from flask import Blueprint, current_app, jsonify, request

from ..extensions import db
from ..models import Group, Student

students_bp = Blueprint("students", __name__)


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