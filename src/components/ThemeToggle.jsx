import { useTheme } from "../ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className={`theme-icon ${theme === "dark" ? "active" : ""}`}>🌙</span>
      <span className={`theme-icon ${theme === "light" ? "active" : ""}`}>☀️</span>
    </button>
  );
}
