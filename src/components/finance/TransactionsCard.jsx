import React from 'react';
import { History, ReceiptText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TransactionsCard = ({
  entryCategories,
  expenseCategories,
  filterType,
  formatCurrency,
  onClearMonth,
  onFilterChange,
  onOpenHistory,
  onRemoveTransaction,
  transactions,
}) => {
  return (
    <Card>
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="planner-kicker">Fluxo recente</p>
            <CardTitle className="mt-4 text-xl font-medium text-foreground flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-[var(--finance-profit)]" />
              Transações recentes
            </CardTitle>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full md:w-auto">
            <Select value={filterType} onValueChange={onFilterChange}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="gasto">Gastos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 sm:ml-2">
              <Button
                variant="outline"
                size="icon"
                title="Histórico"
                onClick={onOpenHistory}
                className="rounded-2xl"
              >
                <History className="w-4 h-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-2xl sm:w-auto"
                  >
                    Limpar mês
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar dados do mês?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação remove todas as entradas, gastos e orçamentos do mês atual.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onClearMonth}>
                      Limpar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="planner-scroll space-y-3 max-h-96 overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/45 px-4 py-8 text-center text-muted-foreground">
              Nenhuma transação encontrada.
            </div>
          ) : (
            transactions.map((transaction) => {
              const isEntry = transaction.tipo === 'entrada';
              const categories = isEntry ? entryCategories : expenseCategories;
              const category = categories[transaction.categoria] || { icon: '↺', label: 'Outros' };
              const dateFormatted = new Date(transaction.data).toLocaleDateString('pt-BR');

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-border/70 bg-background/55 p-4"
                  style={{
                    boxShadow: `inset 4px 0 0 ${isEntry ? 'var(--finance-income)' : 'var(--finance-expense)'}`,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-lg">
                      {category.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {transaction.descricao}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dateFormatted} · {category.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-bold ${isEntry ? 'text-[var(--finance-income-deep)]' : 'text-[var(--finance-expense-deep)]'}`}>
                      {isEntry ? '+' : '-'} {formatCurrency(transaction.valor)}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 rounded-full px-0 text-xs text-muted-foreground hover:text-[var(--finance-expense)] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remover
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover transação?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A transação será excluída.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRemoveTransaction(transaction.id, transaction.tipo)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsCard;
