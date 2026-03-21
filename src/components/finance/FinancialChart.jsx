import React from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Minus,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SERIES = [
  { key: 'receitas', label: 'Receitas', color: 'var(--finance-income)' },
  { key: 'despesas', label: 'Despesas', color: 'var(--finance-expense)' },
  { key: 'lucro', label: 'Lucro', color: 'var(--finance-profit)' },
];

const ALERT_STYLES = {
  critical: 'border-[var(--finance-expense-soft)] bg-[var(--finance-expense-soft)] text-[var(--finance-expense-deep)]',
  warning: 'border-[var(--planner-amber-soft)] bg-[var(--planner-amber-soft)] text-foreground',
  info: 'border-[var(--planner-sage-soft)] bg-[var(--planner-sage-soft)] text-[var(--planner-sage-deep)]',
};

const DELTA_STYLES = {
  positive: 'text-[var(--finance-income-deep)] bg-[var(--finance-income-soft)]',
  negative: 'text-[var(--finance-expense-deep)] bg-[var(--finance-expense-soft)]',
  neutral: 'text-muted-foreground bg-background/60',
};

const getDeltaState = (value, invert = false) => {
  if (value === null) {
    return {
      Icon: Minus,
      className: DELTA_STYLES.neutral,
      label: 'Sem base anterior',
    };
  }

  if (value === 0) {
    return {
      Icon: Minus,
      className: DELTA_STYLES.neutral,
      label: '0% vs. período anterior',
    };
  }

  const isPositive = value > 0;
  const isGood = invert ? !isPositive : isPositive;

  return {
    Icon: isPositive ? ArrowUpRight : ArrowDownRight,
    className: isGood ? DELTA_STYLES.positive : DELTA_STYLES.negative,
    label: `${Math.abs(value).toFixed(1)}% vs. período anterior`,
  };
};

const MetricCard = ({
  className,
  comparisonLabel,
  delta,
  formatCurrency,
  icon,
  invertDelta = false,
  title,
  value,
}) => {
  const deltaMeta = getDeltaState(delta, invertDelta);
  const DeltaIcon = deltaMeta.Icon;
  const MetricIcon = icon;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-background/60">
            <MetricIcon className="w-4 h-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{formatCurrency(value)}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${deltaMeta.className}`}>
            <DeltaIcon className="w-3.5 h-3.5" />
            {deltaMeta.label}
          </span>
          <span className="text-muted-foreground">{comparisonLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const LineTooltip = ({ active, formatCurrency, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="min-w-[13rem] rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-[var(--planner-shadow)] backdrop-blur-xl">
      <div className="text-sm font-semibold text-foreground">{point.fullLabel}</div>
      <div className="mt-3 space-y-2 text-xs">
        {SERIES.map((series) => {
          const rawValue = point[series.key];
          const value = typeof rawValue === 'number' ? rawValue : 0;

          return (
            <div key={series.key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
                {series.label}
              </div>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PieTooltip = ({ active, formatCurrency, payload }) => {
  const slice = payload?.[0]?.payload;

  if (!active || !slice) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-[var(--planner-shadow)] backdrop-blur-xl">
      <div className="text-sm font-semibold text-foreground">{slice.name}</div>
      <div className="mt-2 text-xs text-muted-foreground">Despesa no período</div>
      <div className="mt-1 font-mono font-medium text-foreground">{formatCurrency(slice.value)}</div>
    </div>
  );
};

const EmptyState = ({ onPrimaryAction }) => (
  <div className="rounded-[1.6rem] border border-dashed border-border/70 bg-background/45 px-6 py-10 text-center">
    <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-[var(--planner-sage-soft)] text-[var(--planner-sage-deep)]">
      <Wallet className="w-7 h-7" />
    </div>
    <h3 className="mt-5 text-xl font-semibold text-foreground">Fluxo financeiro ainda vazio</h3>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
      Adicione seus primeiros pagamentos para visualizar seu fluxo financeiro
    </p>
    {onPrimaryAction && (
      <Button className="mt-6" onClick={onPrimaryAction}>
        Adicionar pagamentos
      </Button>
    )}
  </div>
);

const ProfitDot = ({ cx, cy, payload }) => {
  if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) {
    return null;
  }

  const fill = payload.lucro < 0 ? 'var(--finance-expense)' : 'var(--finance-profit)';

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke="var(--background)"
      strokeWidth={2}
    />
  );
};

const FinancialChart = ({
  filterOptions,
  formatCompactCurrency,
  formatCurrency,
  isLoading = false,
  isMobile = false,
  model,
  onFilterChange,
  onPrimaryAction,
  selectedFilter,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="planner-kicker">Fluxo financeiro</p>
            <CardTitle className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">
              Receitas, despesas e lucro em uma única leitura
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {model.filterLabel} · {model.rangeLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 xl:max-w-[28rem] xl:justify-end">
            {filterOptions.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() => onFilterChange(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
            {isLoading && (
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-2 text-xs text-muted-foreground">
                Atualizando dados...
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            className="border-[var(--finance-income-soft)] bg-[var(--finance-income-soft)]"
            comparisonLabel={model.comparisonRangeLabel}
            delta={model.comparison.entries}
            formatCurrency={formatCurrency}
            icon={TrendingUp}
            title="Receita total"
            value={model.totals.totalEntries}
          />
          <MetricCard
            className="border-[var(--finance-expense-soft)] bg-[var(--finance-expense-soft)]"
            comparisonLabel={model.comparisonRangeLabel}
            delta={model.comparison.expenses}
            formatCurrency={formatCurrency}
            icon={TrendingDown}
            invertDelta
            title="Despesa total"
            value={model.totals.totalExpenses}
          />
          <MetricCard
            className={`border-[var(--finance-profit-soft)] ${model.totals.netProfit >= 0 ? 'bg-[var(--finance-profit-soft)]' : 'bg-[var(--finance-expense-soft)] border-[var(--finance-expense-soft)]'}`}
            comparisonLabel={model.comparisonRangeLabel}
            delta={model.comparison.profit}
            formatCurrency={formatCurrency}
            icon={CircleDollarSign}
            title="Lucro líquido"
            value={model.totals.netProfit}
          />
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-border/70 bg-background/40 p-4 md:p-5">
          {model.isEmpty ? (
            <EmptyState onPrimaryAction={onPrimaryAction} />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {SERIES.map((series) => (
                  <span key={series.key} className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
                    {series.label}
                  </span>
                ))}
                {model.hasNegativeProfit && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--finance-expense-soft)] px-3 py-1.5 text-[var(--finance-expense-deep)]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Há buckets com lucro negativo
                  </span>
                )}
              </div>

              <div className="h-[320px] sm:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={model.points} margin={{ top: 12, right: isMobile ? 12 : 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
                    {model.hasNegativeProfit && (
                      <ReferenceArea y1={model.minimumProfit} y2={0} fill="var(--finance-expense-soft)" fillOpacity={0.45} />
                    )}
                    <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      minTickGap={isMobile ? 18 : 10}
                      tick={{ fill: 'var(--planner-ink-soft)', fontSize: isMobile ? 10 : 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={isMobile ? 54 : 72}
                      tick={{ fill: 'var(--planner-ink-soft)', fontSize: isMobile ? 10 : 11 }}
                      tickFormatter={formatCompactCurrency}
                    />
                    <Tooltip content={<LineTooltip formatCurrency={formatCurrency} />} />
                    <Line
                      type="monotone"
                      dataKey="receitas"
                      name="Receitas"
                      stroke="var(--finance-income)"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, fill: 'var(--finance-income)' }}
                      animationDuration={700}
                      animationEasing="ease-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="despesas"
                      name="Despesas"
                      stroke="var(--finance-expense)"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, fill: 'var(--finance-expense)' }}
                      animationDuration={760}
                      animationEasing="ease-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="lucro"
                      name="Lucro"
                      stroke="var(--finance-profit)"
                      strokeWidth={3}
                      dot={<ProfitDot />}
                      activeDot={{ r: 6, fill: 'var(--finance-profit)' }}
                      animationDuration={820}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {!model.isEmpty && (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/70 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <PieChartIcon className="w-5 h-5 text-[var(--finance-expense)]" />
                  Despesas por categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {model.pieData.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-border/70 bg-background/45 px-4 py-10 text-center text-sm text-muted-foreground">
                    Nenhuma despesa no período selecionado para montar o gráfico de pizza.
                  </div>
                ) : (
                  <>
                    <div className="h-[280px] sm:h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip content={<PieTooltip formatCurrency={formatCurrency} />} />
                          <Pie
                            data={model.pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={isMobile ? 54 : 72}
                            outerRadius={isMobile ? 88 : 112}
                            paddingAngle={2}
                            animationDuration={700}
                            animationEasing="ease-out"
                          >
                            {model.pieData.map((item) => (
                              <Cell key={item.category} fill={item.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {model.pieData.map((item) => (
                        <div key={item.category} className="flex items-center justify-between rounded-2xl bg-background/55 px-3 py-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                            {item.name}
                          </div>
                          <div className="font-mono font-medium text-foreground">{formatCurrency(item.value)}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card>
                <CardHeader className="border-b border-border/70 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Clock3 className="w-5 h-5 text-[var(--finance-profit)]" />
                    Indicador de fluxo futuro
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className={`text-3xl font-semibold ${model.forecast.projectedNet >= 0 ? 'text-[var(--finance-profit)]' : 'text-[var(--finance-expense-deep)]'}`}>
                    {formatCurrency(model.forecast.projectedNet)}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {model.forecast.label}. Restam {model.forecast.remainingDays} dias no mês, considerando o ritmo médio atual.
                  </p>

                  <div className="mt-5 grid gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-2xl bg-background/55 px-3 py-2">
                      <span className="text-muted-foreground">Receita projetada</span>
                      <span className="font-mono font-medium text-[var(--finance-income-deep)]">
                        {formatCurrency(model.forecast.projectedEntries)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-background/55 px-3 py-2">
                      <span className="text-muted-foreground">Despesa projetada</span>
                      <span className="font-mono font-medium text-[var(--finance-expense-deep)]">
                        {formatCurrency(model.forecast.projectedExpenses)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-background/55 px-3 py-2">
                      <span className="text-muted-foreground">Ritmo líquido diário</span>
                      <span className={`font-mono font-medium ${model.forecast.averageDailyNet >= 0 ? 'text-[var(--finance-income-deep)]' : 'text-[var(--finance-expense-deep)]'}`}>
                        {formatCurrency(model.forecast.averageDailyNet)} / dia
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border/70 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <CreditCard className="w-5 h-5 text-[var(--finance-expense)]" />
                    Alertas automáticos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-3">
                    {model.alerts.map((alert) => (
                      <div key={alert.id} className={`rounded-[1.35rem] border px-4 py-3 ${ALERT_STYLES[alert.severity]}`}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <div className="font-semibold">{alert.title}</div>
                            <div className="mt-1 text-sm leading-6 opacity-90">{alert.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(FinancialChart);
