import { motion } from 'framer-motion';
import ChartMockup from '../components/ChartMockup';

const cardVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } },
};

const MINI_TASKS = [
  { text: 'Reunião de equipe', time: '09:00', color: '#818cf8', done: true },
  { text: 'Revisar proposta', time: '11:00', color: '#fbbf24', done: false },
  { text: 'Enviar relatório', time: '14:30', color: '#34d399', done: false },
];

const TODAY = 5;
const SPECIAL = [12, 20, 25];

export default function BentoSection() {
  return (
    <section
      id="bento"
      style={{ background: '#f8f8f6', padding: '96px 32px' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 9999,
              padding: '4px 12px',
              background: 'rgba(99,102,241,0.08)',
              color: '#4338ca',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
            Tudo em um lugar
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.042em',
              color: '#1a1a1e',
              margin: '0 0 14px',
            }}
          >
            Um espaço para a sua vida
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
            Agenda, rotina e finanças juntos — sem abrir três aplicativos diferentes.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {/* Card: Tasks — col 1-7 */}
          <motion.div
            variants={cardVariant}
            className="md:col-span-7"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.055)',
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>
                Agenda do Dia
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1e', letterSpacing: '-0.035em' }}>
                Organize cada momento
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MINI_TASKS.map((task, i) => (
                <motion.div
                  key={task.text}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.18 + i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    // Replica rounded-[1.35rem] border border-border/70 bg-background/55 do app
                    borderRadius: '1.35rem',
                    border: '1px solid rgba(0,0,0,0.07)',
                    background: 'rgba(248,248,246,0.55)',
                    boxShadow: `inset 3px 0 0 ${task.color}`,
                  }}
                >
                  {/* Checkbox — replica size-5 rounded-full border-2 do app */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: `2px solid ${task.done ? task.color : 'rgba(0,0,0,0.18)'}`,
                      background: task.done ? task.color : 'transparent',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {task.done && (
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: task.done ? '#9ca3af' : '#1a1a1e',
                      textDecoration: task.done ? 'line-through' : 'none',
                      textDecorationColor: 'rgba(0,0,0,0.25)',
                      flex: 1,
                    }}
                  >
                    {task.text}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#9ca3af',
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {task.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card: Streak — col 8-12 */}
          <motion.div
            variants={cardVariant}
            className="md:col-span-5"
            style={{
              background: 'linear-gradient(140deg, #1e1b4b 0%, #1a1a2e 100%)',
              border: '1px solid rgba(129,140,248,0.18)',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 4px 24px rgba(99,102,241,0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 200,
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
                🔥 Sequência Ativa
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 54, fontWeight: 800, color: '#f1f1f3', lineHeight: 1, letterSpacing: '-0.05em' }}>
                  47
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(241,241,243,0.4)', marginBottom: 10 }}>dias seguidos</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(241,241,243,0.35)', lineHeight: 1.5 }}>
                Continue assim — sua consistência está no topo.
              </p>
            </div>
            {/* Week bar */}
            <div style={{ display: 'flex', gap: 5, marginTop: 20 }}>
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: 5,
                      borderRadius: 9999,
                      background: i < 6 ? '#f97316' : 'rgba(255,255,255,0.1)',
                      marginBottom: 4,
                    }}
                  />
                  <span style={{ fontSize: 9, fontWeight: 700, color: i < 6 ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.2)' }}>{d}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card: Calendar — col 1-5 */}
          <motion.div
            variants={cardVariant}
            className="md:col-span-5"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.055)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>
                Calendário
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1e', letterSpacing: '-0.035em' }}>
                Maio 2026
              </div>
            </div>
            {/* Week labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0 2px', marginBottom: 4 }}>
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#c4c4cc', padding: '2px 0' }}>
                  {d}
                </div>
              ))}
            </div>
            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px 2px' }}>
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 3;
                if (day <= 0 || day > 31) return <div key={i} />;
                const isToday = day === TODAY;
                const isSpecial = SPECIAL.includes(day);
                return (
                  <div
                    key={i}
                    style={{
                      textAlign: 'center',
                      borderRadius: 6,
                      padding: '4px 0',
                      fontSize: 11,
                      fontWeight: isToday ? 800 : isSpecial ? 700 : 400,
                      background: isToday
                        ? '#6366f1'
                        : isSpecial
                          ? 'rgba(245,158,11,0.1)'
                          : 'transparent',
                      color: isToday ? '#ffffff' : isSpecial ? '#92400e' : '#374151',
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Card: Finance chart — col 6-12 */}
          <motion.div
            variants={cardVariant}
            className="md:col-span-7"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 20,
              padding: '24px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.055)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>
                Finanças
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1e', letterSpacing: '-0.035em' }}>
                Receita vs. Gasto
              </div>
            </div>
            <ChartMockup />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
