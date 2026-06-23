# Feedback Especifico de Erros no Frontend

## Objetivo

Garantir que o usuario veja sempre o motivo real do erro na interface, evitando mensagens genericas quando o sistema souber exatamente o que aconteceu.

Este ajuste cobre o frontend inteiro do painel atual e aproveita as mensagens especificas ja emitidas pelo backend.

## Regra Principal

Quando existir uma causa conhecida para a falha, a tela deve exibir essa causa de forma direta ao usuario.

Exemplos desejados:

- `Ja existe aluno com esse telefone`
- `Usuario ou senha invalidos`
- `Ja existe uma avaliacao para esse numero de aula`
- `Voce nao tem permissao para editar este aluno`
- `Dashboard nao encontrado`

Mensagens genericas como `Nao foi possivel...` devem ficar restritas apenas aos casos em que realmente nao existir um motivo especifico disponivel.

## Estrategia Aprovada

Usar um mapeamento central no frontend com esta prioridade:

1. usar `response.data.message` vindo do backend quando existir
2. mapear casos tecnicos conhecidos para mensagens claras
3. cair em fallback generico apenas quando nao houver motivo especifico

Isso preserva o backend como fonte da verdade do erro, mas evita apresentacao inconsistente nas telas.

## Escopo Funcional

### 1. Helper central de tratamento

Criar um utilitario unico para:

- detectar erro Axios
- ler `response.data.message`
- tratar falha de rede
- tratar erros sem resposta do backend
- devolver uma string pronta para exibicao

O helper nao deve esconder mensagens especificas do backend.

### 2. Telas do frontend que devem migrar

Aplicar o helper nas telas que hoje usam `err.message` ou fallback direto:

- `portal-evolucao-frontend/src/pages/Login.tsx`
- `portal-evolucao-frontend/src/pages/Dashboard.tsx`
- `portal-evolucao-frontend/src/pages/StudentsList.tsx`
- `portal-evolucao-frontend/src/pages/CreateStudent.tsx`
- `portal-evolucao-frontend/src/pages/EditStudent.tsx`
- `portal-evolucao-frontend/src/pages/StudentDetails.tsx`
- `portal-evolucao-frontend/src/pages/CreateEvaluation.tsx`
- `portal-evolucao-frontend/src/pages/Evaluations.tsx`
- `portal-evolucao-frontend/src/pages/Reports.tsx`
- `portal-evolucao-frontend/src/pages/Settings.tsx`
- `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`

### 3. Tipos de erro que precisam de feedback claro

#### Erros vindos do backend

Devem aparecer exatamente como o backend enviar:

- autenticacao invalida
- falta de permissao
- conflito por duplicidade
- entidade nao encontrada
- validacoes de negocio

#### Erros tecnicos conhecidos

Devem ser convertidos para mensagens uteis:

- sem conexao com servidor
- servidor fora do ar
- resposta invalida
- timeout, se houver

Exemplo esperado:

- em vez de `Network Error`
- mostrar `Nao foi possivel conectar ao servidor. Verifique se o backend esta em execucao.`

### 4. Regras por contexto

#### Login

Preferir mensagens como:

- `Usuario ou senha invalidos`
- `Nao foi possivel conectar ao servidor.`

#### Cadastro e edicao de aluno

Preferir mensagens como:

- `Ja existe aluno com esse telefone`
- `Informe exatamente 11 digitos no telefone do aluno`
- `Voce nao tem permissao para editar este aluno`

#### Avaliacoes

Preferir mensagens como:

- `Ja existe uma avaliacao para esse numero de aula`
- `Aluno nao encontrado`
- `Voce nao tem permissao para avaliar este aluno`

#### Dashboard publico

Preferir mensagens como:

- `Link invalido`
- `Dashboard nao encontrado`

## Ajustes Tecnicos Necessarios

### Frontend

Arquivos impactados:

- `portal-evolucao-frontend/src/utils/getApiErrorMessage.ts`
- telas que hoje usam `setError(err instanceof Error ? err.message : ...)`

Mudancas:

- consolidar a extracao da mensagem em um unico ponto
- remover uso direto de `err.message` nas telas listadas
- manter o mesmo componente visual de alerta, mudando apenas a origem do texto

### Backend

Nenhuma mudanca estrutural obrigatoria nesta etapa.

O backend ja possui varias mensagens especificas em `AppError`. Se surgir algum fluxo com texto tecnico demais, esse texto pode ser refinado depois diretamente no backend.

## Criterios de Aceite

- o usuario nao deve ver erro generico quando existir mensagem especifica conhecida
- duplicidade de telefone mostra mensagem clara
- login invalido mostra mensagem clara
- duplicidade de aula mostra mensagem clara
- falha de rede mostra mensagem clara de conexao
- dashboard publico mostra motivo real do erro
- o frontend continua buildando sem regressao

## Riscos e Mitigacao

### Risco 1: mensagens inconsistentes entre backend e frontend

Mitigacao:

- usar o backend como fonte primaria
- centralizar a apresentacao no helper

### Risco 2: algumas telas continuarem usando tratamento antigo

Mitigacao:

- localizar todos os `setError` com `err.message`
- migrar todos no mesmo ciclo

### Risco 3: fallback generico esconder problema real

Mitigacao:

- fallback so entra quando nao existir `response.data.message`
- priorizar casos tecnicos conhecidos como falha de rede
