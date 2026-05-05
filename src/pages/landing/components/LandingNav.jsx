import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

const NAV_LINKS = [
  { label: 'Funcionalidades', id: 'bento' },
  { label: 'Agenda', id: 'agenda' },
  { label: 'Finanças', id: 'financas' },
];

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function LandingNav({ onGetStarted }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: 'rgba(13,13,16,0.88)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <img src={logoImg} alt="" style={{ height: 26, width: 'auto' }} />
          <span
            style={{
              fontFamily: "'Segoe UI Variable Display', Aptos, 'Segoe UI', sans-serif",
              fontSize: '1.2rem',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Life</span>
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

        {/* Nav links — hidden on small screens */}
        <div className="hidden md:flex" style={{ gap: 28, flex: 1, justifyContent: 'center' }}>
          {NAV_LINKS.map(({ label, id }) => (
            <NavLink key={id} label={label} onClick={() => scrollTo(id)} />
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
          <button
            onClick={onGetStarted}
            className="hidden sm:inline-flex"
            style={{
              alignItems: 'center',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.13)',
              color: '#f1f1f3',
              borderRadius: 9999,
              padding: '7px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 0.18s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)';
              e.currentTarget.style.background = 'none';
            }}
          >
            Entrar
          </button>
          <button
            onClick={onGetStarted}
            style={{
              background: '#6366f1',
              border: 'none',
              color: '#ffffff',
              borderRadius: 9999,
              padding: '7px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 0.18s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4f46e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#6366f1';
            }}
          >
            Começar grátis
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: 'rgba(241,241,243,0.52)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        padding: 0,
        letterSpacing: '-0.01em',
        transition: 'color 0.18s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f1f3')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(241,241,243,0.52)')}
    >
      {label}
    </button>
  );
}
