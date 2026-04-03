import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes blob   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-20px) scale(1.04)} 66%{transform:translate(-18px,14px) scale(.97)} }
@keyframes spin   { to{transform:rotate(360deg)} }
.auth-in { width:100%; padding:13px 16px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:12px; color:#fff; font-size:.9rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; box-sizing:border-box; transition:border .2s,background .2s; }
.auth-in:focus { border-color:rgba(231,76,60,.6); background:rgba(231,76,60,.06); }
.auth-in::placeholder { color:rgba(255,255,255,.28); }
.auth-in option { background:#1a1a22; }
.auth-btn { width:100%; padding:14px; background:linear-gradient(135deg,#e74c3c,#c0392b); color:#fff; border:none; border-radius:12px; font-size:.95rem; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:opacity .2s,transform .15s; box-shadow:0 8px 24px rgba(231,76,60,.35); }
.auth-btn:hover:not(:disabled){opacity:.88;}
.auth-btn:active:not(:disabled){transform:scale(.98);}
.auth-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}
.role-btn { flex:1; padding:12px; border-radius:12px; font-family:'Plus Jakarta Sans',sans-serif; font-size:.88rem; font-weight:700; cursor:pointer; transition:all .2s; }
`;

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", bloodGroup: "", role: "donor" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { alert("Name is required"); return; }
        if (!form.email.trim()) { alert("Email is required"); return; }
        if (form.password.length < 8) { alert("Password must be 8+ characters"); return; }
        if (!form.bloodGroup) { alert("Please select a blood group"); return; }

        setLoading(true);
        try {
            await API.post("/api/auth/register", form);
            // ✅ Redirect to OTP verification page with email
            navigate("/verify-otp", { state: { email: form.email } });
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
        { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
        { label: "Password", name: "password", type: "password", placeholder: "Min 8 characters" },
    ];

    return (
        <>
            <style>{S}</style>
            <div style={{ minHeight: "100vh", background: "#0d0d12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: -120, right: -120, background: "radial-gradient(circle,rgba(192,57,43,.2) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bottom: -100, left: -100, background: "radial-gradient(circle,rgba(142,68,173,.15) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ width: "100%", maxWidth: 460, padding: "1.5rem", position: "relative", zIndex: 1, animation: "fadeUp .6s ease both" }}>
                    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 24, padding: "2.5rem 2rem", backdropFilter: "blur(12px)" }}>

                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#e74c3c,#c0392b)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", boxShadow: "0 10px 28px rgba(231,76,60,.45)", marginBottom: 16 }}>🩸</div>
                            <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Join BloodConnect</h1>
                            <p style={{ color: "rgba(255,255,255,.38)", fontSize: "0.88rem", margin: 0 }}>Create your account</p>
                        </div>

                        {/* Role selector */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", color: "rgba(255,255,255,.5)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.8px" }}>I am registering as</label>
                            <div style={{ display: "flex", gap: 10 }}>
                                {[
                                    { value: "donor", label: "🩸 Donor", desc: "I want to donate" },
                                    { value: "receiver", label: "🏥 Receiver", desc: "I need blood" },
                                ].map(r => (
                                    <button key={r.value} type="button" className="role-btn"
                                        onClick={() => setForm({ ...form, role: r.value })}
                                        style={{
                                            background: form.role === r.value ? "linear-gradient(135deg,#e74c3c,#c0392b)" : "rgba(255,255,255,.05)",
                                            color: form.role === r.value ? "#fff" : "rgba(255,255,255,.45)",
                                            border: `1.5px solid ${form.role === r.value ? "transparent" : "rgba(255,255,255,.1)"}`,
                                            boxShadow: form.role === r.value ? "0 6px 18px rgba(231,76,60,.35)" : "none",
                                        }}
                                    >
                                        <div>{r.label}</div>
                                        <div style={{ fontSize: "0.72rem", fontWeight: 400, opacity: .7, marginTop: 2 }}>{r.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {fields.map(f => (
                                <div key={f.name} style={{ marginBottom: 14 }}>
                                    <label style={{ display: "block", color: "rgba(255,255,255,.5)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>{f.label}</label>
                                    <input type={f.type} name={f.name} className="auth-in" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} required />
                                </div>
                            ))}

                            <div style={{ marginBottom: 26 }}>
                                <label style={{ display: "block", color: "rgba(255,255,255,.5)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>Blood Group</label>
                                <select name="bloodGroup" className="auth-in" value={form.bloodGroup} onChange={handleChange} required>
                                    <option value="">Select blood group</option>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading
                                    ? <span style={{ display: "inline-block", width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite", verticalAlign: "middle" }} />
                                    : "Create Account →"
                                }
                            </button>
                        </form>

                        <p style={{ textAlign: "center", marginTop: 20, color: "rgba(255,255,255,.35)", fontSize: "0.85rem" }}>
                            Have an account?{" "}
                            <Link to="/" style={{ color: "#ff8a80", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}