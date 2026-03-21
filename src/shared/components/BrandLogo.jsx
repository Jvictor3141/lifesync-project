import React from 'react';

const BrandLogo = ({ className = '', title = 'LifeSync', ...props }) => {
  return (
    <svg
      viewBox="0 0 980 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <title>{title}</title>

      <g transform="translate(18 16)" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="18" width="182" height="154" rx="34" strokeWidth="10" />
        <path d="M18 58H200" strokeWidth="10" />
        <path d="M62 8V34" strokeWidth="14" />
        <path d="M152 8V34" strokeWidth="14" />
        <path d="M146 18H162C183 18 200 35 200 56V72" strokeWidth="10" opacity="0.95" />
        <path d="M150 58L200 108" strokeWidth="10" opacity="0.16" />

        <circle cx="58" cy="84" r="5.5" fill="currentColor" stroke="none" opacity="0.95" />
        <path d="M78 84H150" strokeWidth="8" opacity="0.82" />

        <circle cx="58" cy="112" r="5.5" fill="currentColor" stroke="none" opacity="0.95" />
        <path d="M78 112H138" strokeWidth="8" opacity="0.82" />

        <circle cx="58" cy="140" r="5.5" fill="currentColor" stroke="none" opacity="0.95" />
        <path d="M78 140H122" strokeWidth="8" opacity="0.82" />

        <path d="M110 86L126 102L160 70" strokeWidth="12" />
        <path d="M170 84V148" strokeWidth="8" opacity="0.26" />
        <path d="M158 140L170 152L182 140" strokeWidth="8" opacity="0.7" />
      </g>

      <text
        x="255"
        y="138"
        fill="currentColor"
        fontFamily="'Segoe UI Variable Display', Aptos, 'Segoe UI', sans-serif"
        fontSize="112"
        letterSpacing="-4"
      >
        <tspan fontWeight="640">Life</tspan>
        <tspan dx="-2" fontWeight="430">Sync</tspan>
      </text>
    </svg>
  );
};

export default BrandLogo;
