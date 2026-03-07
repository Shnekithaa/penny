import { useState, useEffect, useRef } from "react";
import { COLORS } from "../constants";
import { formatCurrency } from "../utils";

function AnimatedCounter({ target, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 30);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

function FloatingOrb({ color, size, top, left, delay }) {
  return (
    <div style={{
      position: "absolute", width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      top, left, animation: `float ${6 + delay}s ease-in-out infinite ${delay}s`,
      filter: "blur(40px)", opacity: 0.5, pointerEvents: "none",
    }} />
  );
}

export default function LandingPage({ onGetStarted }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection Observer for reveal-up animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    const els = document.querySelectorAll(".reveal-up");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: "⚡", title: "Instant Tracking", desc: "Add income & expenses in seconds. See your balance update in real-time.", color: "#f59e0b" },
    { icon: "📊", title: "Smart Analytics", desc: "Area charts, donut breakdowns, and cash flow trends with daily/monthly/yearly views.", color: "#38bdf8" },
    { icon: "🧠", title: "AI-Powered Insights", desc: "PennyBot analyzes your spending patterns and gives personalized financial advice.", color: "#14b8a6" },
    { icon: "🔒", title: "Google Auth", desc: "Secure sign-in with Google OAuth via Firebase. Your data stays private.", color: "#a78bfa" },
    { icon: "🌗", title: "Light & Dark Mode", desc: "Elegant theme switching that remembers your preference. Easy on the eyes.", color: "#fb7185" },
    { icon: "📱", title: "Responsive Design", desc: "Beautiful glassmorphism UI that looks stunning on every screen size.", color: "#5eead4" },
  ];

  const testimonials = [
    { name: "Priya S.", role: "Freelancer", text: "Penny helped me track my freelance income and finally save consistently!", avatar: "🧑‍💻" },
    { name: "Arjun M.", role: "Student", text: "The AI insights are spot-on. I cut my food expenses by 30% in 2 months.", avatar: "👨‍🎓" },
    { name: "Sneha K.", role: "Designer", text: "Finally a finance app that's as beautiful as it is functional. Love the dark mode!", avatar: "👩‍🎨" },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div className="hero-bg" />
      <FloatingOrb color="rgba(20,184,166,0.1)" size={400} top="-5%" left="60%" delay={0} />
      <FloatingOrb color="rgba(245,197,66,0.06)" size={300} top="30%" left="-5%" delay={2} />
      <FloatingOrb color="rgba(56,189,248,0.07)" size={250} top="60%" left="75%" delay={4} />
      <FloatingOrb color="rgba(167,139,250,0.05)" size={200} top="80%" left="20%" delay={1} />

      {/* Particle grid */}
      <div className="particle-grid" />

      {/* NAV */}
      <nav className="landing-nav" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px", position: "sticky", top: 0, zIndex: 50,
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        background: scrollY > 50 ? "var(--glass-nav)" : "transparent",
        borderBottom: scrollY > 50 ? "1px solid var(--border)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>
          <span className="gradient-text">penny</span>
          <span style={{ color: "var(--text-dim)", fontSize: 12, marginLeft: 6 }}>finance</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-ghost" onClick={onGetStarted}>Sign in</button>
          <button className="btn-primary" onClick={onGetStarted}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px 100px", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div className="reveal-up" style={{ animationDelay: "0.1s" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px",
                background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)",
                borderRadius: 20, fontSize: 12, color: COLORS.emerald, marginBottom: 24,
                fontWeight: 600, letterSpacing: "0.05em",
              }}>
                <span className="pulse-dot" /> NEW — AI-powered PennyBot
              </div>
            </div>
            <h1 className="font-display reveal-up" style={{
              fontSize: "clamp(40px, 5vw, 60px)", fontWeight: 800,
              lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 20,
              animationDelay: "0.2s",
            }}>
              Your money,<br />
              <span className="gradient-text">crystal clear.</span>
            </h1>
            <p className="reveal-up" style={{
              fontSize: 17, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 32, maxWidth: 420,
              animationDelay: "0.3s",
            }}>
              Penny is the calm, beautiful finance tracker that shows exactly where your money goes — with AI insights, smart analytics, and zero noise.
            </p>
            <div className="reveal-up" style={{ display: "flex", gap: 12, flexWrap: "wrap", animationDelay: "0.4s" }}>
              <button className="btn-primary btn-glow" onClick={onGetStarted} style={{ padding: "14px 32px", fontSize: 15 }}>
                Start for free 
              </button>
              <button className="btn-ghost" onClick={onGetStarted} style={{ padding: "14px 24px", fontSize: 15 }}>
                View demo ↗
              </button>
            </div>
            <div className="reveal-up" style={{ marginTop: 32, display: "flex", gap: 32, animationDelay: "0.5s" }}>
              {[
                { value: 10000, suffix: "+", label: "users" },
                { value: 99, suffix: ".9%", label: "uptime" },
                { value: 4, suffix: ".9★", label: "rating" },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D MOCKUP */}
          <div className="mockup-card reveal-up" style={{ animationDelay: "0.3s" }}>
            <div className="mockup-inner" style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--border)",
              borderRadius: 20, padding: 20, position: "relative",
              boxShadow: "0 40px 80px var(--shadow-xl), 0 0 40px rgba(20,184,166,0.08)",
            }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                <span className="font-display" style={{ fontWeight: 700, color: "var(--text)" }}>penny</span>
                <span>Jun 2025</span>
              </div>
              {[
                { label: "Balance", value: formatCurrency(63821), color: COLORS.emerald },
                { label: "Spent", value: formatCurrency(21179), color: COLORS.rose },
                { label: "Saved", value: formatCurrency(42642), color: COLORS.sky },
              ].map(s => (
                <div key={s.label} className="glass mockup-stat" style={{ padding: "12px 16px", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
              <div style={{ height: 80, marginTop: 12, opacity: 0.8 }}>
                <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 C40,55 80,30 120,35 C160,40 200,20 240,25 C260,28 280,32 300,28 L300,80 L0,80 Z" fill="url(#lg1)" />
                  <path d="M0,60 C40,55 80,30 120,35 C160,40 200,20 240,25 C260,28 280,32 300,28" fill="none" stroke="#14b8a6" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES - Bento Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="font-display reveal-up" style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Everything you need,<br />nothing you don't.
          </h2>
          <p className="reveal-up" style={{ color: "var(--text-muted)", fontSize: 15, animationDelay: "0.1s" }}>
            Built around one principle: clarity without clutter.
          </p>
        </div>
        <div className="bento-grid">
          {features.map((f, i) => (
            <div key={f.title} className={`glass feature-card bento-item ${i === 0 ? "bento-wide" : ""}`} style={{
              padding: "28px 24px", border: "1px solid var(--border)",
              animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both`,
            }}>
              <div style={{
                fontSize: 28, marginBottom: 14, width: 52, height: 52,
                background: `${f.color}15`, borderRadius: 14, border: `1px solid ${f.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}>{f.icon}</div>
              <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 100px" }}>
        <h2 className="font-display reveal-up" style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 40, letterSpacing: "-0.03em" }}>
          Loved by thousands
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {testimonials.map((t, i) => (
            <div key={i} className="glass feature-card" style={{
              padding: 24, border: "1px solid var(--border)",
              animation: `fadeUp 0.5s ease ${0.1 + i * 0.1}s both`,
            }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
                "{t.text}"
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", fontSize: 18,
                  background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "60px 48px 100px" }}>
        <div className="cta-card glass" style={{
          display: "inline-block", padding: "60px 80px",
          background: "linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(56,189,248,0.04) 100%)",
          border: "1px solid rgba(20,184,166,0.15)", borderRadius: 24,
        }}>
          <h2 className="font-display" style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Ready to see clearly?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 15 }}>Join thousands who've taken control of their finances.</p>
          <button className="btn-primary btn-glow" onClick={onGetStarted} style={{ padding: "14px 40px", fontSize: 16 }}>
            Plant your first penny 🪙
          </button>
        </div>
      </div>
    </div>
  );
}
