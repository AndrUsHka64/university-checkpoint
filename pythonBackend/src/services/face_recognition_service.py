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