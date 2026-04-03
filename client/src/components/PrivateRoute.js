import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/" replace />;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            return <Navigate to="/" replace />;
        }
    } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return <Navigate to="/" replace />;
    }
    return children;
}