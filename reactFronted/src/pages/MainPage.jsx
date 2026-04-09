import { useEffect, useState } from "react";

import { api } from "../api/client";

function MainPage() {
    const [frame, setFrame] = useState("");
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
                const decoder = new TextDecoder("utf-8");
                let buffer = "";
                while (mounted) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const chunks = buffer.split("\n");
                    buffer = chunks.pop() ?? "";

                    for (const chunk of chunks) {
                        if (!chunk.trim()) {
                            continue;
                        }

                        let metadata;
                        try {
                            metadata = JSON.parse(chunk);
                        } catch (_error) {
                            continue;
                        }

                        if (metadata.Image) {
                            setFrame(`data:image/jpeg;base64,${metadata.Image}`);
                        }
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
                {frame ? (
                    <img src={frame} alt="Webcam stream" />
                ) : (
                    <div className="placeholder">No frame</div>
                )}
            </div>
            {streamError ? <p className="error-text">{streamError}</p> : null}
        </section>
    );
}

export default MainPage;
