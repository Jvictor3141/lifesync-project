import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  Clock,
  Flame,
  GripVertical,
  Repeat,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getTaskStreak,
  getTaskTimeStatus,
  isRecurringTask,
  sortTasksByTime,
  TASK_TIME_STATUS,
  TASK_REMOVAL_SCOPES,
} from '@/features/agenda/lib/task-utils';
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

const PERIOD_STYLES = {
  manha: {
    dot: 'bg-[var(--planner-amber)]',
    badge: 'bg-[var(--planner-amber-soft)] text-[var(--planner-terracotta-deep)]',
    nowBadge: 'bg-[var(--planner-amber-soft)] text-[var(--planner-terracotta-deep)]',
    nowDot: 'bg-[var(--planner-amber)]',
    accentVar: '--planner-amber',
  },
  tarde: {
    dot: 'bg-[var(--planner-sage)]',
    badge: 'bg-[var(--planner-sage-soft)] text-[var(--planner-sage-deep)]',
    nowBadge: 'bg-[var(--planner-sage-soft)] text-[var(--planner-sage-deep)]',
    nowDot: 'bg-[var(--planner-sage)]',
    accentVar: '--planner-sage',
  },
  noite: {
    dot: 'bg-[var(--planner-terracotta)]',
    badge: 'bg-[var(--planner-terracotta-soft)] text-[var(--planner-terracotta-deep)]',
    nowBadge: 'bg-[var(--planner-terracotta-soft)] text-[var(--planner-terracotta-deep)]',
    nowDot: 'bg-[var(--planner-terracotta)]',
    accentVar: '--planner-terracotta',
  },
};

const TIME_STATUS_STYLES = {
  [TASK_TIME_STATUS.overdue]: {
    container: 'border-amber-500/35 bg-amber-500/5',
    time: 'text-amber-500 font-semibold',
    label: '· Atrasada',
  },
  [TASK_TIME_STATUS.missed]: {
    container: 'border-red-500/35 bg-red-500/5',
    time: 'text-red-500 font-semibold',
    label: '· Perdida',
  },
};

const STREAK_UNIT = {
  diario: ['dia', 'dias'],
  semanal: ['semana', 'semanas'],
  mensal: ['mês', 'meses'],
};

const getRemoveTaskDescription = (task) => (
  isRecurringTask(task)
    ? 'Escolha se deseja remover apenas esta ocorrência ou apagar a tarefa recorrente inteira.'
    : 'Esta ação não pode ser desfeita. A tarefa será removida.'
);

const TaskRemovalActions = ({ task, onRemoveTask }) => {
  if (!isRecurringTask(task)) {
    return (
      <AlertDialogAction onClick={() => onRemoveTask(task.id, TASK_REMOVAL_SCOPES.allOccurrences)}>
        Remover
      </AlertDialogAction>
    );
  }

  return (
    <>
      <AlertDialogAction
        className={buttonVariants({ variant: 'outline' })}
        onClick={() => onRemoveTask(task.id, TASK_REMOVAL_SCOPES.selectedDate)}
      >
        Remover só esta data
      </AlertDialogAction>
      <AlertDialogAction
        className={buttonVariants({ variant: 'destructive' })}
        onClick={() => onRemoveTask(task.id, TASK_REMOVAL_SCOPES.allOccurrences)}
      >
        Remover todas
      </AlertDialogAction>
    </>
  );
};

const SortableTaskItem = ({
  task,
  selectedDate,
  isToday,
  currentTimeStr,
  onToggleTask,
  onRemoveTask,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const streak = getTaskStreak(task, selectedDate);
  const timeStatus = getTaskTimeStatus(task, currentTimeStr, isToday);
  const statusStyle = timeStatus ? TIME_STATUS_STYLES[timeStatus] : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging
      ? `0 8px 24px rgba(0,0,0,0.12), inset 3px 0 0 ${task.cor}`
      : `inset 3px 0 0 ${task.cor}`,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-[1.35rem] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
        statusStyle ? statusStyle.container : 'border-border/70 bg-background/55'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastar para reordenar"
        className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggleTask(task.id)}
        aria-label={task.completed ? 'Desmarcar tarefa' : 'Marcar tarefa como concluída'}
        className="mt-1 shrink-0 size-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          borderColor: task.cor,
          backgroundColor: task.completed ? task.cor : 'transparent',
        }}
      >
        {task.completed && <Check className="size-3 text-white stroke-[3]" />}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className={`font-medium text-foreground transition-all duration-300 ${
            task.completed ? 'line-through opacity-55' : ''
          }`}
        >
          {task.text}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          <span className={`flex items-center gap-1 ${statusStyle ? statusStyle.time : 'text-muted-foreground'}`}>
            {statusStyle
              ? <AlertCircle className="w-3 h-3 shrink-0" />
              : <Clock className="w-3 h-3 shrink-0" />
            }
            {task.hora}
            {statusStyle && <span>{statusStyle.label}</span>}
          </span>

          {task.frequencia && (
            <span className="flex items-center gap-1 uppercase tracking-[0.12em] text-muted-foreground">
              <Repeat className="w-3 h-3" />
              {task.frequencia}
            </span>
          )}

          {streak >= 2 && (
            <span
              className="flex items-center gap-1 font-semibold tabular-nums"
              style={{ color: task.cor }}
              title={`${streak} ${streak === 1 ? STREAK_UNIT[task.frequencia]?.[0] : STREAK_UNIT[task.frequencia]?.[1]} consecutivo${streak === 1 ? '' : 's'}`}
            >
              <Flame className="w-3 h-3" />
              {streak}
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
            aria-label={`Remover tarefa ${task.text}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              {getRemoveTaskDescription(task)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <TaskRemovalActions task={task} onRemoveTask={onRemoveTask} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const TaskPeriodCard = ({
  period,
  tasks,
  selectedDate,
  isCurrentPeriod,
  isToday,
  currentTimeStr,
  onRemoveTask,
  onReorderTasks,
  onToggleTask,
}) => {
  const style = PERIOD_STYLES[period.id] ?? PERIOD_STYLES.tarde;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);

    onReorderTasks(period.id, reordered.map((t) => t.id));
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300">
      {isCurrentPeriod && (
        <div
          className="h-0.5 w-full"
          style={{ background: `var(${style.accentVar})` }}
        />
      )}

      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-medium text-foreground flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${style.dot}`} />
            {period.title}
          </CardTitle>

          <div className="flex items-center gap-2">
            {tasks.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-full px-2 text-muted-foreground hover:text-foreground"
                title="Ordenar por horário"
                onClick={() => onReorderTasks(period.id, sortTasksByTime(tasks).map((t) => t.id))}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </Button>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${style.badge}`}>
              {period.timeRange}
            </span>
          </div>
        </div>
        {isCurrentPeriod && (
              <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${style.nowBadge}`}>
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${style.nowDot}`} />
                Agora
              </span>
            )}
      </CardHeader>

      <CardContent className="pt-5">
        <div className="planner-scroll space-y-3 min-h-[220px] max-h-[300px] overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="flex h-full min-h-[190px] flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-background/45 px-4 text-center text-muted-foreground">
              <Clock className="mb-3 h-5 w-5 text-[var(--planner-sage)]" />
              <div className="font-medium">Nenhuma tarefa para este período.</div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {tasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    selectedDate={selectedDate}
                    isToday={isToday}
                    currentTimeStr={currentTimeStr}
                    onToggleTask={onToggleTask}
                    onRemoveTask={onRemoveTask}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskPeriodCard;
