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
import { ArrowUpDown, Check, Clock, GripVertical, Repeat, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sortTasksByTime } from '@/features/agenda/lib/task-utils';
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
  },
  tarde: {
    dot: 'bg-[var(--planner-sage)]',
    badge: 'bg-[var(--planner-sage-soft)] text-[var(--planner-sage-deep)]',
  },
  noite: {
    dot: 'bg-[var(--planner-terracotta)]',
    badge: 'bg-[var(--planner-terracotta-soft)] text-[var(--planner-terracotta-deep)]',
  },
};

const SortableTaskItem = ({ task, onToggleTask, onRemoveTask }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

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
      className="flex items-center gap-3 rounded-[1.35rem] border border-border/70 bg-background/55 p-4 transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-sm"
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

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.hora}
          </span>

          {task.frequencia && (
            <span className="flex items-center gap-1 uppercase tracking-[0.12em]">
              <Repeat className="w-3 h-3" />
              {task.frequencia}
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
              Esta ação não pode ser desfeita. A tarefa será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onRemoveTask(task.id)}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const TaskPeriodCard = ({ period, tasks, onRemoveTask, onReorderTasks, onToggleTask }) => {
  const style = PERIOD_STYLES[period.id] ?? PERIOD_STYLES.tarde;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);

    onReorderTasks(period.id, reordered.map((t) => t.id));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-medium text-foreground flex items-center">
            <span className={`mr-3 h-3 w-3 rounded-full ${style.dot}`}></span>
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
      </CardHeader>

      <CardContent className="pt-5">
        <div className="planner-scroll space-y-3 min-h-[220px] max-h-[300px] overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="flex h-full min-h-[190px] flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-background/45 px-4 text-center text-muted-foreground">
              <Clock className="mb-3 h-5 w-5 text-[var(--planner-sage)]" />
              <div className="font-medium">Nenhuma tarefa para este período.</div>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragEnd={handleDragEnd}>
              <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {tasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
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
