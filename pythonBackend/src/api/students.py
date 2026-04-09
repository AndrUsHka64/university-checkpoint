from flask import Blueprint, jsonify

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