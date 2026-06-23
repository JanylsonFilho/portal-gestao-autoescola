# Dashboard do Aluno por Aula e Painel Interno Pratico

## Objetivo

Ajustar o sistema para obedecer ao fluxo validado pelo cliente:

- o instrutor usa uma area interna pratica e objetiva
- o aluno acessa um dashboard individual por link
- esse dashboard individual precisa mostrar a evolucao por aula, e nao apenas um resumo total

Tambem corrigir as quebras atuais de renderizacao no dashboard publico e remover siglas confusas da experiencia interna.

## Contexto do Cliente

O cliente deixou claro que:

- quer uma ficha de evolucao por aula
- isso nao pode atrapalhar o processo interno do instrutor
- a parte administrativa deve ser pratica
- o dashboard do aluno deve mostrar evolucao e pontos de melhoria

Fluxo esperado:

1. Instrutor faz login
2. Ve lista de alunos
3. Cadastra novo aluno ou escolhe aluno existente
4. Clica em `Nova avaliacao`
5. Preenche notas dos quesitos e observacoes
6. Salva a avaliacao
7. Sistema atualiza media e dashboard
8. Instrutor copia o link
9. Aluno recebe o link
10. Aluno visualiza a propria evolucao por aula

## Problemas Atuais

### 1. Dashboard publico quebra ao abrir

O frontend ainda assume que varios campos numericos sempre chegam como `number` e chama `toFixed()` diretamente em valores que podem vir como texto serializado do backend. Isso derruba a tela publica.

### 2. Siglas confusas na interface interna

Ainda existem siglas como:

- `CP`
- `VW`
- `+`
- e marcadores numericos que nao agregam significado real

Isso prejudica a clareza e passa uma sensacao de interface inacabada.

### 3. Pagina interna do aluno esta resumida demais

Hoje `/alunos/:id` mostra historico compacto, mas nao mostra claramente a ficha de evolucao por aula com os criterios da avaliacao.

### 4. Dashboard publico ainda nao esta totalmente orientado por aula

Apesar de existir grafico e lista, a pagina ainda precisa assumir com mais forca a funcao de ficha visual individual por aula, com clareza sobre:

- data
- media da aula
- notas de cada criterio
- observacoes
- tendencia de evolucao

## Decisao de Produto

Separar bem os dois papeis:

### Area do instrutor

Deve ser pratica, administrativa e objetiva.

Principios:

- menos ornamento
- acoes claras
- textos completos sem siglas
- leitura rapida
- responsividade forte no celular

### Dashboard publico do aluno

Deve ser o artefato principal de acompanhamento.

Principios:

- visual premium
- foco em evolucao por aula
- leitura facil no celular
- cada aula apresentada como bloco proprio
- criterios e observacoes visiveis
- medias e status em destaque

## Estrutura Funcional Esperada

### `/alunos/:id`

Pagina interna do instrutor para administracao do aluno.

Deve mostrar:

- nome
- whatsapp
- categoria
- instrutor
- quantidade de aulas feitas
- total previsto
- media geral
- status
- botoes claros:
  - `Nova avaliacao`
  - `Copiar link do dashboard`
  - `Ver dashboard do aluno`

Historico interno:

- listar aulas registradas
- mostrar media de cada aula
- mostrar observacoes
- opcionalmente mostrar os criterios da aula em bloco compacto

Objetivo:

- apoiar o instrutor
- nao competir visualmente com o dashboard publico

### `/aluno/:publicToken`

Pagina publica do aluno.

Deve mostrar:

- nome do aluno
- categoria
- instrutor responsavel
- aulas feitas
- total de aulas
- media geral
- status
- grafico de evolucao
- ficha por aula com:
  - numero da aula
  - data
  - media da aula
  - notas de cada criterio
  - observacoes

O layout precisa deixar claro que o aluno esta vendo uma trilha de evolucao aula a aula.

## Ajustes Tecnicos Necessarios

### Frontend

- normalizar valores numericos antes de usar `toFixed()`
- remover siglas restantes da interface interna
- revisar `StudentDetails` para deixar os botoes e blocos mais claros
- reforcar `PublicStudentDashboard` como ficha por aula
- tornar a pagina publica mais resiliente a tipos vindos da API

### Backend

- garantir que valores numericos retornados ao frontend sejam consistentes
- manter medias e notas serializadas de forma segura para consumo no React

## Responsabilidades por Tela

### StudentDetails

- pagina do instrutor
- foco operacional
- acesso rapido ao historico e ao link publico

### PublicStudentDashboard

- pagina do aluno
- foco em compreensao da propria evolucao
- linguagem mais visual e explicativa

## Responsividade

### Mobile

- cards empilhados em ordem clara
- blocos por aula com leitura vertical
- botoes grandes e legiveis
- criterios distribuidos em grade simples

### Desktop

- cabecalho com metricas
- historico por aula com melhor uso do espaco
- grafico e fichas sem poluicao visual

## Validacao

Ao final:

- `/aluno/:publicToken` deve abrir sem crash
- `/alunos/:id` deve abrir sem siglas confusas
- o dashboard publico deve mostrar evolucao por aula de forma clara
- o fluxo de salvar avaliacao -> copiar link -> abrir dashboard deve funcionar
- frontend deve buildar
- backend deve manter testes e build funcionais

## Riscos e Mitigacao

### Risco 1: tipos inconsistentes da API

Mitigacao:

- normalizar numericos no backend e proteger o frontend

### Risco 2: excesso de informacao na pagina interna

Mitigacao:

- manter detalhes profundos principalmente no dashboard publico
- deixar a pagina do instrutor administrativa

### Risco 3: visual bonito mas pouco pratico no celular

Mitigacao:

- priorizar empilhamento claro e componentes legiveis no mobile
