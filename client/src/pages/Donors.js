import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const bloodGroupColors = {
    "A+": "#e74c3c", "A-": "#c0392b",
    "B+": "#8e44ad", "B-": "#6c3483",
    "AB+": "#2980b9", "AB-": "#1a5276",
    "O+": "#27ae60", "O-": "#1e8449",
};

function Donors() {
    const [donors, setDonors] = useState([]);
    const [requestedIds, setRequestedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterGroup, setFilterGroup] = useState("");

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            // ✅ Fixed: /api/ prefix added
            const res = await API.get("/api/users/donors");
            setDonors(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch donors");
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (donorId) => {
        try {
            // ✅ Fixed: /api/ prefix added
            await API.post("/api/requests/create", { donorId });
            setRequestedIds((prev) => [...prev, donorId]);
            alert("Request sent successfully!");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Error sending request";
            alert(msg);
        }
    };

    // Filter donors by name or blood group
    const filtered = donors.filter((d) => {
        const matchName = d.name.toLowerCase().includes(search.toLowerCase());
        const matchGroup = filterGroup ? d.bloodGroup === filterGroup : true;
        return matchName && matchGroup;
    });

    return (
        <>
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
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    {/* Header */}
                    <p style={{ color: "#e74c3c", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
                        Find Help
                    </p>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1a1a1a", margin: "0 0 1.5rem" }}>
                        Available Donors
                    </h1>

                    {/* Search + Filter bar */}
                    <div style={{ display: "flex", gap: "12px", marginBottom: "2rem", flexWrap: "wrap" }}>
                        <input
                            type="text"
                            placeholder="🔍 Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                flex: 1, minWidth: "200px",
                                padding: "10px 16px", borderRadius: "10px",
                                border: "1.5px solid #f5c6c6", outline: "none",
                                fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem",
                                background: "white",
                            }}
                        />
                        <select
                            value={filterGroup}
                            onChange={(e) => setFilterGroup(e.target.value)}
                            style={{
                                padding: "10px 16px", borderRadius: "10px",
                                border: "1.5px solid #f5c6c6", outline: "none",
                                fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem",
                                background: "white", cursor: "pointer",
                                color: filterGroup ? "#1a1a1a" : "#999",
                            }}
                        >
                            <option value="">All Blood Groups</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>
                            Loading donors...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{
                            textAlign: "center", padding: "4rem",
                            background: "white", borderRadius: "16px",
                            border: "2px dashed #f5c6c6",
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🩸</div>
                            <p style={{ color: "#999", fontWeight: 500 }}>
                                {search || filterGroup ? "No donors match your search" : "No donors available"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                Showing {filtered.length} donor(s)
                            </p>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                gap: "1.25rem",
                            }}>
                                {filtered.map((d) => {
                                    const isRequested = requestedIds.includes(d._id);
                                    const bgColor = bloodGroupColors[d.bloodGroup] || "#c0392b";
                                    return (
                                        <div key={d._id} style={{
                                            background: "white",
                                            borderRadius: "16px",
                                            padding: "1.5rem",
                                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                            border: "1px solid #f5f5f5",
                                            transition: "transform 0.2s, box-shadow 0.2s",
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = "translateY(-3px)";
                                                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                                            }}
                                        >
                                            {/* Top: avatar + blood group badge */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                                <div style={{
                                                    width: "48px", height: "48px", borderRadius: "12px",
                                                    background: "#fff5f5", display: "flex",
                                                    alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
                                                }}>
                                                    🧑
                                                </div>
                                                <span style={{
                                                    background: bgColor, color: "white",
                                                    padding: "4px 12px", borderRadius: "20px",
                                                    fontSize: "0.85rem", fontWeight: 700,
                                                }}>
                                                    {d.bloodGroup}
                                                </span>
                                            </div>

                                            <h3 style={{ margin: "0 0 4px", fontWeight: 700, color: "#1a1a1a", fontSize: "1.05rem" }}>
                                                {d.name}
                                            </h3>
                                            <p style={{ margin: "0 0 4px", fontSize: "0.82rem", color: "#999" }}>
                                                {d.email}
                                            </p>
                                            <p style={{ margin: "0 0 1.25rem", fontSize: "0.82rem", color: d.isAvailable ? "#27ae60" : "#e74c3c", fontWeight: 600 }}>
                                                {d.isAvailable ? "✅ Available" : "❌ Not available"}
                                            </p>

                                            <button
                                                disabled={isRequested || !d.isAvailable}
                                                onClick={() => handleRequest(d._id)}
                                                style={{
                                                    width: "100%", padding: "10px",
                                                    background: isRequested ? "#eee" : !d.isAvailable ? "#f5f5f5" : "#e74c3c",
                                                    color: isRequested || !d.isAvailable ? "#aaa" : "white",
                                                    border: "none", borderRadius: "10px",
                                                    fontWeight: 600, cursor: isRequested || !d.isAvailable ? "not-allowed" : "pointer",
                                                    fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem",
                                                    transition: "background 0.2s",
                                                }}
                                            >
                                                {isRequested ? "✓ Requested" : !d.isAvailable ? "Unavailable" : "Request Blood"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default Donors;