import { useEffect, useState } from "react";
import API from "../services/api";

function IncomingRequests() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await API.get("/requests/donor");
            setRequests(res.data);
        } catch (err) {
            console.error(err);
            alert("Error fetching requests");
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/requests/${id}/status`, { status });
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        }
    };

    return (
        <div>
            <h2>Incoming Requests</h2>

            {requests.map((r) => (
                <div key={r._id}>
                    <p><b>{r.receiver.name}</b></p>
                    <p>Status: {r.status}</p>

                    {r.status === "pending" && (
                        <>
                            <button onClick={() => updateStatus(r._id, "accepted")}>
                                Accept
                            </button>

                            <button onClick={() => updateStatus(r._id, "rejected")}>
                                Reject
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default IncomingRequests;