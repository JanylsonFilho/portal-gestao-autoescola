# Portal Gestao Autoescola

Primeira versao funcional do sistema da Autoescola Ximenes, com backend em Node.js/TypeScript e frontend em React/Vite.

## Estrutura

```text
portal-gestao-autoescola/
├── portal-gestao-autoescola-backend
└── portal-gestao-autoescola-frontend
```

## Backend

```bash
cd portal-gestao-autoescola-backend
npm install
cp .env.example .env
npm run dev
```

Configure o arquivo `.env` com os dados do MySQL:

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=SuaSenhaForte123!
DATABASE_NAME=portal_evolucao_aluno
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## Frontend

```bash
cd portal-gestao-autoescola-frontend
npm install
npm run dev
```

Se quiser apontar para outra API, crie `portal-gestao-autoescola-frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Banco de dados

1. Crie o banco MySQL `portal_evolucao_aluno`.
2. Rode o script `portal-gestao-autoescola-backend/database/schema.sql`.
3. Execute o seed inicial de instrutores conforme a configuracao do backend.

Instrutores esperados:

- `davison` / `123456` / categoria `A`
- `rafael` / `123456` / categoria `B`
- `janylson` / `123456` / categoria `D`

## Fluxo principal

1. Acesse `/login` no frontend.
2. Entre com um instrutor seedado.
3. Cadastre um aluno em `/alunos/novo`.
4. Registre uma avaliacao em `/alunos/:id/avaliacoes/nova`.
5. Copie o link publico do dashboard do aluno.
6. Abra `/aluno/:telefone` para visualizar o painel publico.

## Scripts uteis

Backend:

```bash
cd portal-gestao-autoescola-backend
npm run dev
npm test
```

Frontend:

```bash
cd portal-gestao-autoescola-frontend
npm run dev
npm run build
```
