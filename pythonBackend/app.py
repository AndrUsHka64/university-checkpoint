import os
from src import create_app

app = create_app()

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("FLASK_RUN_PORT", "5000")),
        debug=app.config.get("DEBUG", False),
    )