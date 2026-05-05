import { motion } from 'framer-motion';
import ChartMockup from '../components/ChartMockup';

const CATEGORIES = [
  { emoji: '🍔', label: 'Alimentação' },
  { emoji: '🚗', label: 'Transporte' },
  { emoji: '🏠', label: 'Casa' },
  { emoji: '🎮', label: 'Lazer' },
  { emoji: '👕', label: 'Roupas' },
  { emoji: '💊', label: 'Saúde' },
];


export default function FinanceFeatureSection() {
  return (
    <section
      id="financas"
      style={{
        background: '#f8f8f6',
        padding: '96px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-8%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(245,158,11,0.055) 0%, transparent 62%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="flex flex-col md:flex-row items-center gap-16"
        style={{ maxWidth: 1200, margin: '0 auto' }}
      >
        {/* Left: chart mockup */}
        <motion.div
          className="flex-1 flex flex-col gap-4 w-full order-2 md:order-1"
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <ChartMockup />
        </motion.div>

        {/* Right: text */}
        <motion.div
          className="w-full md:w-[420px] order-1 md:order-2"
          style={{ flexShrink: 0 }}
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <Kicker>Controle Financeiro</Kicker>

          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.042em',
              color: '#1a1a1e',
              margin: '0 0 20px',
              lineHeight: 1.1,
            }}
          >
            Seus números,{' '}
            <span style={{ color: '#6366f1' }}>com clareza</span>
          </h2>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#6b7280', margin: '0 0 32px' }}>
            Registre receitas e gastos, acompanhe gráficos em tempo real e entenda para onde seu dinheiro vai — sem planilhas complicadas.
          </p>

          {/* Category chips */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
              Categorias de gasto
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {CATEGORIES.map((cat) => (
                <span
                  key={cat.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#374151',
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: '-0.01em',
                  }}
                >
                  {cat.emoji} {cat.label}
                </span>
              ))}
            </div>
          </div>

          {/* Budget callout */}
          <div
            style={{
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.14)',
              borderRadius: 14,
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4338ca', marginBottom: 5 }}>
              🎯 Orçamentos mensais
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
              Defina metas por categoria e acompanhe se está dentro do planejado.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Kicker({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 9999,
        padding: '4px 12px',
        background: 'rgba(245,158,11,0.1)',
        color: '#92400e',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 20,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
      {children}
    </span>
  );
}
