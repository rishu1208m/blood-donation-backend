import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.05)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes pop { 0%{transform:scale(.85);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
.tab { transition: all .2s ease; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
.act-btn { transition: all .2s cubic-bezier(.34,1.56,.64,1); cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
.act-btn:hover:not(:disabled) { transform: translateY(-2px); }
.act-btn:disabled { opacity:.55; cursor:not-allowed; }
.inc-card { transition: all .25s ease; }
.inc-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.16) !important; }
`;

const STATUS = {
    pending:   { color: "#f39c12", bg: "rgba(243,156,18,.15)", border: "rgba(243,156,18,.35)", icon: "⏳", label: "Pending"  },
    accepted:  { color: "#27ae60", bg: "rgba(39,174,96,.15)",  border: "rgba(39,174,96,.35)",  icon: "✅", label: "Accepted" },
    rejected:  { color: "#e74c3c", bg: "rgba(231,76,60,.15)",  border: "rgba(231,76,60,.35)",  icon: "❌", label: "Rejected" },
};

const TABS = [
    { v: "all",      label: "All",      icon: "📥" },
    { v: "pending",  label: "Pending",  icon: "⏳" },
    { v: "accepted", label: "Accepted", icon: "✅" },
    { v: "rejected", label: "Rejected", icon: "❌" },
];

export default function IncomingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [tab, setTab] = useState("all");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setReady(true), 60);
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await API.get("/api/requests/donor");
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            // ignore
        } finally { setLoading(false); }
    };

    const updateStatus = async (id, status) => {
        setUpdating(id + status);
        try {
            await API.put(`/api/requests/${id}/status`, { status });
            await fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update");
        } finally { setUpdating(null); }
    };

    const filtered = tab === "all" ? requests : requests.filter(r => r.status === tab);
    const counts = TABS.reduce((acc, t) => {
        acc[t.v] = t.v === "all" ? requests.length : requests.filter(r => r.status === t.v).length;
        return acc;
    }, {});
    const pendingCount = counts.pending || 0;

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden", paddingBottom: 60 }}>
                <div style={{ position: "absolute", width: 540, height: 540, borderRadius: "50%", top: -130, left: -130, background: "radial-gradient(circle,rgba(39,174,96,.12) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", bottom: -90, right: -90, background: "radial-gradient(circle,rgba(231,76,60,.12) 0%,transparent 70%)", animation: "blob 14s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 0", position: "relative", zIndex: 1 }}>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease" : "none" }}>
                        <div style={{ position: "relative", width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#27ae60,#1e8449)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 28px rgba(39,174,96,.45)" }}>
                            📥
                            {pendingCount > 0 && (
                                <span style={{ position: "absolute", top: -4, right: -4, background: "#e74c3c", color: "#fff", borderRadius: "50%", minWidth: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".7rem", fontWeight: 800, boxShadow: "0 0 0 3px #0d0d12", animation: "pop .4s ease" }}>{pendingCount}</span>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Incoming Requests</h1>
                            <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", margin: 0 }}>People asking for your help · {requests.length} total</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease .1s both" : "none" }}>
                        {TABS.map(t => {
                            const active = tab === t.v;
                            return (
                                <button key={t.v} className="tab" onClick={() => setTab(t.v)}
                                    style={{
                                        background: active ? "linear-gradient(135deg,#27ae60,#1e8449)" : "rgba(255,255,255,.04)",
                                        color: active ? "#fff" : "rgba(255,255,255,.65)",
                                        border: `1.5px solid ${active ? "transparent" : "rgba(255,255,255,.1)"}`,
                                        padding: "9px 16px", borderRadius: 12, fontSize: ".85rem", fontWeight: 700,
                                        boxShadow: active ? "0 8px 22px rgba(39,174,96,.4)" : "none", cursor: "pointer",
                                    }}>
                                    {t.icon} {t.label} <span style={{ opacity: .65, marginLeft: 4 }}>· {counts[t.v]}</span>
                                </button>
                            );
                        })}
                    </div>

                    {loading && (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <span style={{ display: "inline-block", width: 32, height: 32, border: "3px solid rgba(39,174,96,.25)", borderTop: "3px solid #27ae60", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div style={{ background: "rgba(20,20,28,.7)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: 50, textAlign: "center" }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                            <div style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>{tab === "all" ? "No incoming requests" : `No ${tab} requests`}</div>
                            <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".88rem" }}>You'll see requests here when receivers reach out to you.</div>
                        </div>
                    )}

                    {!loading && filtered.length > 0 && (
                        <div style={{ display: "grid", gap: 12 }}>
                            {filtered.map((r, i) => {
                                const s = STATUS[r.status] || STATUS.pending;
                                return (
                                    <div key={r._id} className="inc-card" style={{
                                        background: "rgba(20,20,28,.72)", backdropFilter: "blur(20px)",
                                        border: `1px solid ${s.border}`, borderRadius: 16, padding: 18,
                                        animation: ready ? `fadeUp .4s ease ${Math.min(i,8) * .05 + .15}s both` : "none",
                                        borderLeft: `4px solid ${s.color}`,
                                    }}>
                                        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: r.status === "pending" ? 14 : 0, flexWrap: "wrap" }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#e74c3c,#c0392b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: ".95rem", fontWeight: 800, flexShrink: 0 }}>
                                                {(r.receiver?.name || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ color: "#fff", fontSize: ".95rem", fontWeight: 700, marginBottom: 3 }}>{r.receiver?.name || "Receiver"}</div>
                                                <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".78rem", display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                    {r.receiver?.email && <span>✉️ {r.receiver.email}</span>}
                                                    {r.createdAt && <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                            <span style={{ background: s.bg, color: s.color, padding: "6px 12px", borderRadius: 999, fontSize: ".78rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                                                {s.icon} {s.label}
                                            </span>
                                        </div>
                                        {r.status === "pending" && (
                                            <div style={{ display: "flex", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                                                <button className="act-btn" onClick={() => updateStatus(r._id, "rejected")} disabled={updating === r._id + "rejected" || updating === r._id + "accepted"}
                                                    style={{ flex: 1, background: "rgba(231,76,60,.12)", color: "#ff8a80", border: "1px solid rgba(231,76,60,.3)", padding: "10px", borderRadius: 11, fontSize: ".85rem", fontWeight: 700 }}>
                                                    {updating === r._id + "rejected" ? "…" : "✗ Decline"}
                                                </button>
                                                <button className="act-btn" onClick={() => updateStatus(r._id, "accepted")} disabled={updating === r._id + "accepted" || updating === r._id + "rejected"}
                                                    style={{ flex: 2, background: "linear-gradient(135deg,#27ae60,#1e8449)", color: "#fff", border: "none", padding: "10px", borderRadius: 11, fontSize: ".88rem", fontWeight: 700, boxShadow: "0 8px 22px rgba(39,174,96,.4)" }}>
                                                    {updating === r._id + "accepted"
                                                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Accepting…</span>
                                                        : "✓ Accept Request"}
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
