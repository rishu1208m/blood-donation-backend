import axios from "axios";

const API = axios.create({
    baseURL: "https://blood-donation-backend-bzb8.onrender.com"
});

// ✅ Attach access token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// ✅ Auto-refresh access token when it expires (401)
API.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;

        // If 401 and not already retried
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token");

                const res = await axios.post(
                    "https://blood-donation-backend-bzb8.onrender.com/api/auth/refresh",
                    { token: refreshToken }
                );

                // Save new tokens
                localStorage.setItem("token", res.data.accessToken);
                localStorage.setItem("refreshToken", res.data.refreshToken);

                // Retry original request with new token
                original.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return API(original);
            } catch {
                // Refresh failed — clear everything and redirect to login
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                window.location.href = "/";
            }
        }

        return Promise.reject(err);
    }
);

export default API;