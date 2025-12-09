import React, { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const TaskSection = ({ 
  title, 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onRemoveTask,
  // userType removido, não utilizado
}) => {
  const [newTask, setNewTask] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [selectedColor, setSelectedColor] = useState('#74aee8');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [frequency, setFrequency] = useState('diario');

  const colors = [
    { value: '#74aee8', label: 'Azul' },
    { value: '#ba82e8', label: 'Roxo' },
    { value: '#a6695a', label: 'Marrom' }
  ];

  const periods = [
    { id: 'manha', title: 'Manhã', timeRange: '6h - 12h', tasks: tasks.manha || [] },
    { id: 'tarde', title: 'Tarde', timeRange: '12h - 18h', tasks: tasks.tarde || [] },
    { id: 'noite', title: 'Noite', timeRange: '18h - 24h', tasks: tasks.noite || [] }
  ];

  const getPeriodByTime = (time) => {
    const [hour] = time.split(':').map(Number);
    if (hour >= 6 && hour < 12) return 'manha';
    if (hour >= 12 && hour < 18) return 'tarde';
    return 'noite';
  };

  const handleAddTask = () => {
    if (!newTask.trim() || !newTaskTime) {
      alert('Preencha a tarefa e o horário!');
      return;
    }


    const period = getPeriodByTime(newTaskTime);
    const task = {
      text: newTask.trim(),
      hora: newTaskTime,
      cor: selectedColor,
      completed: false,
      completedDates: [],
      frequencia: showAdvanced ? frequency : ''
    };
    onAddTask(period, task);
    
    // Reset form
    setNewTask('');
    setNewTaskTime('');
    setSelectedColor('#74aee8');
    setShowAdvanced(false);
    setFrequency('diario');
  };

  const renderTasks = (periodTasks, period) => {
    if (periodTasks.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">✨</div>
          <div>Nenhuma tarefa para este período</div>
        </div>
      );
    }

    return periodTasks.map((task) => (
      <div
        key={task.id}
        className="flex items-center justify-between p-3 rounded-lg border border-purple-100 transition-all duration-300 hover:shadow-md"
        style={{ backgroundColor: task.cor }}
      >
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleTask(period, task.id)}
          className="mr-3"
        />
        <span className={`flex-1 text-center text-gray-700 transition-all duration-300 ${
          task.completed ? 'line-through opacity-60' : ''
        }`}>
          {task.text}
        </span>
        <span className="text-xs font-bold text-gray-600 ml-3 min-w-[48px] text-right flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {task.hora}
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400 transition-colors duration-300 p-1 ml-2"
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
              <AlertDialogAction onClick={() => onRemoveTask(period, task.id)}>
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ));
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-purple-100 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
        {title}
      </h3>

      {/* Adicionar Tarefa */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 justify-center items-center w-full">
        <Input
          type="text"
          placeholder="Nova tarefa..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 min-w-[220px] md:min-w-[320px] max-w-md px-4 py-2 text-base"
        />
        <Input
          type="time"
          value={newTaskTime}
          onChange={(e) => setNewTaskTime(e.target.value)}
          className="w-[90px] md:w-[110px] px-2 py-1 text-sm cursor-pointer"
        />
        
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`w-8 h-8 rounded-full border-2 border-purple-100 cursor-pointer ${
                selectedColor === color.value ? 'ring-2 ring-pink-500' : ''
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => setSelectedColor(color.value)}
              title={color.label}
            />
          ))}
        </div>

        <Button onClick={handleAddTask} className="bg-pink-400 hover:bg-pink-500">
          <Plus className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-1 font-medium text-sm">
            <Checkbox
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            Avançado
          </label>
          {showAdvanced && (
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Períodos */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {periods.map((period) => (
          <Card key={period.id} className="bg-white dark:bg-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  <span className="w-3 h-3 bg-pink-400 rounded-full mr-3"></span>
                  {period.title}
                </CardTitle>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {period.timeRange}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 min-h-[200px]">
                {renderTasks(period.tasks, period.id)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskSection;

