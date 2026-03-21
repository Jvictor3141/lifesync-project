import React from 'react';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FinanceSummaryCards = ({ formatCurrency, summary }) => {
  const cards = [
    {
      title: 'Entradas',
      value: summary.totalEntries,
      icon: TrendingUp,
      cardClassName: 'bg-[var(--finance-income-soft)] border-[var(--finance-income-soft)]',
      textClassName: 'text-[var(--finance-income-deep)]',
    },
    {
      title: 'Gastos',
      value: summary.totalExpenses,
      icon: TrendingDown,
      cardClassName: 'bg-[var(--finance-expense-soft)] border-[var(--finance-expense-soft)]',
      textClassName: 'text-[var(--finance-expense-deep)]',
    },
    {
      title: 'Saldo atual',
      value: summary.balance,
      icon: DollarSign,
      cardClassName: summary.balance >= 0
        ? 'bg-[var(--finance-profit-soft)] border-[var(--finance-profit-soft)]'
        : 'bg-[var(--finance-expense-soft)] border-[var(--finance-expense-soft)]',
      textClassName: summary.balance >= 0
        ? 'text-[var(--finance-profit-deep)]'
        : 'text-[var(--finance-expense-deep)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card) => {
        const SummaryIcon = card.icon;

        return (
          <Card key={card.title} className={card.cardClassName}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${card.textClassName}`}>
                <span className="flex size-9 items-center justify-center rounded-2xl bg-background/55">
                  <SummaryIcon className="w-4 h-4" />
                </span>
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.textClassName}`}>
                {formatCurrency(card.value)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FinanceSummaryCards;
