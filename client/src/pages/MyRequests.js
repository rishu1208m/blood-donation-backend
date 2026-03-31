import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar"; // 👈 ADD THIS

function MyRequests() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await API.get("/requests/my");
            setRequests(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch requests");
        }
    };

    return (
        <>
            <Navbar />

            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">My Requests</h2>

                {requests.length === 0 ? (
                    <p className="text-gray-500">No requests found</p>
                ) : (
                    requests.map((r) => (
                        <div key={r._id} className="bg-white p-4 shadow mb-3 rounded">
                            <p><strong>Donor:</strong> {r.donor?.name}</p>
                            <p><strong>Status:</strong> {r.status}</p>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default MyRequests;