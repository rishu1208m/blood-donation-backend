import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/dashboard");
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Basic frontend validation
        if (!email.trim()) {
            alert("Email is required");
            return;
        }
        if (!password.trim()) {
            alert("Password is required");
            return;
        }

        setLoading(true);
        try {
            const res = await API.post("/api/auth/login", { email, password });

            // ✅ Save both tokens
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);

            navigate("/dashboard");
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Login failed. Please try again.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-red-50">
            <div className="bg-white p-8 rounded shadow w-80">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
                    Login
                </h2>
                <form onSubmit={handleSubmit}>
                    {/* ✅ type="email" added */}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border mb-4 rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border mb-4 rounded"
                        required
                    />
                    {/* ✅ type="submit" + loading state */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-2 rounded disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="text-center mt-4">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-500">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;