import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { COLORS } from "../constants";
import { formatCurrency, formatCurrencyShort } from "../utils";
import { getInsights } from "../aiService";
import SkeletonCard from "../components/SkeletonCard";
import StatCard from "../components/StatCard";
import ScoreRing from "../components/ScoreRing";
import EmptyState from "../components/EmptyState";
import CustomTooltip from "../components/CustomTooltip";

export default function Dashboard({ transactions, loading, analytics, onAdd }) {
  const { totalIncome, totalExpense, balance, savingsRate, score, cashFlowMonthly, cashFlowDaily, cashFlowYearly, spendingByCategory, suggestedSavings, projectedSavings, avgExpense } = analytics;
  const [cfView, setCfView] = useState("monthly");
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const cashFlowData = cfView === "daily" ? cashFlowDaily : cfView === "yearly" ? cashFlowYearly : cashFlowMonthly;

  useEffect(() => {
    if (transactions.length > 0) {
      setInsightsLoading(true);
      getInsights(transactions).then(r => { setInsights(r); setInsightsLoading(false); });
    }
  }, [transactions]);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }} className="stats-grid">
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="charts-grid">
          {[0, 1].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }} className="stats-grid">
        <StatCard label="Total Balance" value={formatCurrency(balance)} sub="All time" color={COLORS.emerald} icon="💰" delay={0} />
        <StatCard label="Total Income" value={formatCurrency(totalIncome)} sub="All time" color={COLORS.sky} icon="📈" delay={0.05} />
        <StatCard label="Total Spent" value={formatCurrency(totalExpense)} sub="All time" color={COLORS.rose} icon="💳" delay={0.1} />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }} className="charts-grid">
        {/* Area chart */}
        <div className="glass noise" style={{ padding: 22, animation: "fadeUp 0.5s ease 0.15s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>Cash Flow Trends</h3>
            <div className="toggle">
              {["daily", "monthly", "yearly"].map(v => (
                <button key={v} className={`toggle-btn ${cfView === v ? "active" : ""}`}
                  onClick={() => setCfView(v)} style={{ fontSize: 11, padding: "4px 12px" }}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashFlowData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "var(--text-dim)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-dim)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#14b8a6" strokeWidth={2} fill="url(#gIncome)" name="Income" dot={false} />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#gExpense)" name="Expense" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="glass noise" style={{ padding: 22, animation: "fadeUp 0.5s ease 0.2s both", display: "flex", flexDirection: "column" }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Spending Split</h3>
          {spendingByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={38} outerRadius={56}
                    paddingAngle={3} dataKey="value">
                    {spendingByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [formatCurrency(v), ""]} contentStyle={{ background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text)" }} itemStyle={{ color: "var(--text)" }} labelStyle={{ color: "var(--text)" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "grid", gap: 4, marginTop: 10, maxHeight: 108, overflowY: "auto", paddingRight: 2 }}>
                {spendingByCategory.map(c => (
                  <div key={c.id} className="spending-split-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "6px 8px", borderRadius: 8, cursor: "default" }}>
                    <span className="split-left">
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, display: "inline-block", flexShrink: 0 }} />
                      <span>{c.icon}</span>
                      <span className="split-label">{c.label}</span>
                    </span>
                    <span className="split-value">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyState onAction={onAdd} />}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="charts-grid">
        {/* Health score */}
        <div className="glass noise" style={{ padding: 22, animation: "fadeUp 0.5s ease 0.25s both" }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Financial Health</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <ScoreRing score={score} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {score >= 70 ? "Excellent" : score >= 40 ? "Fair" : "Needs work"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Savings rate: <span style={{ color: savingsRate > 20 ? COLORS.emerald : COLORS.amber }}>{savingsRate.toFixed(0)}%</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                Target: 20%+
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, height: 4, background: "var(--surface-2)", borderRadius: 2 }}>
            <div style={{
              height: "100%", borderRadius: 2, transition: "width 1s ease",
              width: `${score}%`,
              background: score >= 70 ? "linear-gradient(90deg, #14b8a6, #5eead4)" : score >= 40 ? "linear-gradient(90deg, #f59e0b, #fcd34d)" : "linear-gradient(90deg, #f43f5e, #fb7185)",
            }} />
          </div>
        </div>

        {/* Predictive insight */}
        <div className="glass noise" style={{
          padding: 22, animation: "fadeUp 0.5s ease 0.3s both",
          background: "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, transparent 100%)",
          border: "1px solid rgba(16,185,129,0.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🧠</span>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>Predictive Insight</h3>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
            Based on your avg monthly spend of <strong style={{ color: "var(--text)" }}>{formatCurrency(Math.round(avgExpense))}</strong>, you could save:
          </div>
          <div className="font-display" style={{ fontSize: 30, fontWeight: 800, color: COLORS.emerald, marginBottom: 4 }}>
            {formatCurrency(Math.max(0, projectedSavings))}
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 400 }}>/mo</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Suggested savings goal: <span style={{ color: COLORS.amber }}>{formatCurrency(suggestedSavings)}/mo (20%)</span>
          </div>
          <div style={{
            marginTop: 12, padding: "8px 12px", borderRadius: 8,
            background: projectedSavings >= suggestedSavings ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
            fontSize: 12,
            color: projectedSavings >= suggestedSavings ? COLORS.emerald : COLORS.amber,
          }}>
            {projectedSavings >= suggestedSavings
              ? "✓ You're on track! Keep it up."
              : `⚠ Try to cut ${formatCurrency(Math.round(suggestedSavings - projectedSavings))}/mo to hit your goal.`}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="glass noise" style={{ padding: 22, animation: "fadeUp 0.5s ease 0.35s both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>AI Insights</h3>
          <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: "auto" }}>Powered by AI</span>
        </div>
        {insightsLoading ? (
          <div style={{ display: "grid", gap: 8 }}>
            {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 20, width: `${80 - i * 15}%` }} />)}
          </div>
        ) : insights.length > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            {insights.map((insight, i) => (
              <div key={i} style={{
                padding: "10px 14px", borderRadius: 10,
                background: "var(--surface-1)", border: "1px solid var(--border)",
                fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6,
                animation: `fadeUp 0.3s ease ${i * 0.1}s both`,
              }}>
                {insight}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Add more transactions to unlock AI-powered insights.</div>
        )}
      </div>
    </div>
  );
}
