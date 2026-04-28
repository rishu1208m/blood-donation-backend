import { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.05)} }
@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes scaleIn { from{transform:scale(0)} to{transform:scale(1)} }
@keyframes shine { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes barFill { from{width:0%} }
@keyframes ringGlow { 0%,100%{box-shadow:0 0 0 0 rgba(231,76,60,.0)} 50%{box-shadow:0 0 0 8px rgba(231,76,60,.18)} }

.sm-card { background: rgba(20,20,28,.78); backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); border: 1px solid rgba(255,255,255,.08); border-radius: 22px; box-shadow: 0 14px 50px rgba(0,0,0,.4); }
.bg-chip { transition: all .22s cubic-bezier(.34,1.56,.64,1); cursor:pointer; }
.bg-chip:hover { transform: translateY(-2px); }
.urg-chip { transition: all .2s ease; cursor:pointer; }
.urg-chip:hover { transform: translateY(-1px); }
.input { background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:11px 14px; color:#fff; font-size:.92rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition: border .2s, box-shadow .2s; }
.input:focus { border-color: rgba(41,128,185,.55); box-shadow: 0 0 0 4px rgba(41,128,185,.1); }
.cta { transition: all .22s cubic-bezier(.34,1.56,.64,1); cursor:pointer; }
.cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 36px rgba(231,76,60,.45); }
.cta:disabled { opacity:.45; cursor:not-allowed; }
.donor-card { transition: all .25s ease; }
.donor-card:hover { transform: translateY(-3px); border-color: rgba(231,76,60,.35) !important; box-shadow: 0 10px 26px rgba(0,0,0,.3); }
.podium-card { transition: all .3s cubic-bezier(.34,1.56,.64,1); position:relative; overflow:hidden; }
.podium-card:hover { transform: translateY(-6px) scale(1.02); }
.podium-card::before { content:""; position:absolute; inset:0; background: linear-gradient(135deg, rgba(255,255,255,.08), transparent 50%); pointer-events:none; }
.score-bar { background: linear-gradient(90deg, var(--c1), var(--c2)); background-size: 200% 100%; animation: barFill .9s cubic-bezier(.34,1.56,.64,1), shine 3s linear infinite; height:6px; border-radius:3px; }
`;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCIES = [
    { v: "low",    label: "Low",    icon: "🟢", c: "#27ae60", bg: "linear-gradient(135deg,#27ae60,#1e8449)" },
    { v: "medium", label: "Medium", icon: "🟡", c: "#f39c12", bg: "linear-gradient(135deg,#f39c12,#d68910)" },
    { v: "high",   label: "High",   icon: "🔴", c: "#e74c3c", bg: "linear-gradient(135deg,#e74c3c,#c0392b)" },
];

const PODIUM = [
    { rank: 1, height: 96, c: "linear-gradient(135deg,#f1c40f,#b7950b)", glow: "rgba(241,196,15,.45)", emoji: "🥇" },
    { rank: 2, height: 78, c: "linear-gradient(135deg,#bdc3c7,#7f8c8d)", glow: "rgba(189,195,199,.4)",  emoji: "🥈" },
    { rank: 3, height: 64, c: "linear-gradient(135deg,#e67e22,#a04000)", glow: "rgba(230,126,34,.4)",   emoji: "🥉" },
];

export default function SmartMatch() {
    const [bloodGroup, setBloodGroup] = useState("");
    const [urgency, setUrgency] = useState("medium");
    const [coords, setCoords] = useState({ lat: "", lng: "" });
    const [loading, setLoading] = useState(false);
    const [donors, setDonors] = useState(null);
    const [error, setError] = useState("");

    const useMyLocation = () => {
        if (!navigator.geolocation) return setError("Geolocation not supported");
        navigator.geolocation.getCurrentPosition(
            pos => setCoords({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }),
            () => setError("Could not get your location")
        );
    };

    const search = async () => {
        if (!bloodGroup) return setError("Please select a blood group");
        setLoading(true); setError(""); setDonors(null);
        try {
            const res = await API.post("/api/ai/smart-match", {
                bloodGroup, urgency,
                lat: coords.lat || undefined,
                lng: coords.lng || undefined,
            });
            setDonors(res.data.donors || []);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally { setLoading(false); }
    };

    const top3 = donors ? donors.slice(0, 3) : [];
    const rest = donors ? donors.slice(3) : [];

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden", paddingBottom: 60 }}>
                <div style={{ position: "absolute", width: 540, height: 540, borderRadius: "50%", top: -130, right: -130, background: "radial-gradient(circle,rgba(41,128,185,.13) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", bottom: -90, left: -90, background: "radial-gradient(circle,rgba(231,76,60,.12) 0%,transparent 70%)", animation: "blob 14s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px 0", position: "relative", zIndex: 1, animation: "fadeUp .5s ease" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#2980b9,#1a5276)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 28px rgba(41,128,185,.45)" }}>🎯</div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Smart Donor Match</h1>
                            <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", margin: 0 }}>AI ranks the best donors for your request — with reasoning</p>
                        </div>
                    </div>

                    {/* Filters Card */}
                    <div className="sm-card" style={{ padding: 22, marginBottom: 18 }}>
                        {/* Blood group chips */}
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ color: "rgba(255,255,255,.62)", fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>🩸 Blood Group Needed</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(70px,1fr))", gap: 8 }}>
                                {BLOOD_GROUPS.map(g => {
                                    const active = bloodGroup === g;
                                    return (
                                        <button key={g} className="bg-chip" onClick={() => setBloodGroup(g)}
                                            style={{
                                                background: active ? "linear-gradient(135deg,#e74c3c,#c0392b)" : "rgba(255,255,255,.04)",
                                                color: active ? "#fff" : "rgba(255,255,255,.7)",
                                                border: `1.5px solid ${active ? "transparent" : "rgba(255,255,255,.1)"}`,
                                                padding: "12px 6px", borderRadius: 12,
                                                fontSize: "1rem", fontWeight: 800, fontFamily: "inherit",
                                                boxShadow: active ? "0 8px 22px rgba(231,76,60,.45)" : "none",
                                            }}>
                                            {g}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Urgency chips */}
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ color: "rgba(255,255,255,.62)", fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>⚡ Urgency</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                {URGENCIES.map(u => {
                                    const active = urgency === u.v;
                                    return (
                                        <button key={u.v} className="urg-chip" onClick={() => setUrgency(u.v)}
                                            style={{
                                                flex: 1,
                                                background: active ? u.bg : "rgba(255,255,255,.04)",
                                                color: active ? "#fff" : "rgba(255,255,255,.7)",
                                                border: `1.5px solid ${active ? "transparent" : "rgba(255,255,255,.1)"}`,
                                                padding: "11px", borderRadius: 12,
                                                fontSize: ".88rem", fontWeight: 700, fontFamily: "inherit",
                                                boxShadow: active ? `0 6px 18px ${u.c}55` : "none",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                            }}>
                                            <span>{u.icon}</span>{u.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Location row */}
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ color: "rgba(255,255,255,.62)", fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>📍 Your Location <span style={{ fontWeight: 500, opacity: .6, textTransform: "none", letterSpacing: 0 }}> (optional, improves accuracy)</span></div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <input className="input" placeholder="Latitude"  value={coords.lat} onChange={e => setCoords({ ...coords, lat: e.target.value })} style={{ flex: "1 1 140px" }} />
                                <input className="input" placeholder="Longitude" value={coords.lng} onChange={e => setCoords({ ...coords, lng: e.target.value })} style={{ flex: "1 1 140px" }} />
                                <button className="cta" onClick={useMyLocation}
                                    style={{ background: "rgba(255,255,255,.06)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "10px 16px", fontSize: ".82rem", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                                    📍 Use My Location
                                </button>
                            </div>
                        </div>

                        {error && <div style={{ color: "#ff6b6b", fontSize: ".85rem", marginBottom: 10 }}>⚠️ {error}</div>}

                        <button className="cta" onClick={search} disabled={loading}
                            style={{ width: "100%", background: "linear-gradient(135deg,#e74c3c,#c0392b)", color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: "1rem", fontWeight: 700, fontFamily: "inherit", boxShadow: "0 10px 28px rgba(231,76,60,.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            {loading
                                ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> AI is ranking donors…</>
                                : <>✨ Find My Best Matches</>}
                        </button>
                    </div>

                    {/* Results */}
                    {donors && donors.length === 0 && (
                        <div className="sm-card" style={{ padding: 40, textAlign: "center", animation: "fadeUp .4s ease" }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                            <div style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>No compatible donors found</div>
                            <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem" }}>Try a different blood group or wait for new donors to register.</div>
                        </div>
                    )}

                    {top3.length > 0 && (
                        <>
                            {/* Podium for top 3 */}
                            <div style={{ marginBottom: 18, animation: "fadeUp .5s ease" }}>
                                <div style={{ color: "rgba(255,255,255,.62)", fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 12 }}>🏆 Top Matches</div>
                                <div style={{ display: "grid", gridTemplateColumns: top3.length === 1 ? "1fr" : top3.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr", gap: 12 }}>
                                    {top3.map((d, i) => <PodiumCard key={d._id} donor={d} podium={PODIUM[i]} delay={i * 0.1} />)}
                                </div>
                            </div>

                            {/* Rest list */}
                            {rest.length > 0 && (
                                <div>
                                    <div style={{ color: "rgba(255,255,255,.62)", fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>📋 More Matches</div>
                                    <div style={{ display: "grid", gap: 10 }}>
                                        {rest.map((d, i) => <DonorCard key={d._id} donor={d} rank={i + 4} delay={i * 0.05} />)}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function PodiumCard({ donor, podium, delay }) {
    const score = Math.round(donor.aiScore || 0);
    return (
        <div className="sm-card podium-card" style={{
            padding: 18, borderColor: `${podium.glow}`, animation: `pop .55s cubic-bezier(.34,1.56,.64,1) both`, animationDelay: `${delay}s`,
        }}>
            {/* Medal */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: podium.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: `0 10px 26px ${podium.glow}`, animation: "scaleIn .4s ease" }}>{podium.emoji}</div>
            </div>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ color: "#fff", fontSize: "1rem", fontWeight: 800, marginBottom: 4, letterSpacing: "-.2px" }}>{donor.name}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ background: "rgba(231,76,60,.18)", color: "#ff8a80", padding: "3px 10px", borderRadius: 999, fontSize: ".78rem", fontWeight: 800 }}>{donor.bloodGroup}</span>
                    {donor.isAvailable && <span style={{ background: "rgba(39,174,96,.18)", color: "#5fd693", padding: "3px 10px", borderRadius: 999, fontSize: ".7rem", fontWeight: 700 }}>● Available</span>}
                </div>
            </div>

            {/* Animated score bar */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>AI Score</span>
                    <span style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 800 }}>{score}</span>
                </div>
                <div style={{ background: "rgba(255,255,255,.06)", height: 6, borderRadius: 3, overflow: "hidden" }}>
                    <div className="score-bar" style={{ width: `${score}%`, "--c1": "#e74c3c", "--c2": "#f39c12" }} />
                </div>
            </div>

            <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <p style={{ color: "rgba(255,255,255,.85)", fontSize: ".82rem", margin: 0, lineHeight: 1.45 }}>💡 {donor.aiReason}</p>
            </div>

            <div style={{ display: "flex", gap: 8, fontSize: ".74rem", color: "rgba(255,255,255,.5)", flexWrap: "wrap" }}>
                {donor.distanceKm != null && <span>📍 {donor.distanceKm}km</span>}
                {donor.rating > 0 && <span>⭐ {donor.rating}</span>}
            </div>
        </div>
    );
}

function DonorCard({ donor, rank, delay }) {
    const score = Math.round(donor.aiScore || 0);
    const c = score >= 75 ? "#27ae60" : score >= 50 ? "#f39c12" : "#e74c3c";
    return (
        <div className="sm-card donor-card" style={{ padding: 16, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", animation: "fadeUp .4s ease both", animationDelay: `${delay}s` }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#3a3a4a,#252532)", border: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.7)", fontWeight: 800, fontSize: ".85rem" }}>
                #{rank}
            </div>
            <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <h3 style={{ color: "#fff", fontSize: ".95rem", fontWeight: 700, margin: 0 }}>{donor.name}</h3>
                    <span style={{ background: "rgba(231,76,60,.18)", color: "#ff8a80", padding: "2px 8px", borderRadius: 6, fontSize: ".7rem", fontWeight: 700 }}>{donor.bloodGroup}</span>
                    {donor.isAvailable && <span style={{ background: "rgba(39,174,96,.18)", color: "#5fd693", padding: "2px 8px", borderRadius: 6, fontSize: ".68rem", fontWeight: 700 }}>● Available</span>}
                </div>
                <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".82rem", margin: 0, lineHeight: 1.4 }}>💡 {donor.aiReason}</p>
                <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: ".72rem", color: "rgba(255,255,255,.42)" }}>
                    {donor.distanceKm != null && <span>📍 {donor.distanceKm}km</span>}
                    {donor.rating > 0 && <span>⭐ {donor.rating}</span>}
                    {donor.lastDonated && <span>🩸 {new Date(donor.lastDonated).toLocaleDateString()}</span>}
                </div>
            </div>
            <div style={{ textAlign: "center", minWidth: 56 }}>
                <div style={{ color: c, fontSize: "1.5rem", fontWeight: 800, lineHeight: 1 }}>{score}</div>
                <div style={{ color: "rgba(255,255,255,.4)", fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".8px", marginTop: 3 }}>Score</div>
            </div>
        </div>
    );
}
