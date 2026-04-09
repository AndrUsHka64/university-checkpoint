from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Group, Institute

institutes_bp = Blueprint("institutes", __name__)


@institutes_bp.post("/institutes")
def create_institute():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()

    if not name:
        return jsonify({"error": "Institute name is required"}), 400

    institute = Institute(name=name)
    db.session.add(institute)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Institute with this name already exists"}), 409

    return jsonify(institute.to_dict()), 201


@institutes_bp.get("/institutes/<int:institute_id>/groups")
def get_institute_groups(institute_id):
    institute = Institute.query.get(institute_id)
    if institute is None:
        return jsonify({"error": "Institute not found"}), 404

    groups = (
        Group.query.filter_by(institute_id=institute_id).order_by(Group.name.asc()).all()
    )
    return jsonify([group.to_dict() for group in groups])


@institutes_bp.get("/institutes")
def get_institutes():
    institutes = Institute.query.order_by(Institute.name.asc()).all()
    return jsonify([institute.to_dict() for institute in institutes])