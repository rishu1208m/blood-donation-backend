import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const statusColors = {
    pending: { bg: "#fff8e1", color: "#f39c12", label: "⏳ Pending" },
    accepted: { bg: "#eafaf1", color: "#27ae60", label: "✅ Accepted" },
    rejected: { bg: "#fdedec", color: "#c0392b", label: "❌ Rejected" },
};

function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // ✅ Fixed: added /api/ prefix
            const res = await API.get("/api/requests/my");
            setRequests(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch requests");
        } finally {
            setLoading(false);
        }
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
                        Your Activity
                    </p>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1a1a1a", margin: "0 0 2rem" }}>
                        My Requests
                    </h1>

                    {/* Content */}
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>
                            Loading your requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div style={{
                            textAlign: "center", padding: "4rem",
                            background: "white", borderRadius: "16px",
                            border: "2px dashed #f5c6c6",
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                            <p style={{ color: "#999", fontWeight: 500 }}>No requests found yet</p>
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
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "1rem",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{
                                                width: "48px", height: "48px", borderRadius: "12px",
                                                background: "#fff5f5",
                                                display: "flex", alignItems: "center",
                                                justifyContent: "center", fontSize: "1.4rem",
                                                flexShrink: 0,
                                            }}>
                                                🩸
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, color: "#1a1a1a", fontSize: "1rem" }}>
                                                    {r.donor?.name || "Unknown Donor"}
                                                </p>
                                                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#aaa" }}>
                                                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <span style={{
                                            background: status.bg,
                                            color: status.color,
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                        }}>
                                            {status.label}
                                        </span>
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

export default MyRequests;