import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Donors() {
    const [donors, setDonors] = useState([]);
    const [requestedIds, setRequestedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            const res = await API.get("/users/donors");
            setDonors(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch donors");
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (donorId) => {
        try {
            await API.post("/requests/create", { donorId });

            //  Safe update (avoids duplicate / stale state issue)
            setRequestedIds((prev) => [...prev, donorId]);

            alert("Request sent");
        } catch (err) {
            console.error(err);
            alert("Error sending request");
        }
    };

    return (
        <>
            <Navbar />

            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Available Donors</h2>

                {/*  Loading */}
                {loading ? (
                    <p>Loading donors...</p>
                ) : donors.length === 0 ? (
                    <p>No donors available</p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-4">
                        {donors.map((d) => (
                            <div key={d._id} className="bg-white p-4 shadow rounded">
                                <h3 className="font-bold">{d.name}</h3>
                                <p>Blood Group: {d.bloodGroup}</p>

                                <button
                                    disabled={requestedIds.includes(d._id)}
                                    onClick={() => handleRequest(d._id)}
                                >
                                    {requestedIds.includes(d._id) ? "Requested" : "Request"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Donors;