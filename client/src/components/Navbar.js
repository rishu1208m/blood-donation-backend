import { useNavigate, Link } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    return (
        <div className="bg-red-500 text-white p-4 flex justify-between">
            <h2 className="font-bold">BloodConnect</h2>

            <div>
                <button onClick={() => navigate("/dashboard")} className="mr-4">Dashboard</button>
                <button onClick={() => navigate("/donors")} className="mr-4">Donors</button>
                <button onClick={() => navigate("/map")} className="mr-4">Map</button>
                <button onClick={() => navigate("/my-requests")}>Requests</button>
                <Link to="/incoming-requests" className="mr-4">
                    Incoming Requests
                </Link>
            </div>
        </div>
    );
}

export default Navbar;