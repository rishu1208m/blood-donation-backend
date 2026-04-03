import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes blob   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-20px) scale(1.04)} 66%{transform:translate(-18px,14px) scale(.97)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
.otp-box {
    width: 52px; height: 60px;
    background: rgba(255,255,255,.06);
    border: 1.5px solid rgba(255,255,255,.12);
    border-radius: 12px;
    color: #fff;
    font-size: 1.6rem;
    font-weight: 800;
    text-align: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: border .2s, background .2s;
    caret-color: #e74c3c;
}
.otp-box:focus { border-color: rgba(231,76,60,.7); background: rgba(231,76,60,.07); }
.auth-btn { width:100%; padding:14px; background:linear-gradient(135deg,#e74c3c,#c0392b); color:#fff; border:none; border-radius:12px; font-size:.95rem; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:opacity .2s,transform .15s; box-shadow:0 8px 24px rgba(231,76,60,.35); }
.auth-btn:hover:not(:disabled){opacity:.88;}
.auth-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}
.shake { animation: shake .4s ease; }
`;

export default function VerifyOTP() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const refs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const handleChange = (val, i) => {
        if (!/^\d*$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[i] = val.slice(-1);
        setOtp(newOtp);
        if (val && i < 5) refs.current[i + 1]?.focus();
    };

    const handleKeyDown = (e, i) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste.split(""));
            refs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) { setError("Enter all 6 digits"); triggerShake(); return; }
        setLoading(true);
        setError("");
        try {
            const res = await API.post("/api/auth/verify-otp", { email, otp: code });
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
            triggerShake();
            setOtp(["", "", "", "", "", ""]);
            refs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await API.post("/api/auth/resend-otp", { email });
            setError("");
            alert("New OTP sent to " + email);
        } catch (err) {
            setError(err.response?.data?.message || "Could not resend OTP");
        } finally {
            setResending(false);
        }
    };

    return (
        <>
            <style>{S}</style>
            <div style={{ minHeight: "100vh", background: "#0d0d12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: -120, left: -120, background: "radial-gradient(circle,rgba(192,57,43,.2) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", bottom: -80, right: -80, background: "radial-gradient(circle,rgba(142,68,173,.15) 0%,transparent 70%)", animation: "blob 12s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem", position: "relative", zIndex: 1, animation: "fadeUp .6s ease both" }}>
                    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 24, padding: "2.5rem 2rem", backdropFilter: "blur(12px)" }}>

                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#e74c3c,#c0392b)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", boxShadow: "0 10px 28px rgba(231,76,60,.45)", marginBottom: 18 }}>📧</div>
                            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Verify your email</h1>
                            <p style={{ color: "rgba(255,255,255,.38)", fontSize: "0.88rem", margin: 0 }}>
                                Enter the 6-digit OTP sent to<br />
                                <strong style={{ color: "rgba(255,255,255,.7)" }}>{email}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={shake ? "shake" : ""} style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }} onPaste={handlePaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={el => refs.current[i] = el}
                                        className="otp-box"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleChange(e.target.value, i)}
                                        onKeyDown={e => handleKeyDown(e, i)}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p style={{ color: "#ff6b6b", fontSize: "0.82rem", textAlign: "center", marginBottom: 16, fontWeight: 600 }}>
                                    ⚠️ {error}
                                </p>
                            )}

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading
                                    ? <span style={{ display: "inline-block", width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite", verticalAlign: "middle" }} />
                                    : "Verify & Continue →"
                                }
                            </button>
                        </form>

                        <div style={{ textAlign: "center", marginTop: 20 }}>
                            <p style={{ color: "rgba(255,255,255,.35)", fontSize: "0.85rem" }}>
                                Didn't receive it?{" "}
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    style={{ background: "none", border: "none", color: "#ff8a80", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                                >
                                    {resending ? "Sending..." : "Resend OTP"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}