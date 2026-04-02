import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        bloodGroup: "",
    });
    const [loading, setLoading] = useState(false); // ✅ loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Frontend validation before hitting API
        if (!form.name.trim()) {
            alert("Name is required");
            return;
        }
        if (!form.email.trim()) {
            alert("Email is required");
            return;
        }
        if (form.password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }
        if (!form.bloodGroup) {
            alert("Please select a blood group");
            return;
        }

        setLoading(true);
        try {
            await API.post("/api/auth/register", form);
            alert("Registered successfully! Please login.");
            navigate("/");
        } catch (err) {
            // ✅ handles both 'message' and 'msg' keys from backend
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.msg ||
                "Registration failed. Please try again.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-red-50">
            <div className="bg-white p-8 rounded shadow w-80">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
                    Register
                </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-2 border mb-3 rounded"
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-2 border mb-3 rounded"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password (min 8 characters)"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 border mb-3 rounded"
                    />
                    <select
                        name="bloodGroup"
                        value={form.bloodGroup}
                        onChange={handleChange}
                        className="w-full p-2 border mb-4 rounded"
                    >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                    {/* ✅ type="submit" + disabled during loading */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-2 rounded disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="text-center mt-4">
                    Already have an account?{" "}
                    <Link to="/" className="text-blue-500">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;