import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-20px) scale(1.04)} 66%{transform:translate(-18px,14px) scale(.97)} }
@keyframes ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2);opacity:0} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:.8} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes count { from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }

.dcard { transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s ease; cursor: pointer; position: relative; overflow: hidden; }
.dcard:hover { transform: translateY(-8px) scale(1.015); }
.dcard:active { transform: translateY(-2px) scale(.98); }
.dcard::before { content:''; position:absolute; inset:0; background: linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 60%); opacity:0; transition: opacity .3s ease; border-radius:inherit; pointer-events:none; }
.dcard:hover::before { opacity:1; }
.dcard::after { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background: linear-gradient(45deg, transparent, rgba(255,255,255,.08), transparent); background-size: 200% 200%; opacity:0; transition: opacity .3s ease; pointer-events:none; }
.dcard:hover::after { opacity:1; animation: shimmer 1.5s ease infinite; }

.ai-banner { background: linear-gradient(135deg, #6c3483, #8e44ad, #c0392b, #e74c3c); background-size: 300% 300%; animation: gradMove 9s ease infinite; }

.stat-card { transition: all .25s ease; }
.stat-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,.14) !important; }

.float-icon { animation: float 3s ease-in-out infinite; }

.skeleton { background: linear-gradient(90deg, rgba(255,255,255,.05) 25%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.05) 75%); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; border-radius: 8px; }
`;

const CORE_CARDS = [
    { label: "Browse Donors",   desc: "Find available blood donors",       path: "/donors",            icon: "🩸", grad: "linear-gradient(135deg,#e74c3c,#c0392b)", glow: "rgba(231,76,60,.45)" },
    { label: "Map View",        desc: "See donors on the map",             path: "/map",               icon: "🗺️", grad: "linear-gradient(135deg,#8e44ad,#6c3483)", glow: "rgba(142,68,173,.45)" },
    { label: "My Requests",     desc: "Track your blood requests",         path: "/my-requests",       icon: "📋", grad: "linear-gradient(135deg,#2980b9,#1a5276)", glow: "rgba(41,128,185,.45)" },
    { label: "Incoming",        desc: "Requests sent to you",              path: "/incoming-requests", icon: "📩", grad: "linear-gradient(135deg,#27ae60,#1e8449)", glow: "rgba(39,174,96,.45)", badge: true },
];

const AI_CARDS = [
    { label: "AI Chatbot",       desc: "Ask anything about donation", path: "/ai/chat",         icon: "🤖", grad: "linear-gradient(135deg,#e74c3c,#c0392b)" },
    { label: "Smart Match",      desc: "AI ranks best donors",        path: "/ai/smart-match",  icon: "🎯", grad: "linear-gradient(135deg,#2980b9,#1a5276)" },
    { label: "Urgency Classify", desc: "Plain-text request analyser", path: "/ai/urgency",      icon: "⚡", grad: "linear-gradient(135deg,#f39c12,#d68910)" },
    { label: "Eligibility",      desc: "Can I donate today?",         path: "/ai/eligibility",  icon: "✅", grad: "linear-gradient(135deg,#27ae60,#1e8449)" },
];

const greeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return { text: "Good late night",  emoji: "🌙" };
    if (h < 12) return { text: "Good morning",     emoji: "🌅" };
    if (h < 17) return { text: "Good afternoon",   emoji: "☀️" };
    if (h < 21) return { text: "Good evening",     emoji: "🌆" };
    return        { text: "Good night",            emoji: "🌙" };
};

// Animated counter for stat numbers
function AnimatedCount({ value, duration = 800 }) {
    const [v, setV] = useState(0);
    useEffect(() => {
        let start = 0;
        const target = Number(value) || 0;
        if (target === 0) { setV(0); return; }
        const stepTime = Math.max(15, duration / target);
        const id = setInterval(() => {
            start += Math.max(1, Math.ceil(target / 30));
            if (start >= target) { setV(target); clearInterval(id); }
            else setV(start);
        }, stepTime);
        return () => clearInterval(id);
    }, [value, duration]);
    return <span>{v}</span>;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [pending, setPending] = useState(0);
    const [myRequests, setMyRequests] = useState(0);
    const [donorCount, setDonorCount] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [ready, setReady] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);

    const g = greeting();

    useEffect(() => {
        setTimeout(() => setReady(true), 60);

        Promise.all([
            API.get("/api/requests/incoming").catch(() => ({ data: [] })),
            API.get("/api/requests/my").catch(() => ({ data: [] })),
            API.get("/api/users").catch(() => ({ data: [] })),
        ]).then(([inc, mine, users]) => {
            setPending(Array.isArray(inc.data) ? inc.data.filter(r => r.status === "pending").length : 0);
            setMyRequests(Array.isArray(mine.data) ? mine.data.length : 0);
            setDonorCount(Array.isArray(users.data) ? users.data.filter(u => u.role === "donor").length : 0);
        }).finally(() => setLoadingStats(false));
    }, []);

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden", paddingBottom: 60 }}>
                <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", top: -160, left: -160, background: "radial-gradient(circle,rgba(192,57,43,.16) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", bottom: -100, right: -100, background: "radial-gradient(circle,rgba(142,68,173,.12) 0%,transparent 70%)", animation: "blob 12s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ maxWidth: 1080, margin: "0 auto", padding: "3rem 1.5rem 0", position: "relative", zIndex: 1 }}>

                    {/* ============ HERO ============ */}
                    <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(24px)", transition: "all .6s ease", marginBottom: 28 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(231,76,60,.12)", border: "1px solid rgba(231,76,60,.25)", borderRadius: 20, padding: "5px 14px", marginBottom: 14 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c", animation: "pulse 1.6s ease infinite" }} />
                            <span style={{ fontSize: 11, color: "#ff8a80", fontWeight: 700, letterSpacing: "0.7px" }}>BLOODCONNECT · DASHBOARD</span>
                        </div>
                        <h1 style={{ fontSize: "clamp(1.9rem,4.5vw,2.8rem)", fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.1, letterSpacing: "-1px" }}>
                            {g.text}, <span className="float-icon" style={{ display: "inline-block" }}>{g.emoji}</span>
                            <br />
                            <span style={{ background: "linear-gradient(135deg,#e74c3c,#ff8a80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Save lives</span> together.
                        </h1>
                        <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".95rem", margin: 0 }}>
                            One donation can save up to <strong style={{ color: "#fff" }}>3 lives</strong>. Here's what's happening today.
                        </p>
                    </div>

                    {/* ============ STAT STRIP ============ */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 28, opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease .15s both" : "none" }}>
                        <Stat icon="📩" label="Pending Incoming" value={pending}     color="#e74c3c" loading={loadingStats} />
                        <Stat icon="📋" label="My Requests"      value={myRequests}  color="#2980b9" loading={loadingStats} />
                        <Stat icon="🩸" label="Donors Available" value={donorCount}  color="#27ae60" loading={loadingStats} />
                        <Stat icon="✨" label="AI Features"      value={4}           color="#8e44ad" loading={false} suffix=" tools" />
                    </div>

                    {/* ============ AI BANNER ============ */}
                    <div onClick={() => navigate("/ai/chat")}
                        className="ai-banner dcard"
                        style={{
                            borderRadius: 22, padding: "22px 24px", marginBottom: 22,
                            display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
                            opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease .25s both" : "none",
                            boxShadow: "0 14px 40px rgba(142,68,173,.35)",
                        }}>
                        <div className="float-icon" style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,.18)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>🤖</div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: "inline-block", background: "rgba(255,255,255,.2)", color: "#fff", padding: "3px 10px", borderRadius: 999, fontSize: ".7rem", fontWeight: 700, letterSpacing: "1px", marginBottom: 6 }}>NEW · AI-POWERED</div>
                            <h2 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 800, margin: 0, letterSpacing: "-.3px" }}>Try BloodBot — your AI assistant</h2>
                            <p style={{ color: "rgba(255,255,255,.85)", fontSize: ".88rem", margin: "4px 0 0" }}>Get instant answers about eligibility, blood compatibility, donation process, and more.</p>
                        </div>
                        <div style={{ background: "#fff", color: "#c0392b", padding: "10px 18px", borderRadius: 12, fontWeight: 800, fontSize: ".88rem", boxShadow: "0 6px 18px rgba(0,0,0,.2)" }}>
                            Chat now →
                        </div>
                    </div>

                    {/* ============ CORE ACTIONS ============ */}
                    <div style={{ marginBottom: 28 }}>
                        <SectionTitle icon="⚡" label="Quick Actions" />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                            {CORE_CARDS.map((c, i) => (
                                <div key={c.path} className="dcard"
                                    onClick={() => navigate(c.path)}
                                    onMouseEnter={() => setHovered("c" + i)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{
                                        background: "rgba(255,255,255,.04)",
                                        backdropFilter: "blur(14px)",
                                        border: `1px solid ${hovered === "c" + i ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.07)"}`,
                                        borderRadius: 20,
                                        padding: "1.6rem",
                                        boxShadow: hovered === "c" + i ? `0 22px 50px ${c.glow}` : "0 4px 14px rgba(0,0,0,.2)",
                                        opacity: ready ? 1 : 0,
                                        animation: ready ? `fadeUp .5s ease ${i * .07 + .35}s both` : "none",
                                    }}>
                                    {c.badge && pending > 0 && (
                                        <div style={{ position: "absolute", top: 14, right: 14 }}>
                                            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#e74c3c", animation: "ping 1.5s ease infinite" }} />
                                            <div style={{ position: "relative", background: "#e74c3c", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{pending}</div>
                                        </div>
                                    )}
                                    <div style={{ width: 50, height: 50, borderRadius: 14, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", marginBottom: 16, boxShadow: `0 8px 22px ${c.glow}`, transition: "transform .3s ease", transform: hovered === "c" + i ? "scale(1.12) rotate(-4deg)" : "scale(1)" }}>
                                        {c.icon}
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: ".98rem", color: "#fff", margin: "0 0 4px" }}>{c.label}</p>
                                    <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,.42)", margin: 0 }}>{c.desc}</p>
                                    <div style={{ position: "absolute", bottom: 16, right: 16, fontSize: "1rem", color: hovered === "c" + i ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.12)", transition: "all .3s", transform: hovered === "c" + i ? "translate(3px,-3px)" : "none" }}>↗</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ============ AI ACTIONS ============ */}
                    <div style={{ marginBottom: 28 }}>
                        <SectionTitle icon="✨" label="AI Tools" badge="POWERED BY GEMINI" />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                            {AI_CARDS.map((c, i) => (
                                <div key={c.path} className="dcard"
                                    onClick={() => navigate(c.path)}
                                    onMouseEnter={() => setHovered("a" + i)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{
                                        background: "rgba(255,255,255,.03)",
                                        backdropFilter: "blur(14px)",
                                        border: `1px solid ${hovered === "a" + i ? "rgba(142,68,173,.4)" : "rgba(255,255,255,.06)"}`,
                                        borderRadius: 18,
                                        padding: "1.2rem 1.3rem",
                                        opacity: ready ? 1 : 0,
                                        animation: ready ? `fadeUp .5s ease ${i * .06 + .55}s both` : "none",
                                        display: "flex", alignItems: "center", gap: 12,
                                    }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, transition: "transform .3s ease", transform: hovered === "a" + i ? "scale(1.1) rotate(8deg)" : "scale(1)" }}>{c.icon}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: ".88rem", color: "#fff", margin: "0 0 2px" }}>{c.label}</p>
                                        <p style={{ fontSize: "0.74rem", color: "rgba(255,255,255,.42)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ============ INFO STRIP ============ */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease .85s both" : "none" }}>
                        <InfoTile emoji="❤️" title="Did you know?" body="One pint of blood can save up to 3 lives in critical care." />
                        <InfoTile emoji="⏱️" title="Donation time" body="The whole process takes about 30–45 minutes from start to finish." />
                        <InfoTile emoji="🔁" title="Recovery" body="Your body replaces lost fluids in 24 hours and red cells in ~6 weeks." />
                    </div>

                </div>
            </div>
        </>
    );
}

function Stat({ icon, label, value, color, loading, suffix = "" }) {
    return (
        <div className="stat-card" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}22`, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
                {loading ? (
                    <div className="skeleton" style={{ height: 22, width: 50, marginBottom: 4 }} />
                ) : (
                    <div style={{ color, fontSize: "1.4rem", fontWeight: 800, lineHeight: 1, animation: "count .5s cubic-bezier(.34,1.56,.64,1)" }}>
                        <AnimatedCount value={value} />{suffix}
                    </div>
                )}
                <div style={{ color: "rgba(255,255,255,.45)", fontSize: ".7rem", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</div>
            </div>
        </div>
    );
}

function SectionTitle({ icon, label, badge }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <h2 style={{ color: "#fff", fontSize: "1rem", fontWeight: 800, margin: 0, letterSpacing: "-.2px" }}>{label}</h2>
            {badge && <span style={{ background: "rgba(142,68,173,.18)", color: "#d6b3ff", padding: "3px 9px", borderRadius: 999, fontSize: ".65rem", fontWeight: 700, letterSpacing: "1px" }}>{badge}</span>}
        </div>
    );
}

function InfoTile({ emoji, title, body }) {
    return (
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
            <div style={{ color: "#fff", fontSize: ".88rem", fontWeight: 700, marginBottom: 4 }}>{title}</div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".78rem", lineHeight: 1.5 }}>{body}</div>
        </div>
    );
}
