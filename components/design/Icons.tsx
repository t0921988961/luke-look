import type { SVGProps } from "react";

export function LogoMark({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a6cff" />
          <stop offset="1" stopColor="#1739b8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lm-g)" />
      <path
        data-logo-stroke={animated ? "" : undefined}
        d="M9.8 8.5V22.5H17.8"
        fill="none"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle data-logo-dot={animated ? "" : undefined} cx="22.3" cy="22.5" r="2.3" fill="#ff7a57" />
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ArrowUpRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 3.6 5.2 3.6 8.5s-1 6.1-3.6 8.5c-2.6-2.4-3.6-5.2-3.6-8.5s1-6.1 3.6-8.5Z" />
    </svg>
  );
}

export function LightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <circle cx="12" cy="12" r="6.5" />
    </svg>
  );
}

export function DarkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <path d="M18.5 14.6A7 7 0 0 1 9.4 5.5a7 7 0 1 0 9.1 9.1Z" fill="currentColor" fillOpacity=".15" />
    </svg>
  );
}

export function SystemIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 5.5a6.5 6.5 0 0 1 0 13Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Line illustrations for project cards; every path is drawn on scroll via [data-draw]. */
export function ProjectArt({ kind }: { kind: number }) {
  const p = { ...base, strokeWidth: 1.4, "data-draw": "" } as const;
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden="true">
      {kind === 0 && (
        <g>
          <path {...p} d="M30 10h38l14 14v46H30Z" />
          <path {...p} d="M68 10v14h14" />
          <path {...p} d="M38 34h30M38 42h22" />
          <path {...p} className="text-warm" stroke="currentColor" d="M38 60c4-8 7-8 8-2s4 6 7-2 5-6 6 0 3 4 7-1" />
          <path {...p} d="m88 30 10-10 6 6-10 10-8 2Z" />
        </g>
      )}
      {kind === 1 && (
        <g>
          <path {...p} d="M10 62 34 52l26 10 26-10 24 10V20L86 10 60 20 34 10 10 20Z" opacity=".55" />
          <circle {...p} cx="60" cy="38" r="18" strokeDasharray="3 4" />
          <path {...p} className="text-warm" stroke="currentColor" d="M60 46s-8-7.5-8-13a8 8 0 0 1 16 0c0 5.5-8 13-8 13Z" />
          <circle {...p} cx="60" cy="33" r="2.4" />
        </g>
      )}
      {kind === 2 && (
        <g>
          <path {...p} d="M14 56a24 24 0 0 1 48 0" />
          <path {...p} className="text-warm" stroke="currentColor" d="m38 56 12-14" />
          <path {...p} d="M74 64V44M86 64V30M98 64V38M110 64V20" />
          <path {...p} d="M10 70h100" />
        </g>
      )}
      {kind === 3 && (
        <g>
          <rect {...p} x="8" y="18" width="38" height="44" rx="5" />
          <rect {...p} x="74" y="18" width="38" height="44" rx="5" />
          <path {...p} d="M14 30h26M14 38h18M80 30h26M80 38h18" />
          <path {...p} className="text-warm" stroke="currentColor" d="M50 40h20m-6-6 6 6-6 6" />
          <circle {...p} cx="93" cy="52" r="5" />
        </g>
      )}
      {kind === 4 && (
        <g>
          <rect {...p} x="40" y="6" width="40" height="68" rx="8" />
          <path {...p} d="M54 12h12" />
          <path {...p} className="text-warm" stroke="currentColor" d="M48 54c6-14 12-20 24-22" />
          <path {...p} d="M92 22v8M88 26h8M24 46v6M21 49h6M100 54v4M98 56h4" />
        </g>
      )}
    </svg>
  );
}
