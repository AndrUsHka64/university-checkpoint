import { useEffect, useState } from "react";

import { api } from "../api/client";

function MainPage() {
    const [streamError, setStreamError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;

        const readStream = async () => {
            try {
                const response = await fetch(api.getWebcamStreamUrl(), {
                    signal: controller.signal,
                });

                if (!response.ok || !response.body) {
                    throw new Error("Unable to connect to camera stream.");
                }

                const reader = response.body.getReader();
                while (mounted) {
                    const { done } = await reader.read();
                    if (done) {
                        break;
                    }
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setStreamError(error.message);
                }
            }
        };

        readStream();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, []);

    return (
        <section className="panel">
            <div className="panel-title">
                <p className="eyebrow">Monitoring</p>
                <h1>Camera stream</h1>
            </div>
            <div className="stream-box">
                <div className="placeholder">No frame</div>
            </div>
            {streamError ? <p className="error-text">{streamError}</p> : null}
        </section>
    );
}

export default MainPage;