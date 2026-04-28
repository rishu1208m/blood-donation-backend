import axios from "axios";

// 🌐 Auto-pick the API base URL.
// - In dev (npm start) → localhost:5000 (your local Express server)
// - In production build → Render deployed backend
//
// You can override either by setting REACT_APP_API_URL in client/.env
const BASE_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://blood-donation-backend-bzb8.onrender.com");

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

API.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token");
                const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { token: refreshToken });
                localStorage.setItem("token", res.data.accessToken);
                localStorage.setItem("refreshToken", res.data.refreshToken);
                original.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return API(original);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                window.location.href = "/";
            }
        }
        return Promise.reject(err);
    }
);

export default API;
