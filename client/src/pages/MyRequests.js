import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const STATUS = {
    pending: { color: "#f39c12", bg: "rgba(243,156,18,.15)", label: "⏳ Pending" },
    accepted: { color: "#52d68a", bg: "rgba(82,214,138,.15)", label: "✅ Accepted" },
    rejected: { color: "#ff6b6b", bg: "rgba(255,107,107,.15)", label: "❌ Rejected" },
};

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setReady(true), 80);
        API.get("/api/requests/my")
            .then(res => setRequests(Array.isArray(res.data) ? res.data : []))
            .catch(() => alert("Failed to fetch requests"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
            `}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", padding: "3rem 1.5rem" }}>
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                    <div style={{ opacity: ready ? 1 : 0, transition: "all .5s ease", marginBottom: "2.5rem" }}>
                        <span style={{ display: "inline-block", background: "rgba(41,128,185,.12)", border: "1px solid rgba(41,128,185,.25)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#74b9ff", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>Your Activity</span>
                        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>My Requests</h1>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "5rem", color: "rgba(255,255,255,.3)" }}>
                            <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,.1)", borderTop: "3px solid #2980b9", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
                            Loading requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,.03)", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 20 }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
                            <p style={{ color: "rgba(255,255,255,.3)", fontWeight: 500 }}>No requests yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {requests.map((r, i) => {
                                const s = STATUS[r.status] || STATUS.pending;
                                return (
                                    <div key={r._id} style={{
                                        background: "rgba(255,255,255,.04)",
                                        border: "1px solid rgba(255,255,255,.07)",
                                        borderRadius: 18, padding: "1.4rem",
                                        display: "flex", alignItems: "center",
                                        justifyContent: "space-between", gap: "1rem",
                                        animation: ready ? `fadeUp .4s ease ${i * .07}s both` : "none",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                            <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(231,76,60,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>🩸</div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{r.donor?.name || "Unknown Donor"}</p>
                                                <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,.3)" }}>
                                                    {r.donor?.bloodGroup && <span style={{ background: "rgba(231,76,60,.2)", color: "#ff8a80", padding: "1px 8px", borderRadius: 10, marginRight: 6, fontSize: "0.72rem", fontWeight: 700 }}>{r.donor.bloodGroup}</span>}
                                                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{ background: s.bg, color: s.color, padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>
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