import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const LINKS = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Donors", path: "/donors" },
    { label: "Map", path: "/map" },
    { label: "My Requests", path: "/my-requests" },
    { label: "Incoming", path: "/incoming-requests" },
];

const AI_LINKS = [
    { label: "Chatbot", path: "/ai/chat", icon: "🤖", desc: "Ask anything" },
    { label: "Smart Match", path: "/ai/smart-match", icon: "🎯", desc: "AI-ranked donors" },
    { label: "Urgency Classifier", path: "/ai/urgency", icon: "⚡", desc: "Analyse a request" },
    { label: "Eligibility Check", path: "/ai/eligibility", icon: "✅", desc: "Can I donate?" },
];

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [hovered, setHovered] = useState(null);
    const [aiOpen, setAiOpen] = useState(false);
    const aiRef = useRef(null);

    useEffect(() => {
        const close = (e) => { if (aiRef.current && !aiRef.current.contains(e.target)) setAiOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const onAi = location.pathname.startsWith("/ai/");

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .nb-link { transition: all .18s ease; border: 1px solid transparent; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
                .nb-link:hover { background: rgba(255,255,255,.08) !important; border-color: rgba(255,255,255,.1) !important; }
                .nb-logout { transition: all .18s ease; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; }
                .nb-logout:hover { background: rgba(231,76,60,.2) !important; color: #ff6b6b !important; border-color: rgba(231,76,60,.4) !important; }
                .nb-ai { transition: all .18s ease; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; position:relative; }
                .nb-ai:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(142,68,173,.4) !important; }
                .ai-item { transition: all .15s ease; cursor:pointer; }
                .ai-item:hover { background: rgba(255,255,255,.06) !important; }
                @keyframes aiDrop { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
            `}</style>
            <nav style={{
                background: "rgba(13,13,18,.9)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,.07)",
                padding: "0 2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 64,
                position: "sticky",
                top: 0,
                zIndex: 200,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
                <div onClick={() => navigate("/dashboard")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#e74c3c,#c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 14px rgba(231,76,60,.5)" }}>🩸</div>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.3px" }}>BloodConnect</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {LINKS.map(link => {
                        const active = location.pathname === link.path;
                        return (
                            <button key={link.path} className="nb-link"
                                onClick={() => navigate(link.path)}
                                style={{
                                    background: active ? "rgba(231,76,60,.18)" : "transparent",
                                    color: active ? "#ff8a80" : "rgba(255,255,255,.55)",
                                    borderColor: active ? "rgba(231,76,60,.3)" : "transparent",
                                    padding: "7px 14px", borderRadius: 10,
                                    fontSize: "0.82rem", fontWeight: active ? 700 : 500,
                                }}
                            >{link.label}</button>
                        );
                    })}

                    {/* 🤖 AI dropdown */}
                    <div ref={aiRef} style={{ position: "relative", marginLeft: 4 }}>
                        <button className="nb-ai" onClick={() => setAiOpen(o => !o)}
                            style={{
                                background: onAi ? "linear-gradient(135deg,#8e44ad,#6c3483)" : "linear-gradient(135deg,rgba(142,68,173,.25),rgba(108,52,131,.25))",
                                color: onAi ? "#fff" : "#d6b3ff",
                                border: `1px solid ${onAi ? "rgba(142,68,173,.6)" : "rgba(142,68,173,.35)"}`,
                                padding: "7px 14px", borderRadius: 10,
                                fontSize: "0.82rem", fontWeight: 700,
                                display: "flex", alignItems: "center", gap: 6,
                            }}>
                            <span>✨ AI</span>
                            <span style={{ fontSize: ".7rem", opacity: .8, transform: aiOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .18s ease" }}>▾</span>
                        </button>
                        {aiOpen && (
                            <div style={{
                                position: "absolute", top: "calc(100% + 8px)", right: 0,
                                background: "rgba(20,20,28,.95)", backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,.1)", borderRadius: 14,
                                padding: 6, minWidth: 240, boxShadow: "0 12px 32px rgba(0,0,0,.5)",
                                animation: "aiDrop .18s ease",
                            }}>
                                {AI_LINKS.map(l => {
                                    const active = location.pathname === l.path;
                                    return (
                                        <div key={l.path} className="ai-item"
                                            onClick={() => { navigate(l.path); setAiOpen(false); }}
                                            style={{ padding: "10px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, background: active ? "rgba(142,68,173,.18)" : "transparent" }}>
                                            <div style={{ fontSize: 18 }}>{l.icon}</div>
                                            <div>
                                                <div style={{ color: "#fff", fontSize: ".85rem", fontWeight: 600 }}>{l.label}</div>
                                                <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem" }}>{l.desc}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <button className="nb-logout" onClick={logout} style={{
                        background: "rgba(255,255,255,.04)",
                        color: "rgba(255,255,255,.45)",
                        border: "1px solid rgba(255,255,255,.1)",
                        padding: "7px 16px", borderRadius: 10,
                        fontSize: "0.82rem", fontWeight: 600, marginLeft: 8,
                    }}>Logout</button>
                </div>
            </nav>
        </>
    );
}
