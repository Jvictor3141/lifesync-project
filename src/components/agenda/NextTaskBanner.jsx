import React from 'react';
import { ArrowRight, Clock3 } from 'lucide-react';

const NextTaskBanner = ({ tasks }) => {
  if (!tasks?.length) return null;

  return (
    <div className="w-fit rounded-[1.35rem] border border-border/70 bg-background/45 px-4 py-3 text-sm">
      <div className="mb-2.5 flex items-center gap-2">
        <Clock3 className="h-3.5 w-3.5 shrink-0 text-[var(--planner-sage)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {tasks.length === 1 ? 'Próxima' : 'Próximas'}
        </span>
      </div>

      <div className="space-y-1.5">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2.5">
            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
            <span className="font-semibold tabular-nums text-foreground">{task.hora}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="max-w-[240px] truncate text-foreground/80">{task.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextTaskBanner;
