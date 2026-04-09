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
    students = db.relationship("Student", back_populates="institute", lazy=True)
    students = db.relationship(
        "Student",
        back_populates="group",
        cascade="all, delete-orphan",
        lazy=True,
    )
class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    card_id = db.Column(db.String(16), nullable=False, unique=True)
    last_name = db.Column(db.String(100), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    patronymic = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    learning_form = db.Column(db.String(20), nullable=True)
    face_embedding = db.Column(db.JSON, nullable=True)
    group_id = db.Column(
        db.Integer,
        db.ForeignKey("groups.id", ondelete="RESTRICT"),
        nullable=False,
    )
    institute_id = db.Column(
        db.Integer,
        db.ForeignKey("institutes.id", ondelete="RESTRICT"),
        nullable=False,
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    group = db.relationship("Group", back_populates="students", lazy=True)
    institute = db.relationship("Institute", back_populates="students", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "card_id": self.card_id,
            "last_name": self.last_name,
            "first_name": self.first_name,
            "patronymic": self.patronymic,
            "phone": self.phone,
            "learning_form": self.learning_form,
            "group_id": self.group_id,
            "group_name": self.group.name if self.group else None,
            "institute_id": self.institute_id,
            "institute_name": self.institute.name if self.institute else None,
            "has_face_embedding": bool(self.face_embedding),
        }