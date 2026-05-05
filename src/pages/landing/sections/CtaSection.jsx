import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function CtaSection({ onGetStarted }) {
  return (
    <section
      style={{
        background: '#0d0d10',
        padding: '96px 32px 72px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Top gradient rule */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: '12%',
          right: '12%',
          height: 1,
          background:
            'linear-gradient(90deg, transparent, rgba(99,102,241,0.45), rgba(245,158,11,0.35), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Center glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 420,
          background:
            'radial-gradient(ellipse, rgba(99,102,241,0.09) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <img src={logoImg} alt="LifeSync" style={{ height: 80, width: 'auto', opacity: 0.9, padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255)' }} />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.052em',
            color: '#f1f1f3',
            margin: '0 0 16px',
            lineHeight: 1.04,
          }}
        >
          Comece hoje.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.16 }}
          style={{
            fontSize: 16,
            color: 'rgba(241,241,243,0.42)',
            margin: '0 0 44px',
            lineHeight: 1.65,
          }}
        >
          Gratuito. Sem cartão. Pronto em segundos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.24 }}
        >
          <button
            onClick={onGetStarted}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 9999,
              padding: '15px 32px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 0.18s ease',
              boxShadow: '0 4px 28px rgba(99,102,241,0.38)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 36px rgba(99,102,241,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 28px rgba(99,102,241,0.38)';
            }}
          >
            Criar minha conta
            <ArrowRight size={17} />
          </button>
        </motion.div>
      </div>

      {/* Footer text */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 64,
          fontSize: 12,
          color: 'rgba(241,241,243,0.18)',
          letterSpacing: '0.03em',
        }}
      >
        © 2026 LifeSync · Seu planner pessoal
      </motion.div>
    </section>
  );
}
