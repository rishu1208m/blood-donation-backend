import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

function Dashboard() {
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        // Get user name from token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUserName(payload.name || "Donor");
            } catch { }
        }

        // ✅ Fixed: added /api/ prefix
        const checkRequests = async () => {
            try {
                const res = await API.get("/api/requests/incoming");
                const pending = Array.isArray(res.data)
                    ? res.data.filter((r) => r.status === "pending")
                    : [];
                setPendingCount(pending.length);
            } catch (err) {
                console.error("Notification error:", err);
            }
        };
        checkRequests();
    }, []);

    const cards = [
        {
            label: "View Map",
            description: "Find nearby donors on the map",
            path: "/map",
            icon: "🗺️",
            color: "#8e44ad",
            light: "#f5eef8",
        },
        {
            label: "View Donors",
            description: "Browse all available donors",
            path: "/donors",
            icon: "🩸",
            color: "#c0392b",
            light: "#fdedec",
        },
        {
            label: "My Requests",
            description: "Track your blood requests",
            path: "/my-requests",
            icon: "📋",
            color: "#2980b9",
            light: "#eaf4fb",
        },
        {
            label: "Incoming Requests",
            description: pendingCount > 0 ? `${pendingCount} pending request(s)` : "No new requests",
            path: "/incoming-requests",
            icon: "📩",
            color: "#27ae60",
            light: "#eafaf1",
            badge: pendingCount,
        },
    ];

    return (
        <>
            {/* Load Outfit font */}
            <link
                href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
            <Navbar />
            <div style={{
                minHeight: "calc(100vh - 64px)",
                background: "linear-gradient(160deg, #fff5f5 0%, #fff 60%)",
                fontFamily: "'Outfit', sans-serif",
                padding: "3rem 2rem",
            }}>
                {/* Header */}
                <div style={{ maxWidth: "900px", margin: "0 auto 2.5rem" }}>
                    <p style={{ color: "#e74c3c", fontWeight: 600, fontSize: "0.9rem", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>
                        Welcome back
                    </p>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                        Dashboard
                    </h1>
                    <p style={{ color: "#888", marginTop: "8px", fontSize: "1rem" }}>
                        What would you like to do today?
                    </p>
                </div>

                {/* Cards Grid */}
                <div style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.25rem",
                }}>
                    {cards.map((card) => (
                        <button
                            key={card.path}
                            onClick={() => navigate(card.path)}
                            style={{
                                background: "white",
                                border: `2px solid ${card.light}`,
                                borderRadius: "16px",
                                padding: "1.75rem 1.5rem",
                                cursor: "pointer",
                                textAlign: "left",
                                position: "relative",
                                transition: "all 0.2s ease",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                fontFamily: "'Outfit', sans-serif",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.boxShadow = `0 12px 28px rgba(0,0,0,0.12)`;
                                e.currentTarget.style.borderColor = card.color;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                                e.currentTarget.style.borderColor = card.light;
                            }}
                        >
                            {/* Badge */}
                            {card.badge > 0 && (
                                <div style={{
                                    position: "absolute", top: "14px", right: "14px",
                                    background: "#e74c3c", color: "white",
                                    borderRadius: "50%", width: "22px", height: "22px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.75rem", fontWeight: 700,
                                }}>
                                    {card.badge}
                                </div>
                            )}

                            {/* Icon */}
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "12px",
                                background: card.light,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.5rem", marginBottom: "1rem",
                            }}>
                                {card.icon}
                            </div>

                            <p style={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a1a", margin: "0 0 4px" }}>
                                {card.label}
                            </p>
                            <p style={{ fontSize: "0.8rem", color: "#999", margin: 0, fontWeight: 400 }}>
                                {card.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Dashboard;