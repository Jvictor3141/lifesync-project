import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TaskPeriodCard from '@/components/agenda/TaskPeriodCard';
import {
  createTaskDraft,
  DEFAULT_TASK_COLOR,
  getPeriodByTime,
  TASK_FREQUENCIES,
  TASK_PERIODS,
} from '@/features/agenda/lib/task-utils';

const INITIAL_FORM = {
  text: '',
  time: '',
  color: DEFAULT_TASK_COLOR,
  advanced: false,
  frequency: TASK_FREQUENCIES[0].value,
};

const TaskSection = ({
  title,
  tasks,
  onAddTask,
  onRemoveTask,
  onToggleTask,
}) => {
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formState.text.trim() || !formState.time) {
      toast.error('Preencha a tarefa e o horário.');
      return;
    }

    const period = getPeriodByTime(formState.time);
    const nextTask = createTaskDraft({
      text: formState.text,
      time: formState.time,
      color: formState.color,
      frequency: formState.advanced ? formState.frequency : '',
    });

    setIsSubmitting(true);

    try {
      await onAddTask(period, nextTask);
      setFormState(INITIAL_FORM);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="glassmorphism rounded-[1.85rem] border p-5 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="planner-kicker">Rotina diária</p>
          <h3 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">
            {title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monte seu dia por blocos de tempo, com a cor que fizer mais sentido para sua rotina.
          </p>
        </div>

        <div className="planner-chip text-sm">
          <span className="h-2 w-2 rounded-full bg-[var(--planner-amber)]"></span>
          {Object.values(tasks || {}).reduce((total, periodTasks) => total + periodTasks.length, 0)} tarefas no dia
        </div>
      </div>

      <div className="grid gap-4 rounded-[1.6rem] border border-border/70 bg-background/45 p-4 lg:grid-cols-[minmax(0,1.6fr)_180px_auto_auto] lg:items-end">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tarefa
          </label>
          <Input
            type="text"
            placeholder="Ex.: revisar compromissos e separar prioridades"
            value={formState.text}
            onChange={(event) => setFormState((current) => ({
              ...current,
              text: event.target.value,
            }))}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Horário
          </label>
          <Input
            type="time"
            value={formState.time}
            onChange={(event) => setFormState((current) => ({
              ...current,
              time: event.target.value,
            }))}
            className="cursor-pointer"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Cor
          </label>
          <div className="flex h-11 items-center gap-3 rounded-[1rem] border border-border/70 bg-background/80 px-3">
            <Input
              type="color"
              value={formState.color}
              onChange={(event) => setFormState((current) => ({
                ...current,
                color: event.target.value,
              }))}
              className="h-8 w-10 cursor-pointer rounded-md border-0 bg-transparent p-0 shadow-none"
            />
            <span className="text-sm font-medium text-foreground">
              {formState.color.toUpperCase()}
            </span>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="h-11 rounded-[1rem] px-5"
          disabled={isSubmitting}
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </Button>

        <div className="flex flex-col gap-3 lg:col-span-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Checkbox
              checked={formState.advanced}
              onCheckedChange={(value) => setFormState((current) => ({
                ...current,
                advanced: Boolean(value),
              }))}
            />
            Configuração avançada
          </label>

          {formState.advanced && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Frequência
              </span>
              <Select
                value={formState.frequency}
                onValueChange={(value) => setFormState((current) => ({
                  ...current,
                  frequency: value,
                }))}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Frequência" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_FREQUENCIES.map((frequency) => (
                    <SelectItem key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {TASK_PERIODS.map((period) => (
          <TaskPeriodCard
            key={period.id}
            period={period}
            tasks={tasks?.[period.id] || []}
            onRemoveTask={onRemoveTask}
            onToggleTask={onToggleTask}
          />
        ))}
      </div>
    </section>
  );
};

export default TaskSection;
