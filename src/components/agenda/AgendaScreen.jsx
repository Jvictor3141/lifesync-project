import React from 'react';
import CalendarSection from '@/components/agenda/CalendarSection';
import TaskSection from '@/components/agenda/TaskSection';

const AgendaScreen = ({
  allTasks,
  onAddSpecialDate,
  onAddTask,
  onDateClick,
  onRemoveSpecialDate,
  onRemoveTask,
  onToggleTask,
  selectedDate,
  specialDates,
  tasks,
}) => {
  return (
    <>
      <CalendarSection
        allTasks={allTasks}
        onAddSpecialDate={onAddSpecialDate}
        onDateClick={onDateClick}
        onRemoveSpecialDate={onRemoveSpecialDate}
        selectedDate={selectedDate}
        specialDates={specialDates}
      />

      <TaskSection
        title="Minhas Tarefas"
        tasks={tasks}
        onAddTask={onAddTask}
        onRemoveTask={onRemoveTask}
        onToggleTask={onToggleTask}
      />
    </>
  );
};

export default AgendaScreen;
