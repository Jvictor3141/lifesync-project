import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FinanceSection = ({ 
  financialData, 
  onAddEntry, 
  onAddExpense, 
  onRemoveTransaction,
  onClearMonth 
}) => {
  const [entryForm, setEntryForm] = useState({
    valor: '',
    descricao: '',
    categoria: 'salario',
    pessoa: 'pessoa1'
  });

  const [expenseForm, setExpenseForm] = useState({
    valor: '',
    descricao: '',
    categoria: 'alimentacao',
    tipo: 'pessoa1'
  });

  const [filterType, setFilterType] = useState('todos');

  const entryCategories = {
    salario: { icon: '💼', label: 'Salário' },
    freelance: { icon: '💻', label: 'Freelance' },
    presente: { icon: '🎁', label: 'Presente' },
    investimento: { icon: '📈', label: 'Investimento' }
  };

  const expenseCategories = {
    alimentacao: { icon: '🍕', label: 'Alimentação' },
    transporte: { icon: '🚗', label: 'Transporte' },
    casa: { icon: '🏠', label: 'Casa' },
    lazer: { icon: '🎮', label: 'Lazer' },
    roupas: { icon: '👕', label: 'Roupas' },
    saude: { icon: '💊', label: 'Saúde' },
    educacao: { icon: '📚', label: 'Educação' },
    outros: { icon: '🔄', label: 'Outros' }
  };

  const personTypes = {
    pessoa1: 'Larissa',
    pessoa2: 'João Victor',
    ambos: 'Ambos',
    compartilhado: 'Compartilhado'
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    const valor = parseFloat(entryForm.valor);
    
    if (!valor || valor <= 0 || !entryForm.descricao.trim()) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    onAddEntry({
      ...entryForm,
      valor,
      descricao: entryForm.descricao.trim()
    });

    setEntryForm({
      valor: '',
      descricao: '',
      categoria: 'salario',
      pessoa: 'pessoa1'
    });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const valor = parseFloat(expenseForm.valor);
    
    if (!valor || valor <= 0 || !expenseForm.descricao.trim()) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    onAddExpense({
      ...expenseForm,
      valor,
      descricao: expenseForm.descricao.trim()
    });

    setExpenseForm({
      valor: '',
      descricao: '',
      categoria: 'alimentacao',
      tipo: 'pessoa1'
    });
  };

  const totalEntries = financialData.entradas?.reduce((sum, entry) => sum + entry.valor, 0) || 0;
  const totalExpenses = financialData.gastos?.reduce((sum, expense) => sum + expense.valor, 0) || 0;
  const balance = totalEntries - totalExpenses;

  // Combinar e filtrar transações
  let allTransactions = [];
  
  if (filterType === 'todos' || filterType === 'entrada') {
    allTransactions = allTransactions.concat(
      (financialData.entradas || []).map(item => ({ ...item, tipo: 'entrada' }))
    );
  }
  
  if (filterType === 'todos' || filterType === 'gasto') {
    allTransactions = allTransactions.concat(
      (financialData.gastos || []).map(item => ({ ...item, tipo: 'gasto' }))
    );
  }

  allTransactions.sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Total de Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(totalEntries)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Total de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className={`${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              <DollarSign className="w-4 h-4 mr-2" />
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulários */}
      <Tabs defaultValue="entrada" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entrada">Adicionar Entrada</TabsTrigger>
          <TabsTrigger value="gasto">Adicionar Gasto</TabsTrigger>
        </TabsList>

        <TabsContent value="entrada">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-green-600 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Nova Entrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)"
                  value={entryForm.valor}
                  onChange={(e) => setEntryForm({ ...entryForm, valor: e.target.value })}
                  required
                />
                <Input
                  type="text"
                  placeholder="Descrição"
                  value={entryForm.descricao}
                  onChange={(e) => setEntryForm({ ...entryForm, descricao: e.target.value })}
                  required
                />
                <Select value={entryForm.categoria} onValueChange={(value) => setEntryForm({ ...entryForm, categoria: value })}>
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
                <Select value={entryForm.pessoa} onValueChange={(value) => setEntryForm({ ...entryForm, pessoa: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(personTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 md:col-span-2 lg:col-span-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Entrada
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gasto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-red-600 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                Novo Gasto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)"
                  value={expenseForm.valor}
                  onChange={(e) => setExpenseForm({ ...expenseForm, valor: e.target.value })}
                  required
                />
                <Input
                  type="text"
                  placeholder="Descrição"
                  value={expenseForm.descricao}
                  onChange={(e) => setExpenseForm({ ...expenseForm, descricao: e.target.value })}
                  required
                />
                <Select value={expenseForm.categoria} onValueChange={(value) => setExpenseForm({ ...expenseForm, categoria: value })}>
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
                <Select value={expenseForm.tipo} onValueChange={(value) => setExpenseForm({ ...expenseForm, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(personTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 md:col-span-2 lg:col-span-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Gasto
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Transações Recentes
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="gasto">Gastos</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={onClearMonth}
                className="text-gray-500 hover:text-red-500"
              >
                Limpar Mês
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allTransactions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">📊</div>
                <div>Nenhuma transação encontrada</div>
              </div>
            ) : (
              allTransactions.map((transaction) => {
                const isEntry = transaction.tipo === 'entrada';
                const categories = isEntry ? entryCategories : expenseCategories;
                const category = categories[transaction.categoria] || { icon: '🔄', label: 'Outros' };
                const personText = personTypes[transaction.pessoa] || transaction.pessoa;
                const dateFormatted = new Date(transaction.data).toLocaleDateString('pt-BR');

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {transaction.descricao}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {personText} • {dateFormatted}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
                        {isEntry ? '+' : '-'} {formatCurrency(transaction.valor)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveTransaction(transaction.tipo, transaction.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceSection;

