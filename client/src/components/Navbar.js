import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const LINKS = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Donors", path: "/donors" },
    { label: "Map", path: "/map" },
    { label: "My Requests", path: "/my-requests" },
    { label: "Incoming", path: "/incoming-requests" },
];

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [hovered, setHovered] = useState(null);

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