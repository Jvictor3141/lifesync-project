import React from 'react';
import logoImg from '@/assets/logo.png';

const BrandLogo = ({ className = '', title = 'LifeSync', ...props }) => {
  return (
    <div
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}
      role="img"
      aria-label={title}
      {...props}
    >
      <img src={logoImg} alt="" className="h-full w-auto object-contain" />
      <span
        style={{
          fontFamily: "'Segoe UI Variable Display', Aptos, 'Segoe UI', sans-serif",
          fontSize: '2rem',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: '#1a2555', fontWeight: 700 }}>Life</span>
        <span
          style={{
            background: 'linear-gradient(90deg, #2dc5a8 20%, #1ab4c8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 430,
          }}
        >
          Sync
        </span>
      </span>
    </div>
  );
};

export default BrandLogo;
