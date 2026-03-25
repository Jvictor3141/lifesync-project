import React from 'react';
import { Clock, Repeat, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

const TaskPeriodCard = ({ period, tasks, onRemoveTask, onToggleTask }) => {
  const style = PERIOD_STYLES[period.id] ?? PERIOD_STYLES.tarde;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl font-medium text-foreground flex items-center">
            <span className={`mr-3 h-3 w-3 rounded-full ${style.dot}`}></span>
            {period.title}
          </CardTitle>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${style.badge}`}>
            {period.timeRange}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="space-y-3 min-h-[220px]">
          {tasks.length === 0 ? (
            <div className="flex h-full min-h-[190px] flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-background/45 px-4 text-center text-muted-foreground">
              <Clock className="mb-3 h-5 w-5 text-[var(--planner-sage)]" />
              <div className="font-medium">Nenhuma tarefa para este período.</div>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-[1.35rem] border border-border/70 bg-background/55 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                style={{ boxShadow: `inset 3px 0 0 ${task.cor}` }}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(task.id)}
                  className="mt-1 shrink-0"
                />

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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskPeriodCard;
