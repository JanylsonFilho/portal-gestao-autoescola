# Bloco 2 - PDF Premium e Ajustes Finais do Dashboard Publico

## Objetivo

Implementar a segunda leva do pente fino visual e funcional, focando em:

- substituir o PDF atual baseado em `window.print()` por um relatorio PDF com layout proprio
- manter a identidade visual premium do dashboard, agora adaptada para A4
- consolidar os ajustes finais do dashboard publico do aluno
- garantir que a URL publica final use o telefone do aluno
- fechar os detalhes de paginacao que impactam a leitura e a exportacao

Este bloco nao cobre ainda a modelagem de perfis `admin` e `instrutor`, cadastro de usuarios com permissao diferenciada ou gestao administrativa.

## Problema Atual

Hoje o PDF e apenas a impressao da pagina publica do aluno.

Isso gera problemas claros:

- o layout de tela nao foi pensado para A4
- o PDF herda controles e estruturas de navegacao desnecessarias
- a distribuicao dos blocos quebra de forma ruim entre paginas
- a hierarquia visual do relatorio nao fica no mesmo nivel do dashboard premium desejado
- o PDF ainda carrega vestigios de um fluxo antigo, inclusive exemplo com token em URL

O cliente quer um relatorio com cara propria, com o mesmo padrao visual do dashboard, mas adaptado para impressao profissional.

## Direcao Validada

### Estrategia escolhida

Criar um layout proprio de relatorio PDF, separado da tela do dashboard publico.

Decisao:

- o dashboard publico continua sendo a experiencia interativa para celular e navegador
- o PDF deixa de ser um print da tela e passa a ser uma composicao pensada para A4
- os dois compartilham os mesmos dados e a mesma identidade visual, mas nao a mesma estrutura de layout

### Consequencia pratica

Nao vamos tentar “forcar” o dashboard responsivo a parecer bom no PDF.

Em vez disso:

- a pagina publica continua otimizada para leitura em tela
- a exportacao gera um relatorio com seções e quebras de pagina controladas

## Escopo Funcional

### 1. Relatorio PDF proprio

O PDF deve deixar de ser uma copia literal da tela publica.

Ele deve usar:

- formato A4
- blocos com espacamento previsivel
- contraste proximo ao dashboard premium
- cards e secoes com moldura, dourado e fundo escuro em tons diferenciados
- tipografia legivel em impressao e exportacao

### 2. Identidade visual do PDF

O relatorio precisa seguir o padrao premium do dashboard.

Diretrizes visuais:

- fundo escuro uniforme com pequenas variacoes de painel
- dourado como cor de destaque principal
- texto branco e off-white para leitura
- secoes com bordas e blocos mais claramente separadas do que hoje
- nada de visual “print cru” do navegador

A intencao nao e copiar pixel a pixel a tela publica, mas sim traduzir a mesma marca para um relatorio profissional.

### 3. Estrutura do PDF

O PDF deve ser organizado em secoes fixas.

#### Pagina 1

- cabecalho com marca da autoescola
- titulo do relatorio
- subtitulo explicando o objetivo do documento
- bloco-resumo com:
  - nome do aluno
  - categoria
  - instrutor
  - media atual
  - aulas realizadas
  - status
- grafico ou resumo visual de evolucao por aula

#### Paginas seguintes

- ficha de evolucao por aula
- duas aulas por pagina como referencia inicial, desde que caiba com boa legibilidade
- cada ficha com:
  - numero da aula
  - data
  - media da aula
  - notas por criterio
  - observacoes do instrutor

#### Secao final

- ultima avaliacao resumida, se fizer sentido manter
- ou apenas encerramento do relatorio com identificacao do link publico e data de geracao

Durante a implementacao, se a “ultima avaliacao” ficar redundante diante das fichas por aula, ela pode ser removida do PDF. O foco e legibilidade, nao repeticao.

### 4. Dashboard publico em tela

O dashboard publico continua existindo como tela separada do PDF.

Regras mantidas:

- rota publica por telefone
- sem botao de WhatsApp
- visual premium responsivo
- leitura boa no celular

Regras complementares do bloco 2:

- garantir que nenhum detalhe visual do fluxo antigo de print apareca no PDF
- revisar o texto e os blocos da pagina publica para ficarem coerentes com o relatorio

### 5. URL publica final

A URL publica precisa estar definitivamente consolidada com o telefone do aluno.

Exemplo esperado:

- `/aluno/5585989551746`

O PDF pode exibir essa URL no rodape ou em uma secao discreta de referencia, mas nunca com token antigo.

### 6. Paginacao relacionada ao bloco

Este bloco considera validas as paginacoes ja iniciadas, mas faz o acabamento final para leitura.

Inclui:

- ficha do dashboard publico paginada com leitura mais limpa
- lista de alunos com paginacao coerente no painel
- relatorio PDF com quebras de pagina controladas, independentes da paginacao da tela

Importante:

- a paginacao do PDF nao precisa replicar a mesma paginacao visual da tela
- o PDF deve priorizar boa distribuicao em folhas A4

## Ajustes Tecnicos Necessarios

### Frontend

Arquivos provavelmente impactados:

- `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`
- componentes novos para relatorio PDF, se necessario
- estilos globais ou estilos de impressao especificos
- utilitarios de exportacao/impressao

Possiveis novos arquivos:

- componente dedicado de relatorio PDF
- componente de ficha de aula para PDF
- helper de quebra de pagina / modo de impressao

### Estrategia de geracao

O fluxo atual usa `window.print()`.

Neste bloco, o `window.print()` pode continuar como gatilho final do navegador, mas deve apontar para uma estrutura dedicada de impressao, e nao mais para o dashboard interativo bruto.

Ou seja:

- nao necessariamente trocar o mecanismo de impressao nesta fase
- mas obrigatoriamente trocar o layout que sera impresso

### Backend

Nao deve haver mudanca estrutural obrigatoria no backend para este bloco, desde que os dados atuais do dashboard publico ja sejam suficientes.

Se faltar algum dado essencial para o relatorio, o backend pode ser expandido pontualmente, sem reabrir a arquitetura.

## Decisoes de Implementacao

### Separacao entre tela e impressao

O dashboard publico e o PDF passam a ser duas apresentacoes do mesmo conjunto de dados.

Isso evita:

- hacks de CSS para esconder metade da tela na impressao
- quebra imprevisivel de cards
- perda de qualidade visual

### Prioridade de legibilidade

No PDF, legibilidade vale mais do que reproduzir exatamente a composicao da tela.

Exemplos:

- um bloco pode mudar de largura
- um grafico pode ser simplificado
- uma secao pode mudar de ordem

Desde que a identidade premium e a leitura profissional sejam preservadas.

### Quebra de pagina controlada

As fichas por aula devem respeitar limites de altura e evitar partir uma mesma aula no meio da pagina sempre que possivel.

Se necessario:

- uma aula ocupa um bloco fechado
- as aulas seguintes comecam na proxima area disponivel

### Cores e contraste

As cores secundarias do PDF devem seguir a referencia premium do dashboard:

- nao pode ficar tudo no mesmo tom escuro
- os paines devem ter separacao clara
- o dourado deve destacar metricas e titulos
- o fundo precisa sustentar contraste sem matar a leitura

## Criterios de Aceite

- o PDF nao pode mais ser um print cru da tela publica
- o relatorio PDF deve ter layout proprio
- o PDF deve usar a identidade premium do dashboard
- o PDF deve ficar legivel em A4
- as fichas por aula devem ser distribuidas com boa quebra de pagina
- o botao de WhatsApp continua ausente do dashboard publico
- a URL publica no dashboard e no PDF usa telefone, nao token
- o dashboard publico continua responsivo e limpo no celular
- o visual do PDF deve ser percebido como relatorio profissional, nao captura de pagina

## Riscos e Mitigacao

### Risco 1: tentar reaproveitar demais o layout da tela

Mitigacao:

- separar componente de tela e componente de impressao
- compartilhar dados, nao composicao

### Risco 2: PDF bonito em tela, mas ruim ao imprimir

Mitigacao:

- testar exportacao real em A4
- validar contraste, margens e quebras de pagina

### Risco 3: excesso de informacao por pagina

Mitigacao:

- limitar quantidade de fichas por folha
- manter secoes compactas e hierarquia clara

### Risco 4: visual premium perder qualidade no PDF

Mitigacao:

- usar os mesmos principios de cor, contraste e moldura do dashboard
- adaptar formas e blocos ao A4 em vez de apenas redimensionar a tela
