import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
.dcard2 { transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease, border-color .25s ease; }
.dcard2:hover { transform: translateY(-7px); }
.sin { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:12px; color:#fff; padding:11px 16px; font-family:'Plus Jakarta Sans',sans-serif; font-size:.88rem; outline:none; transition:border .2s,background .2s; }
.sin:focus { border-color:rgba(231,76,60,.45); background:rgba(231,76,60,.04); }
.sin::placeholder { color:rgba(255,255,255,.28); }
.sin option { background:#1a1a22; }
.rbtn { width:100%; padding:11px; border:none; border-radius:11px; font-family:'Plus Jakarta Sans',sans-serif; font-size:.85rem; font-weight:700; cursor:pointer; transition:opacity .2s,transform .15s; }
.rbtn:hover:not(:disabled){opacity:.85;}
.rbtn:active:not(:disabled){transform:scale(.97);}
`;

const BG = { "A+": "#e74c3c", "A-": "#c0392b", "B+": "#8e44ad", "B-": "#6c3483", "AB+": "#2980b9", "AB-": "#1a5276", "O+": "#27ae60", "O-": "#1e8449" };

export default function Donors() {
    const [donors, setDonors] = useState([]);
    const [requestedIds, setRequestedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setReady(true), 80);
        API.get("/api/users/donors")
            .then(res => setDonors(Array.isArray(res.data) ? res.data : []))
            .catch(() => alert("Failed to fetch donors"))
            .finally(() => setLoading(false));
    }, []);

    const handleRequest = async (donorId) => {
        try {
            await API.post("/api/requests/create", { donorId });
            setRequestedIds(p => [...p, donorId]);
            alert("Request sent!");
        } catch (err) {
            alert(err.response?.data?.message || "Error sending request");
        }
    };

    const filtered = donors.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) &&
        (filter ? d.bloodGroup === filter : true)
    );

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", padding: "3rem 1.5rem" }}>
                <div style={{ maxWidth: 1060, margin: "0 auto" }}>
                    <div style={{ opacity: ready ? 1 : 0, transform: ready ? "none" : "translateY(20px)", transition: "all .5s ease", marginBottom: "2rem" }}>
                        <span style={{ display: "inline-block", background: "rgba(231,76,60,.12)", border: "1px solid rgba(231,76,60,.25)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#ff8a80", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 12 }}>Find Help</span>
                        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Available Donors</h1>
                        <p style={{ color: "rgba(255,255,255,.38)", margin: 0, fontSize: "0.9rem" }}>{filtered.length} donor(s) found</p>
                    </div>

                    <div style={{ display: "flex", gap: 12, marginBottom: "2rem", flexWrap: "wrap", opacity: ready ? 1 : 0, transition: "opacity .5s ease .1s" }}>
                        <input className="sin" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
                        <select className="sin" value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: 160 }}>
                            <option value="">All blood groups</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "5rem", color: "rgba(255,255,255,.3)" }}>
                            <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,.1)", borderTop: "3px solid #e74c3c", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
                            Loading donors...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,.03)", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 20 }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🩸</div>
                            <p style={{ color: "rgba(255,255,255,.3)", fontWeight: 500 }}>No donors match your search</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(275px,1fr))", gap: "1.2rem" }}>
                            {filtered.map((d, i) => {
                                const req = requestedIds.includes(d._id);
                                const col = BG[d.bloodGroup] || "#e74c3c";
                                return (
                                    <div key={d._id} className="dcard2"
                                        style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 20, padding: "1.5rem", animation: ready ? `fadeUp .45s ease ${i * .07 + .15}s both` : "none", boxShadow: "0 0 0 transparent" }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,.4)`; e.currentTarget.style.borderColor = "rgba(255,255,255,.14)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.1rem" }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>🧑</div>
                                            <span style={{ background: col, color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 800 }}>{d.bloodGroup}</span>
                                        </div>
                                        <h3 style={{ margin: "0 0 3px", fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{d.name}</h3>
                                        <p style={{ margin: "0 0 3px", fontSize: "0.78rem", color: "rgba(255,255,255,.35)" }}>{d.email}</p>
                                        <p style={{ margin: "0 0 1.2rem", fontSize: "0.78rem", color: d.isAvailable ? "#52d68a" : "#ff6b6b", fontWeight: 600 }}>
                                            {d.isAvailable ? "● Available" : "● Unavailable"}
                                        </p>
                                        <button className="rbtn"
                                            disabled={req || !d.isAvailable}
                                            onClick={() => handleRequest(d._id)}
                                            style={{
                                                background: req ? "rgba(255,255,255,.06)" : !d.isAvailable ? "rgba(255,255,255,.04)" : `linear-gradient(135deg,${col},${col}cc)`,
                                                color: req || !d.isAvailable ? "rgba(255,255,255,.25)" : "#fff",
                                                cursor: req || !d.isAvailable ? "not-allowed" : "pointer",
                                                boxShadow: !req && d.isAvailable ? `0 6px 20px ${col}55` : "none",
                                            }}
                                        >{req ? "✓ Requested" : !d.isAvailable ? "Unavailable" : "Request Blood"}</button>
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