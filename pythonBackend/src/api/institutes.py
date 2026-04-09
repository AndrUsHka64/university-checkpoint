from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Institute

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