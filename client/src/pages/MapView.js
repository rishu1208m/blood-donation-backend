import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import API from "../services/api";

function MapView() {
    const [donors, setDonors] = useState([]);
    const [center, setCenter] = useState({ lat: 0, lng: 0 });

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            setCenter({ lat, lng });
            fetchNearby(lat, lng);
        });
    }, []);

    const fetchNearby = async (lat, lng) => {
        const res = await API.get(`/users/nearby?lat=${lat}&lng=${lng}`);
        setDonors(res.data);
    };

    return (
        <LoadScript googleMapsApiKey="YOUR_API_KEY">
            <GoogleMap center={center} zoom={12} mapContainerStyle={{ width: "100%", height: "90vh" }}>
                {donors.map((d) => (
                    <Marker
                        key={d._id}
                        position={{
                            lat: d.location.coordinates[1],
                            lng: d.location.coordinates[0],
                        }}
                    />
                ))}
            </GoogleMap>
        </LoadScript>
    );
}

export default MapView;