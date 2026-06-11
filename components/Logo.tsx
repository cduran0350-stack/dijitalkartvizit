// Marka logosu — NFC temalı (kontaksız dokunuş) işaret + isim.
// Hem ana sayfa başlığında hem panelde kullanılır.

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="dkLogo"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#dkLogo)" />
      <circle cx="16.5" cy="24" r="3.2" fill="#fff" />
      <path
        d="M23 16a10 10 0 0 1 0 16"
        fill="none"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M28.5 12a17 17 0 0 1 0 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Logo({
  size = 32,
  showText = true,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold text-zinc-900 ${className}`}>
      <LogoMark size={size} />
      {showText && <span>Dijital Kartvizit</span>}
    </span>
  );
}
