import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatCurrency } from "./utils";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

// Simple retry with exponential backoff for 429 errors
async function withRetry(fn, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("Resource has been exhausted");
      if (is429 && i < maxRetries) {
        await new Promise(r => setTimeout(r, (i + 1) * 2000));
        continue;
      }
      throw err;
    }
  }
}

// Cache insights to avoid repeated API calls
let insightsCache = { key: "", data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function buildContext(transactions) {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const cats = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    cats[t.category] = (cats[t.category] || 0) + t.amount;
  });
  return `User's financial summary (INR):
- Total Income: ${formatCurrency(income)}
- Total Expenses: ${formatCurrency(expense)}
- Balance: ${formatCurrency(income - expense)}
- Savings Rate: ${income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0}%
- Spending by category: ${Object.entries(cats).map(([k, v]) => `${k}: ${formatCurrency(v)}`).join(", ")}
- Number of transactions: ${transactions.length}`;
}

function getFallbackInsights(transactions) {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? ((income - expense) / income * 100) : 0;
  const cats = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    cats[t.category] = (cats[t.category] || 0) + t.amount;
  });
  const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  const insights = [];
  if (savingsRate > 30) insights.push("🎉 Excellent savings rate! You're saving over 30% of your income.");
  else if (savingsRate > 15) insights.push("👍 Good savings rate. Try pushing towards 20%+ for faster wealth building.");
  else insights.push("⚠️ Your savings rate is below 15%. Consider cutting discretionary spending.");
  if (topCat) insights.push(`💡 Your biggest expense category is ${topCat[0]} at ${formatCurrency(topCat[1])}. Look for ways to optimize here.`);
  if (expense > income * 0.9) insights.push("🔴 You're spending over 90% of your income. Build an emergency fund first.");
  else insights.push("💰 You have a healthy income-to-expense ratio. Consider investing the surplus.");
  insights.push("📊 Track consistently for 3+ months to unlock trend-based predictions.");
  return insights;
}

export async function getInsights(transactions) {
  if (!model || transactions.length === 0) return getFallbackInsights(transactions);

  // Return cached insights if still fresh
  const cacheKey = transactions.map(t => t.id).sort().join(",");
  if (insightsCache.key === cacheKey && Date.now() - insightsCache.ts < CACHE_TTL) {
    return insightsCache.data;
  }

  try {
    const ctx = buildContext(transactions);
    const result = await withRetry(() =>
      model.generateContent(
        `You are Penny, an AI financial advisor. Based on this data:\n${ctx}\n\nGive exactly 4 short, actionable financial insights as a JSON array of strings. Each insight should start with an emoji. Be specific about the numbers. Reply ONLY with the JSON array, no markdown.`
      )
    );
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    insightsCache = { key: cacheKey, data: parsed, ts: Date.now() };
    return parsed;
  } catch {
    return getFallbackInsights(transactions);
  }
}

export async function chatWithPenny(messages, transactions) {
  const ctx = buildContext(transactions);
  const systemPrompt = `You are PennyBot, a friendly and knowledgeable AI financial assistant built into the Penny finance tracker app. You help users understand their spending, give savings tips, and answer finance questions. Be concise (2-4 sentences), warm, and use emojis occasionally. Always base your answers on the user's actual financial data when relevant.\n\nUser's financial context:\n${ctx}`;

  if (!model) {
    // Fallback: generate contextual responses without AI
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const cats = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const topCat = sorted[0];
    const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;

    if (lastMsg.includes("spend") || lastMsg.includes("summary") || lastMsg.includes("expense")) {
      return `You've spent ${formatCurrency(expense)} across ${sorted.length} categories. Your top spend is ${topCat ? `${topCat[0]} at ${formatCurrency(topCat[1])}` : "N/A"}. ${sorted.length > 1 ? `Next is ${sorted[1][0]} at ${formatCurrency(sorted[1][1])}.` : ""} 📊`;
    }
    if (lastMsg.includes("save") || lastMsg.includes("saving")) {
      return `Your current savings rate is ${savingsRate}%. ${Number(savingsRate) > 20 ? "That's great! Keep it above 20% for healthy finances. 🎉" : `Try to target 20%. You'd need to cut about ${formatCurrency(Math.round(income * 0.2 - (income - expense)))}/mo from spending. 🎯`}`;
    }
    if (lastMsg.includes("invest")) {
      const surplus = income - expense;
      return `With a monthly surplus of ${formatCurrency(surplus)}, you could start a SIP of ${formatCurrency(Math.round(surplus * 0.5))} in index funds. Build a 3-6 month emergency fund first (${formatCurrency(expense * 3)} - ${formatCurrency(expense * 6)}). 📈`;
    }
    if (lastMsg.includes("budget")) {
      return `Based on your income of ${formatCurrency(income)}: Needs (50%) = ${formatCurrency(Math.round(income * 0.5))}, Wants (30%) = ${formatCurrency(Math.round(income * 0.3))}, Savings (20%) = ${formatCurrency(Math.round(income * 0.2))}. Currently you're spending ${formatCurrency(expense)} total. 📋`;
    }
    if (topCat && (lastMsg.includes(topCat[0]) || lastMsg.includes("top") || lastMsg.includes("most"))) {
      return `Your highest spend is ${topCat[0]} at ${formatCurrency(topCat[1])} (${income > 0 ? (topCat[1] / income * 100).toFixed(1) : 0}% of income). ${sorted.length > 2 ? `Top 3: ${sorted.slice(0, 3).map(([k, v]) => `${k} (${formatCurrency(v)})`).join(", ")}` : ""} 💡`;
    }
    return `Your balance is ${formatCurrency(income - expense)} with a ${savingsRate}% savings rate. I can help with spending analysis, savings tips, budgeting, or investment basics! What interests you? 🪙`;
  }

  try {
    // Filter history to only include user messages and their model responses
    const historyMsgs = messages.slice(0, -1);
    const validHistory = historyMsgs
      .map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }))
      .filter((_, i, arr) => {
        // Ensure history starts with "user" — Gemini requires this
        if (i === 0 && arr[i].role === "model") return false;
        return true;
      });

    const chat = model.startChat({
      history: validHistory,
      systemInstruction: { parts: [{ text: systemPrompt }] },
    });
    const lastMessage = messages[messages.length - 1]?.content || "";
    const result = await withRetry(() => chat.sendMessage(lastMessage));
    return result.response.text().trim();
  } catch (err) {
    console.error("PennyBot API error:", err);
    // Fall back to contextual responses instead of showing error
    return generateFallbackChat(messages, transactions);
  }
}

function generateFallbackChat(messages, transactions) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const cats = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    cats[t.category] = (cats[t.category] || 0) + t.amount;
  });
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0];
  const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;

  if (lastMsg.includes("spend") || lastMsg.includes("summary") || lastMsg.includes("expense")) {
    return `You've spent ${formatCurrency(expense)} across ${sorted.length} categories. Your top spend is ${topCat ? `${topCat[0]} at ${formatCurrency(topCat[1])}` : "N/A"}. ${sorted.length > 1 ? `Next is ${sorted[1][0]} at ${formatCurrency(sorted[1][1])}.` : ""} 📊`;
  }
  if (lastMsg.includes("save") || lastMsg.includes("saving")) {
    return `Your current savings rate is ${savingsRate}%. ${Number(savingsRate) > 20 ? "That's great! Keep it above 20% for healthy finances. 🎉" : `Try to target 20%. You'd need to cut about ${formatCurrency(Math.round(income * 0.2 - (income - expense)))}/mo from spending. 🎯`}`;
  }
  if (lastMsg.includes("invest")) {
    const surplus = income - expense;
    return `With a monthly surplus of ${formatCurrency(surplus)}, you could start a SIP of ${formatCurrency(Math.round(surplus * 0.5))} in index funds. Build a 3-6 month emergency fund first (${formatCurrency(expense * 3)} - ${formatCurrency(expense * 6)}). 📈`;
  }
  if (lastMsg.includes("budget")) {
    return `Based on your income of ${formatCurrency(income)}: Needs (50%) = ${formatCurrency(Math.round(income * 0.5))}, Wants (30%) = ${formatCurrency(Math.round(income * 0.3))}, Savings (20%) = ${formatCurrency(Math.round(income * 0.2))}. Currently you're spending ${formatCurrency(expense)} total. 📋`;
  }
  if (topCat && (lastMsg.includes(topCat[0]) || lastMsg.includes("top") || lastMsg.includes("most"))) {
    return `Your highest spend is ${topCat[0]} at ${formatCurrency(topCat[1])} (${income > 0 ? (topCat[1] / income * 100).toFixed(1) : 0}% of income). ${sorted.length > 2 ? `Top 3: ${sorted.slice(0, 3).map(([k, v]) => `${k} (${formatCurrency(v)})`).join(", ")}` : ""} 💡`;
  }
  return `Your balance is ${formatCurrency(income - expense)} with a ${savingsRate}% savings rate. I can help with spending analysis, savings tips, budgeting, or investment basics! What interests you? 🪙`;
}
