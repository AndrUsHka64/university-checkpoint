from datetime import datetime

from .extensions import db


class Institute(db.Model):
    __tablename__ = "institutes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {"id": self.id, "name": self.name}
    groups = db.relationship(
        "Group",
        back_populates="institute",
        cascade="all, delete-orphan",
        lazy=True,
    )


class Group(db.Model):
    __tablename__ = "groups"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    institute_id = db.Column(
        db.Integer,
        db.ForeignKey("institutes.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    institute = db.relationship("Institute", back_populates="groups", lazy=True)

    __table_args__ = (
        db.UniqueConstraint("name", "institute_id", name="uq_group_name_institute"),
    )

    def to_dict(self):
        return {"id": self.id, "name": self.name, "institute_id": self.institute_id}