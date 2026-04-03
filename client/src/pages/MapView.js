import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/Navbar";
import API from "../services/api";

// ✅ Fix Leaflet default marker icon broken in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🩸 Custom red marker for donors
const bloodIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function MapView() {
    const [donors, setDonors] = useState([]);
    const [center, setCenter] = useState([20.5937, 78.9629]); // Default: India
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [locationReady, setLocationReady] = useState(false);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCenter([lat, lng]);
                fetchNearby(lat, lng);
                setLocationReady(true);
            },
            () => {
                setError("Location access denied. Showing default view.");
                setLoading(false);
                setLocationReady(true);
            }
        );
    }, []);

    const fetchNearby = async (lat, lng) => {
        try {
            const res = await API.get(`/api/users/nearby?lat=${lat}&lng=${lng}`);
            setDonors(res.data);
        } catch (err) {
            console.error("Failed to fetch donors:", err);
            setError("Could not load nearby donors.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap"
                rel="stylesheet"
            />
            {/* ✅ Leaflet CSS — must be included */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />

            <Navbar />

            {/* Header bar */}
            <div style={{
                background: "white",
                padding: "1rem 2rem",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontFamily: "'Outfit', sans-serif",
            }}>
                <span style={{ fontSize: "1.5rem" }}>🗺️</span>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}>
                        Nearby Donors
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#999" }}>
                        {loading ? "Fetching your location..." : `${donors.length} donor(s) found near you`}
                    </p>
                </div>
                {error && (
                    <span style={{
                        marginLeft: "auto", background: "#fff5f5",
                        color: "#c0392b", padding: "6px 12px",
                        borderRadius: "8px", fontSize: "0.8rem", fontWeight: 500,
                    }}>
                        ⚠️ {error}
                    </span>
                )}
            </div>

            {/* Map — only render after location is determined */}
            {locationReady ? (
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ width: "100%", height: "calc(100vh - 130px)" }}
                >
                    {/* ✅ FREE — OpenStreetMap tiles, no API key needed */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Your location */}
                    <Marker position={center}>
                        <Popup><strong>📍 You are here</strong></Popup>
                    </Marker>

                    {/* Donor markers */}
                    {donors.map((d) => (
                        <Marker
                            key={d._id}
                            position={[
                                d.location.coordinates[1],
                                d.location.coordinates[0],
                            ]}
                            icon={bloodIcon}
                        >
                            <Popup>
                                <div style={{ fontFamily: "'Outfit', sans-serif", minWidth: "140px" }}>
                                    <strong style={{ color: "#c0392b", fontSize: "1rem" }}>
                                        {d.name}
                                    </strong>
                                    <p style={{ margin: "6px 0 2px", fontSize: "0.85rem" }}>
                                        🩸 Blood Group: <strong>{d.bloodGroup}</strong>
                                    </p>
                                    <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#888" }}>
                                        {d.isAvailable ? "✅ Available to donate" : "❌ Not available"}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            ) : (
                <div style={{
                    height: "calc(100vh - 130px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Outfit', sans-serif", color: "#999", fontSize: "1rem",
                }}>
                    📍 Getting your location...
                </div>
            )}
        </>
    );
}

export default MapView;