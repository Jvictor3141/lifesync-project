import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Clock, Flame, Repeat } from 'lucide-react';

// Mirrors PERIOD_STYLES from the real app (dark mode tokens)
const PERIODS = [
  {
    id: 'manha',
    label: 'Manhã',
    range: '06:00 – 12:00',
    dot: '#fb923c',
    badgeBg: 'rgba(251,146,60,0.11)',
    badgeText: '#fb923c',
    tasks: [
      { id: 1, text: 'Reunião de equipe', time: '09:00', cor: '#818cf8', recurrence: 'diario', streak: 8 },
      { id: 2, text: 'Revisar proposta', time: '11:00', cor: '#fbbf24', recurrence: null },
    ],
  },
  {
    id: 'tarde',
    label: 'Tarde',
    range: '12:00 – 18:00',
    dot: '#818cf8',
    badgeBg: 'rgba(129,140,248,0.11)',
    badgeText: '#818cf8',
    tasks: [
      { id: 3, text: 'Enviar relatório', time: '14:30', cor: '#4ade80', recurrence: 'semanal' },
      { id: 4, text: 'Planejamento Q2', time: '16:00', cor: '#fb923c', recurrence: 'diario', streak: 21 },
    ],
  },
];

const item = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function TaskMockup() {
  const [checked, setChecked] = useState(new Set());

  // Simula uma task sendo concluída automaticamente
  useEffect(() => {
    const t = setTimeout(() => setChecked(new Set([2])), 1900);
    return () => clearTimeout(t);
  }, []);

  const toggle = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    // Replica o glassmorphism outer wrapper do app (dark mode)
    <div
      style={{
        background: '#18181c',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1.85rem',
        padding: '20px',
        width: '100%',
        maxWidth: 380,
        boxShadow:
          '0 1px 4px rgba(0,0,0,0.45), 0 6px 20px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset',
      }}
    >
      {PERIODS.map((period, pi) => (
        <motion.div
          key={period.id}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.2 + pi * 0.5 },
            },
          }}
          style={{
            // Replica surface-panel / rounded-[1.85rem] do app
            background: 'rgba(13,13,16,0.55)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '1.35rem',
            marginBottom: pi < PERIODS.length - 1 ? 12 : 0,
            overflow: 'hidden',
          }}
        >
          {/* Period header — replica CardHeader com dot + badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Dot colorido — igual ao h-3 w-3 rounded-full do app */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: period.dot,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#f1f1f3',
                  letterSpacing: '-0.02em',
                }}
              >
                {period.label}
              </span>
            </div>
            {/* Badge de horário — replica rounded-full px-3 py-1 uppercase tracking do app */}
            <span
              style={{
                background: period.badgeBg,
                color: period.badgeText,
                borderRadius: 9999,
                padding: '3px 10px',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              {period.range}
            </span>
          </div>

          {/* Tasks */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {period.tasks.map((task) => {
              const done = checked.has(task.id);
              return (
                <motion.div
                  key={task.id}
                  variants={item}
                  transition={{ duration: 0.32, ease: [0.25, 0.4, 0.25, 1] }}
                  onClick={() => toggle(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 12px',
                    // Replica rounded-[1.35rem] border border-border/70 bg-background/55
                    borderRadius: '1.35rem',
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(13,13,16,0.45)',
                    // Left accent via box-shadow — idêntico ao app
                    boxShadow: `inset 3px 0 0 ${task.cor}`,
                    cursor: 'pointer',
                  }}
                >
                  {/* Checkbox — replica size-5 rounded-full border-2 do app */}
                  <motion.div
                    animate={
                      done
                        ? { backgroundColor: task.cor, borderColor: task.cor }
                        : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.22)' }
                    }
                    transition={{ duration: 0.18 }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: '2px solid',
                      flexShrink: 0,
                      marginTop: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AnimatePresence>
                      {done && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15, ease: 'backOut' }}
                        >
                          <Check size={12} color="white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Task text — replica font-medium text-foreground */}
                    <motion.span
                      animate={{ opacity: done ? 0.45 : 1 }}
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#f1f1f3',
                        letterSpacing: '-0.01em',
                        display: 'block',
                        textDecoration: done ? 'line-through' : 'none',
                        textDecorationColor: 'rgba(241,241,243,0.3)',
                      }}
                    >
                      {task.text}
                    </motion.span>

                    {/* Metadata row — replica mt-2 flex gap-3 text-xs text-muted-foreground */}
                    <div
                      style={{
                        marginTop: 5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Clock + time */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 11,
                          color: '#6b7280',
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        <Clock size={10} />
                        {task.time}
                      </span>

                      {/* Recurrence */}
                      {task.recurrence && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 10,
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 700,
                          }}
                        >
                          <Repeat size={9} />
                          {task.recurrence}
                        </span>
                      )}

                      {/* Streak — só aparece se >= 2 e não concluída */}
                      {task.streak >= 2 && !done && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 11,
                            fontWeight: 600,
                            color: task.cor,
                          }}
                        >
                          <Flame size={11} color={task.cor} />
                          {task.streak}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
