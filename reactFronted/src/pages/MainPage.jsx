import { useEffect, useRef, useState } from "react";

import { api } from "../api/client";

function MainPage() {
    const [frame, setFrame] = useState("");
    const [streamError, setStreamError] = useState("");
    const [accessState, setAccessState] = useState("N/A");
    const [currentUser, setCurrentUser] = useState("N/A");
    const [activeFaces, setActiveFaces] = useState([]);
    const [entriesCount, setEntriesCount] = useState(0);

    const countedUsersRef = useRef(new Set());

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
                        if (metadata.User) {
                            setCurrentUser(metadata.User);
                        }
                        if (metadata.Access) {
                            setAccessState(metadata.Access === "True" ? "Open" : "Closed");
                        }
                        if (metadata.User && metadata.User !== "Unknown") {
                            const now = Date.now();
                            setActiveFaces((prevFaces) => {
                                const existingIndex = prevFaces.findIndex(
                                    (face) => face.user === metadata.User
                                );
                                const updated = [...prevFaces];
                                if (existingIndex === -1) {
                                    updated.push({ user: metadata.User, lastSeen: now });
                                } else {
                                    updated[existingIndex] = {
                                        ...updated[existingIndex],
                                        lastSeen: now,
                                    };
                                }
                                return updated;
                            });

                            if (
                                metadata.Access === "True" &&
                                !countedUsersRef.current.has(metadata.User)
                            ) {
                                countedUsersRef.current.add(metadata.User);
                                setEntriesCount((value) => value + 1);
                            }
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

    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            setActiveFaces((faces) =>
                faces.filter((face) => {
                    const isActual = now - face.lastSeen < 5000;
                    if (!isActual) {
                        countedUsersRef.current.delete(face.user);
                    }
                    return isActual;
                })
            );
        }, 1000);

        return () => clearInterval(cleanup);
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
            <div className="status-grid">
                <div className="status-card">
                    <span>Current user</span>
                    <strong>{currentUser}</strong>
                </div>
                <div className="status-card">
                    <span>Access state</span>
                    <strong>{accessState}</strong>
                </div>
                <div className="status-card">
                    <span>Entries this session</span>
                    <strong>{entriesCount}</strong>
                </div>
                <div className="status-card">
                    <span>Faces in frame now</span>
                    <strong>{activeFaces.length}</strong>
                </div>
            </div>
            {streamError ? <p className="error-text">{streamError}</p> : null}
        </section>
    );
}

export default MainPage;
