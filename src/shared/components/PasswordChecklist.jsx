import React from 'react';
import { getPasswordChecks } from '@/shared/lib/password';

const PasswordChecklist = ({ password, className = '' }) => {
  const checks = getPasswordChecks(password);

  return (
    <div className={className}>
      <div className="text-xs text-current/80">
        A senha deve incluir:
      </div>
      <ul className="mt-1 space-y-1 text-xs">
        {checks.map((rule) => (
          <li
            key={rule.id}
            className={rule.passed ? 'text-[var(--planner-sage-deep)]' : 'text-[var(--planner-terracotta)]'}
          >
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordChecklist;
