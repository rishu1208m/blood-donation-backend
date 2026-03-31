import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    // 🔐 Logout
    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    // 🔔 Check incoming request notifications
    useEffect(() => {
        const checkRequests = async () => {
            try {
                const res = await API.get("/requests/incoming");

                const pending = Array.isArray(res.data)
                    ? res.data.filter((r) => r.status === "pending")
                    : [];

                if (pending.length > 0) {
                    alert(`You have ${pending.length} new request(s)`);
                }
            } catch (err) {
                console.error("Notification error:", err);
            }
        };

        checkRequests();
    }, []);

    return (
        <>
            <Navbar />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h2 className="text-3xl mb-6 font-bold">Dashboard</h2>

                <button
                    onClick={() => navigate("/map")}
                    className="bg-purple-500 text-white px-6 py-2 rounded mb-4"
                >
                    View Map
                </button>

                <button
                    onClick={() => navigate("/donors")}
                    className="bg-red-500 text-white px-6 py-2 rounded mb-4"
                >
                    View Donors
                </button>

                <button
                    onClick={() => navigate("/my-requests")}
                    className="bg-blue-500 text-white px-6 py-2 rounded mb-4"
                >
                    My Requests
                </button>

                <button
                    onClick={() => navigate("/incoming")}
                    className="bg-green-500 text-white px-6 py-2 rounded mb-4"
                >
                    Incoming Requests
                </button>

                <button
                    onClick={logout}
                    className="bg-gray-700 text-white px-6 py-2 rounded"
                >
                    Logout
                </button>
            </div>
        </>
    );
}

export default Dashboard;