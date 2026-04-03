import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/Navbar";
import API from "../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const bloodIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function MapView() {
    const [donors, setDonors] = useState([]);
    const [center, setCenter] = useState([20.5937, 78.9629]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [locationReady, setLocationReady] = useState(false);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCenter([lat, lng]);
                API.get(`/api/users/nearby?lat=${lat}&lng=${lng}`)
                    .then(res => setDonors(res.data))
                    .catch(() => setError("Could not load nearby donors."))
                    .finally(() => setLoading(false));
                setLocationReady(true);
            },
            () => {
                setError("Location access denied. Showing default view.");
                setLoading(false);
                setLocationReady(true);
            }
        );
    }, []);

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <Navbar />

            {/* Header */}
            <div style={{ background: "rgba(13,13,18,.95)", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: 14, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#8e44ad,#6c3483)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: "0 4px 14px rgba(142,68,173,.4)" }}>🗺️</div>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#fff" }}>Nearby Donors</h2>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,.35)" }}>
                        {loading ? "Fetching your location..." : `${donors.length} donor(s) found near you`}
                    </p>
                </div>
                {error && (
                    <span style={{ marginLeft: "auto", background: "rgba(231,76,60,.12)", color: "#ff8a80", padding: "6px 14px", borderRadius: 10, fontSize: "0.78rem", fontWeight: 600, border: "1px solid rgba(231,76,60,.2)" }}>
                        ⚠️ {error}
                    </span>
                )}
            </div>

            {locationReady ? (
                <MapContainer center={center} zoom={13} style={{ width: "100%", height: "calc(100vh - 130px)" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={center}>
                        <Popup><strong>📍 You are here</strong></Popup>
                    </Marker>
                    {donors.map(d => (
                        <Marker key={d._id} position={[d.location.coordinates[1], d.location.coordinates[0]]} icon={bloodIcon}>
                            <Popup>
                                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", minWidth: 150 }}>
                                    <strong style={{ color: "#c0392b", fontSize: "1rem" }}>{d.name}</strong>
                                    <p style={{ margin: "6px 0 2px", fontSize: "0.85rem" }}>🩸 Blood Group: <strong>{d.bloodGroup}</strong></p>
                                    <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#888" }}>{d.isAvailable ? "✅ Available" : "❌ Not available"}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            ) : (
                <div style={{ height: "calc(100vh - 130px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0d0d12", color: "rgba(255,255,255,.3)", fontFamily: "'Plus Jakarta Sans',sans-serif", gap: 16 }}>
                    <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,.1)", borderTop: "3px solid #8e44ad", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                    Getting your location...
                </div>
            )}
        </>
    );
}