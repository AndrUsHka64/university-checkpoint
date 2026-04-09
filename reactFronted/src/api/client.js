const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        ...options,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(payload?.error ?? `Request failed with code ${response.status}`);
    }

    return payload;
}

export const api = {
    getInstitutes: () => request("/institutes"),
    getGroups: (instituteId) => request(`/institutes/${instituteId}/groups`),
    getStudents: (groupId) => request(`/groups/${groupId}/students`),
    createStudent: (groupId, payload) =>
        request(`/groups/${groupId}/students`, {
            method: "POST",
            body: JSON.stringify(payload),
        }),
    getWebcamStreamUrl: () => `${API_BASE_URL}/stream/webcam`,
};