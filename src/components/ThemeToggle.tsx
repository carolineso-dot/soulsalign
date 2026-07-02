"use client";

/**
 * Light ⇆ nocturnal theme toggle. State-free: the correct label is shown by CSS
 * based on the `.dark` class on <html> (see globals.css), so there's no
 * hydration mismatch and no setState-in-effect. Choice persists in localStorage.
 */
export function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("sa-theme", isDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle day / night theme"
      className="flex items-center gap-2 rounded-full border border-hairline veil px-3 py-1.5 text-xs text-clay transition-colors hover:text-ink"
    >
      {/* shown in light mode → offers night */}
      <span className="theme-when-light flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" />
        </svg>
        Night sky
      </span>
      {/* shown in dark mode → offers daylight */}
      <span className="theme-when-dark flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" strokeLinecap="round" />
        </svg>
        Daylight
      </span>
    </button>
  );
}
