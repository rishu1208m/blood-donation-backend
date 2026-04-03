import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    // ✅ Check if token is expired (don't wait for API to tell you)
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            return <Navigate to="/" replace />;
        }
    } catch {
        // Token is malformed — clear and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return <Navigate to="/" replace />;
    }

    return children;
}

export default PrivateRoute;