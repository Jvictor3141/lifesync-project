import React from 'react';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FinanceForms = ({
  entryCategories,
  entryForm,
  expenseCategories,
  expenseForm,
  onEntryChange,
  onExpenseChange,
  onSubmitEntry,
  onSubmitExpense,
}) => {
  return (
    <Tabs defaultValue="entrada" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="entrada">Adicionar entrada</TabsTrigger>
        <TabsTrigger value="gasto">Adicionar gasto</TabsTrigger>
      </TabsList>

      <TabsContent value="entrada">
        <Card className="border-[var(--finance-income-soft)] bg-[linear-gradient(180deg,var(--finance-income-soft),rgba(255,255,255,0))]">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-[var(--finance-income-deep)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Nova entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmitEntry} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Valor (R$)"
                value={entryForm.valor}
                onChange={(event) => onEntryChange('valor', event.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Descrição"
                value={entryForm.descricao}
                onChange={(event) => onEntryChange('descricao', event.target.value)}
                required
              />
              <Select value={entryForm.categoria} onValueChange={(value) => onEntryChange('categoria', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(entryCategories).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" className="bg-[var(--finance-income)] hover:bg-[var(--finance-income-deep)] md:col-span-2 lg:col-span-4">
                <Plus className="w-4 h-4" />
                Adicionar entrada
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="gasto">
        <Card className="border-[var(--finance-expense-soft)] bg-[linear-gradient(180deg,var(--finance-expense-soft),rgba(255,255,255,0))]">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-[var(--finance-expense-deep)] flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Novo gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmitExpense} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Valor (R$)"
                value={expenseForm.valor}
                onChange={(event) => onExpenseChange('valor', event.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Descrição"
                value={expenseForm.descricao}
                onChange={(event) => onExpenseChange('descricao', event.target.value)}
                required
              />
              <Select value={expenseForm.categoria} onValueChange={(value) => onExpenseChange('categoria', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(expenseCategories).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" className="bg-[var(--finance-expense)] hover:bg-[var(--finance-expense-deep)] md:col-span-2 lg:col-span-4">
                <Plus className="w-4 h-4" />
                Adicionar gasto
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FinanceForms;
