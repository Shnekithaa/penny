import { useState, useRef, useEffect } from "react";
import { chatWithPenny } from "../aiService";

const PennyBotIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="pbg2" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#059669" />
        <stop offset="1" stopColor="#14b8a6" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="16" fill="url(#pbg2)" />
    {/* Coin base */}
    <ellipse cx="16" cy="25" rx="5.5" ry="2" fill="rgba(255,255,255,0.18)" />
    <ellipse cx="16" cy="24" rx="5.5" ry="2" fill="rgba(255,255,255,0.4)" />
    {/* Stem */}
    <line x1="16" y1="23" x2="16" y2="11" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    {/* Left leaf */}
    <path d="M 16 19 C 12.5 17.5 10.5 13.5 12 9.5 C 14 11.5 15.5 15.5 16 18.5 Z" fill="rgba(255,255,255,0.85)" />
    {/* Right leaf */}
    <path d="M 16 14.5 C 19.5 13 21.5 8.5 20 5 C 18 7.5 17 11 16 14 Z" fill="white" />
  </svg>
);

export default function PennyBot({ transactions }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hey! I'm PennyBot — your AI finance buddy. Ask me about your spending, savings tips, or budgeting advice!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickActions = [
    { label: "📊 Spending summary", q: "Give me a summary of my spending" },
    { label: "💰 How to save more?", q: "How can I save more money based on my spending?" },
    { label: "📈 Investment tips", q: "What should I invest in as a beginner?" },
    { label: "🎯 Budget advice", q: "Help me create a budget plan" },
  ];

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reply = await chatWithPenny([...messages, userMsg], transactions);
      setMessages(prev => [...prev, { role: "bot", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", content: "Oops, something went wrong. Try again! 🔧" }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} className="pennybot-fab" aria-label="Open PennyBot chat"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {open
          ? <span style={{ fontSize: 18, lineHeight: 1, color: "white" }}>✕</span>
          : <PennyBotIcon size={26} />}
      </button>

      {open && (
        <div className="pennybot-panel glass">
          <div className="pennybot-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PennyBotIcon size={28} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>PennyBot</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>AI Financial Advisor</div>
              </div>
            </div>
            <div className="pennybot-status">
              <span className="pennybot-dot" />
              Online
            </div>
          </div>

          <div className="pennybot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`pennybot-msg ${m.role}`}>
                {m.role === "bot" && <span className="pennybot-avatar"><PennyBotIcon size={22} /></span>}
                <div className={`pennybot-bubble ${m.role}`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="pennybot-msg bot">
                <span className="pennybot-avatar"><PennyBotIcon size={22} /></span>
                <div className="pennybot-bubble bot pennybot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="pennybot-quick">
              {quickActions.map((a, i) => (
                <button key={i} className="pennybot-quick-btn" onClick={() => send(a.q)}>
                  {a.label}
                </button>
              ))}
            </div>
          )}

          <div className="pennybot-input-row">
            <input
              className="penny-input"
              placeholder="Ask PennyBot anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && send(input)}
              disabled={loading}
            />
            <button className="btn-primary" onClick={() => send(input)} disabled={loading || !input.trim()}
              style={{ padding: "10px 16px", flexShrink: 0 }}>
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
