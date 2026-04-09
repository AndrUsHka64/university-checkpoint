import json

from flask import Blueprint, Response, stream_with_context

stream_bp = Blueprint("stream", __name__)


@stream_bp.get("/stream/webcam")
def webcam_stream():
    def generate():
        payload = {
            "Access": "False",
            "User": "StreamNotReady",
            "Image": "",
        }
        while True:
            yield json.dumps(payload, ensure_ascii=False) + "\n"

    return Response(stream_with_context(generate()), mimetype="application/x-ndjson")