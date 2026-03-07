import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "../constants";
import { formatCurrency, formatCurrencyShort } from "../utils";
import EmptyState from "../components/EmptyState";
import CustomTooltip from "../components/CustomTooltip";

export default function AnalyticsPage({ analytics }) {
  const { spendingByCategory, cashFlowMonthly, cashFlowDaily, cashFlowYearly, savingsRate, totalIncome, totalExpense, balance, monthlyComparison } = analytics;
  const [cfView, setCfView] = useState("monthly");

  const cashFlowData = cfView === "daily" ? cashFlowDaily : cfView === "yearly" ? cashFlowYearly : cashFlowMonthly;

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Analytics</h2>
      <div style={{ display: "grid", gap: 16 }}>
        {/* Cash flow chart */}
        <div className="glass noise" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>Cash Flow</h3>
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
            <AreaChart data={cashFlowData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ag3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "var(--text-dim)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-dim)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyShort(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#14b8a6" strokeWidth={2} fill="url(#ag1)" name="Income" dot={false} />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#ag2)" name="Expense" dot={false} />
              <Area type="monotone" dataKey="net" stroke="#38bdf8" strokeWidth={2} fill="url(#ag3)" name="Net" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly comparison bar */}
        {monthlyComparison && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="charts-grid">
            <div className="glass noise" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 28 }}>📊</div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>Expense vs Last Month</div>
                <div className="font-display" style={{
                  fontSize: 22, fontWeight: 800,
                  color: monthlyComparison.expenseChange <= 0 ? COLORS.emerald : COLORS.rose,
                }}>
                  {monthlyComparison.expenseChange > 0 ? "+" : ""}{monthlyComparison.expenseChange.toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {monthlyComparison.expenseChange <= 0 ? "You're spending less — great!" : "Spending increased this month"}
                </div>
              </div>
            </div>
            <div className="glass noise" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 28 }}>💹</div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>Income vs Last Month</div>
                <div className="font-display" style={{
                  fontSize: 22, fontWeight: 800,
                  color: monthlyComparison.incomeChange >= 0 ? COLORS.emerald : COLORS.rose,
                }}>
                  {monthlyComparison.incomeChange > 0 ? "+" : ""}{monthlyComparison.incomeChange.toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {monthlyComparison.incomeChange >= 0 ? "Income is growing" : "Income dipped this month"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="charts-grid">
          {/* Spending categories */}
          <div className="glass noise" style={{ padding: 24 }}>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Spending by Category</h3>
            {spendingByCategory.length === 0 ? <EmptyState /> : (
              <div style={{ display: "grid", gap: 10 }}>
                {spendingByCategory.map(c => {
                  const pct = totalExpense > 0 ? (c.value / totalExpense * 100) : 0;
                  return (
                    <div key={c.id} className="spending-split-item" style={{ padding: "6px 0", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{c.icon}</span>
                          <span style={{ fontWeight: 500 }}>{c.label}</span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{pct.toFixed(1)}%</span>
                          <span style={{ color: "var(--text)", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(c.value)}</span>
                        </span>
                      </div>
                      <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2 }}>
                        <div style={{
                          height: "100%", borderRadius: 2, background: c.color,
                          width: `${pct}%`,
                          transition: "width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="glass noise" style={{ padding: 24 }}>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Key Metrics</h3>
            {[
              { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, color: savingsRate > 20 ? COLORS.emerald : COLORS.amber, icon: "💎" },
              { label: "Income / Expense Ratio", value: totalExpense > 0 ? (totalIncome / totalExpense).toFixed(2) : "—", color: COLORS.sky, icon: "⚖️" },
              { label: "Net Surplus", value: formatCurrency(balance), color: balance >= 0 ? COLORS.emerald : COLORS.rose, icon: "📈" },
              { label: "Monthly Avg Expense", value: cashFlowMonthly.length > 0 ? formatCurrency(Math.round(cashFlowMonthly.reduce((s, m) => s + m.expense, 0) / cashFlowMonthly.length)) : "—", color: "var(--text-muted)", icon: "📉" },
            ].map(m => (
              <div key={m.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: "1px solid var(--border)",
              }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{m.icon}</span> {m.label}
                </span>
                <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
