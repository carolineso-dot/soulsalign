/**
 * Faint ambient orbit rings bleeding from the top-right and bottom-left
 * corners of every screen. Low opacity, non-interactive, fixed behind content.
 */
export function AmbientBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* top-right */}
      <svg
        className="absolute -right-40 -top-40 h-[34rem] w-[34rem]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="190" stroke="#a8843b" strokeWidth="0.6" opacity="0.16" />
        <circle cx="200" cy="200" r="140" stroke="#a8843b" strokeWidth="0.6" opacity="0.13" />
        <circle cx="200" cy="200" r="90" stroke="#7e3340" strokeWidth="0.6" opacity="0.12" />
      </svg>
      {/* bottom-left */}
      <svg
        className="absolute -bottom-40 -left-40 h-[34rem] w-[34rem]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="190" stroke="#7e3340" strokeWidth="0.6" opacity="0.14" />
        <circle cx="200" cy="200" r="140" stroke="#a8843b" strokeWidth="0.6" opacity="0.12" />
        <circle cx="200" cy="200" r="90" stroke="#a8843b" strokeWidth="0.6" opacity="0.1" />
      </svg>
    </div>
  );
}
