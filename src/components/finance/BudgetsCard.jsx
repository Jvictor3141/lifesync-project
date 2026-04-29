import React, { useMemo, useState } from 'react';
import { Check, ClipboardList, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MAX_TEXT_LENGTHS } from '@/shared/lib/security';
import { parseAmountInput } from '@/features/finance/lib/finance-utils';

const EMPTY_ITEM = { descricao: '', quantidade: '1', valor: '' };
const INITIAL_FORM = {
  titulo: '',
  itens: [{ ...EMPTY_ITEM }],
};

const normalizeBudgetForm = (form) => ({
  titulo: form.titulo.trim(),
  itens: form.itens
    .map((item) => ({
      descricao: item.descricao.trim(),
      quantidade: parseAmountInput(item.quantidade) || 1,
      valor: parseAmountInput(item.valor),
    }))
    .filter((item) => item.descricao && item.valor > 0),
});

const BudgetActionDialog = ({
  actionLabel,
  description,
  onConfirm,
  title,
  trigger,
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>
          {actionLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const BudgetModal = ({ onAddBudget }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(
    () => form.itens.reduce((sum, item) => (
      sum + ((parseAmountInput(item.quantidade) || 1) * parseAmountInput(item.valor))
    ), 0),
    [form.itens],
  );

  const resetForm = () => setForm({
    titulo: '',
    itens: [{ ...EMPTY_ITEM }],
  });

  const updateItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      itens: current.itens.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const addItem = () => {
    setForm((current) => ({
      ...current,
      itens: [...current.itens, { ...EMPTY_ITEM }],
    }));
  };

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      itens: current.itens.length === 1
        ? [{ ...EMPTY_ITEM }]
        : current.itens.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const budget = normalizeBudgetForm(form);

    if (!budget.titulo || budget.itens.length === 0) {
      toast.error('Preencha o título e pelo menos um item com valor válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddBudget(budget);
      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="rounded-2xl" title="Criar orçamento">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="grid h-[min(82vh,640px)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 p-0 sm:w-full sm:max-w-3xl">
        <DialogHeader className="border-b border-border/70 px-4 py-5 sm:px-6">
          <DialogTitle>Novo orçamento</DialogTitle>
        </DialogHeader>

        <form id="budget-form" onSubmit={handleSubmit} className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
          <div className="space-y-2 px-4 py-5 sm:px-6">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Título do orçamento
            </label>
            <Input
              value={form.titulo}
              maxLength={MAX_TEXT_LENGTHS.transactionDescription}
              placeholder="Ex.: Materiais do projeto"
              onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))}
              required
            />
          </div>

          <div className="min-h-0 overflow-y-auto border-y border-border/70 px-4 py-4 planner-scroll sm:px-6">
            <div className="w-full">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(3.75rem,0.24fr)_minmax(5.5rem,0.36fr)_2.25rem] gap-2 px-1 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:grid-cols-[minmax(0,1fr)_minmax(5rem,0.22fr)_minmax(7rem,0.34fr)_2.5rem] sm:gap-3 sm:text-xs sm:tracking-[0.16em]">
                <div>Item</div>
                <div>Qtd.</div>
                <div>Valor</div>
                <div />
              </div>
              <div className="space-y-3">
                {form.itens.map((item, index) => (
                  <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(3.75rem,0.24fr)_minmax(5.5rem,0.36fr)_2.25rem] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(5rem,0.22fr)_minmax(7rem,0.34fr)_2.5rem] sm:gap-3">
                    <Input
                      className="min-w-0 px-2 text-sm sm:px-3"
                      value={item.descricao}
                      maxLength={MAX_TEXT_LENGTHS.transactionDescription}
                      placeholder="Descrição do item"
                      onChange={(event) => updateItem(index, 'descricao', event.target.value)}
                      required={index === 0}
                    />
                    <Input
                      className="min-w-0 px-2 text-sm sm:px-3"
                      type="number"
                      step="1"
                      min="1"
                      max="1000000"
                      value={item.quantidade}
                      onChange={(event) => updateItem(index, 'quantidade', event.target.value)}
                      required={index === 0}
                    />
                    <Input
                      className="min-w-0 px-2 text-sm sm:px-3"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="1000000000"
                      value={item.valor}
                      placeholder="R$ 0,00"
                      onChange={(event) => updateItem(index, 'valor', event.target.value)}
                      required={index === 0}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-2xl text-muted-foreground hover:text-[var(--finance-expense)] sm:size-10"
                      onClick={() => removeItem(index)}
                      title="Remover item"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-2xl"
                onClick={addItem}
              >
                <Plus className="w-4 h-4" />
                Adicionar linha
              </Button>
            </div>
          </div>
        </form>

        <DialogFooter className="border-t border-border/70 px-4 py-4 sm:px-6">
          <div className="w-full text-sm text-muted-foreground sm:mr-auto sm:w-auto">
            Total: <span className="font-semibold text-foreground">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="budget-form" disabled={isSubmitting}>
            Salvar orçamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const BudgetsCard = ({
  budgets,
  formatCurrency,
  onAcceptBudget,
  onAddBudget,
  onRemoveBudget,
}) => (
  <Card>
    <CardHeader className="border-b border-border/70 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="planner-kicker">Planejamento</p>
          <CardTitle className="mt-4 text-xl font-medium text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[var(--finance-profit)]" />
            Orçamentos pendentes
          </CardTitle>
        </div>
        <BudgetModal onAddBudget={onAddBudget} />
      </div>
    </CardHeader>
    <CardContent className="pt-5">
      <div className="planner-scroll space-y-3 max-h-80 overflow-y-auto pr-1">
        {budgets.length === 0 ? (
          <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/45 px-4 py-8 text-center text-muted-foreground">
            Nenhum orçamento pendente.
          </div>
        ) : (
          budgets.map((budget) => {
            const dateFormatted = new Date(budget.data).toLocaleDateString('pt-BR');

            return (
              <div
                key={budget.id}
                className="flex flex-col gap-4 rounded-[1.35rem] border border-border/70 bg-background/55 p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ boxShadow: 'inset 4px 0 0 var(--finance-profit)' }}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{budget.titulo}</div>
                  <div className="text-sm text-muted-foreground">
                    {dateFormatted} · {budget.itens.length} {budget.itens.length === 1 ? 'item' : 'itens'}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                  <div className="font-bold text-[var(--finance-profit-deep)]">
                    {formatCurrency(budget.valor)}
                  </div>
                  <div className="flex items-center gap-2">
                    <BudgetActionDialog
                      actionLabel="Aceitar"
                      title="Aceitar orçamento?"
                      description="Ao aceitar, cada item deste orçamento será lançado como gasto do mês atual."
                      onConfirm={() => onAcceptBudget(budget.id)}
                      trigger={(
                        <Button size="sm" className="rounded-full">
                          <Check className="w-4 h-4" />
                          Aceitar
                        </Button>
                      )}
                    />
                    <BudgetActionDialog
                      actionLabel="Remover"
                      title="Remover orçamento?"
                      description="Esta ação remove o orçamento pendente sem criar gastos."
                      onConfirm={() => onRemoveBudget(budget.id)}
                      trigger={(
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-muted-foreground hover:text-[var(--finance-expense)]"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </Button>
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </CardContent>
  </Card>
);

export default BudgetsCard;
