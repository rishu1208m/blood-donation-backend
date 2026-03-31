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

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await API.post("/auth/register", form);
            alert("Registered successfully");
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.msg || "Error");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-red-50">
            <div className="bg-white p-8 rounded shadow w-80">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Register</h2>

                <form onSubmit={handleSubmit}>
                    <input name="name" className="w-full p-2 border mb-3 rounded" placeholder="Name" onChange={handleChange} />
                    <input name="email" className="w-full p-2 border mb-3 rounded" placeholder="Email" onChange={handleChange} />
                    <input name="password" type="password" className="w-full p-2 border mb-3 rounded" placeholder="Password" onChange={handleChange} />
                    <input name="bloodGroup" className="w-full p-2 border mb-4 rounded" placeholder="Blood Group" onChange={handleChange} />

                    <button className="w-full bg-red-500 text-white py-2 rounded">Register</button>
                </form>

                <p className="text-center mt-4">
                    <Link to="/" className="text-blue-500">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;