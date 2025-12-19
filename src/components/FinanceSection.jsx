// Seção de finanças: UI e gráficos
import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, ComposedChart, LabelList, Cell } from 'recharts';

// Componente principal da área de finanças
const FinanceSection = ({ 
  financialData, 
  onAddEntry, 
  onAddExpense, 
  onRemoveTransaction,
  onClearMonth,
  onListHistoryMonths,
  onLoadMonthData,
}) => {
  // Estado do formulário de entrada
  const [entryForm, setEntryForm] = useState({
    valor: '',
    descricao: '',
    categoria: 'salario'
  });

  // Estado do formulário de gasto
  const [expenseForm, setExpenseForm] = useState({
    valor: '',
    descricao: '',
    categoria: 'alimentacao'
  });

  // Filtro de listagem (todos/entrada/gasto)
  const [filterType, setFilterType] = useState('todos');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyMonths, setHistoryMonths] = useState([]);
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(null);
  const [selectedMonthData, setSelectedMonthData] = useState({ entradas: [], gastos: [] });
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [chartView, setChartView] = useState('categoria');
  const isMobile = useIsMobile();

  // Catálogo de categorias de entrada (com ícone e rótulo)
  const entryCategories = {
    salario: { icon: '💼', label: 'Salário' },
    freelance: { icon: '💻', label: 'Freelance' },
    presente: { icon: '🎁', label: 'Presente' },
    investimento: { icon: '📈', label: 'Investimento' }
  };

  // Catálogo de categorias de gasto (com ícone e rótulo)
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

  // Site individual: sem distinção de pessoas

  // Formata valores em BRL (pt-BR)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Converte chave de mês (YYYY-MM) em rótulo "Mês / Ano"
  const formatMonthLabel = (ym) => {
    try {
      const date = new Date(`${ym}-01T00:00:00`);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
      const year = ym.split('-')[0];
      return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} / ${year}`;
    } catch {
      return ym;
    }
  };

  // Obtém rótulo visível para uma categoria
  const formatCategoryLabel = (key) => (
    entryCategories[key]?.label || expenseCategories[key]?.label || key
  );

  // Formata rótulos do eixo X para caber em telas pequenas
  const formatXAxisLabel = (label) => {
    if (typeof label !== 'string') return label;
    return label.length > 12 ? `${label.slice(0, 12)}…` : label;
  };

  // Monta dados agregados por categoria para uso nos gráficos
  const buildChartData = (data) => {
    const entradas = data.entradas || [];
    const gastos = data.gastos || [];
    const cats = Array.from(new Set([
      ...entradas.map(i => i.categoria),
      ...gastos.map(i => i.categoria)
    ]));
    return cats.map((c) => ({
      categoria: formatCategoryLabel(c),
      entradas: entradas.filter(i => i.categoria === c).reduce((s, i) => s + (i.valor || 0), 0),
      gastos: gastos.filter(i => i.categoria === c).reduce((s, i) => s + (i.valor || 0), 0)
    }));
  };

  // Dados por dia do mês atual
    const buildDailyChartData = (data) => {
      const entradas = data.entradas || [];
      const gastos = data.gastos || [];
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const rows = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const e = entradas.filter(i => new Date(i.data).getDate() === d).reduce((s,i)=>s+(i.valor||0),0);
        const g = gastos.filter(i => new Date(i.data).getDate() === d).reduce((s,i)=>s+(i.valor||0),0);
        if (e > 0 || g > 0) rows.push({ dia: String(d).padStart(2,'0'), entradas: e, gastos: g });
      }
      return rows;
    };

    // Dados por semana (1..5) do mês atual
    const buildWeeklyChartDataLocal = (data) => {
      const toWeek = (dStr) => {
        if (!dStr) return null;
        const d = new Date(dStr);
        const day = d.getDate();
        return Math.floor((day - 1) / 7) + 1;
      };
      const weeks = [1,2,3,4,5];
      return weeks.map((w)=>{
        const entradas = (data.entradas||[]).filter(i=>toWeek(i.data)===w).reduce((s,i)=>s+(i.valor||0),0);
        const gastos = (data.gastos||[]).filter(i=>toWeek(i.data)===w).reduce((s,i)=>s+(i.valor||0),0);
        return { semana: `Sem ${w}`, entradas, gastos };
      }).filter(r=>r.entradas>0||r.gastos>0);
    };

    // Dados do gráfico atual conforme visualização
    const currentChartData = (() => {
      let base;
      if (chartView === 'dia') base = buildDailyChartData(financialData);
      else if (chartView === 'semana') base = buildWeeklyChartDataLocal(financialData);
      else base = buildChartData(financialData);
      return base.map((row) => ({ ...row, saldo: (row.entradas || 0) - (row.gastos || 0) }));
    })();

    // Totais auxiliares para destaque e tooltip dependem do dataset atual
    const totalGastosMesAtual = currentChartData.reduce((s, r) => s + (r.gastos || 0), 0);
    const maxGastoIndex = currentChartData.length ? currentChartData.reduce((maxIdx, r, idx) =>
      (r.gastos || 0) > ((currentChartData[maxIdx]?.gastos) || 0) ? idx : maxIdx
    , 0) : 0;

  // Renderizador de rótulos de valor em BRL no topo das barras
  const renderCurrencyLabel = (props) => {
    const { value, x, y } = props;
    // Mostrar somente valores relevantes: >= 500
    if (!value || value < 500) return null;
    return (
      <text x={x} y={y - 4} fill="#6b7280" fontSize={10} textAnchor="middle">
        {formatCurrency(value)}
      </text>
    );
  };

  // Configuração de cores/legendas dos gráficos
  const chartConfig = {
    entradas: { label: 'Entradas', color: 'hsl(142, 72%, 35%)' },
    gastos: { label: 'Gastos', color: 'hsl(0, 72%, 50%)' }
  };

  // Agrega dados por semana do mês (Sem 1..Sem 5)
  const buildWeeklyChartData = (data) => {
    const toWeek = (dStr) => {
      if (!dStr) return null;
      const d = new Date(dStr);
      const day = d.getDate();
      return Math.floor((day - 1) / 7) + 1; // 1..5
    };

    const weeks = [1, 2, 3, 4, 5];
    return weeks
      .map((w) => {
        const entradas = (data.entradas || [])
          .filter((i) => toWeek(i.data) === w)
          .reduce((s, i) => s + (i.valor || 0), 0);
        const gastos = (data.gastos || [])
          .filter((i) => toWeek(i.data) === w)
          .reduce((s, i) => s + (i.valor || 0), 0);
        return { semana: `Sem ${w}`, entradas, gastos };
      })
      .filter((row) => row.entradas > 0 || row.gastos > 0);
  };

  // Abre o modal de histórico e carrega meses disponíveis
  const handleOpenHistory = async () => {
    try {
      const months = await onListHistoryMonths?.();
      setHistoryMonths(months || []);
      setSelectedHistoryMonth(null);
      setSelectedMonthData({ entradas: [], gastos: [] });
      setHistoryOpen(true);
    } catch {
      setHistoryMonths([]);
      setHistoryOpen(true);
    }
  };

  // Ao selecionar um mês no histórico, busca seus dados
  const handleSelectHistoryMonth = async (monthKey) => {
    setSelectedHistoryMonth(monthKey);
    setLoadingMonth(true);
    try {
      const data = await onLoadMonthData?.(monthKey);
      setSelectedMonthData(data || { entradas: [], gastos: [] });
    } finally {
      setLoadingMonth(false);
    }
  };

  // Adiciona uma nova ENTRADA
  const handleAddEntry = (e) => {
    e.preventDefault();
    const valor = parseFloat(String(entryForm.valor).replace(',', '.'));
    
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
      categoria: 'salario'
    });
  };

  // Adiciona um novo GASTO
  const handleAddExpense = (e) => {
    e.preventDefault();
    const valor = parseFloat(String(expenseForm.valor).replace(',', '.'));
    
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
      categoria: 'alimentacao'
    });
  };

  // Totais de entradas/gastos e saldo
  const totalEntries = financialData.entradas?.reduce((sum, entry) => sum + entry.valor, 0) || 0;
  const totalExpenses = financialData.gastos?.reduce((sum, expense) => sum + expense.valor, 0) || 0;
  const balance = totalEntries - totalExpenses;

  // Combinar e filtrar transações (aplica tipo selecionado)
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

  // Renderização da seção de finanças
  return (
    <div className="space-y-6">
      {/* Resumo Financeiro: total de entradas, gastos e saldo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-300 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Total de Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-200">
              {formatCurrency(totalEntries)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-300 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Total de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-200">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className={`${balance >= 0 
          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900' 
          : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center ${balance >= 0 
              ? 'text-blue-600 dark:text-blue-300' 
              : 'text-red-600 dark:text-red-300'}`}>
              <DollarSign className="w-4 h-4 mr-2" />
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 
              ? 'text-blue-700 dark:text-blue-200' 
              : 'text-red-700 dark:text-red-200'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulários: adicionar entrada e gasto */}
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

                <Button type="submit" className="bg-red-600 hover:bg-red-700 md:col-span-2 lg:col-span-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Gasto
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lista de Transações: transações recentes com filtro e remoção */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Transações Recentes
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="gasto">Gastos</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 sm:ml-2">
                <Button
                  variant="outline"
                  size="icon"
                  title="Histórico"
                  onClick={handleOpenHistory}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onClearMonth}
                  className="text-gray-500 hover:text-red-500 flex-1 sm:w-auto"
                >
                  Limpar Mês
                </Button>
              </div>
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
                          {dateFormatted}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
                        {isEntry ? '+' : '-'} {formatCurrency(transaction.valor)}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover transação?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A transação será excluída.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onRemoveTransaction(transaction.id, transaction.tipo)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Indicadores inteligentes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média de gastos diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-red-600">{formatCurrency(((financialData.gastos||[]).reduce((s,i)=>s+(i.valor||0),0) || 0) / (new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate()))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maior gasto do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-red-600">{formatCurrency((financialData.gastos||[]).reduce((m,e)=>Math.max(m,e.valor||0),0))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dia que mais gastou</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const map = (financialData.gastos||[]).reduce((acc,g)=>{ const d=new Date(g.data); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0'); const k=`${y}-${m}-${dd}`; acc[k]=(acc[k]||0)+(g.valor||0); return acc; },{});
              const key = Object.entries(map).sort((a,b)=>b[1]-a[1])[0]?.[0];
              return <div className="text-xl font-semibold">{key? new Date(`${key}T00:00:00`).toLocaleDateString('pt-BR'): '—'}</div>;
            })()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo projetado até o fim do mês</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const now = new Date();
              const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
              const daysElapsed = now.getDate();
              const net = ((financialData.entradas||[]).reduce((s,i)=>s+(i.valor||0),0) - (financialData.gastos||[]).reduce((s,i)=>s+(i.valor||0),0));
              const projected = daysElapsed>0 ? (net/daysElapsed)*daysInMonth : net;
              return <div className={`text-xl font-semibold ${projected>=0?'text-blue-600':'text-red-600'}`}>{formatCurrency(projected)}</div>;
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico do mês atual com opções de visualização */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Gráfico do Mês Atual
            </CardTitle>
            <div className="w-40">
              <Select value={chartView} onValueChange={setChartView}>
                <SelectTrigger>
                  <SelectValue placeholder="Visualização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="categoria">Por categoria</SelectItem>
                  <SelectItem value="dia">Por dia</SelectItem>
                  <SelectItem value="semana">Por semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer className="w-full h-[300px] sm:h-[360px]" config={{
            ...chartConfig,
            saldo: { 
              label: chartView === 'categoria' ? 'Saldo por categoria' : chartView === 'dia' ? 'Saldo por dia' : 'Saldo por semana',
              color: 'hsl(246, 72%, 55%)' 
            }
          }}>
            <ComposedChart data={currentChartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={chartView === 'categoria' ? 'categoria' : chartView === 'dia' ? 'dia' : 'semana'}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 10 }}
                tickFormatter={formatXAxisLabel}
              />
              <YAxis />
              <ChartTooltip wrapperStyle={isMobile ? { left: '50%', transform: 'translateX(-50%)' } : undefined} content={<ChartTooltipContent formatter={(value, name, item, index, row) => {
                const isGasto = name === 'gastos' || item?.dataKey === 'gastos';
                const isSaldo = name === 'saldo' || item?.dataKey === 'saldo';
                const percent = isGasto && totalGastosMesAtual > 0 
                  ? ((value / totalGastosMesAtual) * 100) 
                  : null;
                const isMax = isGasto && row?.gastos === currentChartData[maxGastoIndex]?.gastos;
                return (
                  <div className="flex w-full justify-between items-center gap-2">
                    <div className="text-muted-foreground">
                      {isSaldo 
                        ? `${chartView === 'categoria' ? 'Saldo por categoria:' : chartView === 'dia' ? 'Saldo por dia:' : 'Saldo por semana:'} `
                        : (name === 'entradas' ? 'Entrada:' : 'Gasto:')}
                    </div>
                    <div className="text-foreground font-mono font-medium tabular-nums whitespace-nowrap">
                      {formatCurrency(value)}
                      {percent !== null && (
                        <span className="ml-1 text-muted-foreground whitespace-nowrap">({percent.toFixed(1)}%)</span>
                      )}
                      {isMax && (
                        <span className="ml-2 text-[10px] text-red-600 whitespace-nowrap">Maior gasto do mês</span>
                      )}
                    </div>
                  </div>
                );
              }} />} />
              <Bar dataKey="entradas" fill="var(--color-entradas)">
                <LabelList position="top" content={renderCurrencyLabel} />
              </Bar>
              <Bar dataKey="gastos" fill="var(--color-gastos)">
                {currentChartData.map((row, idx) => (
                  <Cell key={`g-${idx}`} 
                    stroke={idx === maxGastoIndex ? 'rgba(220, 38, 38, 0.9)' : undefined}
                    strokeWidth={idx === maxGastoIndex ? 2 : 0}
                    fillOpacity={idx === maxGastoIndex ? 0.9 : 1}
                  />
                ))}
                <LabelList position="top" content={renderCurrencyLabel} />
              </Bar>
              {/* Linha de saldo por categoria suavizada */}
              <Line type="monotone" dataKey="saldo" stroke="var(--color-saldo)" dot={{ r: 2 }} strokeWidth={1.5} />
              <ChartLegend content={<ChartLegendContent />} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
      {/* Dialog: Histórico financeiro */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        {/* Tornar o modal mais compacto no mobile e com rolagem se necessário */}
        <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl p-3 sm:p-4 md:p-6 max-h-[85vh] overflow-y-auto">
          {!selectedHistoryMonth ? (
            <>
              <DialogHeader>
                <DialogTitle>Histórico de meses</DialogTitle>
              </DialogHeader>
              <div className="max-h-[50vh] overflow-y-auto space-y-4">
                {historyMonths.length === 0 ? (
                  <div className="text-center text-gray-500">Nenhum histórico disponível.</div>
                ) : (
                  Object.entries(historyMonths.reduce((acc, ym) => {
                    const [y] = ym.split('-');
                    acc[y] = acc[y] || [];
                    acc[y].push(ym);
                    return acc;
                  }, {})).sort(([a],[b])=>Number(b)-Number(a)).map(([year, months]) => (
                    <div key={year}>
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">{year}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {months.sort().reverse().map((ym) => (
                          <Button key={ym} variant="outline" onClick={() => handleSelectHistoryMonth(ym)} className="justify-start">
                            {formatMonthLabel(ym)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{formatMonthLabel(selectedHistoryMonth)}</DialogTitle>
              </DialogHeader>
              {loadingMonth ? (
                <div className="py-12 text-center text-muted-foreground">Carregando…</div>
              ) : (
                <div className="space-y-4">
                  {/* Gráfico semanal: duas colunas (entradas/gastos) por semana do mês */}
                  <ChartContainer className="w-full" config={chartConfig}>
                    <BarChart data={buildWeeklyChartData(selectedMonthData)} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semana" interval={0} tick={{ fontSize: 11 }} />
                      <YAxis />
                      <ChartTooltip wrapperStyle={isMobile ? { left: '50%', transform: 'translateX(-50%)' } : undefined} content={<ChartTooltipContent />} />
                      <Bar dataKey="entradas" fill="var(--color-entradas)" />
                      <Bar dataKey="gastos" fill="var(--color-gastos)" />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ChartContainer>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Entradas</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-lg font-semibold text-green-700">{formatCurrency((selectedMonthData.entradas||[]).reduce((s,i)=>s+(i.valor||0),0))}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Gastos</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-lg font-semibold text-red-700">{formatCurrency((selectedMonthData.gastos||[]).reduce((s,i)=>s+(i.valor||0),0))}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Saldo</CardTitle></CardHeader>
                      <CardContent>
                        {(() => {
                          const tE = (selectedMonthData.entradas||[]).reduce((s,i)=>s+(i.valor||0),0);
                          const tG = (selectedMonthData.gastos||[]).reduce((s,i)=>s+(i.valor||0),0);
                          const b = tE - tG;
                          return <div className={`text-lg font-semibold ${b>=0?'text-blue-700':'text-red-700'}`}>{formatCurrency(b)}</div>;
                        })()}
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedHistoryMonth(null)}>Voltar</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceSection;

