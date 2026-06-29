import { API_URL } from "../config";

/**
 * Wrapper for fetch that automatically handles auth headers and JSON parsing.
 */
export async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem("admin-token");
    
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    if (config.body && typeof config.body === "object") {
        config.body = JSON.stringify(config.body);
    }

    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return { response, data };
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}
