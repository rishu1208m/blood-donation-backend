import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes blob   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-20px) scale(1.04)} 66%{transform:translate(-18px,14px) scale(.97)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
.auth-in { width:100%; padding:13px 16px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:12px; color:#fff; font-size:.9rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; box-sizing:border-box; transition:border .2s,background .2s; }
.auth-in:focus { border-color:rgba(231,76,60,.6); background:rgba(231,76,60,.06); }
.auth-in::placeholder { color:rgba(255,255,255,.28); }
.auth-btn { width:100%; padding:14px; background:linear-gradient(135deg,#e74c3c,#c0392b); color:#fff; border:none; border-radius:12px; font-size:.95rem; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:opacity .2s,transform .15s; box-shadow:0 8px 24px rgba(231,76,60,.35); }
.auth-btn:hover:not(:disabled){opacity:.88;}
.auth-btn:active:not(:disabled){transform:scale(.98);}
.auth-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}
.err-banner { color:#ff6b6b; background:rgba(231,76,60,.08); border:1px solid rgba(231,76,60,.22); border-radius:10px; padding:10px 14px; font-size:.82rem; margin-bottom:14px; animation: shake .35s ease; }
`;

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => setReady(true), 60);
        if (localStorage.getItem("token")) navigate("/dashboard");
    }, [navigate]);

    // Strip ALL whitespace from email — handles paste-with-spaces, autofill quirks,
    // and stray taps on the spacebar that produce the "part after @ should not contain space" error.
    const onEmailChange = (e) => setEmail(e.target.value.replace(/\s+/g, ""));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password.trim()) {
            setError("Please fill in both fields");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const res = await API.post("/api/auth/login", { email: cleanEmail, password });
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{S}</style>
            <div style={{ minHeight: "100vh", background: "#0d0d12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", top: -140, left: -140, background: "radial-gradient(circle,rgba(192,57,43,.2) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", bottom: -100, right: -100, background: "radial-gradient(circle,rgba(142,68,173,.15) 0%,transparent 70%)", animation: "blob 12s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem", position: "relative", zIndex: 1, opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(28px)", transition: "all .6s ease" }}>
                    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 24, padding: "2.5rem 2rem", backdropFilter: "blur(12px)" }}>

                        <div style={{ textAlign: "center", marginBottom: "2.2rem" }}>
                            <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#e74c3c,#c0392b)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", boxShadow: "0 10px 28px rgba(231,76,60,.45)", marginBottom: 18 }}>🩸</div>
                            <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Welcome back</h1>
                            <p style={{ color: "rgba(255,255,255,.38)", fontSize: "0.88rem", margin: 0 }}>Sign in to BloodConnect</p>
                        </div>

                        {error && <div className="err-banner">⚠️ {error}</div>}

                        {/* noValidate: skip browser HTML5 validation since we strip whitespace and validate ourselves */}
                        <form onSubmit={handleSubmit} noValidate>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: "block", color: "rgba(255,255,255,.5)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>Email</label>
                                <input type="email" autoComplete="email" className="auth-in" placeholder="you@example.com" value={email} onChange={onEmailChange} />
                            </div>
                            <div style={{ marginBottom: 26 }}>
                                <label style={{ display: "block", color: "rgba(255,255,255,.5)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>Password</label>
                                <input type="password" autoComplete="current-password" className="auth-in" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading
                                    ? <span style={{ display: "inline-block", width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite", verticalAlign: "middle" }} />
                                    : "Sign In →"
                                }
                            </button>
                        </form>

                        <p style={{ textAlign: "center", marginTop: 20, color: "rgba(255,255,255,.35)", fontSize: "0.85rem" }}>
                            No account?{" "}
                            <Link to="/register" style={{ color: "#ff8a80", fontWeight: 700, textDecoration: "none" }}>Create one</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
