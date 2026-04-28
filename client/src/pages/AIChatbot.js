import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes pop    { 0%{transform:scale(.85);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
@keyframes blob   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.05)} }
@keyframes pulse  { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.18)} }
@keyframes glow   { 0%,100%{box-shadow:0 0 0 0 rgba(231,76,60,.0)} 50%{box-shadow:0 0 0 8px rgba(231,76,60,.18)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

.cb-shell { display:grid; grid-template-columns: 280px 1fr; gap:18px; height:calc(100vh - 64px - 32px); padding:16px 20px 16px; max-width:1200px; margin:0 auto; box-sizing:border-box; }
@media (max-width: 880px){ .cb-shell { grid-template-columns: 1fr; height:auto; } .cb-side { display:none; } }

.cb-card { background: rgba(20,20,28,.72); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.08); border-radius: 22px; box-shadow: 0 12px 40px rgba(0,0,0,.35); }

.cb-side { padding: 16px; display:flex; flex-direction:column; }
.cb-side h3 { color: rgba(255,255,255,.55); font-size:.7rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; margin: 14px 6px 8px; }
.tpl-btn { width:100%; text-align:left; padding:11px 12px; border-radius:12px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); color:rgba(255,255,255,.78); cursor:pointer; transition:all .18s ease; font-family:'Plus Jakarta Sans',sans-serif; display:flex; gap:10px; align-items:center; margin-bottom:6px; }
.tpl-btn:hover { background:rgba(231,76,60,.12); border-color:rgba(231,76,60,.35); transform: translateX(2px); }
.tpl-btn .ico { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
.tpl-btn .lbl { font-size:.83rem; font-weight:600; }
.tpl-btn .sub { font-size:.7rem; color:rgba(255,255,255,.4); margin-top:1px; }

.cb-main { display:flex; flex-direction:column; overflow:hidden; }
.cb-head { display:flex; align-items:center; gap:14px; padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,.06); }
.cb-avatar { width:42px; height:42px; border-radius:14px; background:linear-gradient(135deg,#e74c3c,#c0392b); display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 8px 24px rgba(231,76,60,.4); position:relative; }
.cb-avatar::after { content:""; position:absolute; right:-2px; bottom:-2px; width:12px; height:12px; border-radius:50%; background:#27ae60; border:2px solid #14141c; animation: pulse 2s infinite; }
.cb-title { color:#fff; font-size:1.05rem; font-weight:800; margin:0; letter-spacing:-.3px; }
.cb-sub   { color:rgba(255,255,255,.5); font-size:.78rem; margin:2px 0 0; }
.cb-clear { margin-left:auto; background:rgba(255,255,255,.04); color:rgba(255,255,255,.55); border:1px solid rgba(255,255,255,.1); padding:7px 12px; border-radius:10px; font-size:.78rem; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; transition:all .18s ease; }
.cb-clear:hover { background:rgba(231,76,60,.12); color:#ff8a80; border-color:rgba(231,76,60,.35); }

.cb-stream { flex:1; overflow-y:auto; padding: 22px; }
.cb-stream::-webkit-scrollbar { width: 8px; }
.cb-stream::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 4px; }

.row { display:flex; gap:10px; margin-bottom:14px; animation: fadeUp .28s ease; }
.row.user { justify-content:flex-end; }
.row .av { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; box-shadow:0 4px 14px rgba(0,0,0,.3); }
.row.bot .av { background:linear-gradient(135deg,#e74c3c,#c0392b); }
.row.user .av { background:linear-gradient(135deg,#2980b9,#1a5276); order:2; }
.bubble { max-width:78%; padding:12px 16px; border-radius:18px; font-size:.92rem; line-height:1.55; white-space:pre-wrap; word-wrap:break-word; }
.bubble.bot  { background: rgba(255,255,255,.05); color: rgba(255,255,255,.92); border:1px solid rgba(255,255,255,.07); border-bottom-left-radius:6px; }
.bubble.user { background: linear-gradient(135deg,#e74c3c,#c0392b); color:#fff; border-bottom-right-radius:6px; box-shadow:0 4px 14px rgba(231,76,60,.3); }
.bubble strong { font-weight:800; color:#fff; }
.bubble.bot strong { color:#ff8a80; }
.bubble ul { margin: 4px 0 4px; padding-left: 18px; }
.bubble li { margin: 2px 0; }
.ts { font-size:.68rem; color:rgba(255,255,255,.32); margin-top:4px; padding:0 4px; }
.row.user .ts { text-align:right; }

.dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#e74c3c; margin:0 2px; animation: pulse 1.2s infinite; }
.dot:nth-child(2){ animation-delay:.2s }
.dot:nth-child(3){ animation-delay:.4s }

.empty { text-align:center; padding: 40px 20px; animation: fadeIn .4s ease; }
.empty-icon { width:72px; height:72px; border-radius:22px; background:linear-gradient(135deg,#e74c3c,#c0392b); display:inline-flex; align-items:center; justify-content:center; font-size:34px; margin-bottom:18px; box-shadow:0 16px 40px rgba(231,76,60,.45); animation: pop .6s cubic-bezier(.34,1.56,.64,1); }
.empty h2 { color:#fff; font-size:1.4rem; font-weight:800; margin:0 0 6px; letter-spacing:-.4px; }
.empty p  { color:rgba(255,255,255,.55); font-size:.92rem; margin:0 0 22px; }
.starters { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px; max-width: 560px; margin: 0 auto; }
.starter { padding:14px 14px; border-radius:14px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); cursor:pointer; transition:all .2s ease; text-align:left; font-family:'Plus Jakarta Sans',sans-serif; }
.starter:hover { background:rgba(231,76,60,.12); border-color:rgba(231,76,60,.4); transform:translateY(-2px); box-shadow:0 8px 20px rgba(231,76,60,.2); }
.starter .em { font-size:18px; margin-bottom:6px; }
.starter .qq { color:#fff; font-size:.85rem; font-weight:600; }

.cb-input-wrap { padding: 14px 18px 18px; border-top: 1px solid rgba(255,255,255,.06); }
.cb-input { display:flex; gap:10px; align-items:flex-end; background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 6px 6px 6px 14px; transition: border-color .2s ease, box-shadow .2s ease; }
.cb-input:focus-within { border-color: rgba(231,76,60,.5); box-shadow: 0 0 0 4px rgba(231,76,60,.08); }
.cb-input textarea { flex:1; resize:none; background:transparent; border:none; outline:none; color:#fff; font-family:'Plus Jakarta Sans',sans-serif; font-size:.93rem; padding: 10px 0; min-height: 22px; max-height: 140px; line-height:1.4; }
.cb-input textarea::placeholder { color: rgba(255,255,255,.32); }
.send { background:linear-gradient(135deg,#e74c3c,#c0392b); color:#fff; border:none; border-radius:12px; width:42px; height:42px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; transition:all .18s ease; flex-shrink:0; }
.send:hover:not(:disabled) { transform:translateY(-1px) scale(1.04); box-shadow:0 8px 22px rgba(231,76,60,.5); }
.send:disabled { opacity:.4; cursor:not-allowed; }

.err { color:#ff6b6b; background: rgba(231,76,60,.08); border:1px solid rgba(231,76,60,.22); border-radius:10px; padding: 10px 14px; font-size:.82rem; margin: 0 18px 12px; }
`;

// Conversation templates (left sidebar)
const TEMPLATES = [
    { icon: "✅", color: "linear-gradient(135deg,#27ae60,#1e8449)", label: "Eligibility", sub: "Can I donate?",
      prompt: "What are the eligibility criteria to donate blood? List the main things I should check before donating." },
    { icon: "🩸", color: "linear-gradient(135deg,#e74c3c,#c0392b)", label: "Compatibility", sub: "Who can give to whom",
      prompt: "Explain blood group compatibility. Who can donate to whom for each of the 8 blood groups?" },
    { icon: "📋", color: "linear-gradient(135deg,#2980b9,#1a5276)", label: "Process", sub: "What happens at donation",
      prompt: "Walk me through the entire blood donation process from arrival to leaving. What should I expect?" },
    { icon: "💪", color: "linear-gradient(135deg,#8e44ad,#6c3483)", label: "Recovery", sub: "After-donation care",
      prompt: "What should I do after donating blood? Foods, drinks, activities to do or avoid for the next 24 hours." },
    { icon: "⏰", color: "linear-gradient(135deg,#f39c12,#d68910)", label: "Frequency", sub: "How often can I donate",
      prompt: "How often can I donate blood? Whole blood vs platelets vs plasma — what are the gaps required?" },
    { icon: "🚨", color: "linear-gradient(135deg,#c0392b,#7b241c)", label: "Emergency", sub: "Urgent need help",
      prompt: "Someone close to me urgently needs blood. What should I do right now using BloodConnect?" },
];

const STARTERS = [
    { em: "💉", q: "Am I eligible to donate?" },
    { em: "🆎", q: "What's blood group compatibility?" },
    { em: "🍎", q: "What should I eat after donating?" },
    { em: "🗓️", q: "How often can I donate?" },
];

// Tiny markdown → JSX renderer (only **bold**, lists, paragraphs).
function renderRich(text = "") {
    const lines = text.split(/\n/);
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (/^\s*[-*]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
                i++;
            }
            blocks.push(<ul key={"u" + i}>{items.map((t, k) => <li key={k}>{renderInline(t)}</li>)}</ul>);
        } else if (line.trim() === "") {
            i++;
        } else {
            blocks.push(<p key={"p" + i} style={{ margin: "0 0 8px" }}>{renderInline(line)}</p>);
            i++;
        }
    }
    return blocks.length ? blocks : <span>{text}</span>;
}
function renderInline(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
            ? <strong key={i}>{p.slice(2, -2)}</strong>
            : <span key={i}>{p}</span>
    );
}

const formatTime = d => {
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const am = h < 12 ? "AM" : "PM";
    return `${((h + 11) % 12) + 1}:${m} ${am}`;
};

const INITIAL = {
    role: "assistant",
    content: "Hi! I'm **BloodBot** 🩸\n\nI'm here to help with anything about blood donation, eligibility, group compatibility, or using BloodConnect.\n\nPick a topic from the left, or just type a question below.",
    ts: new Date(),
};

export default function AIChatbot() {
    const [messages, setMessages] = useState([INITIAL]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const endRef = useRef(null);
    const taRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Auto-resize textarea
    useEffect(() => {
        const ta = taRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
    }, [input]);

    const send = async (text) => {
        const content = (text ?? input).trim();
        if (!content || loading) return;
        const userMsg = { role: "user", content, ts: new Date() };
        const next = [...messages, userMsg];
        setMessages(next);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const payload = next.map(({ role, content }) => ({ role, content }));
            const res = await API.post("/api/ai/chat", { messages: payload });
            setMessages([...next, { role: "assistant", content: res.data.reply, ts: new Date() }]);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const reset = () => {
        setMessages([{ ...INITIAL, ts: new Date() }]);
        setError("");
    };

    const showEmpty = messages.length <= 1;

    return (
        <>
            <style>{S}</style>
            <Navbar />
            <div style={{ minHeight: "calc(100vh - 64px)", background: "#0d0d12", fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", top: -150, left: -150, background: "radial-gradient(circle,rgba(231,76,60,.13) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", bottom: -80, right: -80, background: "radial-gradient(circle,rgba(142,68,173,.1) 0%,transparent 70%)", animation: "blob 14s ease-in-out infinite reverse", pointerEvents: "none" }} />

                <div className="cb-shell" style={{ position: "relative", zIndex: 1, animation: "fadeUp .5s ease" }}>

                    {/* ==== SIDEBAR ==== */}
                    <aside className="cb-card cb-side">
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 8px" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#e74c3c,#c0392b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 6px 18px rgba(231,76,60,.4)" }}>🤖</div>
                            <div>
                                <div style={{ color: "#fff", fontSize: ".92rem", fontWeight: 800 }}>BloodBot</div>
                                <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem" }}>AI Assistant</div>
                            </div>
                        </div>

                        <h3>Topics</h3>
                        <div style={{ overflowY: "auto", flex: 1, paddingRight: 2 }}>
                            {TEMPLATES.map(t => (
                                <button key={t.label} className="tpl-btn" onClick={() => send(t.prompt)} disabled={loading}>
                                    <div className="ico" style={{ background: t.color }}>{t.icon}</div>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="lbl">{t.label}</div>
                                        <div className="sub">{t.sub}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.06)", marginTop: 10 }}>
                            <button className="cb-clear" onClick={reset} style={{ width: "100%" }}>↺ New Chat</button>
                        </div>
                    </aside>

                    {/* ==== MAIN CHAT ==== */}
                    <section className="cb-card cb-main">
                        <header className="cb-head">
                            <div className="cb-avatar">🩸</div>
                            <div>
                                <h1 className="cb-title">BloodBot</h1>
                                <p className="cb-sub">Online · Powered by Gemini</p>
                            </div>
                            <button className="cb-clear" onClick={reset}>↺ Clear</button>
                        </header>

                        <div className="cb-stream">
                            {showEmpty ? (
                                <div className="empty">
                                    <div className="empty-icon">🩸</div>
                                    <h2>How can I help you today?</h2>
                                    <p>{INITIAL.content.split("\n\n")[1]}</p>
                                    <div className="starters">
                                        {STARTERS.map(s => (
                                            <div key={s.q} className="starter" onClick={() => send(s.q)}>
                                                <div className="em">{s.em}</div>
                                                <div className="qq">{s.q}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((m, i) => (
                                    <div key={i} className={`row ${m.role === "user" ? "user" : "bot"}`}>
                                        <div className="av">{m.role === "user" ? "👤" : "🩸"}</div>
                                        <div style={{ display: "flex", flexDirection: "column", maxWidth: "calc(100% - 50px)" }}>
                                            <div className={`bubble ${m.role === "user" ? "user" : "bot"}`}>
                                                {m.role === "assistant" ? renderRich(m.content) : m.content}
                                            </div>
                                            <div className="ts">{m.ts ? formatTime(new Date(m.ts)) : ""}</div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {loading && (
                                <div className="row bot">
                                    <div className="av">🩸</div>
                                    <div className="bubble bot" style={{ display: "inline-flex", alignItems: "center" }}>
                                        <span className="dot" /><span className="dot" /><span className="dot" />
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {error && <div className="err">⚠️ {error}</div>}

                        <div className="cb-input-wrap">
                            <div className="cb-input">
                                <textarea
                                    ref={taRef}
                                    rows={1}
                                    placeholder="Ask anything about blood donation… (Shift+Enter for new line)"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    disabled={loading}
                                />
                                <button className="send" onClick={() => send()} disabled={loading || !input.trim()} title="Send">
                                    {loading
                                        ? <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                                        : "➤"}
                                </button>
                            </div>
                            <div style={{ color: "rgba(255,255,255,.32)", fontSize: ".7rem", marginTop: 8, textAlign: "center" }}>
                                BloodBot can make mistakes. For medical emergencies, call your local emergency number first.
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
