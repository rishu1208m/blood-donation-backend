import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes pop { 0%{transform:scale(.7);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.05)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
.dn-card { transition: all .3s cubic-bezier(.34,1.56,.64,1); cursor:default; }
.dn-card:hover { transform: translateY(-6px); border-color: rgba(231,76,60,.35) !important; box-shadow: 0 18px 40px rgba(0,0,0,.45); }
.bg-pill { transition: all .22s cubic-bezier(.34,1.56,.64,1); cursor:pointer; }
.bg-pill:hover { transform: translateY(-2px); }
.sin { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:12px; color:#fff; padding:12px 16px; font-family:'Plus Jakarta Sans',sans-serif; font-size:.9rem; outline:none; transition: all .2s ease; width:100%; box-sizing:border-box; }
.sin:focus { border-color:rgba(231,76,60,.5); box-shadow:0 0 0 4px rgba(231,76,60,.1); background:rgba(231,76,60,.04); }
.sin::placeholder { color:rgba(255,255,255,.32); }
.rbtn { transition: all .2s cubic-bezier(.34,1.56,.64,1); cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
.rbtn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(231,76,60,.4); }
.rbtn:active:not(:disabled) { transform: translateY(0) scale(.97); }
.rbtn:disabled { opacity:.55; cursor:not-allowed; }
`;

const BG_GRAD = {
    "A+":  "linear-gradient(135deg,#e74c3c,#c0392b)",
    "A-":  "linear-gradient(135deg,#c0392b,#7b241c)",
    "B+":  "linear-gradient(135deg,#8e44ad,#6c3483)",
    "B-":  "linear-gradient(135deg,#6c3483,#4a235a)",
    "AB+": "linear-gradient(135deg,#2980b9,#1a5276)",
    "AB-": "linear-gradient(135deg,#1a5276,#0e3a4d)",
    "O+":  "linear-gradient(135deg,#27ae60,#1e8449)",
    "O-":  "linear-gradient(135deg,#16a085,#0e6655)",
};
const BG_DOT = {
    "A+":"#e74c3c","A-":"#c0392b","B+":"#8e44ad","B-":"#6c3483",
    "AB+":"#2980b9","AB-":"#1a5276","O+":"#27ae60","O-":"#16a085",
};
const ALL_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Donors() {
    const [donors, setDonors] = useState([]);
    const [requestedIds, setRequestedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [requesting, setRequesting] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setReady(true), 60);
        API.get("/api/users/donors")
            .then(res => setDonors(Array.isArray(res.data) ? res.data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleRequest = async (donorId) => {
        setRequesting(donorId);
        try {
            await API.post("/api/requests/create", { donorId });
            setRequestedIds(p => [...p, donorId]);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send request");
        } finally {
            setRequesting(null);
        }
    };

    const filtered = donors.filter(d => {
        const matchesText = !search || (d.name || "").toLowerCase().includes(search.toLowerCase()) || (d.email || "").toLowerCase().includes(search.toLowerCase());
        const matchesGroup = !filter || d.bloodGroup === filter;
        return matchesText && matchesGroup;
    });

    const groupCounts = ALL_GROUPS.reduce((acc, g) => { acc[g] = donors.filter(d => d.bloodGroup === g).length; return acc; }, {});

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden", paddingBottom: 60 }}>
                <div style={{ position: "absolute", width: 540, height: 540, borderRadius: "50%", top: -120, left: -120, background: "radial-gradient(circle,rgba(231,76,60,.12) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", bottom: -90, right: -90, background: "radial-gradient(circle,rgba(142,68,173,.1) 0%,transparent 70%)", animation: "blob 14s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 0", position: "relative", zIndex: 1 }}>

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease" : "none" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#e74c3c,#c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 28px rgba(231,76,60,.45)" }}>🩸</div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Donors</h1>
                            <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", margin: 0 }}>{donors.length} verified blood donors in the network</p>
                        </div>
                    </div>

                    {/* Filter chips */}
                    <div style={{ marginBottom: 16, opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease .1s both" : "none" }}>
                        <div style={{ color: "rgba(255,255,255,.55)", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>Filter by Blood Group</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            <button className="bg-pill" onClick={() => setFilter("")}
                                style={{
                                    background: !filter ? "linear-gradient(135deg,#fff,#ddd)" : "rgba(255,255,255,.04)",
                                    color: !filter ? "#0d0d12" : "rgba(255,255,255,.7)",
                                    border: `1.5px solid ${!filter ? "transparent" : "rgba(255,255,255,.1)"}`,
                                    padding: "8px 14px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", fontFamily: "inherit", cursor: "pointer",
                                }}>
                                All <span style={{ opacity: .6, marginLeft: 4 }}>· {donors.length}</span>
                            </button>
                            {ALL_GROUPS.map(g => (
                                <button key={g} className="bg-pill" onClick={() => setFilter(filter === g ? "" : g)}
                                    style={{
                                        background: filter === g ? BG_GRAD[g] : "rgba(255,255,255,.04)",
                                        color: filter === g ? "#fff" : "rgba(255,255,255,.7)",
                                        border: `1.5px solid ${filter === g ? "transparent" : "rgba(255,255,255,.1)"}`,
                                        padding: "8px 14px", borderRadius: 999, fontWeight: 700, fontSize: ".82rem", fontFamily: "inherit", cursor: "pointer",
                                        boxShadow: filter === g ? `0 6px 18px ${BG_DOT[g]}55` : "none",
                                    }}>
                                    {g} <span style={{ opacity: .65, marginLeft: 4 }}>· {groupCounts[g] || 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search bar */}
                    <div style={{ marginBottom: 22, opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease .15s both" : "none" }}>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.4)", fontSize: 16 }}>🔍</span>
                            <input className="sin" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 44 }} />
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px" }}>
                            <span style={{ width: 32, height: 32, border: "3px solid rgba(231,76,60,.25)", borderTop: "3px solid #e74c3c", borderRadius: "50%", animation: "spin .8s linear infinite", marginBottom: 14 }} />
                            <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".88rem" }}>Loading donors…</span>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && filtered.length === 0 && (
                        <div style={{ background: "rgba(20,20,28,.7)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 22, padding: 50, textAlign: "center", animation: "fadeUp .5s ease" }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🩸</div>
                            <div style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>No donors match your filters</div>
                            <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem" }}>Try clearing search or selecting "All".</div>
                        </div>
                    )}

                    {/* Grid */}
                    {!loading && filtered.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
                            {filtered.map((d, i) => {
                                const initials = (d.name || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
                                const isReq = requestedIds.includes(d._id);
                                const isReqing = requesting === d._id;
                                return (
                                    <div key={d._id} className="dn-card" style={{
                                        background: "rgba(20,20,28,.72)", backdropFilter: "blur(20px)",
                                        border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: 18,
                                        animation: ready ? `fadeUp .45s ease ${Math.min(i, 8) * .04 + .2}s both` : "none",
                                        boxShadow: "0 8px 22px rgba(0,0,0,.25)",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 14, background: BG_GRAD[d.bloodGroup] || "linear-gradient(135deg,#34495e,#2c3e50)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: ".95rem", fontWeight: 800, boxShadow: `0 8px 22px ${BG_DOT[d.bloodGroup] || "#34495e"}55` }}>
                                                {initials}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ color: "#fff", fontSize: ".95rem", fontWeight: 700, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name || "Anonymous"}</div>
                                                <div style={{ color: "rgba(255,255,255,.45)", fontSize: ".74rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                                            <span style={{ background: BG_GRAD[d.bloodGroup] || "#34495e", color: "#fff", padding: "5px 12px", borderRadius: 999, fontSize: ".78rem", fontWeight: 800 }}>{d.bloodGroup || "?"}</span>
                                            {d.isAvailable !== false && <span style={{ background: "rgba(39,174,96,.18)", color: "#5fd693", padding: "4px 10px", borderRadius: 999, fontSize: ".7rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5fd693", animation: "pulse 1.6s infinite" }} />Available</span>}
                                        </div>
                                        <button className="rbtn" onClick={() => handleRequest(d._id)} disabled={isReq || isReqing}
                                            style={{
                                                width: "100%", padding: "10px",
                                                background: isReq ? "rgba(39,174,96,.2)" : "linear-gradient(135deg,#e74c3c,#c0392b)",
                                                color: isReq ? "#5fd693" : "#fff",
                                                border: isReq ? "1px solid rgba(39,174,96,.4)" : "none",
                                                borderRadius: 11, fontSize: ".84rem", fontWeight: 700,
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                            }}>
                                            {isReqing ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Sending…</>
                                                : isReq ? "✓ Request Sent"
                                                : "Request Blood"}
                                        </button>
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
