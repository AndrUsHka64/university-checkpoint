from flask_cors import CORS

from .health import health_bp
from .institutes import institutes_bp


def register_blueprints(app):
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(institutes_bp, url_prefix="/api/v1")