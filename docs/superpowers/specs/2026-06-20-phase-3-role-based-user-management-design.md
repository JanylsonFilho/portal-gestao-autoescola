# Phase 3 Role-Based User Management Design

## Objetivo

Adicionar diferenciacao real entre usuarios do painel, permitindo:

- `admin` cadastrar novos `admins` e novos `instrutores`
- `admin` editar qualquer usuario do painel
- `instrutor` editar apenas os proprios dados
- manter o login, o painel e a experiencia atual com o menor impacto estrutural possivel

Esta fase fecha a parte administrativa que hoje ainda esta livre para qualquer usuario autenticado.

## Escopo desta fase

Esta fase cobre:

- modelagem de perfil com `role`
- ajuste do login e do payload autenticado
- controle de permissao no backend
- adaptacao da tela `Configuracoes`
- fluxo de edicao de usuarios do painel
- fluxo de edicao do proprio perfil

Esta fase nao cobre:

- multiempresa
- permissao granular por acao alem de `admin` x `instrutor`
- redefinicao de senha por email
- auditoria completa de alteracoes

## Decisao de arquitetura

### Opcao escolhida

Manter a estrutura atual baseada em `instructors`, adicionando um campo `role` na mesma tabela.

Valores previstos:

- `admin`
- `instructor`

### Motivo da escolha

O projeto ja possui:

- autenticacao baseada em `instructor`
- relacao de alunos com `instructor_id`
- tipagem e telas montadas em cima desse conceito

Criar uma nova tabela `users` agora aumentaria muito o custo e o risco desta fase. A opcao aprovada preserva a estrutura funcional atual e adiciona apenas a camada de permissao necessaria.

### Consequencia consciente

Nem todo registro da tabela `instructors` sera literalmente um instrutor operacional. Mesmo assim, o ganho de simplicidade compensa nesta fase.

Como contrapartida, o codigo deve ficar semanticamente claro:

- `role` define permissao
- `category` continua definindo contexto operacional
- usuarios `admin` tambem continuam sendo registros autenticaveis do painel

## Regras de negocio

### Perfis

#### `admin`

Pode:

- acessar `Configuracoes`
- ver a lista completa de usuarios do painel
- cadastrar novos `admins`
- cadastrar novos `instrutores`
- editar nome, usuario, categoria, role e senha de qualquer usuario
- editar os proprios dados

Nao ha diferenciacao entre admins neste momento.

#### `instructor`

Pode:

- fazer login normalmente
- usar as areas operacionais do painel
- editar apenas os proprios dados
- alterar a propria senha

Nao pode:

- listar todos os usuarios do painel
- cadastrar novos usuarios
- editar outro usuario
- promover ou rebaixar perfis

## Banco de dados

### Alteracao principal

Adicionar coluna `role` na tabela `instructors`.

Representacao recomendada:

- `VARCHAR(20)` com valores controlados pela aplicacao

Valor padrao:

- `instructor`

### Regra de compatibilidade

Todos os registros antigos devem permanecer validos apos a migracao:

- se nao houver `role`, a migracao define `instructor`

### Integridade esperada

- `username` continua unico
- `role` deve aceitar apenas valores previstos

Se o banco nao usar `CHECK`, a validacao deve ficar garantida no backend.

## Backend

### Tipagem

Criar uma representacao tipada de papel de usuario:

- `admin`
- `instructor`

Essa tipagem deve aparecer em:

- interfaces
- services
- controllers
- payload autenticado

### Autenticacao

O login continua usando:

- `username`
- `password`

Mas a resposta de login e o perfil retornado por `/auth/me` passam a incluir:

- `role`

O token JWT pode continuar com `sub`, mas o middleware deve sempre montar `req.instructor` com o perfil completo do usuario autenticado, incluindo `role`.

### Regras de autorizacao

Adicionar protecao explicita por perfil.

Rotas administrativas:

- listar usuarios do painel
- criar usuario do painel
- editar usuario do painel

Exigem:

- `role === "admin"`

Rotas de perfil proprio:

- ler proprio perfil
- editar proprio perfil
- alterar propria senha

Exigem apenas autenticacao.

### Organizacao recomendada

Para evitar logica espalhada:

- manter `authMiddleware` para autenticacao
- adicionar middleware utilitario para autorizacao por role, como `requireRole("admin")`

### Operacoes novas

#### Listagem de usuarios do painel

Retorna todos os usuarios com campos publicos:

- `id`
- `name`
- `username`
- `category`
- `role`
- `created_at`
- `updated_at`

#### Cadastro de usuario do painel

Disponivel apenas para admin.

Payload:

- `name`
- `username`
- `password`
- `category`
- `role`

Validacoes:

- nome obrigatorio
- usuario obrigatorio
- senha obrigatoria
- categoria obrigatoria
- role obrigatorio e valido
- usuario nao pode duplicar

#### Edicao de usuario do painel por admin

Disponivel apenas para admin.

Permite alterar:

- nome
- username
- categoria
- role
- senha opcional

Regras:

- se a senha nao vier preenchida, nao altera a senha atual
- se `username` pertencer a outro usuario, retornar erro especifico

#### Edicao do proprio perfil

Disponivel para qualquer autenticado.

Permite alterar:

- nome
- username
- categoria
- senha opcional

Nao permite alterar:

- o proprio `role`

### Casos especiais

#### Admin editando a si mesmo

Permitido.

#### Admin mudando outro usuario para `admin`

Permitido.

#### Instructor tentando editar outro usuario

Deve receber erro de permissao claro, sem fallback generico.

#### Instructor tentando alterar `role` no proprio payload

O backend deve ignorar ou rejeitar explicitamente. A recomendacao aqui e rejeitar com erro claro para evitar ambiguidade.

## Frontend

### Modelo autenticado

O contexto de autenticacao deve passar a conhecer:

- `role`

Isso permite:

- controlar o conteudo da tela `Configuracoes`
- proteger acoes visiveis
- ajustar textos da interface

### Tela `Configuracoes`

Ela deixa de ser uma tela unica de “cadastro livre de instrutores” e passa a ser uma area orientada por perfil.

#### Se usuario for `admin`

Mostrar:

- resumo da equipe
- formulario de cadastro de usuario do painel
- seletor de `role`
- lista de usuarios cadastrados
- acao de editar usuario
- secao secundaria para editar o proprio perfil

O texto da tela deve deixar claro que ali se gerencia acessos do painel, nao apenas instrutores.

#### Se usuario for `instructor`

Mostrar apenas:

- dados do proprio perfil
- formulario para atualizar nome, usuario, categoria
- campo opcional para troca de senha

Nao mostrar:

- lista de usuarios
- formulario de criacao
- seletor de perfil
- metricas administrativas

### Edicao de usuario por admin

Recomendacao de UX:

- manter na propria tela `Configuracoes`
- abrir em bloco lateral, modal ou secao expansivel

Para esta fase, a abordagem mais simples e robusta e:

- um card de edicao inline ou modal simples

Objetivo:

- evitar criar uma tela separada sem necessidade
- manter o admin dentro do fluxo da lista de usuarios

### Edicao do proprio perfil

Deve existir tanto para:

- `admin`
- `instructor`

No caso de `admin`, pode viver na mesma tela `Configuracoes`, abaixo da gestao de usuarios.

No caso de `instructor`, essa passa a ser a tela principal de `Configuracoes`.

## Navegacao e permissao visual

### Menu lateral

O item `Configuracoes` permanece visivel para usuarios autenticados.

Motivo:

- o `admin` entra para gerenciar acessos
- o `instructor` entra para editar o proprio perfil

Assim evitamos:

- duplicar itens de menu
- criar uma rota nova apenas para “Meu perfil”

### Protecao de acoes

Mesmo quando o frontend esconder botoes, o backend continua sendo a fonte de verdade da permissao.

## Mensagens e feedbacks

Seguindo o padrao ja definido no projeto:

- nada de erro generico quando a causa for conhecida

Exemplos esperados:

- `Ja existe um usuario com esse login`
- `Voce nao tem permissao para cadastrar usuarios do painel`
- `Voce nao pode alterar o perfil de acesso da sua propria conta`
- `Nao foi possivel atualizar este usuario`

O frontend deve mapear essas mensagens de forma clara e direta ao usuario.

## Impactos na UI existente

Os pontos que precisam mudar semanticamente:

- `Cadastro de instrutores` vira algo como `Usuarios do painel`
- `Salvar instrutor` vira `Salvar usuario`
- `Instrutores cadastrados` vira `Usuarios cadastrados`
- a metrica `Fluxo atual livre` deixa de fazer sentido e deve refletir o novo controle por perfil

## Testes esperados

### Backend

- login retorna `role`
- `/auth/me` retorna `role`
- admin consegue listar usuarios
- instructor nao consegue listar usuarios
- admin consegue criar `admin`
- admin consegue criar `instructor`
- instructor nao consegue criar usuarios
- admin consegue editar outro usuario
- instructor nao consegue editar outro usuario
- usuario consegue editar o proprio perfil
- usuario nao consegue alterar o proprio `role`
- duplicidade de `username` retorna erro especifico

### Frontend

- tela `Configuracoes` muda conforme `role`
- admin ve lista e formulario de criacao
- instructor ve apenas o proprio perfil
- formulario de admin envia `role`
- feedbacks de erro aparecem de forma especifica

## Riscos e cuidados

### Semantica do nome `Instructor`

Como nem todo usuario sera operacionalmente instrutor, o nome atual pode causar confusao futuras. Nesta fase isso e aceitavel, mas o codigo novo deve reduzir esse ruído sempre que possivel em labels e copy de interface.

### Auto-rebaixamento de admin

Para nao criar situacoes confusas, a recomendacao desta fase e:

- permitir que o admin edite o proprio perfil
- nao permitir que ele altere o proprio `role` para `instructor`

Isso evita perda acidental de acesso administrativo.

### Categoria em admin

Para reduzir impacto estrutural, `category` continua obrigatoria para todos os usuarios do painel nesta fase.

Isso significa que admins tambem terao categoria cadastrada, mesmo que nem sempre a usem operacionalmente.

## Resultado esperado

Ao final desta fase:

- o painel deixa de ter administracao livre para qualquer autenticado
- o dono da autoescola pode gerenciar acessos diretamente pela interface
- instrutores comuns continuam com experiencia simples
- o sistema passa a ter base clara para futuras permissoes sem reestruturar tudo agora
