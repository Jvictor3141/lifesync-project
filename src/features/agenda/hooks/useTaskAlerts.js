import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { flattenAgendaTasks, toCurrentTimeStr } from '@/features/agenda/lib/task-utils';

export const useTaskAlerts = (tasks, now, isToday) => {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!isToday) return;

    const currentTimeStr = toCurrentTimeStr(now);
    const allTasks = flattenAgendaTasks(tasks);

    for (const task of allTasks) {
      if (task.completed || !task.hora || task.hora !== currentTimeStr) continue;
      if (notifiedRef.current.has(task.id)) continue;

      notifiedRef.current.add(task.id);
      toast(task.text, {
        description: `Tarefa agendada para ${task.hora}`,
        duration: 8_000,
      });
    }
  }, [now, tasks, isToday]);
};
