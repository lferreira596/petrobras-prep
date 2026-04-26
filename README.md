# 🛢️ Petrobras Prep

Plataforma de estudos para o concurso **Petrobras Nível Técnico Júnior** (ênfase Administração e Controle).  
Teste com 10 questões grátis e plano Premium com mais de 500 questões estratégicas, progresso salvo, revisão inteligente e emails automáticos.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Banco de dados | Vercel Postgres (Neon serverless) |
| ORM | Drizzle ORM |
| Autenticação | NextAuth v5 (Google OAuth) |
| Deploy | Vercel |
| Cron jobs | Vercel Cron |

---

## Estrutura do projeto

```
petrobras-prep/
├── app/
│   ├── (auth)/login/        ← Página de login (Google)
│   ├── dashboard/           ← Home do usuário logado
│   ├── quiz/                ← Quiz interativo
│   ├── revisao/             ← Revisão de erros (SM-2)
│   ├── plano/               ← Plano de estudos semanal
│   └── api/
│       ├── auth/            ← NextAuth handlers
│       ├── questions/       ← GET questões com filtros
│       ├── progress/        ← GET/POST progresso por questão
│       ├── sessions/        ← POST sessões de estudo
│       ├── review-queue/    ← GET fila de revisão
│       ├── stats/           ← GET dashboard analytics
│       ├── study-plan/      ← GET/PUT plano semanal
│       └── cron/
│           └── spaced-repetition/   ← Algoritmo SM-2 (06h)
├── lib/
│   ├── auth.ts              ← Config NextAuth + Google
│   ├── db/
│   │   ├── index.ts         ← Conexão Drizzle + Neon
│   │   ├── schema.ts        ← Todas as tabelas
│   │   ├── queries.ts       ← Queries tipadas + SM-2
│   │   └── seed.ts          ← banco de questões
├── types/
│   └── next-auth.d.ts       ← Augmentação de tipos
├── drizzle.config.ts
├── middleware.ts             ← Proteção de rotas
├── vercel.json               ← Configuração dos crons
└── .env.example              ← Variáveis necessárias
```

---

## 🚀 Deploy passo a passo

### 1. Clonar e instalar

```bash
git clone <seu-repo>
cd petrobras-prep
npm install
```

### 2. Criar projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Conecte o repositório GitHub
3. **Não faça deploy ainda** — precisamos configurar o banco primeiro

### 3. Criar banco de dados Vercel Postgres

1. No painel do projeto Vercel → aba **Storage**
2. Clique em **Create Database** → escolha **Postgres**
3. Dê o nome `petrobras-prep-db`
4. Clique em **Connect to Project** → as variáveis de ambiente são adicionadas automaticamente:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_DATABASE`

### 4. Configurar variáveis de ambiente locais

```bash
cp .env.example .env.local
```

Preencha o `.env.local` com os valores do painel Vercel (Settings → Environment Variables).

### 5. Criar as tabelas no banco

```bash
npm run db:push
```

Você verá as tabelas criadas: `users`, `accounts`, `sessions`, `verification_tokens`, `questions`, `user_question_progress`, `study_sessions`, `study_plans`.

### 6. Popular com as questões (seed)

```bash
npm run db:seed
```

Saída esperada:
```
🌱 Iniciando seed das questões...
✅ questões inseridas com sucesso!
```

### 7. Configurar Google OAuth

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services → Credentials**
4. Clique em **Create Credentials → OAuth Client ID**
5. Tipo: **Web application**
6. URIs de redirecionamento autorizados:
   ```
   http://localhost:3000/api/auth/callback/google
   https://www.preparaconcursos.com/api/auth/callback/google
   ```
7. Copie `Client ID` e `Client Secret`

Adicione no Vercel (Settings → Environment Variables):
```
AUTH_GOOGLE_ID=xxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxx
AUTH_SECRET=<gere com: openssl rand -base64 32>
AUTH_URL=https://www.preparaconcursos.com
```

### 8. Configurar proteção dos Cron Jobs

Gere uma string secreta:
```bash
openssl rand -base64 32
```

Adicione no Vercel:
```
CRON_SECRET=<string-gerada>
NEXT_PUBLIC_APP_URL=https://www.preparaconcursos.com
```

### 9. Deploy final

```bash
git add .
git commit -m "feat: petrobras prep inicial"
git push
```

O Vercel detectará o push e fará o deploy automaticamente.

Ou via CLI:
```bash
npx vercel --prod
```

---

## ⚙️ Cron Jobs configurados

| Cron | Schedule | Função |
|------|----------|--------|
| `spaced-repetition` | `0 6 * * *` (03h BRT) | Processa fila de revisão pelo algoritmo SM-2 |

> Os crons são protegidos pelo header `Authorization: Bearer $CRON_SECRET`

---

## 🗄️ Schema do banco de dados

```
users                    → perfil, streak, plano (free/premium)
accounts                 → OAuth providers (NextAuth)
sessions                 → sessões autenticadas (NextAuth)
verification_tokens      → magic links (NextAuth)
questions                → questões com metadados, 10 grátis e demais premium
user_question_progress   → progresso por questão + SM-2
study_sessions           → histórico de sessões de estudo
study_plans              → plano semanal personalizado
```

---

## 🧠 Algoritmo de Repetição Espaçada (SM-2)

Cada questão errada entra na fila com `proximaRevisao = hoje + 1 dia`.  
Ao acertar na revisão, o intervalo cresce exponencialmente (1d → 2d → 5d → 10d...).  
Ao errar novamente, volta para 1 dia.

```
Intervalo novo = Intervalo atual × Fator de Facilidade (EF)
EF inicial = 2.5 | EF mínimo = 1.3
```

---

## 💰 Custos estimados (Vercel Free Tier)

| Serviço | Limite gratuito |
|---------|----------------|
| Vercel Postgres | 256 MB storage, 60h compute/mês |
| Vercel Functions | 100.000 invocações/mês |
| Vercel Cron | 2 crons no free tier |
| **Total** | **R$ 0** |

---

## 🔧 Comandos úteis

```bash
npm run dev          # Servidor local em localhost:3000
npm run db:push      # Sincroniza schema com o banco
npm run db:studio    # Interface visual do banco (Drizzle Studio)
npm run db:seed      # Insere/atualiza o banco de questões
npm run build        # Build de produção
```

---

## Próximas features

- [ ] Mais ênfases (Suprimentos, Operação)
- [ ] Modo simulado cronometrado (100 questões / 4h)
- [ ] Plano premium com mais de 500 questões estratégicas
- [ ] Ranking entre usuários
- [ ] App mobile (PWA)
