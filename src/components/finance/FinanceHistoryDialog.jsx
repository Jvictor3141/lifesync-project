import React, { useMemo } from 'react';
import {
  ArrowLeft,
  LoaderCircle,
  ReceiptText,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buildMonthlyHistoryModel } from '@/features/finance/lib/finance-history-utils';
import {
  formatCompactCurrency,
  formatCurrency,
  formatMonthLabel,
} from '@/features/finance/lib/finance-utils';

const SERIES = [
  { key: 'entradas', label: 'Entradas', color: 'var(--finance-income)' },
  { key: 'gastos', label: 'Gastos', color: 'var(--finance-expense)' },
  { key: 'saldoAcumulado', label: 'Saldo acumulado', color: 'var(--finance-profit)' },
];

const HistoryTooltip = ({ active, payload }) => {
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="min-w-[14rem] rounded-2xl border border-border/70 bg-background/95 px-4 py-3 shadow-[var(--planner-shadow)] backdrop-blur-xl">
      <div className="text-sm font-semibold text-foreground">{point.fullLabel}</div>
      <div className="mt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--finance-income)]" />
            Entradas
          </div>
          <span className="font-mono font-medium text-foreground">{formatCurrency(point.entradas)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--finance-expense)]" />
            Gastos
          </div>
          <span className="font-mono font-medium text-foreground">{formatCurrency(point.gastos)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-muted-foreground">Saldo do dia</div>
          <span className={`font-mono font-medium ${point.saldoDia >= 0 ? 'text-[var(--finance-income-deep)]' : 'text-[var(--finance-expense-deep)]'}`}>
            {formatCurrency(point.saldoDia)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-2">
          <div className="text-muted-foreground">Saldo acumulado</div>
          <span className={`font-mono font-semibold ${point.saldoAcumulado >= 0 ? 'text-[var(--finance-profit-deep)]' : 'text-[var(--finance-expense-deep)]'}`}>
            {formatCurrency(point.saldoAcumulado)}
          </span>
        </div>
      </div>
    </div>
  );
};

const HistoryMetricCard = ({ className, icon, label, value }) => {
  const MetricIcon = icon;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-background/60">
            <MetricIcon className="h-4 w-4" />
          </span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
};

const HistoryInsightCard = ({ label, tone = 'neutral', value }) => (
  <div className={`rounded-[1.4rem] border px-4 py-4 ${tone === 'positive' ? 'border-[var(--finance-income-soft)] bg-[var(--finance-income-soft)]' : tone === 'negative' ? 'border-[var(--finance-expense-soft)] bg-[var(--finance-expense-soft)]' : 'border-border/70 bg-background/55'}`}>
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    <div className="mt-3 text-sm leading-6 text-foreground">{value}</div>
  </div>
);

const DeleteHistoryMonthAction = ({ disabled, isDeleting, label, onConfirm }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        disabled={disabled}
        className="rounded-2xl border-[var(--finance-expense-soft)] text-[var(--finance-expense-deep)] hover:bg-[var(--finance-expense-soft)] hover:text-[var(--finance-expense-deep)]"
        title={`Excluir ${label}`}
      >
        {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir histórico de {label}?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação remove permanentemente os dados financeiros salvos desse mês.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-[var(--finance-expense)] text-white hover:bg-[var(--finance-expense-deep)]"
        >
          Excluir histórico
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const FinanceHistoryDialog = ({
  deletingMonthKey,
  historyGroups,
  isMobile,
  loadingMonth,
  onBack,
  onDeleteMonth,
  onOpenChange,
  onSelectMonth,
  open,
  selectedHistoryMonth,
  selectedMonthData,
}) => {
  const historyModel = useMemo(
    () => buildMonthlyHistoryModel(selectedMonthData, selectedHistoryMonth),
    [selectedHistoryMonth, selectedMonthData],
  );

  const tickLookup = useMemo(
    () => Object.fromEntries(historyModel.points.map((point) => [point.label, point.showTick])),
    [historyModel.points],
  );

  const monthLabel = selectedHistoryMonth ? formatMonthLabel(selectedHistoryMonth) : '';
  const deleteSelectedMonth = () => onDeleteMonth?.(selectedHistoryMonth);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl p-3 sm:p-4 md:p-6 max-h-[85vh] overflow-y-auto planner-scroll">
        {!selectedHistoryMonth ? (
          <>
            <DialogHeader>
              <DialogTitle>Histórico de meses</DialogTitle>
            </DialogHeader>
            <div className="max-h-[50vh] overflow-y-auto space-y-4 planner-scroll pr-1">
              {historyGroups.length === 0 ? (
                <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/45 px-4 py-10 text-center text-muted-foreground">
                  Nenhum histórico disponível.
                </div>
              ) : (
                historyGroups.map((group) => (
                  <div key={group.year}>
                    <div className="mb-2 text-sm font-semibold text-muted-foreground">
                      {group.year}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {group.months.map((monthKey) => {
                        const currentMonthLabel = formatMonthLabel(monthKey);
                        const isDeleting = deletingMonthKey === monthKey;

                        return (
                          <div key={monthKey} className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => onSelectMonth(monthKey)}
                              className="flex-1 justify-between rounded-2xl"
                            >
                              <span>{currentMonthLabel}</span>
                              <span className="text-xs text-muted-foreground">Abrir</span>
                            </Button>
                            <DeleteHistoryMonthAction
                              disabled={Boolean(deletingMonthKey)}
                              isDeleting={isDeleting}
                              label={currentMonthLabel}
                              onConfirm={() => onDeleteMonth?.(monthKey)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <DialogTitle>{monthLabel}</DialogTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Leitura histórica do fluxo diário do mês, com entradas, gastos e saldo acumulado.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DeleteHistoryMonthAction
                    disabled={Boolean(deletingMonthKey)}
                    isDeleting={deletingMonthKey === selectedHistoryMonth}
                    label={monthLabel}
                    onConfirm={deleteSelectedMonth}
                  />
                  <Button variant="outline" onClick={onBack} className="rounded-2xl">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                </div>
              </div>
            </DialogHeader>
            {loadingMonth ? (
              <div className="py-12 text-center text-muted-foreground">Carregando...</div>
            ) : historyModel.isEmpty ? (
              <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/45 px-4 py-10 text-center text-muted-foreground">
                Esse mês não possui movimentações salvas.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <HistoryMetricCard
                    className="border-[var(--finance-income-soft)] bg-[var(--finance-income-soft)]"
                    icon={TrendingUp}
                    label="Entradas"
                    value={formatCurrency(historyModel.totals.totalEntries)}
                  />
                  <HistoryMetricCard
                    className="border-[var(--finance-expense-soft)] bg-[var(--finance-expense-soft)]"
                    icon={TrendingDown}
                    label="Gastos"
                    value={formatCurrency(historyModel.totals.totalExpenses)}
                  />
                  <HistoryMetricCard
                    className={historyModel.totals.balance >= 0 ? 'border-[var(--finance-profit-soft)] bg-[var(--finance-profit-soft)]' : 'border-[var(--finance-expense-soft)] bg-[var(--finance-expense-soft)]'}
                    icon={Scale}
                    label="Saldo líquido"
                    value={formatCurrency(historyModel.totals.balance)}
                  />
                  <HistoryMetricCard
                    className="border-border/70 bg-background/55"
                    icon={ReceiptText}
                    label="Transações"
                    value={historyModel.totalTransactions.toLocaleString('pt-BR')}
                  />
                </div>

                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-border/70 pb-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">Evolução diária do caixa</CardTitle>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Barras mostram entradas e gastos por dia; a linha acompanha o saldo acumulado ao longo do mês.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {SERIES.map((series) => (
                          <span key={series.key} className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
                            {series.label}
                          </span>
                        ))}
                        {historyModel.hasNegativeBalance && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--finance-expense-soft)] px-3 py-1.5 text-[var(--finance-expense-deep)]">
                            Saldo acumulado negativo em parte do mês
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="h-[320px] sm:h-[380px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={historyModel.points} margin={{ top: 12, right: isMobile ? 12 : 20, left: 0, bottom: 0 }}>
                          <CartesianGrid stroke="var(--border)" strokeDasharray="4 8" vertical={false} />
                          {historyModel.hasNegativeBalance && (
                            <ReferenceArea
                              y1={historyModel.minimumCumulativeBalance}
                              y2={0}
                              fill="var(--finance-expense-soft)"
                              fillOpacity={0.42}
                            />
                          )}
                          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            minTickGap={isMobile ? 16 : 10}
                            tick={{ fill: 'var(--planner-ink-soft)', fontSize: isMobile ? 10 : 11 }}
                            tickFormatter={(value) => (tickLookup[value] ? value : '')}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            width={isMobile ? 54 : 74}
                            tick={{ fill: 'var(--planner-ink-soft)', fontSize: isMobile ? 10 : 11 }}
                            tickFormatter={formatCompactCurrency}
                          />
                          <Tooltip content={<HistoryTooltip />} />
                          <Bar dataKey="entradas" fill="var(--finance-income)" radius={[8, 8, 0, 0]} maxBarSize={20} />
                          <Bar dataKey="gastos" fill="var(--finance-expense)" radius={[8, 8, 0, 0]} maxBarSize={20} />
                          <Line
                            type="monotone"
                            dataKey="saldoAcumulado"
                            stroke="var(--finance-profit)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 5, fill: 'var(--finance-profit)' }}
                            animationDuration={720}
                            animationEasing="ease-out"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-3">
                  <HistoryInsightCard
                    label="Melhor dia"
                    tone="positive"
                    value={historyModel.bestDay
                      ? `${historyModel.bestDay.label} · ${formatCurrency(historyModel.bestDay.value)}`
                      : 'Nenhum movimento relevante no mês'}
                  />
                  <HistoryInsightCard
                    label="Maior pressão de caixa"
                    tone="negative"
                    value={historyModel.worstDay
                      ? `${historyModel.worstDay.label} · ${formatCurrency(historyModel.worstDay.value)}`
                      : 'Nenhum movimento relevante no mês'}
                  />
                  <HistoryInsightCard
                    label="Categoria mais pesada"
                    value={historyModel.topExpenseCategory
                      ? `${historyModel.topExpenseCategory.label} · ${formatCurrency(historyModel.topExpenseCategory.value)}`
                      : 'Sem gastos categorizados nesse mês'}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FinanceHistoryDialog;
