import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-20px) scale(1.04)} 66%{transform:translate(-18px,14px) scale(.97)} }
@keyframes ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2);opacity:0} }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.dcard {
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.dcard:hover { transform: translateY(-10px) scale(1.02); }
.dcard:active { transform: translateY(-2px) scale(.98); }
.dcard::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 60%);
    opacity: 0;
    transition: opacity .3s ease;
    border-radius: inherit;
    pointer-events: none;
}
.dcard:hover::before { opacity: 1; }
`;

const CARDS = [
    { label: "View Map", desc: "Find nearby donors", path: "/map", icon: "🗺️", grad: "linear-gradient(135deg,#8e44ad,#6c3483)", glow: "rgba(142,68,173,.5)" },
    { label: "View Donors", desc: "Browse all donors", path: "/donors", icon: "🩸", grad: "linear-gradient(135deg,#e74c3c,#c0392b)", glow: "rgba(231,76,60,.5)" },
    { label: "My Requests", desc: "Track your requests", path: "/my-requests", icon: "📋", grad: "linear-gradient(135deg,#2980b9,#1a5276)", glow: "rgba(41,128,185,.5)" },
    { label: "Incoming", desc: "Requests for you", path: "/incoming-requests", icon: "📩", grad: "linear-gradient(135deg,#27ae60,#1e8449)", glow: "rgba(39,174,96,.5)", badge: true },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [pending, setPending] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setTimeout(() => setReady(true), 80);
        API.get("/api/requests/incoming")
            .then(res => setPending(Array.isArray(res.data) ? res.data.filter(r => r.status === "pending").length : 0))
            .catch(() => { });
    }, []);

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", top: -160, left: -160, background: "radial-gradient(circle,rgba(192,57,43,.16) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", bottom: -100, right: -100, background: "radial-gradient(circle,rgba(142,68,173,.12) 0%,transparent 70%)", animation: "blob 12s ease-in-out infinite reverse", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", top: "40%", left: "50%", background: "radial-gradient(circle,rgba(41,128,185,.08) 0%,transparent 70%)", animation: "blob 15s ease-in-out infinite", pointerEvents: "none" }} />

                <div style={{ maxWidth: 1000, margin: "0 auto", padding: "4rem 1.5rem", position: "relative", zIndex: 1 }}>
                    <div style={{ opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(24px)", transition: "all .6s ease", marginBottom: "3rem" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(231,76,60,.12)", border: "1px solid rgba(231,76,60,.25)", borderRadius: 20, padding: "5px 16px", marginBottom: 16 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c", display: "inline-block" }} />
                            <span style={{ fontSize: 12, color: "#ff8a80", fontWeight: 700, letterSpacing: "0.5px" }}>BLOODCONNECT</span>
                        </div>
                        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.1 }}>
                            Save Lives,<br /><span style={{ color: "#e74c3c" }}>One Drop</span> at a Time.
                        </h1>
                        <p style={{ color: "rgba(255,255,255,.4)", fontSize: "1rem", margin: 0 }}>What would you like to do today?</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1.2rem", marginBottom: "2rem" }}>
                        {CARDS.map((c, i) => (
                            <div key={c.path} className="dcard"
                                onClick={() => navigate(c.path)}
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    background: "rgba(255,255,255,.04)",
                                    border: `1px solid ${hovered === i ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.07)"}`,
                                    borderRadius: 22,
                                    padding: "1.8rem",
                                    boxShadow: hovered === i ? `0 24px 50px ${c.glow}` : "none",
                                    opacity: ready ? 1 : 0,
                                    animation: ready ? `fadeUp .5s ease ${i * .1 + .1}s both` : "none",
                                }}
                            >
                                {c.badge && pending > 0 && (
                                    <div style={{ position: "absolute", top: 16, right: 16 }}>
                                        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#e74c3c", animation: "ping 1.5s ease infinite" }} />
                                        <div style={{ position: "relative", background: "#e74c3c", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{pending}</div>
                                    </div>
                                )}
                                <div style={{ width: 54, height: 54, borderRadius: 16, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "1.25rem", boxShadow: `0 8px 24px ${c.glow}`, transition: "transform .3s ease", transform: hovered === i ? "scale(1.1) rotate(-3deg)" : "scale(1)" }}>
                                    {c.icon}
                                </div>
                                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#fff", margin: "0 0 5px" }}>{c.label}</p>
                                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,.38)", margin: 0 }}>{c.desc}</p>
                                <div style={{ position: "absolute", bottom: 20, right: 20, fontSize: "1rem", color: hovered === i ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.12)", transition: "all .3s", transform: hovered === i ? "translate(3px,-3px)" : "none" }}>↗</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", opacity: ready ? 1 : 0, animation: ready ? "fadeUp .5s ease .55s both" : "none" }}>
                        {[
                            { label: "Pending requests", value: pending, color: "#e74c3c" },
                            { label: "Your role", value: "Donor", color: "#27ae60" },
                            { label: "Account status", value: "Active ✓", color: "#2980b9" },
                        ].map(s => (
                            <div key={s.label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 16, padding: "1.25rem", textAlign: "center" }}>
                                <p style={{ color: s.color, fontSize: "1.5rem", fontWeight: 800, margin: "0 0 4px" }}>{s.value}</p>
                                <p style={{ color: "rgba(255,255,255,.3)", fontSize: "0.72rem", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}