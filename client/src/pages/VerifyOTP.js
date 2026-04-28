import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes blob   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(28px,-20px) scale(1.04)} 66%{transform:translate(-18px,14px) scale(.97)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
@keyframes pulse  { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes pop    { 0%{transform:scale(.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
.otp-box {
    width: 52px; height: 60px;
    background: rgba(255,255,255,.06);
    border: 1.5px solid rgba(255,255,255,.12);
    border-radius: 14px;
    color: #fff;
    font-size: 1.6rem;
    font-weight: 800;
    text-align: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: border .2s, background .2s, transform .15s;
    caret-color: #e74c3c;
}
.otp-box:focus { border-color: rgba(231,76,60,.7); background: rgba(231,76,60,.07); transform: translateY(-2px); }
.otp-box.filled { border-color: rgba(231,76,60,.55); background: rgba(231,76,60,.06); }
.auth-btn { width:100%; padding:14px; background:linear-gradient(135deg,#e74c3c,#c0392b); color:#fff; border:none; border-radius:14px; font-size:.95rem; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all .2s cubic-bezier(.34,1.56,.64,1); box-shadow:0 8px 24px rgba(231,76,60,.35); }
.auth-btn:hover:not(:disabled){opacity:.92; transform: translateY(-1px); box-shadow:0 12px 30px rgba(231,76,60,.5);}
.auth-btn:active:not(:disabled){transform:scale(.98);}
.auth-btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}
.shake { animation: shake .4s ease; }
.resend-btn { background: none; border: none; color: #ff8a80; font-weight: 700; cursor: pointer; font-size: 0.85rem; font-family: 'Plus Jakarta Sans', sans-serif; transition: color .2s; padding: 0; }
.resend-btn:hover:not(:disabled) { color: #ffaaa3; }
.resend-btn:disabled { color: rgba(255,255,255,.3); cursor: not-allowed; }
`;

function maskEmail(email) {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (!domain) return email;
    const masked = name.length <= 2 ? name[0] + "*" : name[0] + "*".repeat(Math.min(name.length - 2, 4)) + name.slice(-1);
    return `${masked}@${domain}`;
}

export default function VerifyOTP() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [shake, setShake] = useState(false);
    const [seconds, setSeconds] = useState(60);
    const refs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    useEffect(() => {
        if (seconds <= 0) return;
        const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [seconds]);

    const handleChange = (val, i) => {
        if (!/^\d*$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[i] = val.slice(-1);
        setOtp(newOtp);
        if (val && i < 5) refs.current[i + 1]?.focus();
        if (newOtp.every(d => d) && !loading) {
            setTimeout(() => submitCode(newOtp.join("")), 100);
        }
    };

    const handleKeyDown = (e, i) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
        if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (paste.length > 0) {
            const arr = ["", "", "", "", "", ""];
            for (let i = 0; i < paste.length && i < 6; i++) arr[i] = paste[i];
            setOtp(arr);
            const focusIdx = Math.min(paste.length, 5);
            refs.current[focusIdx]?.focus();
            if (paste.length === 6) setTimeout(() => submitCode(paste), 100);
        }
    };

    const submitCode = async (code) => {
        if (code.length < 6) { setError("Enter all 6 digits"); triggerShake(); return; }
        setLoading(true); setError("");
        try {
            const res = await API.post("/api/auth/verify-otp", { email, otp: code });
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            setSuccess("Verified! Redirecting…");
            setTimeout(() => navigate("/dashboard"), 600);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
            triggerShake();
            setOtp(["", "", "", "", "", ""]);
            refs.current[0]?.focus();
        } finally { setLoading(false); }
    };

    const handleSubmit = (e) => { e.preventDefault(); submitCode(otp.join("")); };

    const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    const handleResend = async () => {
        setResending(true); setError("");
        try {
            await API.post("/api/auth/resend-otp", { email });
            setSeconds(60);
            setSuccess("New OTP sent!");
            setTimeout(() => setSuccess(""), 2200);
        } catch (err) {
            setError(err.response?.data?.message || "Could not resend OTP");
        } finally { setResending(false); }
    };

    const filledCount = otp.filter(d => d).length;
    const progress = (filledCount / 6) * 100;

    return (
        <>
            <style>{S}</style>
            <div style={{ minHeight: "100vh", background: "#0d0d12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", top: -120, left: -120, background: "radial-gradient(circle,rgba(192,57,43,.2) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", bottom: -80, right: -80, background: "radial-gradient(circle,rgba(142,68,173,.15) 0%,transparent 70%)", animation: "blob 12s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ width: "100%", maxWidth: 440, padding: "0 1.5rem", position: "relative", zIndex: 1, animation: "fadeUp .6s ease both" }}>
                    <div style={{ background: "rgba(20,20,28,.78)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 26, padding: "2.6rem 2rem", backdropFilter: "blur(20px)", boxShadow: "0 20px 50px rgba(0,0,0,.45)" }}>

                        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg,#e74c3c,#c0392b)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", boxShadow: "0 12px 32px rgba(231,76,60,.5)", marginBottom: 18, animation: "pop .5s cubic-bezier(.34,1.56,.64,1)" }}>📧</div>
                            <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-.4px" }}>Verify your email</h1>
                            <p style={{ color: "rgba(255,255,255,.5)", fontSize: "0.88rem", margin: 0, lineHeight: 1.5 }}>
                                We sent a 6-digit code to<br />
                                <strong style={{ color: "#fff", fontSize: ".94rem" }}>{maskEmail(email) || "your email"}</strong>
                            </p>
                        </div>

                        <div style={{ height: 4, background: "rgba(255,255,255,.05)", borderRadius: 999, overflow: "hidden", marginBottom: 22 }}>
                            <div style={{ height: "100%", width: progress + "%", background: "linear-gradient(90deg,#e74c3c,#ff8a80)", transition: "width .35s cubic-bezier(.34,1.56,.64,1)" }} />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={shake ? "shake" : ""} style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 22 }} onPaste={handlePaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={el => refs.current[i] = el}
                                        className={"otp-box" + (digit ? " filled" : "")}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleChange(e.target.value, i)}
                                        onKeyDown={e => handleKeyDown(e, i)}
                                        autoFocus={i === 0}
                                        disabled={loading || !!success}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div style={{ background: "rgba(231,76,60,.1)", border: "1px solid rgba(231,76,60,.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#ff6b6b", fontSize: "0.82rem", textAlign: "center", fontWeight: 600 }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {success && (
                                <div style={{ background: "rgba(39,174,96,.12)", border: "1px solid rgba(39,174,96,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#5fd693", fontSize: "0.82rem", textAlign: "center", fontWeight: 600, animation: "pop .35s ease" }}>
                                    ✅ {success}
                                </div>
                            )}

                            <button type="submit" className="auth-btn" disabled={loading || !!success}>
                                {loading
                                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                                        <span style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                                        Verifying…
                                      </span>
                                    : "Verify & Continue →"}
                            </button>
                        </form>

                        <div style={{ textAlign: "center", marginTop: 22 }}>
                            <p style={{ color: "rgba(255,255,255,.4)", fontSize: "0.82rem", margin: 0 }}>
                                Didn't receive it?{" "}
                                {seconds > 0 ? (
                                    <span style={{ color: "rgba(255,255,255,.55)", fontWeight: 600 }}>Resend in <strong style={{ color: "#ff8a80" }}>{seconds}s</strong></span>
                                ) : (
                                    <button className="resend-btn" onClick={handleResend} disabled={resending}>
                                        {resending ? "Sending…" : "Resend OTP"}
                                    </button>
                                )}
                            </p>
                        </div>
                    </div>

                    <p style={{ textAlign: "center", marginTop: 16, color: "rgba(255,255,255,.3)", fontSize: ".75rem" }}>
                        Check your spam folder if you don't see it.
                    </p>
                </div>
            </div>
        </>
    );
}
