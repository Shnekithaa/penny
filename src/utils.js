export const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

export const formatCurrencyShort = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

export const formatDateLong = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
