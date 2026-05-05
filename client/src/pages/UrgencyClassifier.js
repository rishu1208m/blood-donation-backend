import { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
@keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.05)} }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
@keyframes flash { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes scaleIn { from{transform:scale(0)} to{transform:scale(1)} }

.uc-card { background: rgba(20,20,28,.78); backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); border: 1px solid rgba(255,255,255,.08); border-radius: 24px; box-shadow: 0 14px 50px rgba(0,0,0,.4); }
.area { background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:16px 18px; color:#fff; font-size:.95rem; font-family:'Plus Jakarta Sans',sans-serif; outline:none; resize:vertical; min-height:140px; width:100%; box-sizing:border-box; transition: all .2s ease; line-height:1.5; }
.area:focus { border-color: rgba(243,156,18,.55); background:rgba(243,156,18,.05); box-shadow:0 0 0 4px rgba(243,156,18,.1); }
.cta { transition: all .22s cubic-bezier(.34,1.56,.64,1); cursor:pointer; }
.cta:hover:not(:disabled) { transform:translateY(-2px); }
.cta:active:not(:disabled) { transform:translateY(0) scale(.98); }
.cta:disabled { opacity:.45; cursor:not-allowed; }
.scenario-card { transition: all .25s ease; cursor:pointer; }
.scenario-card:hover { transform: translateY(-4px); }
.scenario-card.active { transform: translateY(-2px); }
.urg-flash { animation: flash 1.4s ease-in-out infinite; }
`;

const SCENARIOS = [
    { tone: "high",   icon: "🚨", color: "#e74c3c", bg: "linear-gradient(135deg,#e74c3c,#c0392b)",
      title: "Accident / ICU",
      text: "My father was in a road accident an hour ago and is now in the ICU at Apollo hospital. He urgently needs O+ blood, 2 units immediately." },
    { tone: "high",   icon: "🩸", color: "#c0392b", bg: "linear-gradient(135deg,#c0392b,#7b241c)",
      title: "Surgery in Hours",
      text: "My wife is bleeding heavily after delivery, doctors are starting emergency surgery in 30 minutes. She needs A- blood, 3 units NOW." },
    { tone: "medium", icon: "🏥", color: "#f39c12", bg: "linear-gradient(135deg,#f39c12,#d68910)",
      title: "Scheduled Surgery",
      text: "My mother has a bypass surgery scheduled next Tuesday. We need to arrange B- blood, 3 units for the operation." },
    { tone: "medium", icon: "💊", color: "#e67e22", bg: "linear-gradient(135deg,#e67e22,#ba4a00)",
      title: "Chemotherapy",
      text: "My uncle is undergoing chemotherapy and needs a transfusion this week. AB+ blood, 1 unit." },
    { tone: "low",    icon: "📅", color: "#27ae60", bg: "linear-gradient(135deg,#27ae60,#1e8449)",
      title: "Routine Top-up",
      text: "Routine monthly top-up for my brother who is a thalassemia patient. AB+ blood needed within next month." },
    { tone: "low",    icon: "🎯", color: "#16a085", bg: "linear-gradient(135deg,#16a085,#117864)",
      title: "Donation Drive",
      text: "Organising a college blood donation drive next month. Looking for general blood donor information and turnout." },
];

const URGENCY_THEME = {
    high:   { bg: "linear-gradient(135deg,#e74c3c,#c0392b)", glow: "rgba(231,76,60,.5)", emoji: "🚨", text: "#ff8a80", meter: 92, label: "URGENT" },
    medium: { bg: "linear-gradient(135deg,#f39c12,#d68910)", glow: "rgba(243,156,18,.5)", emoji: "⚠️", text: "#ffc36b", meter: 60, label: "MODERATE" },
    low:    { bg: "linear-gradient(135deg,#27ae60,#1e8449)", glow: "rgba(39,174,96,.5)",  emoji: "✅", text: "#5fd693", meter: 28, label: "PLANNED" },
};

export default function UrgencyClassifier() {
    const [text, setText] = useState("");
    const [activeScenario, setActiveScenario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const pickScenario = (s, idx) => {
        setText(s.text);
        setActiveScenario(idx);
        setResult(null);
        setError("");
    };

    const classify = async () => {
        if (text.trim().length < 5) return setError("Please describe the situation in more detail.");
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await API.post("/api/ai/classify-urgency", { description: text });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally { setLoading(false); }
    };

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden", paddingBottom: 60 }}>
                <div style={{ position: "absolute", width: 540, height: 540, borderRadius: "50%", top: -130, left: -130, background: "radial-gradient(circle,rgba(243,156,18,.13) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", bottom: -90, right: -90, background: "radial-gradient(circle,rgba(231,76,60,.12) 0%,transparent 70%)", animation: "blob 14s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px 0", position: "relative", zIndex: 1, animation: "fadeUp .5s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#f39c12,#d68910)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 28px rgba(243,156,18,.45)" }}>⚡</div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ color: "#fff", fontSize: "1.7rem", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Urgency Classifier</h1>
                            <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".9rem", margin: 0 }}>Describe the situation, AI extracts urgency level + key info</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <div style={{ color: "rgba(255,255,255,.55)", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>📚 Try a Scenario</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                            {SCENARIOS.map((s, i) => (
                                <button key={i} className={`scenario-card ${activeScenario === i ? "active" : ""}`} onClick={() => pickScenario(s, i)}
                                    style={{
                                        background: activeScenario === i ? s.bg : "rgba(20,20,28,.6)",
                                        backdropFilter: "blur(12px)",
                                        border: `1.5px solid ${activeScenario === i ? "transparent" : "rgba(255,255,255,.08)"}`,
                                        borderRadius: 14, padding: "14px 14px",
                                        textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                                        boxShadow: activeScenario === i ? `0 12px 30px ${s.color}55` : "0 4px 12px rgba(0,0,0,.2)",
                                    }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 9, background: activeScenario === i ? "rgba(255,255,255,.2)" : s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
                                        <span style={{ color: activeScenario === i ? "#fff" : "rgba(255,255,255,.85)", fontSize: ".88rem", fontWeight: 700 }}>{s.title}</span>
                                    </div>
                                    <div style={{ color: activeScenario === i ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.5)", fontSize: ".74rem", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {s.text}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="uc-card" style={{ padding: 24, marginBottom: 16 }}>
                        <label style={{ display: "block", color: "rgba(255,255,255,.7)", fontSize: ".82rem", fontWeight: 600, marginBottom: 10 }}>📝 Describe the situation</label>
                        <textarea className="area" value={text} onChange={e => { setText(e.target.value); setActiveScenario(null); }} placeholder="e.g. My uncle is in the ICU after a car accident, needs O- blood, 2 units, very urgent…" />

                        {error && <div style={{ color: "#ff6b6b", fontSize: ".85rem", marginTop: 12 }}>⚠️ {error}</div>}

                        <button className="cta" onClick={classify} disabled={loading}
                            style={{ marginTop: 16, width: "100%", background: "linear-gradient(135deg,#e74c3c,#c0392b)", color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: "1rem", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 10px 28px rgba(231,76,60,.4)" }}>
                            {loading
                                ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> AI is analysing…</>
                                : <>✨ Classify Urgency</>}
                        </button>
                    </div>

                    {result && <ResultCard result={result} />}
                </div>
            </div>
        </>
    );
}

function UrgencyMeter({ level }) {
    const theme = URGENCY_THEME[level] || URGENCY_THEME.medium;
    const meterValue = theme.meter;
    const circumference = 282.7;
    const offset = circumference - (meterValue / 100) * circumference;

    return (
        <div style={{ position: "relative", width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id={`grad-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {level === "high"   && <><stop offset="0%" stopColor="#e74c3c" /><stop offset="100%" stopColor="#c0392b" /></>}
                        {level === "medium" && <><stop offset="0%" stopColor="#f39c12" /><stop offset="100%" stopColor="#d68910" /></>}
                        {level === "low"    && <><stop offset="0%" stopColor="#27ae60" /><stop offset="100%" stopColor="#1e8449" /></>}
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={`url(#grad-${level})`} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 50 50)"
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1)" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div className={level === "high" ? "urg-flash" : ""} style={{ fontSize: 36, animation: "pop .6s cubic-bezier(.34,1.56,.64,1)" }}>{theme.emoji}</div>
                <div style={{ color: theme.text, fontSize: ".7rem", fontWeight: 800, letterSpacing: "1.5px", marginTop: 4 }}>{theme.label}</div>
            </div>
        </div>
    );
}

function ResultCard({ result }) {
    const theme = URGENCY_THEME[result.urgency] || URGENCY_THEME.medium;
    return (
        <div className="uc-card" style={{ padding: 28, animation: "fadeUp .5s ease", borderColor: theme.text === "#ff8a80" ? "rgba(231,76,60,.3)" : theme.text === "#ffc36b" ? "rgba(243,156,18,.3)" : "rgba(39,174,96,.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginBottom: 24 }}>
                <UrgencyMeter level={result.urgency} />
                <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Urgency Level</div>
                    <h2 style={{ color: theme.text, fontSize: "2rem", fontWeight: 800, margin: "4px 0", textTransform: "capitalize", letterSpacing: "-.5px" }}>{result.urgency}</h2>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                        {result.bloodGroup && <Pill icon="🩸" label={result.bloodGroup} bg="rgba(231,76,60,.15)" color="#ff8a80" />}
                        {result.unitsNeeded != null && <Pill icon="📦" label={`${result.unitsNeeded} unit${result.unitsNeeded > 1 ? "s" : ""}`} bg="rgba(41,128,185,.15)" color="#79a6ff" />}
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
                <ResultBlock icon="🧠" title="AI Reasoning" body={result.reasoning} />
                {result.suggestedAction && <ResultBlock icon="🎯" title="Next Step" body={result.suggestedAction} highlight />}
            </div>
        </div>
    );
}

function Pill({ icon, label, bg, color }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: bg, color, padding: "5px 11px", borderRadius: 999, fontSize: ".82rem", fontWeight: 700, animation: "scaleIn .35s cubic-bezier(.34,1.56,.64,1)" }}>
            <span>{icon}</span>{label}
        </span>
    );
}

function ResultBlock({ icon, title, body, highlight }) {
    return (
        <div style={{
            background: highlight ? "rgba(231,76,60,.08)" : "rgba(255,255,255,.03)",
            border: `1px solid ${highlight ? "rgba(231,76,60,.22)" : "rgba(255,255,255,.06)"}`,
            borderRadius: 14, padding: 16,
            animation: "fadeUp .4s ease",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ color: highlight ? "#ff8a80" : "rgba(255,255,255,.55)", fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px" }}>{title}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,.92)", fontSize: ".94rem", margin: 0, lineHeight: 1.55 }}>{body}</p>
        </div>
    );
}
