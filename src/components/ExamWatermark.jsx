// Tiled watermark that stamps the student's registration number diagonally
// across the *entire* page (not just one corner), so any screenshot or photo
// of the screen is traceable back to the student. Built with an SVG pattern
// so it always tiles edge-to-edge no matter the screen size, and it's
// pointer-events:none so it never blocks clicking on the exam itself.
export default function ExamWatermark({ regNo, label = "KKM CLASSROOM" }) {
  const text = `${regNo || "GUEST"} • ${label}`;
  const patternId = "exam-watermark-pattern";

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 h-full w-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={patternId}
          width="320"
          height="180"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-28)"
        >
          <text
            x="0"
            y="90"
            fontSize="18"
            fontFamily="Poppins, ui-sans-serif, system-ui, sans-serif"
            fontWeight="600"
            letterSpacing="1"
            fill="var(--color-ink)"
            fillOpacity="0.075"
          >
            {text}
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
