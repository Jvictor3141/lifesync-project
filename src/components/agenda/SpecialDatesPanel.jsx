import React, { useMemo, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  occursInMonth,
  SPECIAL_DATE_FREQUENCIES,
} from '@/features/agenda/lib/special-date-utils';

const INITIAL_FORM = {
  name: '',
  date: '',
  frequency: '',
  oneTime: false,
  withTime: false,
  time: '',
};

const SpecialDatesPanel = ({
  currentMonth,
  onAddSpecialDate,
  onRemoveSpecialDate,
  specialDates,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ano');
  const [formState, setFormState] = useState(INITIAL_FORM);

  const visibleSpecialDates = useMemo(() => (
    filter === 'ano'
      ? specialDates.filter((item) => occursInMonth(item, currentMonth.year, currentMonth.month))
      : specialDates
  ), [currentMonth.month, currentMonth.year, filter, specialDates]);

  const handleSubmit = async () => {
    if (!formState.name.trim() || !formState.date) {
      toast.error('Preencha nome e data.');
      return;
    }

    await onAddSpecialDate({
      nome: formState.name.trim(),
      data: formState.date,
      frequencia: formState.oneTime ? '' : formState.frequency,
      hora: formState.withTime ? formState.time : undefined,
    });

    setFormState(INITIAL_FORM);
    setIsOpen(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="planner-kicker">Eventos marcantes</p>
            <CardTitle className="mt-4 text-xl font-medium text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-[var(--planner-terracotta)]" />
              Datas especiais
            </CardTitle>
          </div>

          <div className="w-40">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ano">Mês atual</SelectItem>
                <SelectItem value="todas">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="mb-4 flex justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-[1rem] px-4">
                <Plus className="w-4 h-4" />
                Nova data
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova data especial</DialogTitle>
                <DialogDescription>
                  Registre aniversários, prazos e lembranças importantes em um só lugar.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Nome</label>
                  <Input
                    value={formState.name}
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      name: event.target.value,
                    }))}
                    placeholder="Ex.: aniversário da equipe"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Data</label>
                    <Input
                      type="date"
                      value={formState.date}
                      onChange={(event) => setFormState((current) => ({
                        ...current,
                        date: event.target.value,
                      }))}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Frequência</label>
                    <Select
                      value={formState.oneTime ? '' : formState.frequency}
                      onValueChange={(value) => setFormState((current) => ({
                        ...current,
                        frequency: value,
                        oneTime: false,
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIAL_DATE_FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency.value} value={frequency.value}>
                            {frequency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1.25rem] border border-border/70 bg-background/45 p-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={formState.oneTime}
                      onCheckedChange={(value) => setFormState((current) => ({
                        ...current,
                        oneTime: Boolean(value),
                        frequency: value ? '' : current.frequency,
                      }))}
                    />
                    Acontece apenas uma vez
                  </label>

                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={formState.withTime}
                      onCheckedChange={(value) => setFormState((current) => ({
                        ...current,
                        withTime: Boolean(value),
                      }))}
                    />
                    Incluir horário
                  </label>

                  {formState.withTime && (
                    <Input
                      type="time"
                      value={formState.time}
                      onChange={(event) => setFormState((current) => ({
                        ...current,
                        time: event.target.value,
                      }))}
                      className="max-w-40"
                    />
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="planner-scroll space-y-3 text-sm text-foreground max-h-[28rem] overflow-y-auto pr-1">
          {visibleSpecialDates.length === 0 ? (
            <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-background/45 px-4 py-8 text-center text-muted-foreground">
              Nenhuma data especial cadastrada neste recorte.
            </div>
          ) : (
            visibleSpecialDates.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-[1.35rem] border border-border/70 bg-background/55 p-4">
                <span className="mt-1 h-3 w-3 rounded-full bg-[var(--planner-terracotta)]"></span>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground">{item.nome}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>{item.data.split('-').reverse().join('/')}</span>
                    {item.hora && <span>às {item.hora}</span>}
                    {item.frequencia && (
                      <span className="rounded-full bg-[var(--planner-amber-soft)] px-2 py-1 text-[var(--planner-terracotta-deep)]">
                        {item.frequencia}
                      </span>
                    )}
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full p-2 text-muted-foreground hover:text-[var(--planner-terracotta)]"
                      aria-label={`Remover evento ${item.nome}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover data especial?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onRemoveSpecialDate(item.id)}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpecialDatesPanel;
