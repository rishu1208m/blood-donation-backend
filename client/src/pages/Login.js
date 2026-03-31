import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/dashboard");
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/api/auth/login", { email, password });

            localStorage.setItem("token", res.data.accessToken);
            navigate("/dashboard");
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-red-50">
            <div className="bg-white p-8 rounded shadow w-80">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
                    Login
                </h2>

                <form onSubmit={handleSubmit}>
                    <input
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border mb-4 rounded"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border mb-4 rounded"
                        required
                    />

                    <button className="w-full bg-red-500 text-white py-2 rounded">
                        Login
                    </button>
                </form>

                <p className="text-center mt-4">
                    <Link to="/register" className="text-blue-500">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;