import json

from flask import Blueprint, Response, current_app, stream_with_context

stream_bp = Blueprint("stream", __name__)


@stream_bp.get("/stream/webcam")
def webcam_stream():
    face_service = current_app.extensions["face_service"]

    def generate():
        try:
            yield from face_service.stream_webcam()
        except RuntimeError as exc:
            payload = {
                "Access": "False",
                "User": "Unavailable",
                "Image": "",
                "Error": str(exc),
            }
            yield json.dumps(payload, ensure_ascii=False) + "\n"

    return Response(stream_with_context(generate()), mimetype="application/x-ndjson")