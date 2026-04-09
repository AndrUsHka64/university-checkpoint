import base64

import numpy as np

from ..extensions import db
from ..models import Student


class FaceRecognitionService:
    def __init__(self, app):
        self.app = app
        self.known_faces = []
        self.known_labels = []
        self.known_faces_matrix = None
        self._cv2 = None
        self._face_recognition = None
        self._load_known_faces()

    def _import_dependencies(self):
        if self._cv2 is not None and self._face_recognition is not None:
            return self._cv2, self._face_recognition

        try:
            import cv2  # pylint: disable=import-outside-toplevel
            import face_recognition  # pylint: disable=import-outside-toplevel
        except Exception as exc:  # noqa: BLE001
            raise RuntimeError(
                "Face recognition dependencies are unavailable."
            ) from exc

        self._cv2 = cv2
        self._face_recognition = face_recognition
        return self._cv2, self._face_recognition

    def _load_known_faces(self):
        self.known_faces = []
        self.known_labels = []
        students = Student.query.filter(Student.face_embedding.isnot(None)).all()

        for student in students:
            embedding_array = np.array(student.face_embedding, dtype=np.float64)
            if embedding_array.size == 0:
                continue
            self.known_faces.append(embedding_array)
            self.known_labels.append(student.card_id)

        self.known_faces_matrix = np.vstack(self.known_faces) if self.known_faces else None

    def reload_known_faces(self):
        with self.app.app_context():
            self._load_known_faces()

    def encode_frames(self, frames):
        if not frames:
            raise ValueError("Frames are required to create face embedding")

        cv2, face_recognition = self._import_dependencies()
        all_encodings = []

        for image_data in frames:
            if not isinstance(image_data, str) or "," not in image_data:
                continue
            try:
                _, base64_str = image_data.split(",", 1)
                image_bytes = base64.b64decode(base64_str)
                np_arr = np.frombuffer(image_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                encodings = face_recognition.face_encodings(rgb_frame)
            except Exception:  # noqa: BLE001
                continue

            if encodings:
                all_encodings.extend(encodings)

        if not all_encodings:
            raise ValueError("No faces were found in uploaded frames")

        average_embedding = np.mean(np.array(all_encodings), axis=0)
        return average_embedding.astype(float).tolist()

    def attach_embedding(self, student, frames):
        student.face_embedding = self.encode_frames(frames)
        db.session.commit()
        self.reload_known_faces()
        return student

    def _serialize_frame(self, frame, access="", user="", error=None):
        if frame is None:
            image_data = ""
        else:
            cv2, _ = self._import_dependencies()
            quality = int(self.app.config.get("STREAM_JPEG_QUALITY", 70))
            quality = max(40, min(95, quality))
            _, buffer = cv2.imencode(
                ".jpg",
                frame,
                [int(cv2.IMWRITE_JPEG_QUALITY), quality],
            )
            image_data = base64.b64encode(buffer.tobytes()).decode("utf-8")

        metadata = {"Access": access, "User": user, "Image": image_data}
        if error:
            metadata["Error"] = error

        return json.dumps(metadata, ensure_ascii=False) + "\n"

    def stream_webcam(self):
        cv2, face_recognition = self._import_dependencies()

        cascade_path = Path(self.app.root_path).parent / "cascade.xml"
        cascade = cv2.CascadeClassifier(str(cascade_path))
        camera_index = self.app.config.get("CAMERA_INDEX", 0)
        capture_backend = cv2.CAP_DSHOW if os.name == "nt" else cv2.CAP_ANY
        camera = cv2.VideoCapture(camera_index, capture_backend)
        if not camera.isOpened():
            yield self._serialize_frame(
                None,
                access="False",
                user="CameraUnavailable",
                error="Camera is not available",
            )
            return

        width = int(self.app.config.get("CAMERA_WIDTH", 640))
        height = int(self.app.config.get("CAMERA_HEIGHT", 360))
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        threshold = self.app.config.get("FACE_MATCH_THRESHOLD", 0.45)
        process_every_n_frames = int(max(1, self.app.config.get("FACE_PROCESS_EVERY_N_FRAMES", 3)))
        face_detection_scale = float(self.app.config.get("FACE_DETECTION_SCALE", 0.5))
        face_detection_scale = min(1.0, max(0.2, face_detection_scale))

        last_face_results = []
        frame_number = 0

        try:
            while True:
                grabbed, frame = camera.read()
                if not grabbed:
                    break

                frame_number += 1
                frame = cv2.resize(frame, (width, height))

                if frame_number % process_every_n_frames == 0:
                    small_frame = cv2.resize(frame, (0, 0), fx=face_detection_scale, fy=face_detection_scale)
                    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

                    face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
                    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

                    current_results = []
                    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                        top = int(top / face_detection_scale)
                        right = int(right / face_detection_scale)
                        bottom = int(bottom / face_detection_scale)
                        left = int(left / face_detection_scale)

                        label = "Unknown"
                        face_access = "False"
                        color = (37, 84, 207)

                        if self.known_faces_matrix is not None:
                            distances = face_recognition.face_distance(self.known_faces_matrix, face_encoding)
                            if len(distances) > 0:
                                best_index = int(np.argmin(distances))
                                if float(distances[best_index]) < threshold:
                                    label = self.known_labels[best_index]
                                    face_access = "True"
                                    color = (41, 163, 81)

                        current_results.append(
                            {
                                "top": top,
                                "right": right,
                                "bottom": bottom,
                                "left": left,
                                "label": label,
                                "access": face_access,
                                "color": color,
                            }
                        )

                    last_face_results = current_results

                user = ""
                access = ""
                for result in last_face_results:
                    cv2.rectangle(
                        frame,
                        (result["left"], result["top"]),
                        (result["right"], result["bottom"]),
                        result["color"],
                        2,
                    )
                    cv2.rectangle(
                        frame,
                        (result["left"], result["bottom"] - 25),
                        (result["right"], result["bottom"]),
                        result["color"],
                        cv2.FILLED,
                    )
                    cv2.putText(
                        frame,
                        result["label"],
                        (result["left"] + 6, result["bottom"] - 6),
                        cv2.FONT_HERSHEY_DUPLEX,
                        0.5,
                        (255, 255, 255),
                        1,
                    )

                    if result["access"] == "True":
                        user = result["label"]
                        access = "True"
                    elif not user:
                        user = result["label"]
                        access = result["access"]

                if not cascade.empty():
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    detected_objects = cascade.detectMultiScale(gray, 1.3, 5, minSize=(10, 10))
                    for x, y, w, h in detected_objects:
                        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 153, 0), 2)

                yield self._serialize_frame(frame, access=access, user=user)
        finally:
            camera.release()

    def create_student(self, student_data, frames=None):
        student = Student(
            card_id=student_data["card_id"],
            last_name=student_data["last_name"],
            first_name=student_data["first_name"],
            patronymic=student_data.get("patronymic"),
            phone=student_data.get("phone"),
            learning_form=student_data.get("learning_form"),
            group_id=student_data["group_id"],
            institute_id=student_data["institute_id"],
        )

        db.session.add(student)
        db.session.flush()

        if frames:
            student.face_embedding = self.encode_frames(frames)

        db.session.commit()
        self.reload_known_faces()
        return student
import json
import os
from pathlib import Path