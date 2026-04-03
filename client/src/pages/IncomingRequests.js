import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function IncomingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null); // tracks which request is being updated

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // ✅ Fixed: /api/ prefix added
            const res = await API.get("/api/requests/donor");
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            alert("Error fetching requests");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        setUpdating(id + status);
        try {
            // ✅ Fixed: /api/ prefix added
            await API.put(`/api/requests/${id}/status`, { status });
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        } finally {
            setUpdating(null);
        }
    };

    const statusColors = {
        pending: { bg: "#fff8e1", color: "#f39c12", label: "⏳ Pending" },
        accepted: { bg: "#eafaf1", color: "#27ae60", label: "✅ Accepted" },
        rejected: { bg: "#fdedec", color: "#c0392b", label: "❌ Rejected" },
    };

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
            <Navbar />
            <div style={{
                minHeight: "calc(100vh - 64px)",
                background: "linear-gradient(160deg, #fff5f5 0%, #fff 60%)",
                fontFamily: "'Outfit', sans-serif",
                padding: "3rem 2rem",
            }}>
                <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                    {/* Header */}
                    <p style={{ color: "#e74c3c", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
                        Donor Panel
                    </p>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1a1a1a", margin: "0 0 2rem" }}>
                        Incoming Requests
                    </h1>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>
                            Loading requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div style={{
                            textAlign: "center", padding: "4rem",
                            background: "white", borderRadius: "16px",
                            border: "2px dashed #f5c6c6",
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📩</div>
                            <p style={{ color: "#999", fontWeight: 500 }}>No incoming requests yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {requests.map((r) => {
                                const status = statusColors[r.status] || statusColors.pending;
                                return (
                                    <div key={r._id} style={{
                                        background: "white",
                                        borderRadius: "16px",
                                        padding: "1.5rem",
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                        border: "1px solid #f5f5f5",
                                    }}>
                                        {/* Top row */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{
                                                    width: "44px", height: "44px", borderRadius: "12px",
                                                    background: "#fff5f5", display: "flex",
                                                    alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
                                                }}>
                                                    🧑
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, color: "#1a1a1a" }}>
                                                        {r.receiver?.name || "Unknown"}
                                                    </p>
                                                    <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#aaa" }}>
                                                        {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                                            day: "numeric", month: "short", year: "numeric"
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span style={{
                                                background: status.bg, color: status.color,
                                                padding: "6px 14px", borderRadius: "20px",
                                                fontSize: "0.8rem", fontWeight: 600,
                                            }}>
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Action buttons — only show if pending */}
                                        {r.status === "pending" && (
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <button
                                                    onClick={() => updateStatus(r._id, "accepted")}
                                                    disabled={updating === r._id + "accepted"}
                                                    style={{
                                                        flex: 1, padding: "10px",
                                                        background: updating === r._id + "accepted" ? "#ccc" : "#27ae60",
                                                        color: "white", border: "none",
                                                        borderRadius: "10px", fontWeight: 600,
                                                        cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                                                        fontSize: "0.9rem", transition: "opacity 0.2s",
                                                    }}
                                                >
                                                    {updating === r._id + "accepted" ? "Accepting..." : "✅ Accept"}
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(r._id, "rejected")}
                                                    disabled={updating === r._id + "rejected"}
                                                    style={{
                                                        flex: 1, padding: "10px",
                                                        background: updating === r._id + "rejected" ? "#ccc" : "#e74c3c",
                                                        color: "white", border: "none",
                                                        borderRadius: "10px", fontWeight: 600,
                                                        cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                                                        fontSize: "0.9rem", transition: "opacity 0.2s",
                                                    }}
                                                >
                                                    {updating === r._id + "rejected" ? "Rejecting..." : "❌ Reject"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default IncomingRequests;