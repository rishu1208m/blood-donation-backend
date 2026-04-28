import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.05)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
.tab { transition: all .2s ease; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
.req-card { transition: all .25s ease; }
.req-card:hover { transform: translateX(2px); border-color: rgba(255,255,255,.16) !important; }
`;

const STATUS = {
    pending:   { color: "#f39c12", bg: "rgba(243,156,18,.15)", border: "rgba(243,156,18,.35)", icon: "⏳", label: "Pending"  },
    accepted:  { color: "#27ae60", bg: "rgba(39,174,96,.15)",  border: "rgba(39,174,96,.35)",  icon: "✅", label: "Accepted" },
    rejected:  { color: "#e74c3c", bg: "rgba(231,76,60,.15)",  border: "rgba(231,76,60,.35)",  icon: "❌", label: "Rejected" },
    fulfilled: { color: "#3498db", bg: "rgba(52,152,219,.15)", border: "rgba(52,152,219,.35)", icon: "🎉", label: "Fulfilled" },
};

const TABS = [
    { v: "all",       label: "All",       icon: "📋" },
    { v: "pending",   label: "Pending",   icon: "⏳" },
    { v: "accepted",  label: "Accepted",  icon: "✅" },
    { v: "rejected",  label: "Rejected",  icon: "❌" },
];

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("all");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setReady(true), 60);
        API.get("/api/requests/my")
            .then(res => setRequests(Array.isArray(res.data) ? res.data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = tab === "all" ? requests : requests.filter(r => r.status === tab);
    const counts = TABS.reduce((acc, t) => {
        acc[t.v] = t.v === "all" ? requests.length : requests.filter(r => r.status === t.v).length;
        return acc;
    }, {});

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden", paddingBottom: 60 }}>
                <div style={{ position: "absolute", width: 540, height: 540, borderRadius: "50%", top: -130, right: -130, background: "radial-gradient(circle,rgba(41,128,185,.13) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", bottom: -90, left: -90, background: "radial-gradient(circle,rgba(231,76,60,.12) 0%,transparent 70%)", animation: "blob 14s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 0", position: "relative", zIndex: 1 }}>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease" : "none" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#2980b9,#1a5276)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 28px rgba(41,128,185,.45)" }}>📋</div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>My Requests</h1>
                            <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", margin: 0 }}>Blood requests you've sent · {requests.length} total</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease .1s both" : "none" }}>
                        {TABS.map(t => {
                            const active = tab === t.v;
                            return (
                                <button key={t.v} className="tab" onClick={() => setTab(t.v)}
                                    style={{
                                        background: active ? "linear-gradient(135deg,#e74c3c,#c0392b)" : "rgba(255,255,255,.04)",
                                        color: active ? "#fff" : "rgba(255,255,255,.65)",
                                        border: `1.5px solid ${active ? "transparent" : "rgba(255,255,255,.1)"}`,
                                        padding: "9px 16px", borderRadius: 12, fontSize: ".85rem", fontWeight: 700,
                                        boxShadow: active ? "0 8px 22px rgba(231,76,60,.4)" : "none", cursor: "pointer",
                                    }}>
                                    {t.icon} {t.label} <span style={{ opacity: .65, marginLeft: 4 }}>· {counts[t.v]}</span>
                                </button>
                            );
                        })}
                    </div>

                    {loading && (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <span style={{ display: "inline-block", width: 32, height: 32, border: "3px solid rgba(231,76,60,.25)", borderTop: "3px solid #e74c3c", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div style={{ background: "rgba(20,20,28,.7)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: 50, textAlign: "center" }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                            <div style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>{tab === "all" ? "You haven't sent any requests yet" : `No ${tab} requests`}</div>
                            <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".88rem" }}>Browse donors to send your first request.</div>
                        </div>
                    )}

                    {!loading && filtered.length > 0 && (
                        <div style={{ display: "grid", gap: 12 }}>
                            {filtered.map((r, i) => {
                                const s = STATUS[r.status] || STATUS.pending;
                                return (
                                    <div key={r._id} className="req-card" style={{
                                        background: "rgba(20,20,28,.72)", backdropFilter: "blur(20px)",
                                        border: `1px solid ${s.border}`, borderRadius: 16, padding: 18,
                                        display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center",
                                        animation: ready ? `fadeUp .4s ease ${Math.min(i,8) * .05 + .15}s both` : "none",
                                        borderLeft: `4px solid ${s.color}`,
                                    }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#34495e,#2c3e50)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                            🩸
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ color: "#fff", fontSize: ".95rem", fontWeight: 700, marginBottom: 3 }}>{r.donor?.name || "Donor"}</div>
                                            <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".78rem", display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                {r.donor?.bloodGroup && <span>🩸 {r.donor.bloodGroup}</span>}
                                                {r.createdAt && <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>}
                                            </div>
                                        </div>
                                        <span style={{ background: s.bg, color: s.color, padding: "6px 12px", borderRadius: 999, fontSize: ".78rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                                            <span>{s.icon}</span>{s.label}
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
