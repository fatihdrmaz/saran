/** Saran ikonları — prototip SVG path'lerinden (README §5). */

export function HeartLeaf({
  size = 19,
  stroke = "#fff",
}: {
  size?: number;
  stroke?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21C12 21 4 14.5 4 9.2C4 6.3 6.2 4 9 4C10.5 4 11.6 4.8 12 5.6C12.4 4.8 13.5 4 15 4C17.8 4 20 6.3 20 9.2C20 14.5 12 21 12 21Z"
        stroke={stroke}
        strokeWidth={1.7}
      />
      <path
        d="M9 9.2H15M12 6.2V12.2"
        stroke={stroke}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Check({
  size = 18,
  stroke = "var(--primary-mid)",
  strokeWidth = 2.2,
}: {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
