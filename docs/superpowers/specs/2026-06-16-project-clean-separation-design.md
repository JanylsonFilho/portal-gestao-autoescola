# Separacao Limpa de Frontend e Backend

## Objetivo

Reorganizar o workspace `portal-de-evolucao` para que apenas dois aplicativos existam como codigo de produto:

- `portal-evolucao-backend`
- `portal-evolucao-frontend`

A raiz deve manter apenas documentacao compartilhada e metadados minimos do projeto, sem codigo de aplicacao fora desses dois diretorios.

## Estado Inicial

O projeto hoje mistura:

- um backend Node/TypeScript em `backend/`
- um frontend React/Vite em `frontend/`
- sobras de um scaffold Next.js/v0 na raiz (`app/`, `components/`, `lib/`, `public/`, `next.config.mjs`, `package.json`, `tsconfig.json`, `postcss.config.mjs`, `components.json`, `pnpm-lock.yaml`)

Essa estrutura aumenta ambiguidade sobre qual app e a fonte real e dificulta manutencao, build e onboarding.

## Decisao

Adotar separacao limpa:

- mover `backend/` para `portal-evolucao-backend/`
- mover `frontend/` para `portal-evolucao-frontend/`
- remover todo o scaffold Next.js e configs de raiz que nao pertencem mais ao produto
- manter na raiz apenas `README.md`, `docs/`, `.gitignore` e pastas internas de ferramenta (`.git`, `.codex`, `.agents`)

## Estrutura Final Esperada

```text
portal-de-evolucao/
├── portal-evolucao-backend/
├── portal-evolucao-frontend/
├── docs/
├── README.md
└── .gitignore
```

## Responsabilidades

### portal-evolucao-backend

Responsavel por:

- API REST
- conexao com MySQL
- seed
- testes Jest
- configuracoes TypeScript do backend
- arquivos `.env` e `.env.example` do backend
- scripts SQL e documentacao tecnica do backend

### portal-evolucao-frontend

Responsavel por:

- app React/Vite
- assets e estilos do frontend
- rotas e paginas do instrutor e dashboard publico
- configuracoes Vite/Tailwind/TypeScript do frontend
- `.env.example` do frontend
- build do frontend

### raiz

Responsavel apenas por:

- README geral explicando como entrar em cada aplicativo
- docs compartilhadas
- configuracao minima ignorando artefatos locais

## Regras de Migracao

- nenhum codigo executavel de frontend ou backend deve permanecer na raiz
- nenhum arquivo de configuracao de Next.js deve permanecer
- referencias em README e instrucoes devem apontar para os novos caminhos
- scripts e imports internos devem continuar relativos aos seus proprios aplicativos
- o backend deve continuar funcional com `.env` local e seed
- o frontend deve continuar buildando sem depender de arquivos de raiz

## Validacao

Ao final da reorganizacao:

- `portal-evolucao-backend`: `npm run build` e `npm test` devem passar
- `portal-evolucao-frontend`: `npm run build` deve passar
- nao deve restar codigo de app na raiz

## Resultado Executado

A reorganizacao foi aplicada com os seguintes efeitos:

- `backend/` foi movido para `portal-evolucao-backend/`
- `frontend/` foi movido para `portal-evolucao-frontend/`
- o scaffold Next.js da raiz foi removido
- a documentacao principal passou a apontar apenas para os dois apps finais
- o banco de referencia mantido para execucao local e `portal_evolucao_aluno`

## Riscos e Tratamento

- risco de caminhos quebrados em documentacao e comandos
  - revisar README e `.env.example`
- risco de artefatos gerados permanecerem em local antigo
  - remover configs e scaffolds obsoletos da raiz
- risco de confusao com nome do banco
  - manter o backend apontando para `portal_evolucao_aluno` enquanto a migracao estrutural ocorre
