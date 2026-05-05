import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import TaskMockup from '../components/TaskMockup';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const child = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } },
};

export default function HeroSection({ onGetStarted }) {
  const scrollDown = () =>
    document.getElementById('bento')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      style={{
        minHeight: '100vh',
        background: '#0d0d10',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 60,
      }}
    >
      {/* Background glows */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-8%',
          width: 720,
          height: 720,
          background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 62%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-5%',
          right: '-8%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(245,158,11,0.055) 0%, transparent 62%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        className="flex flex-col md:flex-row items-center"
        style={{
          flex: 1,
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          padding: '64px 32px 56px',
          gap: 64,
        }}
      >
        {/* Left — text */}
        <motion.div
          className="w-full md:w-[480px] order-2 md:order-1"
          style={{ flexShrink: 0 }}
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Kicker */}
          <motion.div variants={child} style={{ marginBottom: 24 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                borderRadius: 9999,
                padding: '4px 13px',
                background: 'rgba(129,140,248,0.13)',
                color: '#818cf8',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#818cf8',
                  flexShrink: 0,
                }}
              />
              Agenda · Rotina · Finanças
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={child}
            style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.045em',
              lineHeight: 1.06,
              color: '#f1f1f3',
              margin: '0 0 22px',
            }}
          >
            Planeje seus dias.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Cuide das suas finanças.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={child}
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'rgba(241,241,243,0.48)',
              margin: '0 0 36px',
              maxWidth: 430,
            }}
          >
            Sua agenda, sua rotina e suas finanças em um único lugar. Simples, rápido e feito para quem não tem tempo a perder.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={child} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <HeroButton primary onClick={onGetStarted}>
              Começar grátis
              <ArrowRight size={15} />
            </HeroButton>
            <HeroButton onClick={scrollDown}>Ver como funciona</HeroButton>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={child}
            style={{
              marginTop: 24,
              fontSize: 12,
              color: 'rgba(241,241,243,0.25)',
              letterSpacing: '0.01em',
            }}
          >
            Gratuito. Sem cartão de crédito. Sem compromisso.
          </motion.p>
        </motion.div>

        {/* Right — mockup */}
        <motion.div
          className="flex-1 flex justify-center order-1 md:order-2 w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div style={{ position: 'relative' }}>
            {/* Glow under the card */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: '-20px',
                background:
                  'radial-gradient(ellipse 85% 65% at 50% 65%, rgba(99,102,241,0.18), transparent 70%)',
                pointerEvents: 'none',
                borderRadius: '50%',
              }}
            />
            {/* Floating animation */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <TaskMockup />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        style={{ textAlign: 'center', paddingBottom: 28 }}
      >
        <button
          onClick={scrollDown}
          aria-label="Rolar para baixo"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} color="rgba(241,241,243,0.25)" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}

function HeroButton({ primary, onClick, children }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.01em',
    transition: 'all 0.18s ease',
    fontFamily: 'inherit',
    border: 'none',
  };

  const styles = primary
    ? {
        ...base,
        background: '#6366f1',
        color: '#ffffff',
        boxShadow: '0 0 0 0 rgba(99,102,241,0.35)',
      }
    : {
        ...base,
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(241,241,243,0.7)',
        border: '1px solid rgba(255,255,255,0.1)',
      };

  const hoverIn = (e) => {
    if (primary) {
      e.currentTarget.style.background = '#4f46e5';
      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.22)';
    } else {
      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
      e.currentTarget.style.color = '#f1f1f3';
    }
  };
  const hoverOut = (e) => {
    if (primary) {
      e.currentTarget.style.background = '#6366f1';
      e.currentTarget.style.boxShadow = '0 0 0 0 rgba(99,102,241,0.35)';
    } else {
      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
      e.currentTarget.style.color = 'rgba(241,241,243,0.7)';
    }
  };

  return (
    <button style={styles} onClick={onClick} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {children}
    </button>
  );
}
