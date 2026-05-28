type Props = { value: number; size?: "sm" | "md" | "lg" };

export function AccuracyBar({ value, size = "md" }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const ok = v >= 80;
  const mid = v >= 60 && v < 80;
  const color = ok ? "bg-success" : mid ? "bg-warning" : "bg-danger";
  const glow = ok
    ? "shadow-[0_0_12px_-2px_oklch(0.68_0.17_152/0.7)]"
    : mid
      ? "shadow-[0_0_12px_-2px_oklch(0.78_0.16_75/0.6)]"
      : "shadow-[0_0_12px_-2px_oklch(0.58_0.22_27/0.7)]";
  const h = size === "lg" ? "h-2.5" : size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className={`w-full ${h} rounded-full bg-secondary overflow-hidden`}>
      <div
        className={`${h} ${color} ${glow} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
