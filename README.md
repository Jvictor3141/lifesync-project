# **LifeSync – Agenda & Financeiro**

Aplicação React + Vite para organizar tarefas diárias, datas especiais e controle financeiro, com autenticação via Firebase e sincronização em tempo real.

---

## 🚀 **Principais Funcionalidades**

- Agenda por períodos (manhã / tarde / noite)
- Calendário com datas especiais e ícones visuais
- Controle financeiro mensal por usuário
- Login/cadastro com Firebase Authentication
- Firestore em tempo real (tarefas, datas e finanças)
- Interface responsiva com Tailwind + componentes modernos

---

## ⚙️ **Tecnologias Utilizadas**

- **React 18**  
- **Vite**  
- **Firebase (Auth + Firestore)**  
- **Tailwind CSS**  
- **Lucide React**  
- **FullCalendar**  
- **Shadcn/UI**
- **Assistência por IA**: partes do código e sugestões foram geradas com apoio de ferramentas de inteligência artificial.

---

## 📦 **Instalação**

### **Pré-requisitos**
- Node.js 18+
- pnpm (ou npm/yarn adaptando os comandos)

### **Passo a passo**
```bash
git clone <url-do-repositorio>
cd agenda-react
pnpm install
pnpm run dev
```

Acesse:  
`http://localhost:5173`

---

## 🔥 **Configuração do Firebase**

1. Crie um projeto no Firebase Console  
2. Ative:
   - Authentication (Email/Password)  
   - Firestore Database  
3. Crie um arquivo `.env` baseado em `.env.example` com:
   ```bash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```
   O `src/lib/firebase.js` lê essas variáveis via `import.meta.env`.

---

## 🗂️ **Estrutura de Dados (Firestore)**

```
users/{uid}/agendas/{dateKey}       → tarefas por período
users/{uid}/financas/{YYYY-MM}      → entradas/gastos do mês
users/{uid}/datasEspeciais/lista    → array de datas especiais
```

---

## 🚀 **Build e Deploy**

### Gerar build:
```bash
pnpm run build
```

### Firebase Hosting:
```bash
firebase deploy
```

Ou use: **Vercel**, **Netlify**, **GitHub Pages**.

---

## 📄 **Propriedade do Autor**

Todo o código deste repositório é propriedade exclusiva do autor.  
É proibido copiar, utilizar, modificar, redistribuir ou incorporar qualquer parte do código em projetos públicos ou privados sem autorização expressa e por escrito do autor.

---

