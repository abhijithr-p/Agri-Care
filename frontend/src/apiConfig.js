const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Named exports to satisfy all component import variants
export { API_URL, API_URL as API_BASE_URL };

// Default export for standard default imports
export default API_URL;