from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Group, Student

students_bp = Blueprint("students", __name__)


def _validate_student_payload(payload):
    required_fields = ["card_id", "last_name", "first_name"]
    missing_fields = [
        field for field in required_fields if not (payload.get(field) or "").strip()
    ]
    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}"
    return None


@students_bp.get("/groups/<int:group_id>/students")
def get_group_students(group_id):
    group = Group.query.get(group_id)
    if group is None:
        return jsonify({"error": "Group not found"}), 404

    students = (
        Student.query.filter_by(group_id=group_id)
        .order_by(Student.last_name.asc(), Student.first_name.asc())
        .all()
    )

    return jsonify([student.to_dict() for student in students])


@students_bp.post("/groups/<int:group_id>/students")
def create_group_student(group_id):
    group = Group.query.get(group_id)
    if group is None:
        return jsonify({"error": "Group not found"}), 404

    payload = request.get_json(silent=True) or {}
    student_payload = payload.get("student", payload)
    frames = payload.get("frames", [])

    validation_error = _validate_student_payload(student_payload)
    if validation_error:
        return jsonify({"error": validation_error}), 400

    if Student.query.filter_by(card_id=student_payload["card_id"].strip()).first():
        return jsonify({"error": "Student with this card_id already exists"}), 409

    student_data = {
        "card_id": student_payload["card_id"].strip(),
        "last_name": student_payload["last_name"].strip(),
        "first_name": student_payload["first_name"].strip(),
        "patronymic": (student_payload.get("patronymic") or "").strip() or None,
        "phone": (student_payload.get("phone") or "").strip() or None,
        "learning_form": (student_payload.get("learning_form") or "").strip() or None,
        "group_id": group.id,
        "institute_id": group.institute_id,
    }

    face_service = current_app.extensions["face_service"]

    try:
        student = face_service.create_student(student_data, frames=frames or None)
    except ValueError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 503
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Student could not be created"}), 409

    return jsonify(student.to_dict()), 201


@students_bp.post("/students/<int:student_id>/faces")
def add_student_face(student_id):
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    payload = request.get_json(silent=True) or {}
    frames = payload.get("frames", [])
    if not frames:
        return jsonify({"error": "frames field is required"}), 400

    face_service = current_app.extensions["face_service"]

    try:
        student = face_service.attach_embedding(student, frames)
    except ValueError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        db.session.rollback()
        return jsonify({"error": str(exc)}), 503

    return jsonify(student.to_dict())