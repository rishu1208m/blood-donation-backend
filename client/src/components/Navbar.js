import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
    };

    const links = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Donors", path: "/donors" },
        { label: "Map", path: "/map" },
        { label: "My Requests", path: "/my-requests" },
        { label: "Incoming", path: "/incoming-requests" }, // ✅ Fixed path
    ];

    return (
        <nav style={{
            background: "linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
            boxShadow: "0 2px 20px rgba(192,57,43,0.4)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            fontFamily: "'Outfit', sans-serif",
        }}>
            {/* Logo */}
            <div
                onClick={() => navigate("/dashboard")}
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
            >
                <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px"
                }}>🩸</div>
                <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "white", letterSpacing: "-0.5px" }}>
                    BloodConnect
                </span>
            </div>

            {/* Nav Links */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            style={{
                                background: isActive ? "rgba(255,255,255,0.25)" : "transparent",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: isActive ? 700 : 500,
                                fontFamily: "'Outfit', sans-serif",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={e => {
                                if (!isActive) e.target.style.background = "rgba(255,255,255,0.15)";
                            }}
                            onMouseLeave={e => {
                                if (!isActive) e.target.style.background = "transparent";
                            }}
                        >
                            {link.label}
                        </button>
                    );
                })}
                <button
                    onClick={logout}
                    style={{
                        background: "rgba(0,0,0,0.2)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.3)",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        fontFamily: "'Outfit', sans-serif",
                        marginLeft: "8px",
                        transition: "background 0.2s",
                    }}
                    onMouseEnter={e => e.target.style.background = "rgba(0,0,0,0.35)"}
                    onMouseLeave={e => e.target.style.background = "rgba(0,0,0,0.2)"}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;