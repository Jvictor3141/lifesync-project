import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// Dados de demonstração — replica a estrutura do FinancialChart real
const DEMO_DATA = [
  { name: 'Jan', receitas: 4200, despesas: 3100 },
  { name: 'Fev', receitas: 3800, despesas: 2900 },
  { name: 'Mar', receitas: 5100, despesas: 3400 },
  { name: 'Abr', receitas: 4600, despesas: 3200 },
  { name: 'Mai', receitas: 6400, despesas: 3553 },
];

const SUMMARY = [
  { label: 'Receita', value: 'R$ 6.400', color: '#16a34a', bg: 'rgba(22,163,74,0.09)' },
  { label: 'Gasto',   value: 'R$ 3.553', color: '#dc2626', bg: 'rgba(220,38,38,0.09)' },
  { label: 'Saldo',   value: 'R$ 2.847', color: '#6366f1', bg: 'rgba(99,102,241,0.09)' },
];

function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null;
  const bg = dark ? 'rgba(17,17,20,0.97)' : 'rgba(255,255,255,0.97)';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = dark ? '#f1f1f3' : '#1a1a1e';
  const muted = dark ? '#9ca3af' : '#6b7280';

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: '10px 14px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(12px)',
        minWidth: 140,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, color: muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: muted, flex: 1 }}>
            {p.dataKey === 'receitas' ? 'Receita' : 'Gasto'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: textColor }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ChartMockup({ dark = false }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setAnimate(true), 120);
      return () => clearTimeout(t);
    }
  }, [isInView]);

  const bg       = dark ? '#18181c'                          : '#ffffff';
  const border   = dark ? 'rgba(255,255,255,0.08)'           : 'rgba(0,0,0,0.07)';
  const textMain = dark ? '#f1f1f3'                          : '#1a1a1e';
  const muted    = dark ? '#9ca3af'                          : '#6b7280';
  const gridLine = dark ? 'rgba(255,255,255,0.04)'           : 'rgba(0,0,0,0.045)';
  const chartBg  = dark ? 'rgba(13,13,16,0.55)'              : 'rgba(248,248,246,0.6)';
  const chartBdr = dark ? 'rgba(255,255,255,0.07)'           : 'rgba(0,0,0,0.07)';
  const shadow   = dark ? '0 1px 4px rgba(0,0,0,0.45), 0 6px 20px rgba(0,0,0,0.35)'
                        : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)';

  return (
    <div
      ref={ref}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        // Replica o rounded-[1.85rem] dos cards do app
        borderRadius: '1.85rem',
        padding: '20px',
        boxShadow: shadow,
        width: '100%',
      }}
    >
      {/* Header — replica planner-kicker + CardTitle do app */}
      <div
        style={{
          borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          paddingBottom: 14,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Replica .planner-kicker */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              borderRadius: 9999,
              padding: '3px 9px',
              background: dark ? 'rgba(129,140,248,0.11)' : 'rgba(99,102,241,0.08)',
              color: dark ? '#818cf8' : '#4338ca',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: dark ? '#818cf8' : '#6366f1', flexShrink: 0 }} />
            Fluxo financeiro
          </span>
          <div style={{ fontSize: 22, fontWeight: 700, color: textMain, letterSpacing: '-0.04em', lineHeight: 1 }}>
            R$ 2.847
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginTop: 5 }}>↑ 14% vs mês anterior</div>
        </div>

        {/* Legend — replica as séries do gráfico real */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
          {[
            { label: 'Receita', color: '#16a34a' },
            { label: 'Gasto',   color: '#dc2626' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 3, borderRadius: 9999, background: color }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: muted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary chips — replica metric cards do FinancialChart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {SUMMARY.map((c) => (
          <div
            key={c.label}
            style={{
              background: c.bg,
              borderRadius: 12,
              padding: '10px 12px',
              border: `1px solid ${c.bg}`,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: muted, marginBottom: 5 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: c.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart area — replica rounded-[1.6rem] border bg-background/40 do app */}
      <div
        style={{
          background: chartBg,
          borderRadius: '1.35rem',
          border: `1px solid ${chartBdr}`,
          padding: '12px 8px 4px',
          height: 130,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DEMO_DATA} margin={{ top: 6, right: 10, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={gridLine} strokeDasharray="" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: muted, fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ stroke: gridLine, strokeWidth: 1 }} />
            {/* strokeWidth=3 — idêntico ao real */}
            <Line
              type="monotone"
              dataKey="receitas"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={animate}
              animationDuration={1400}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="despesas"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              isAnimationActive={animate}
              animationDuration={1600}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
