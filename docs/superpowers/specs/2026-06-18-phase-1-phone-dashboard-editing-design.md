# Fase 1 - Telefone, Dashboard Publico e Edicao de Alunos

## Objetivo

Implementar a primeira leva de ajustes finos validados com o cliente, focando em:

- telefone padronizado e validado
- dashboard publico acessado pelo telefone do aluno
- edicao de cadastro de aluno
- atualizacao automatica do link publico quando o telefone mudar
- remocao do botao de WhatsApp
- paginacao da lista de alunos
- paginacao das fichas no dashboard publico do aluno

Esta fase nao cobre ainda a nova modelagem de perfis `admin` e `usuario`, nem o ajuste completo do PDF.

## Regras Validadas

### Telefone

Fluxo oficial:

- na interface, o usuario visualiza `55` fixo antes do campo
- o usuario digita somente os 11 digitos locais do Brasil
- o sistema so permite salvar quando houver exatamente 11 digitos locais
- o frontend envia somente os 11 digitos locais
- o backend concatena `55` antes de persistir
- o banco passa a armazenar o telefone completo no formato numerico puro

Exemplo:

- digitado na tela: `85989551746`
- salvo no banco: `5585989551746`

### Dashboard publico

O identificador publico do dashboard deixa de ser o token aleatorio e passa a ser o telefone salvo no banco.

Exemplo:

- rota antiga: `/aluno/:publicToken`
- rota nova: `/aluno/:phone`

Exemplo final:

- `/aluno/5585989551746`

Quando o telefone do aluno for alterado, o link publico muda junto automaticamente.

### WhatsApp no dashboard publico

O botao de WhatsApp deve ser removido do cabecalho do dashboard publico do aluno.

## Escopo Funcional

### 1. Cadastro de aluno

Tela afetada:

- `portal-evolucao-frontend/src/pages/CreateStudent.tsx`

Comportamento esperado:

- exibir `55` fixo visualmente
- aceitar somente 11 digitos locais no campo editavel
- impedir submit se o numero estiver incompleto
- mostrar feedback claro de validacao
- ao salvar, o aluno deve voltar com o telefone persistido no formato completo do banco

### 2. Edicao de aluno

Novo fluxo:

- o painel deve permitir editar o cadastro do aluno existente
- os campos minimos da fase 1 sao:
  - nome
  - telefone
  - quantidade total de aulas

Comportamento esperado:

- a edicao deve reaproveitar o mesmo padrao visual do cadastro atual
- ao alterar o telefone, o link publico deve mudar automaticamente
- ao copiar ou abrir o dashboard depois da edicao, o novo link deve ser usado

### 3. Dashboard publico por telefone

Tela afetada:

- `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`

Comportamento esperado:

- carregar aluno e avaliacoes pela nova rota publica baseada em telefone
- remover o botao de WhatsApp
- manter o botao de impressao/PDF
- manter o visual premium atual

### 4. Paginacao das fichas do dashboard publico

Comportamento esperado:

- a lista de fichas por aula deve ser paginada
- exibir 2 fichas por pagina
- mostrar controles `Anterior` e `Proxima`
- mostrar o estado atual da paginacao
- manter ordem cronologica coerente com a evolucao mostrada ao aluno

### 5. Paginacao da lista de alunos

Telas afetadas:

- `portal-evolucao-frontend/src/pages/Dashboard.tsx`
- `portal-evolucao-frontend/src/pages/StudentsList.tsx`

Comportamento esperado:

- a lista visual de alunos deve ser paginada
- exibir 2 alunos por pagina
- busca continua funcionando sobre o conjunto completo antes da paginacao
- ao mudar o termo de busca, a pagina atual deve voltar para a primeira pagina

## Ajustes Tecnicos Necessarios

### Backend

#### Banco e modelo de aluno

Arquivos impactados:

- schema SQL existente
- `portal-evolucao-backend/src/app/interfaces/Student.ts`
- `portal-evolucao-backend/src/app/models/StudentModel.ts`
- `portal-evolucao-backend/src/app/services/StudentService.ts`
- `portal-evolucao-backend/src/app/validators/student.validator.ts`

Mudancas:

- `public_token` deixa de ser a referencia publica principal do dashboard
- o telefone passa a ser a chave publica usada pela rota do dashboard
- o backend deve validar e persistir telefone no formato `55 + 11 digitos`
- criar suporte para atualizar aluno

#### Rotas e servicos

Arquivos impactados:

- `portal-evolucao-backend/src/app/controllers/StudentController.ts`
- `portal-evolucao-backend/src/app/routes/students.routes.ts`

Mudancas:

- adicionar rota de atualizacao de aluno
- trocar a busca do dashboard publico para telefone
- garantir que a listagem e o detalhe do aluno continuem consistentes

### Frontend

Arquivos impactados:

- `portal-evolucao-frontend/src/types/Student.ts`
- `portal-evolucao-frontend/src/services/studentService.ts`
- `portal-evolucao-frontend/src/utils/copyToClipboard.ts`
- `portal-evolucao-frontend/src/utils/formatWhatsapp.ts`
- `portal-evolucao-frontend/src/pages/CreateStudent.tsx`
- `portal-evolucao-frontend/src/pages/StudentDetails.tsx`
- `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`
- `portal-evolucao-frontend/src/pages/Dashboard.tsx`
- `portal-evolucao-frontend/src/pages/StudentsList.tsx`

Mudancas:

- gerar URL publica usando telefone
- criar fluxo de edicao de aluno
- aplicar validacao visual de telefone
- remover o botao de WhatsApp do dashboard publico
- aplicar paginacao em fichas e listas

## Decisoes de Implementacao

### Persistencia do telefone

O frontend nao salva `55` digitado pelo usuario.

O frontend envia:

- `85989551746`

O backend salva:

- `5585989551746`

Isso centraliza a regra no backend e evita inconsistencias entre telas.

### Compatibilidade

Nesta fase, o sistema deve passar a operar oficialmente com o telefone como identificador publico.

Nao ha necessidade de manter dois links publicos permanentes se isso complicar desnecessariamente a manutencao. O foco e deixar o comportamento principal correto e previsivel.

### PDF

Nesta fase, o PDF sera apenas preservado funcionalmente no fluxo atual de impressao.

Se houver algum ajuste estritamente necessario para o novo link ou para a nova paginacao, ele entra aqui. Uma refatoracao visual maior do PDF fica para fase posterior.

## Criterios de Aceite

- nao existe mais botao de WhatsApp no dashboard publico
- o link publico do aluno usa o telefone salvo no banco
- o cadastro de aluno exige exatamente 11 digitos locais
- o banco salva sempre o telefone com `55` no inicio
- e possivel editar aluno no painel
- ao editar telefone, o link do dashboard muda automaticamente
- a lista de alunos e paginada
- as fichas do dashboard publico sao paginadas de 2 em 2
- copiar link e abrir dashboard usam sempre o telefone atualizado
- frontend builda
- backend builda
- testes essenciais do backend continuam passando

## Riscos e Mitigacao

### Risco 1: inconsistencias entre telefone exibido e telefone salvo

Mitigacao:

- separar claramente o valor digitado do valor persistido
- padronizar funcoes de formatacao e serializacao

### Risco 2: quebra de links antigos baseados em token

Mitigacao:

- assumir explicitamente a troca de identificador como regra da fase 1
- atualizar todos os pontos internos de copia e navegacao para o novo formato

### Risco 3: paginacao conflitar com busca

Mitigacao:

- filtrar primeiro
- paginar depois
- resetar pagina ao mudar busca
