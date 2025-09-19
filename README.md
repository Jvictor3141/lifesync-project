# LifeSync - Nossa Agendinha

Uma aplicação React moderna para gerenciamento de agenda pessoal e controle financeiro, convertida de HTML/CSS/JS para React + Vite com componentização otimizada.

## 🚀 Funcionalidades

### 📅 Agenda
- **Gerenciamento de tarefas por usuário**: Larissa e João Victor
- **Organização por períodos**: Manhã (6h-12h), Tarde (12h-18h), Noite (18h-24h)
- **Calendário interativo**: Visualização mensal com navegação
- **Cores personalizadas**: Sistema de cores para categorização de tarefas
- **Datas especiais**: Marcação e visualização de datas importantes

### 💰 Controle Financeiro
- **Gestão de entradas**: Salário, freelance, presentes, investimentos
- **Controle de gastos**: Categorização por tipo (alimentação, transporte, casa, etc.)
- **Resumo financeiro**: Total de entradas, gastos e saldo atual
- **Histórico de transações**: Lista completa com filtros
- **Atribuição por pessoa**: Controle individual e compartilhado

### 🔐 Autenticação
- **Login seguro**: Integração com Firebase Authentication
- **Cadastro de usuários**: Validação de senha com critérios de segurança
- **Persistência de sessão**: Manutenção do login entre sessões

## 🛠️ Tecnologias Utilizadas

- **React 18**: Framework principal
- **Vite**: Build tool e servidor de desenvolvimento
- **Firebase**: Backend-as-a-Service (Authentication + Firestore)
- **Tailwind CSS**: Framework de estilos utilitários
- **Lucide React**: Biblioteca de ícones
- **FullCalendar**: Componente de calendário
- **Shadcn/ui**: Componentes de interface

## 📁 Estrutura do Projeto

```
agenda-react/
├── src/
│   ├── components/           # Componentes React
│   │   ├── CalendarSection.jsx
│   │   ├── FinanceSection.jsx
│   │   ├── Header.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── LoginForm.jsx
│   │   ├── Sidebar.jsx
│   │   └── TaskSection.jsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.js
│   │   └── useFirebaseData.js
│   ├── lib/                 # Configurações
│   │   └── firebase.js
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos globais
│   └── main.jsx             # Ponto de entrada
├── public/                  # Arquivos estáticos
├── package.json             # Dependências
└── README.md               # Documentação
```

## 🎨 Componentização

### Componentes Principais

1. **App.jsx**: Componente raiz que gerencia estado global e roteamento
2. **Header.jsx**: Cabeçalho com navegação e controles de tema
3. **Sidebar.jsx**: Menu lateral para navegação entre seções
4. **LoginForm.jsx**: Formulário de autenticação com validação
5. **LoadingScreen.jsx**: Tela de carregamento

### Componentes de Funcionalidade

1. **TaskSection.jsx**: Gerenciamento de tarefas por usuário e período
2. **CalendarSection.jsx**: Calendário interativo com FullCalendar
3. **FinanceSection.jsx**: Controle financeiro completo

### Custom Hooks

1. **useAuth.js**: Gerenciamento de autenticação Firebase
2. **useFirebaseData.js**: Operações CRUD com Firestore

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou pnpm

### Passos

1. **Clone o repositório**:
```bash
git clone <url-do-repositorio>
cd agenda-react
```

2. **Instale as dependências**:
```bash
pnpm install
```

3. **Configure o Firebase**:
- Crie um projeto no Firebase Console
- Ative Authentication (Email/Password)
- Ative Firestore Database
- Copie as configurações para `src/lib/firebase.js`

4. **Execute o projeto**:
```bash
pnpm run dev
```

5. **Acesse a aplicação**:
```
http://localhost:5173
```

## 🎯 Melhorias Implementadas

### Arquitetura
- **Componentização modular**: Separação clara de responsabilidades
- **Custom hooks**: Reutilização de lógica de estado
- **Gerenciamento de estado**: Context API para dados globais
- **Tipagem implícita**: Uso de PropTypes para validação

### UX/UI
- **Design responsivo**: Adaptação para desktop e mobile
- **Tema escuro/claro**: Alternância de temas
- **Feedback visual**: Loading states e animações
- **Validação em tempo real**: Formulários com validação instantânea

### Performance
- **Lazy loading**: Carregamento sob demanda
- **Otimização de re-renders**: Uso de useCallback e useMemo
- **Bundle splitting**: Divisão automática do código
- **Caching**: Cache de dados do Firebase

### Funcionalidades
- **Sincronização em tempo real**: Updates automáticos via Firestore
- **Persistência offline**: Dados mantidos localmente
- **Filtros avançados**: Múltiplas opções de filtragem
- **Exportação de dados**: Funcionalidade de backup

## 🔒 Segurança

- **Autenticação Firebase**: Sistema seguro de login
- **Regras de segurança**: Proteção de dados no Firestore
- **Validação de entrada**: Sanitização de dados do usuário
- **HTTPS**: Comunicação criptografada

## 📱 Responsividade

A aplicação é totalmente responsiva com:
- **Breakpoints otimizados**: Mobile-first design
- **Menu adaptativo**: Sidebar colapsável em mobile
- **Calendário responsivo**: Adaptação automática do layout
- **Formulários otimizados**: Interface touch-friendly

## 🚀 Deploy

Para fazer deploy da aplicação:

1. **Build de produção**:
```bash
pnpm run build
```

2. **Deploy no Firebase Hosting**:
```bash
firebase deploy
```

3. **Ou use outros serviços**:
- Vercel
- Netlify
- GitHub Pages

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 👥 Autores

- **Desenvolvedor**: Convertido de HTML/CSS/JS para React
- **Design Original**: Baseado no projeto original fornecido

---

**LifeSync** - Organizando a vida a dois! 💕

