import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const STATUS = {
    pending: { color: "#f39c12", bg: "rgba(243,156,18,.15)", label: "⏳ Pending" },
    accepted: { color: "#52d68a", bg: "rgba(82,214,138,.15)", label: "✅ Accepted" },
    rejected: { color: "#ff6b6b", bg: "rgba(255,107,107,.15)", label: "❌ Rejected" },
};

export default function IncomingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setReady(true), 80);
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
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
            await API.put(`/api/requests/${id}/status`, { status });
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        } finally {
            setUpdating(null);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin  { to{transform:rotate(360deg)} }
                .act-btn { border:none; border-radius:11px; padding:10px 0; font-family:'Plus Jakarta Sans',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; transition:opacity .2s,transform .15s; flex:1; }
                .act-btn:hover:not(:disabled){opacity:.82;}
                .act-btn:active:not(:disabled){transform:scale(.97);}
                .act-btn:disabled{opacity:.35;cursor:not-allowed;}
            `}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", padding: "3rem 1.5rem" }}>
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                    {/* Header */}
                    <div style={{ opacity: ready ? 1 : 0, transition: "all .5s ease", marginBottom: "2.5rem" }}>
                        <span style={{ display: "inline-block", background: "rgba(39,174,96,.12)", border: "1px solid rgba(39,174,96,.25)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#52d68a", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>Donor Panel</span>
                        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>Incoming Requests</h1>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "5rem", color: "rgba(255,255,255,.3)" }}>
                            <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,.1)", borderTop: "3px solid #27ae60", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
                            Loading requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,.03)", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 20 }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📩</div>
                            <p style={{ color: "rgba(255,255,255,.3)", fontWeight: 500 }}>No incoming requests yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {requests.map((r, i) => {
                                const s = STATUS[r.status] || STATUS.pending;
                                return (
                                    <div key={r._id} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "1.4rem", animation: ready ? `fadeUp .4s ease ${i * .08}s both` : "none" }}>
                                        {/* Top row */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: r.status === "pending" ? "1.1rem" : 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(39,174,96,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>🧑</div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{r.receiver?.name || "Unknown"}</p>
                                                    <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,.3)" }}>
                                                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span style={{ background: s.bg, color: s.color, padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700 }}>{s.label}</span>
                                        </div>

                                        {/* Accept / Reject buttons */}
                                        {r.status === "pending" && (
                                            <div style={{ display: "flex", gap: 10 }}>
                                                <button className="act-btn"
                                                    onClick={() => updateStatus(r._id, "accepted")}
                                                    disabled={!!updating}
                                                    style={{ background: "linear-gradient(135deg,#27ae60,#1e8449)", color: "#fff", boxShadow: "0 6px 18px rgba(39,174,96,.35)" }}
                                                >
                                                    {updating === r._id + "accepted" ? "Accepting..." : "✅ Accept"}
                                                </button>
                                                <button className="act-btn"
                                                    onClick={() => updateStatus(r._id, "rejected")}
                                                    disabled={!!updating}
                                                    style={{ background: "linear-gradient(135deg,#e74c3c,#c0392b)", color: "#fff", boxShadow: "0 6px 18px rgba(231,76,60,.35)" }}
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