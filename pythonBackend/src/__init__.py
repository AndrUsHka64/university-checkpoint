import os
from flask import Flask, jsonify

from .api import register_blueprints
from .config import Config
from .extensions import db
from .services.face_recognition_service import FaceRecognitionService


def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)
    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    register_blueprints(app)

    with app.app_context():
        db.create_all()
        app.extensions["face_service"] = FaceRecognitionService(app)

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(_error):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    return app
