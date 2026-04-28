import { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideLeft  { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
@keyframes pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.05)} }
@keyframes confetti { 0%{transform:translateY(-20px) rotate(0);opacity:1} 100%{transform:translateY(60px) rotate(360deg);opacity:0} }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes spin { to{transform:rotate(360deg)} }

.elig-card { background: rgba(20,20,28,.78); backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); border: 1px solid rgba(255,255,255,.08); border-radius: 24px; box-shadow: 0 14px 50px rgba(0,0,0,.4); }
.input { background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:12px 16px; color:#fff; font-size:.95rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; width:100%; box-sizing:border-box; transition: all .2s ease; }
.input:focus { border-color: rgba(39,174,96,.6); background:rgba(39,174,96,.06); box-shadow:0 0 0 4px rgba(39,174,96,.12); }
.input option { background:#1a1a22; }
.cta { transition: all .22s cubic-bezier(.34,1.56,.64,1); cursor:pointer; }
.cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 36px rgba(39,174,96,.45); }
.cta:active:not(:disabled) { transform:translateY(0) scale(.98); }
.cta:disabled { opacity:.45; cursor:not-allowed; }
.yn-btn { transition: all .2s ease; cursor:pointer; }
.yn-btn:hover { transform:translateY(-2px); }
.step-pill { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.78rem; font-weight:800; transition: all .3s ease; flex-shrink:0; }
.confetti-piece { position:absolute; width:8px; height:14px; animation: confetti 1.4s ease-out forwards; }
`;

// Multi-step wizard with grouped questions
const STEPS = [
    {
        title: "Basic Info",
        icon: "👤",
        gradient: "linear-gradient(135deg,#3498db,#2874a6)",
        questions: [
            { key: "age",      label: "How old are you?",        type: "number", placeholder: "e.g. 28", min: 1, max: 120 },
            { key: "gender",   label: "Gender",                  type: "select", options: ["male","female","other"] },
            { key: "weightKg", label: "Your weight (kg)",        type: "number", placeholder: "e.g. 65", min: 1, max: 300 },
        ],
    },
    {
        title: "Donation History",
        icon: "🩸",
        gradient: "linear-gradient(135deg,#e74c3c,#c0392b)",
        questions: [
            { key: "lastDonationDays", label: "Days since last donation (0 if never)", type: "number", placeholder: "0", min: 0 },
        ],
    },
    {
        title: "Health Today",
        icon: "💊",
        gradient: "linear-gradient(135deg,#f39c12,#d68910)",
        questions: [
            { key: "feelingWell",   label: "Feeling well today (no fever/cold/flu)?", type: "yn" },
            { key: "onAntibiotics", label: "Currently on antibiotics?",                type: "yn" },
            { key: "alcoholLast24h",label: "Drank alcohol in last 24 hours?",          type: "yn" },
        ],
    },
    {
        title: "Recent Activity",
        icon: "🎨",
        gradient: "linear-gradient(135deg,#8e44ad,#6c3483)",
        questions: [
            { key: "recentTattooMonths",  label: "Months since last tattoo/piercing (0 if none)", type: "number", placeholder: "0", min: 0 },
            { key: "recentSurgeryMonths", label: "Months since last surgery (0 if none)",         type: "number", placeholder: "0", min: 0 },
        ],
    },
    {
        title: "Special Conditions",
        icon: "🏥",
        gradient: "linear-gradient(135deg,#16a085,#117864)",
        questions: [
            { key: "pregnantOrBreastfeeding", label: "Pregnant or breastfeeding (last 6 months)?",      type: "yn" },
            { key: "chronicCondition",        label: "HIV, hepatitis, heart disease, or active cancer?", type: "yn" },
            { key: "notes",                   label: "Anything else? (optional)",                       type: "text", placeholder: "Allergies, medications, recent travel…" },
        ],
    },
];

export default function EligibilityCheck() {
    const [stepIdx, setStepIdx] = useState(0);
    const [direction, setDirection] = useState("right"); // for slide animation
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const step = STEPS[stepIdx];
    const isLast = stepIdx === STEPS.length - 1;
    const set = (k, v) => setAnswers(a => ({ ...a, [k]: v }));

    const stepValid = () => step.questions.every(q => {
        if (q.key === "notes") return true; // optional
        const v = answers[q.key];
        return v !== undefined && v !== "" && v !== null;
    });

    const next = () => {
        if (!stepValid()) { setError("Please fill in all questions"); return; }
        setError("");
        setDirection("right");
        setStepIdx(i => i + 1);
    };
    const back = () => {
        setError("");
        setDirection("left");
        setStepIdx(i => Math.max(0, i - 1));
    };

    const submit = async () => {
        if (!stepValid()) { setError("Please fill in all questions"); return; }
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await API.post("/api/ai/eligibility-check", { answers });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally { setLoading(false); }
    };

    const reset = () => { setAnswers({}); setStepIdx(0); setResult(null); setError(""); setDirection("right"); };

    const progress = result ? 100 : Math.round(((stepIdx + 1) / STEPS.length) * 100);

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden", paddingBottom: 60 }}>
                <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", top: -130, left: -130, background: "radial-gradient(circle,rgba(39,174,96,.13) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", bottom: -90, right: -90, background: "radial-gradient(circle,rgba(231,76,60,.12) 0%,transparent 70%)", animation: "blob 14s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 0", position: "relative", zIndex: 1, animation: "fadeUp .5s ease" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#27ae60,#1e8449)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 28px rgba(39,174,96,.45)" }}>✅</div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Eligibility Check</h1>
                            <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", margin: 0 }}>AI-powered pre-donation screening · WHO/Red Cross guidelines</p>
                        </div>
                    </div>

                    {/* Step indicator + progress */}
                    {!result && (
                        <div className="elig-card" style={{ padding: "16px 20px", marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                {STEPS.map((s, i) => {
                                    const done = i < stepIdx;
                                    const active = i === stepIdx;
                                    return (
                                        <div key={i} className="step-pill" style={{
                                            background: done ? "linear-gradient(135deg,#27ae60,#1e8449)" : active ? s.gradient : "rgba(255,255,255,.06)",
                                            color: done || active ? "#fff" : "rgba(255,255,255,.4)",
                                            transform: active ? "scale(1.12)" : "scale(1)",
                                            boxShadow: active ? "0 6px 18px rgba(39,174,96,.4)" : "none",
                                        }}>
                                            {done ? "✓" : i + 1}
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: progress + "%", background: "linear-gradient(90deg,#27ae60,#16a085)", transition: "width .4s cubic-bezier(.34,1.56,.64,1)", borderRadius: 999 }} />
                            </div>
                            <div style={{ marginTop: 8, color: "rgba(255,255,255,.45)", fontSize: ".75rem", fontWeight: 600 }}>
                                Step {stepIdx + 1} of {STEPS.length} · {progress}%
                            </div>
                        </div>
                    )}

                    {/* Step content */}
                    {!result && (
                        <div key={stepIdx} className="elig-card" style={{ padding: 28, animation: `${direction === "right" ? "slideRight" : "slideLeft"} .35s ease` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: step.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{step.icon}</div>
                                <h2 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>{step.title}</h2>
                            </div>

                            <div style={{ display: "grid", gap: 16 }}>
                                {step.questions.map(q => (
                                    <div key={q.key}>
                                        <label style={{ display: "block", color: "rgba(255,255,255,.7)", fontSize: ".85rem", fontWeight: 600, marginBottom: 8 }}>{q.label}</label>
                                        {q.type === "select" ? (
                                            <select className="input" value={answers[q.key] || ""} onChange={e => set(q.key, e.target.value)}>
                                                <option value="">Select…</option>
                                                {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        ) : q.type === "yn" ? (
                                            <div style={{ display: "flex", gap: 10 }}>
                                                {[
                                                    { v: "yes", c: "#27ae60", g: "linear-gradient(135deg,#27ae60,#1e8449)", label: "Yes" },
                                                    { v: "no",  c: "#e74c3c", g: "linear-gradient(135deg,#e74c3c,#c0392b)", label: "No"  },
                                                ].map(opt => {
                                                    const active = answers[q.key] === opt.v;
                                                    return (
                                                        <button key={opt.v} className="yn-btn" type="button" onClick={() => set(q.key, opt.v)}
                                                            style={{
                                                                flex: 1, padding: "14px",
                                                                background: active ? opt.g : "rgba(255,255,255,.04)",
                                                                color: active ? "#fff" : "rgba(255,255,255,.65)",
                                                                border: `1.5px solid ${active ? "transparent" : "rgba(255,255,255,.1)"}`,
                                                                borderRadius: 12, fontSize: ".95rem", fontWeight: 700, fontFamily: "inherit",
                                                                boxShadow: active ? `0 8px 22px ${opt.c}55` : "none",
                                                            }}>
                                                            {opt.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <input className="input" type={q.type} placeholder={q.placeholder} min={q.min} max={q.max} value={answers[q.key] || ""} onChange={e => set(q.key, e.target.value)} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {error && <div style={{ color: "#ff6b6b", fontSize: ".85rem", marginTop: 16, animation: "shake .35s ease" }}>⚠️ {error}</div>}

                            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                                <button className="cta" type="button" onClick={back} disabled={stepIdx === 0}
                                    style={{ flex: stepIdx === 0 ? 0 : 1, background: "rgba(255,255,255,.05)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "13px", fontSize: ".92rem", fontWeight: 700, fontFamily: "inherit", display: stepIdx === 0 ? "none" : "block" }}>
                                    ← Back
                                </button>
                                {!isLast ? (
                                    <button className="cta" type="button" onClick={next}
                                        style={{ flex: 2, background: step.gradient, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: ".95rem", fontWeight: 700, fontFamily: "inherit" }}>
                                        Next →
                                    </button>
                                ) : (
                                    <button className="cta" type="button" onClick={submit} disabled={loading}
                                        style={{ flex: 2, background: "linear-gradient(135deg,#27ae60,#1e8449)", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: ".95rem", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                        {loading
                                            ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Analysing…</>
                                            : <>✨ Check My Eligibility</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Result card */}
                    {result && <ResultCard result={result} onReset={reset} />}
                </div>
            </div>
        </>
    );
}

function ResultCard({ result, onReset }) {
    const ok = result.eligible;
    const palette = ok
        ? { c: "#27ae60", g: "linear-gradient(135deg,#27ae60,#1e8449)", glow: "rgba(39,174,96,.5)", icon: "✅", title: "You're eligible!", sub: "Thank you for being a hero 🩸" }
        : { c: "#e74c3c", g: "linear-gradient(135deg,#e74c3c,#c0392b)", glow: "rgba(231,76,60,.5)", icon: "⏳", title: "Not eligible right now", sub: result.deferralDays > 0 ? `Try again in ~${result.deferralDays} days` : "Please review reasons below" };

    return (
        <div className="elig-card" style={{ padding: 32, position: "relative", overflow: "hidden", borderColor: ok ? "rgba(39,174,96,.3)" : "rgba(231,76,60,.3)", animation: "fadeUp .5s ease" }}>
            {/* Confetti */}
            {ok && Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="confetti-piece" style={{
                    left: `${(i * 100 / 18) + Math.random() * 5}%`,
                    top: 0,
                    background: ["#27ae60","#16a085","#e74c3c","#f39c12","#3498db","#8e44ad"][i % 6],
                    animationDelay: `${Math.random() * 0.5}s`,
                }} />
            ))}

            <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div style={{ width: 88, height: 88, borderRadius: 26, background: palette.g, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 42, boxShadow: `0 16px 44px ${palette.glow}`, animation: "pop .6s cubic-bezier(.34,1.56,.64,1)" }}>
                    {palette.icon}
                </div>
                <h2 style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 800, margin: "16px 0 4px", letterSpacing: "-.4px" }}>{palette.title}</h2>
                <p style={{ color: palette.c, fontSize: "1rem", fontWeight: 600, margin: 0 }}>{palette.sub}</p>
            </div>

            <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: 18, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 16 }}>💬</span>
                    <span style={{ color: "rgba(255,255,255,.55)", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>AI Advice</span>
                </div>
                <p style={{ color: "rgba(255,255,255,.92)", fontSize: ".95rem", margin: 0, lineHeight: 1.6 }}>{result.advice}</p>
            </div>

            {result.reasons?.length > 0 && (
                <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: 18, marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 16 }}>{ok ? "🌟" : "📋"}</span>
                        <span style={{ color: "rgba(255,255,255,.55)", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{ok ? "Notes" : "Reasons"}</span>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {result.reasons.map((r, i) => (
                            <li key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < result.reasons.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none", animation: "fadeUp .4s ease both", animationDelay: `${i * .07}s` }}>
                                <span style={{ color: palette.c, fontSize: ".85rem", marginTop: 2 }}>●</span>
                                <span style={{ color: "rgba(255,255,255,.88)", fontSize: ".9rem", flex: 1 }}>{r}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button className="cta" onClick={onReset} style={{ width: "100%", background: "rgba(255,255,255,.06)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "13px", fontSize: ".95rem", fontWeight: 700, fontFamily: "inherit" }}>
                ↺ Run Again
            </button>
        </div>
    );
}
