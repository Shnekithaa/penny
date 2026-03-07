import { useMemo } from "react";
import { CATEGORIES } from "../constants";

export function useAnalytics(transactions) {
  return useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const score = Math.min(100, Math.max(0, Math.round(
      (savingsRate > 20 ? 40 : savingsRate * 2) +
      (balance > 0 ? 30 : 0) +
      (transactions.length > 5 ? 20 : transactions.length * 4) +
      10
    )));

    // Monthly grouping
    const byMonth = {};
    transactions.forEach(t => {
      const key = t.date.substring(0, 7);
      if (!byMonth[key]) byMonth[key] = { month: key, income: 0, expense: 0 };
      if (t.type === "income") byMonth[key].income += t.amount;
      else byMonth[key].expense += t.amount;
    });
    const cashFlowMonthly = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({
      ...m,
      label: new Date(m.month + "-01").toLocaleString("default", { month: "short", year: "2-digit" }),
      net: m.income - m.expense,
    }));

    // Daily grouping
    const byDay = {};
    transactions.forEach(t => {
      const key = t.date;
      if (!byDay[key]) byDay[key] = { day: key, income: 0, expense: 0 };
      if (t.type === "income") byDay[key].income += t.amount;
      else byDay[key].expense += t.amount;
    });
    const cashFlowDaily = Object.values(byDay).sort((a, b) => a.day.localeCompare(b.day)).map(d => ({
      ...d,
      label: new Date(d.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      net: d.income - d.expense,
    }));

    // Yearly grouping
    const byYear = {};
    transactions.forEach(t => {
      const key = t.date.substring(0, 4);
      if (!byYear[key]) byYear[key] = { year: key, income: 0, expense: 0 };
      if (t.type === "income") byYear[key].income += t.amount;
      else byYear[key].expense += t.amount;
    });
    const cashFlowYearly = Object.values(byYear).sort((a, b) => a.year.localeCompare(b.year)).map(y => ({
      ...y,
      label: y.year,
      net: y.income - y.expense,
    }));

    const catMap = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const spendingByCategory = Object.entries(catMap)
      .map(([id, value]) => ({ id, value, ...CATEGORIES.find(c => c.id === id) }))
      .sort((a, b) => b.value - a.value);

    const recentMonths = cashFlowMonthly.slice(-3);
    const avgExpense = recentMonths.length > 0
      ? recentMonths.reduce((s, m) => s + m.expense, 0) / recentMonths.length : 0;
    const suggestedSavings = Math.round(totalIncome > 0 ? (totalIncome / (cashFlowMonthly.length || 1)) * 0.2 : 0);
    const projectedSavings = Math.round((totalIncome / (cashFlowMonthly.length || 1)) - avgExpense);

    // Monthly comparison
    const thisMonth = cashFlowMonthly[cashFlowMonthly.length - 1];
    const lastMonth = cashFlowMonthly[cashFlowMonthly.length - 2];
    const monthlyComparison = thisMonth && lastMonth ? {
      expenseChange: lastMonth.expense > 0 ? ((thisMonth.expense - lastMonth.expense) / lastMonth.expense * 100) : 0,
      incomeChange: lastMonth.income > 0 ? ((thisMonth.income - lastMonth.income) / lastMonth.income * 100) : 0,
    } : null;

    return {
      totalIncome, totalExpense, balance, savingsRate, score,
      cashFlowMonthly, cashFlowDaily, cashFlowYearly,
      spendingByCategory, suggestedSavings, projectedSavings, avgExpense,
      monthlyComparison,
    };
  }, [transactions]);
}
