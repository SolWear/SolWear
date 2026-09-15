import Image from "next/image";

/**
 * SOL bold + WEAR italic, optically aligned with the logo mark.
 * `size` drives both the mark and the type so the lockup never drifts.
 */
export default function Wordmark({
  size = 22,
  className = "",
  showText = true,
}: {
  size?: number;
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-[0.45em] ${className}`} style={{ fontSize: size }}>
      <Image
        src="/solwear-logo-white.webp"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px`, transform: "translateY(-0.02em)" }}
        priority
      />
      {showText ? (
        <span className="wordmark" style={{ fontSize: "1.18em" }}>
          <span className="wordmark-sol">SOL</span>
          <span className="wordmark-wear">WEAR</span>
        </span>
      ) : null}
    </span>
  );
}
