# Portal com Menu Superior

Projeto fullstack com frontend (Vite/React) e backend (Express + Socket.IO) no mesmo repositório.

## Rodar localmente (frontend + backend)

1. Instale dependências:

```bash
npm install
```

2. Crie o arquivo `.env` com base em `.env.example` (opcional no dev local).

3. Suba frontend e backend juntos:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Variáveis de ambiente

Use o arquivo `.env.example` como referência.

### Frontend (Vite)

- `VITE_API_URL`: URL base do backend HTTP.
- `VITE_SOCKET_URL`: URL base do Socket.IO (se omitido, usa `VITE_API_URL`; no dev cai para `http://localhost:3001`).

### Backend (Express)

- `PORT`: porta do backend (Railway injeta automaticamente).
- `DATABASE_URL`: conexão com Postgres.
- `FRONTEND_ORIGIN`: origem principal permitida (ex: domínio do Vercel).
- `FRONTEND_ORIGINS`: lista separada por vírgula com origens permitidas.
- `WHATSAPP_AUTH_PATH`: caminho para persistência de sessão do WhatsApp.

## Deploy: Vercel + Railway

### Vercel (frontend)

Configure no projeto Vercel:

- `VITE_API_URL=https://SEU_BACKEND.up.railway.app`
- `VITE_SOCKET_URL=https://SEU_BACKEND.up.railway.app`

### Railway (backend)

Configure no serviço Railway:

- `FRONTEND_ORIGIN=https://SEU_FRONTEND.vercel.app`
- `FRONTEND_ORIGINS=https://SEU_FRONTEND.vercel.app,http://localhost:5173`
- `DATABASE_URL=...`

Start command:

```bash
node Backend/index.cjs
```
  