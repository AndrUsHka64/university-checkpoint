from datetime import datetime

from .extensions import db


class Institute(db.Model):
    __tablename__ = "institutes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {"id": self.id, "name": self.name}