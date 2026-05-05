import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import TaskMockup from '../components/TaskMockup';

const FEATURES = [
  'Tarefas por período: Manhã, Tarde e Noite',
  'Recorrência diária, semanal ou mensal automática',
  'Sequência de dias para manter o foco',
  'Arraste para reordenar em qualquer momento',
];

export default function AgendaFeatureSection() {
  return (
    <section
      id="agenda"
      style={{
        background: '#111114',
        padding: '96px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-8%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 62%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="flex flex-col md:flex-row items-center gap-16"
        style={{ maxWidth: 1200, margin: '0 auto' }}
      >
        {/* Left: text */}
        <motion.div
          className="w-full md:w-[440px] order-2 md:order-1"
          style={{ flexShrink: 0 }}
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <Kicker color="#818cf8" bg="rgba(129,140,248,0.12)" dot="#818cf8">
            Agenda Inteligente
          </Kicker>

          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.042em',
              color: '#f1f1f3',
              margin: '0 0 20px',
              lineHeight: 1.1,
            }}
          >
            Cada tarefa no{' '}
            <span style={{ color: '#818cf8' }}>momento certo</span>
          </h2>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'rgba(241,241,243,0.45)',
              margin: '0 0 36px',
            }}
          >
            Divida seu dia em períodos e veja claramente o que precisa ser feito agora — não apenas uma lista que nunca termina.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: i * 0.08 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: 'rgba(129,140,248,0.14)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  <Check size={11} color="#818cf8" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(241,241,243,0.65)', lineHeight: 1.5 }}>
                  {text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: mockup */}
        <motion.div
          className="flex-1 flex justify-center order-1 md:order-2 w-full"
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: '-30px',
                background: 'radial-gradient(ellipse 80% 60% at 50% 55%, rgba(99,102,241,0.12), transparent 70%)',
                pointerEvents: 'none',
                borderRadius: '50%',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <TaskMockup />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Kicker({ children, color, bg, dot }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 9999,
        padding: '4px 12px',
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 20,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {children}
    </span>
  );
}
