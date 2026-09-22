---
translationId: 2e191919-1919-4919-8919-191919191919
articleId: e0191919-1919-4919-8919-191919191919
locale: pt-BR
slug: mvp-landing-typescript
title: "MVP e landing com TypeScript: do problema à primeira release pública"
description: "Um guia prático para transformar um problema em MVP publicável, modelar estados com TypeScript, criar landing page, automatizar CI e publicar uma release v0.1 com evidências profissionais."
status: published
---

# MVP e landing com TypeScript: do problema à primeira release pública

Construir um MVP não significa terminar uma aplicação pela metade.

Um MVP precisa provar alguma coisa.

Pode provar que um fluxo principal funciona.

Pode provar que uma hipótese de produto é compreensível.

Pode provar que uma pessoa consegue usar a solução sem explicação privada.

Pode provar que uma arquitetura mínima suporta uma entrega real.

Pode provar que o projeto possui qualidade suficiente para receber feedback sem que cada nova mudança quebre o comportamento anterior.

Neste ciclo, a entrega deixa de ser apenas estudo técnico.

Você vai transformar conhecimento em um pequeno produto público.

O objetivo é sair de:

> "Eu tenho um repositório com código."

para:

> "Eu tenho uma primeira versão limitada, executável, documentada, testada, publicada e explicada para alguém que não participou do desenvolvimento."

O ciclo combina:

- definição de problema;
- recorte de público;
- escopo de MVP;
- TypeScript aplicado ao domínio;
- landing page;
- demonstração;
- testes;
- CI;
- documentação;
- release `v0.1`;
- evidência para portfólio.

> O MVP não precisa provar que o produto inteiro dará certo. Precisa provar claramente qual problema você decidiu atacar, qual fluxo entregou e quais limites conscientemente ficaram de fora.

<!-- VISUAL:
Problema -> Público -> Hipótese -> Fluxo mínimo -> Implementação -> Testes -> CI -> Landing -> Release v0.1 -> Feedback.
Abaixo: "o que entrou" e "o que ficou fora".
-->

## O problema que guia o laboratório

Imagine um produto simples para registrar e acompanhar solicitações técnicas internas.

O problema:

> analistas recebem demandas repetidas, registram contexto de formas diferentes e gastam tempo descobrindo se algo semelhante já foi resolvido.

O MVP não precisa incluir:

- inteligência artificial;
- recomendação automática;
- autenticação corporativa;
- dashboards avançados;
- permissões complexas;
- integração com várias plataformas;
- cobrança.

O fluxo mínimo pode ser:

1. cadastrar um problema;
2. classificar o status;
3. registrar uma solução;
4. consultar itens existentes;
5. visualizar detalhes;
6. demonstrar claramente o benefício.

Esse recorte é pequeno o suficiente para uma `v0.1`.

## Comece pelo problema, não pela stack

Ruim:

> Vou criar um projeto com React, Node, PostgreSQL, Docker e Clean Architecture.

Melhor:

> Quero permitir que um analista registre e encontre soluções anteriores com um fluxo simples e reproduzível.

A stack serve ao experimento.

O problema define o produto.

Antes de codificar, escreva:

```text
Problema:
______________________________________

Público:
______________________________________

Situação atual:
______________________________________

Custo atual:
______________________________________

Resultado desejado:
______________________________________

Hipótese do MVP:
______________________________________
```

## Exemplo

```text
Problema:
soluções anteriores ficam difíceis de localizar.

Público:
analistas técnicos.

Situação atual:
o conhecimento está distribuído em chamados e comentários.

Custo atual:
tempo gasto reconstruindo contexto.

Resultado desejado:
registrar e consultar soluções anteriores em um fluxo simples.

Hipótese:
se o conhecimento for estruturado por problema, status e solução,
o analista consegue reutilizar informação sem depender de memória individual.
```

Ainda não há tecnologia.

Isso é intencional.

## MVP não é lista de features

Uma lista assim é perigosa:

```text
login
dashboard
admin
AI
notificação
filtro
chat
analytics
perfil
tema
exportação
```

Isso não define valor.

Defina um fluxo.

```text
Usuário entra
 -> cria um registro
 -> descreve problema
 -> marca status
 -> adiciona solução
 -> encontra registro depois
```

O MVP deve proteger esse caminho.

## Defina o que fica fora

Crie:

```md
## Out of scope — v0.1

- SSO
- permissões por equipe
- IA
- busca vetorial
- notificações
- importação automática
- aplicativo mobile
- analytics avançado
```

Isso é parte da engenharia.

Escopo explícito reduz mudança descontrolada.

## Critério de sucesso da v0.1

Exemplo:

```text
Uma pessoa deve conseguir:

1. abrir a landing;
2. entender o problema em menos de um minuto;
3. acessar a demonstração;
4. cadastrar um registro válido;
5. consultar o registro;
6. abrir a solução;
7. voltar ao GitHub e reproduzir o projeto pelo README.
```

Esse critério é melhor que:

> "terminar o frontend."

## Modele o MVP antes de criar telas

Comece pelos estados principais.

Versão fraca:

```ts
type Ticket = {
  id: string;
  status: string;
  title: string;
  description?: string;
  solution?: string;
  closedAt?: Date;
};
```

O tipo permite:

```ts
{
  status: "open",
  solution: "Fixed",
  closedAt: new Date()
}
```

O sistema aceita uma combinação contraditória.

## Modele estados válidos

```ts
type OpenTicket = {
  id: string;
  status: "open";
  title: string;
  description: string;
};

type ResolvedTicket = {
  id: string;
  status: "resolved";
  title: string;
  description: string;
  solution: string;
  resolvedAt: Date;
};

type Ticket =
  | OpenTicket
  | ResolvedTicket;
```

Agora:

```ts
function renderTicket(ticket: Ticket) {
  if (ticket.status === "resolved") {
    console.log(ticket.solution);
  }
}
```

O compilador usa o discriminante para narrowing.

## O benefício não é "usar union"

O benefício é:

> um ticket aberto não carrega campos que só fazem sentido depois da resolução.

Esse tipo de modelagem reduz estados inválidos antes do runtime.

## Evite `any` na fronteira

Landing e MVP normalmente recebem dados de:

- formulário;
- URL;
- API;
- storage;
- JSON;
- analytics;
- query string.

Entrada externa deve ser tratada como não confiável.

Ruim:

```ts
async function createTicket(
  input: any,
): Promise<Ticket> {
  return repository.save(input);
}
```

Melhor:

```ts
async function createTicket(
  input: unknown,
): Promise<Ticket> {
  const command =
    parseCreateTicketInput(input);

  return service.execute(command);
}
```

`unknown` obriga validação antes do uso.

## Narrowing

```ts
type CreateTicketInput = {
  title: string;
  description: string;
};

function parseCreateTicketInput(
  input: unknown,
): CreateTicketInput {
  if (
    typeof input !== "object" ||
    input === null
  ) {
    throw new Error("Invalid input");
  }

  const record =
    input as Record<string, unknown>;

  if (
    typeof record.title !== "string" ||
    typeof record.description !== "string"
  ) {
    throw new Error("Invalid input");
  }

  return {
    title: record.title,
    description: record.description,
  };
}
```

Em uma aplicação real, uma biblioteca de schema pode ser apropriada.

O conceito continua o mesmo:

```text
unknown
 -> validação
 -> tipo confiável
```

## `never` para estados esquecidos

Imagine:

```ts
type TicketStatus =
  | "open"
  | "resolved"
  | "archived";
```

Função:

```ts
function labelStatus(
  status: TicketStatus,
): string {
  switch (status) {
    case "open":
      return "Open";

    case "resolved":
      return "Resolved";

    case "archived":
      return "Archived";

    default:
      return assertNever(status);
  }
}

function assertNever(
  value: never,
): never {
  throw new Error(
    `Unhandled value: ${String(value)}`,
  );
}
```

Ao adicionar:

```ts
| "in_review"
```

o compilador passa a apontar locais não exaustivos.

Isso é útil em um MVP porque o produto muda rápido.

## Mudança rápida não justifica tipos fracos

Existe uma ideia comum:

> "Como é MVP, vou usar any e arrumar depois."

O problema é que MVP muda mais que produto estável.

Estados e contratos mudam rapidamente.

Tipos úteis podem tornar essas mudanças mais seguras.

O objetivo não é criar o sistema de tipos mais sofisticado possível.

É tornar mudanças importantes visíveis.

## Generics: reutilize relação, não abstração vazia

Exemplo:

```ts
type ApiResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };
```

Agora:

```ts
type CreateTicketResult =
  ApiResult<Ticket>;

type ListTicketsResult =
  ApiResult<Ticket[]>;
```

O generic preserva uma relação útil.

## Generic desnecessário

Evite:

```ts
type Entity<
  TId,
  TStatus,
  TMetadata,
  TCreatedAt,
> = {
  id: TId;
  status: TStatus;
  metadata: TMetadata;
  createdAt: TCreatedAt;
};
```

se o produto possui um único caso simples.

Pergunte:

> qual duplicação ou relação esse generic realmente resolve?

## Utility types

TypeScript oferece utility types úteis. citeturn554786search0

Exemplo:

```ts
type TicketPreview =
  Pick<
    ResolvedTicket,
    "id" | "title" | "status"
  >;
```

Outro:

```ts
type TicketPatch =
  Partial<
    Pick<
      ResolvedTicket,
      "title" | "description"
    >
  >;
```

Não use `Partial<Ticket>` automaticamente para update.

Isso pode liberar mudanças inválidas em campos que não deveriam ser editáveis.

## Modelando ações

Em vez de:

```ts
updateTicket(
  id: string,
  data: Partial<Ticket>,
);
```

considere ações explícitas:

```ts
type UpdateTicketCommand =
  | {
      type: "rename";
      title: string;
    }
  | {
      type: "change-description";
      description: string;
    }
  | {
      type: "resolve";
      solution: string;
    };
```

Agora regras diferentes ficam visíveis.

## Escopo mínimo do repository

Estrutura sugerida:

```text
mvp-landing-lab/
  apps/
    web/
    api/
  packages/
    domain/
    contracts/
  tests/
    unit/
    integration/
    contract/
    e2e/
  docs/
    decisions/
    release/
    screenshots/
  .github/
    workflows/
      ci.yml
  README.md
```

Se o MVP for frontend-only, simplifique.

Não crie backend apenas para cumprir arquitetura.

## Uma versão ainda mais simples

```text
mvp-landing-lab/
  src/
    domain/
    features/
    pages/
    components/
  tests/
  public/
  docs/
  .github/workflows/
  README.md
```

Arquitetura deve acompanhar a necessidade real.

## Landing page como interface do produto

A landing deve responder:

1. qual problema existe?
2. para quem?
3. o que o MVP faz?
4. como funciona?
5. onde posso testar?
6. por que eu deveria confiar?
7. como entro em contato?

## Estrutura sugerida

```text
Hero
Problema
Para quem é
Como funciona
Demonstração
Limites da v0.1
Tecnologia/evidência
CTA
Contato
```

## Hero

Evite:

> Revolucionando a gestão com tecnologia de ponta.

Isso não comunica nada.

Prefira:

> Registre soluções técnicas e encontre respostas anteriores sem reconstruir o mesmo contexto toda vez.

Subtexto:

> Um MVP para organizar problemas, soluções e histórico de resolução em um fluxo simples.

CTA:

```text
Ver demonstração
```

Secundário:

```text
Ver GitHub
```

## Seção do problema

Exemplo:

> Chamados parecidos aparecem novamente, mas o conhecimento da resolução costuma ficar preso em comentários, histórico ou memória de quem resolveu. O MVP organiza problema e solução em registros consultáveis.

Não prometa mais do que o MVP entrega.

## Público

```text
Para analistas que:

- atendem problemas recorrentes;
- precisam recuperar contexto anterior;
- querem registrar solução de forma estruturada.
```

O público não precisa ser enorme.

Precisa ser claro.

## Como funciona

Use três passos.

```text
1. Registre o problema.
2. Adicione a solução quando resolver.
3. Consulte o histórico quando algo parecido acontecer.
```

A landing não precisa explicar a arquitetura.

## Demonstração

Mostre:

- screenshot;
- GIF;
- vídeo curto;
- demo pública.

Se a demo exigir setup local:

```text
Ver instruções no GitHub
```

Não esconda que é uma v0.1.

## Estado da release

Inclua:

```text
v0.1 — MVP experimental
```

E:

```text
Inclui:
- cadastro;
- consulta;
- resolução.

Ainda não inclui:
- IA;
- autenticação corporativa;
- integrações externas.
```

Isso cria expectativa correta.

## CTA

O CTA deve refletir a fase do produto.

Exemplos:

```text
Testar o MVP
```

```text
Ver código
```

```text
Enviar feedback
```

```text
Falar sobre o projeto
```

Evite CTA comercial forte se o objetivo ainda é validação.

## Chamada para contato

Inclua:

```text
Encontrou um caso em que o fluxo não funciona?
Quer discutir a arquitetura ou sugerir uma melhoria?
Entre em contato.
```

Isso transforma a landing em canal de aprendizado.

## O MVP precisa de uma história

A landing e o README devem contar a mesma história.

Landing:

```text
problema -> valor -> demo
```

README:

```text
problema -> arquitetura -> setup -> testes -> limites
```

Portfólio:

```text
problema -> decisão -> evidência -> impacto
```

Evite três narrativas diferentes.

## Testes unitários

Use para regras puras:

```ts
test(
  "resolved ticket requires solution",
  () => {
    assert.throws(
      () => resolveTicket(
        openTicket,
        "",
      ),
    );
  },
);
```

## Teste de integração

Use para fronteiras reais:

```text
repository + database
API + validator
storage + mapper
```

Se o MVP é apenas frontend, integração pode envolver:

```text
form -> state -> storage
```

## Teste de contrato

Proteja:

- payload da API;
- formato de storage;
- resposta pública;
- schema compartilhado.

Exemplo:

```ts
test(
  "create ticket response keeps contract",
  async () => {
    const response =
      await client.createTicket(validInput);

    assert.equal(
      typeof response.id,
      "string",
    );
  },
);
```

## E2E

Proteja o fluxo principal:

```text
abrir app
 -> criar ticket
 -> visualizar
 -> resolver
 -> consultar
```

Não tente cobrir toda variação no e2e.

## CI em cada pull request

A documentação do GitHub Actions recomenda workflows versionados no repository e oferece templates para CI. citeturn640288search8turn640288search7

Arquivo:

```text
.github/workflows/ci.yml
```

Exemplo:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

Use versões compatíveis com o projeto real.

O importante é que PR não dependa apenas de confiança manual.

## O pipeline mínimo

```text
install
 -> typecheck
 -> lint
 -> tests
 -> build
```

Se houver e2e leve:

```text
 -> e2e
```

## CI não substitui revisão

CI responde:

> o conjunto automatizado passou?

Não responde:

- o escopo faz sentido?
- o nome está bom?
- a abstração é necessária?
- a landing comunica valor?
- o teste está realmente forte?

Automação protege o mecânico.

Revisão protege decisão.

## Badge

README:

```md
![CI](...)
```

O badge é útil porque mostra estado do projeto.

Não use badge como decoração.

## Branch protection

Quando fizer sentido, configure `main` para aceitar mudança apenas com PR e checks.

Mesmo trabalhando sozinho, isso cria processo.

## Issue por mudança importante

Exemplo:

```text
feat: allow resolving a ticket with a documented solution
```

Descrição:

```text
Problem
Scope
Acceptance criteria
Out of scope
Test plan
```

Isso força escopo.

## Pull request

Título:

```text
feat: add ticket resolution flow
```

Descrição:

```text
Problem
What changed
Screenshots
Tests
Trade-offs
Out of scope
```

Inclua a landing quando visual.

## Refatoração durante MVP

MVP não significa não refatorar.

Significa refatorar o suficiente para continuar aprendendo sem transformar cada mudança em risco.

Sinal de refatoração necessária:

- mesma regra duplicada;
- `any` se espalhando;
- componente enorme;
- use case com várias dependências escondidas;
- testes difíceis;
- mudança simples toca muitos arquivos.

## Refatoração em pequenas etapas

Exemplo:

1. adicione teste;
2. tipar input;
3. trocar `any` por `unknown`;
4. extrair parser;
5. modelar estado;
6. atualizar UI;
7. manter contrato;
8. commit.

Isso cria histórico claro.

## Não faça rewrite perto da release

Se `v0.1` funciona, evite trocar:

- framework;
- state manager;
- test runner;
- arquitetura;
- banco;

sem necessidade.

Release pequena exige estabilidade.

## Release v0.1

GitHub Releases organiza versões a partir de tags e permite associar notas e artefatos à entrega. citeturn640288search0turn640288search2

Crie tag:

```text
v0.1.0
```

Mesmo que você chame informalmente de `v0.1`.

## Release notes

Estrutura:

```md
# v0.1.0

First public MVP.

## What is included

- create ticket
- list tickets
- resolve ticket
- view resolution
- public landing page

## What is not included

- authentication
- AI similarity
- external integrations

## How to run

See README.

## Known limitations

- local/demo persistence
- no multi-user permissions
- limited validation in ...
```

Release boa comunica limite.

## Por que `v0.1.0`

O versionamento semântico usa versões no formato `MAJOR.MINOR.PATCH`; versões `0.y.z` são normalmente usadas durante desenvolvimento inicial, quando a API ainda pode mudar rapidamente.

Para este ciclo:

```text
v0.1.0
```

é uma boa marca de primeira entrega pública limitada.

Não prometa estabilidade de `1.0`.

## Tag deve apontar para estado reproduzível

Antes da release:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Depois:

```text
tag
release notes
screenshots
demo
```

## Checklist de release

```text
□ README atualizado.
□ Setup validado.
□ CI verde.
□ Build passa.
□ Testes passam.
□ Escopo está descrito.
□ Limitações estão descritas.
□ Landing está publicada.
□ Demo funciona.
□ Tag criada.
□ Release notes publicadas.
□ Screenshots atuais.
□ Link de contato funciona.
```

## README profissional

Estrutura:

```text
# Nome

Problema
MVP v0.1
Demonstração
Features
Out of scope
Arquitetura
Modelagem TypeScript
Como executar
Testes
CI
Release
Roadmap
Limitações
English summary
```

## Resumo em inglês

```md
## English summary

This repository contains the first public MVP of a small
problem-resolution workflow.

The project focuses on a limited end-to-end flow:
creating a problem record, resolving it, and retrieving
the documented solution later.

TypeScript is used to model valid states, validate external
input, and make product changes safer.

The repository includes automated tests, CI on pull requests,
a public landing page, and a documented v0.1.0 release.
```

## Landing e TypeScript

Mesmo a landing pode se beneficiar de tipos.

Exemplo:

```ts
type Cta =
  | {
      kind: "demo";
      label: string;
      href: string;
    }
  | {
      kind: "contact";
      label: string;
      email: string;
    };
```

Render:

```ts
function renderCta(cta: Cta) {
  switch (cta.kind) {
    case "demo":
      return link(cta.href);

    case "contact":
      return mailto(cta.email);

    default:
      return assertNever(cta);
  }
}
```

O exemplo é pequeno, mas mostra modelagem real.

## Dados da landing

Evite:

```ts
const page: any = {
  hero: ...
};
```

Crie contratos simples:

```ts
type LandingContent = {
  hero: {
    title: string;
    description: string;
    primaryCta: Cta;
  };
  problem: {
    title: string;
    points: string[];
  };
  release: {
    version: `v${number}.${number}.${number}`;
    limitations: string[];
  };
};
```

Não transforme CMS local em sistema de tipos avançado.

## Estados da demo

A interface pode possuir:

```ts
type DemoState =
  | {
      status: "idle";
    }
  | {
      status: "loading";
    }
  | {
      status: "success";
      ticket: Ticket;
    }
  | {
      status: "error";
      message: string;
    };
```

Evite:

```ts
{
  loading: boolean;
  error?: string;
  ticket?: Ticket;
}
```

porque permite:

```text
loading=true
error existe
ticket existe
```

simultaneamente.

## Tipos como documentação de produto

Esse tipo:

```ts
type Ticket =
  | OpenTicket
  | ResolvedTicket;
```

documenta que o produto possui dois estados.

Quando surgir:

```ts
InReviewTicket
```

o compilador ajuda a localizar partes impactadas.

Isso torna TypeScript ferramenta de evolução do MVP.

## Tipos não substituem validação de runtime

TypeScript some no runtime.

Este código:

```ts
const ticket =
  JSON.parse(raw) as Ticket;
```

não valida nada.

Use parser/schema na borda.

Explique isso no artigo.

## Estados inválidos na UI

Ruim:

```ts
type FormState = {
  submitting: boolean;
  success: boolean;
  error?: string;
};
```

Melhor:

```ts
type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | {
      kind: "error";
      message: string;
    };
```

Agora a UI não precisa reconciliar flags contraditórias.

## Custo da modelagem

Uma union pode ficar grande:

```ts
type CheckoutState =
  | ...
  | ...
  | ...
```

Nem toda tela precisa virar máquina de estados formal.

Use quando:

- estados são mutuamente exclusivos;
- cada estado possui dados diferentes;
- erros de combinação são possíveis;
- a mudança é frequente.

## Compare duas abordagens

### Flags

```ts
loading
success
error
```

Vantagem:

- simples.

Falha:

- combinações inválidas.

### Discriminated union

```ts
kind: "idle" | "loading" | ...
```

Vantagem:

- estados explícitos.

Falha:

- mais código em estados triviais.

Registre contexto.

## `unknown` versus `any`

A documentação TypeScript descreve `unknown` como valor que precisa ser refinado antes de uso, enquanto `any` desativa grande parte da checagem. citeturn554786search1turn554786search3

No MVP:

```ts
const raw: unknown =
  await response.json();
```

é um lembrete de que API externa precisa ser validada.

## `never`

`never` representa estados que não deveriam ocorrer e funciona muito bem em exhaustive checking. citeturn554786search4turn554786search5

Use para detectar mudança incompleta.

Não use como truque de tipo sem benefício.

## Generics

Generics permitem preservar relações entre tipos, mas o compilador exige que operações sobre `T` sejam válidas para todos os valores permitidos. citeturn554786search2

No MVP:

```ts
type Paginated<T> = {
  items: T[];
  nextCursor?: string;
};
```

é justificável.

Isto pode não ser:

```ts
class UniversalService<
  TEntity,
  TDto,
  TResponse,
  TFilter,
  TSort,
> {}
```

## Teste que prova estado

```ts
test(
  "resolved ticket exposes solution",
  () => {
    const result =
      resolveTicket(
        openTicket,
        "Restarted worker",
      );

    assert.equal(
      result.status,
      "resolved",
    );

    assert.equal(
      result.solution,
      "Restarted worker",
    );
  },
);
```

## Teste de exhaustive behavior

Você não testa o compilador em runtime.

Mas pode guardar:

```ts
function statusLabel(
  ticket: Ticket,
): string {
  switch (ticket.status) {
    // ...
  }
}
```

e deixar typecheck no CI.

Adicionar novo estado quebra build até os pontos necessários serem atualizados.

Isso é evidência de manutenção segura.

## Landing como prova pública

A landing deve ter:

```text
problema
público
demonstração
release
GitHub
contato
```

Ela não precisa:

- fingir empresa;
- usar depoimentos inventados;
- prometer clientes;
- apresentar números inexistentes.

Um projeto de portfólio ganha credibilidade ao ser preciso.

## Copy da landing

Exemplo:

### Título

> Reutilize soluções anteriores em vez de reconstruir o mesmo contexto.

### Subtexto

> Um MVP para registrar problemas técnicos, documentar resoluções e consultar histórico em um fluxo simples.

### CTA

> Testar demonstração

Secundário:

> Ver código no GitHub

## Seção "por que existe"

> O projeto nasceu de um problema simples: incidentes semelhantes voltam a aparecer, mas a solução anterior nem sempre está organizada de forma fácil de recuperar.

Isso conecta projeto a problema.

## Seção "o que prova"

```text
- modelagem TypeScript;
- fluxo ponta a ponta;
- testes;
- CI;
- release;
- documentação;
```

Não precisa aparecer exatamente assim para usuário final.

Pode aparecer no portfólio.

## Demo vazia

Uma demo sem dados pode parecer quebrada.

Inclua seed demonstrativo.

Exemplo:

```text
INC-001
Login fails after password reset
Resolved
```

Mas deixe claro que é exemplo.

## CTA para feedback

```text
Este é um MVP experimental.
Se você trabalha com suporte técnico e quiser comentar
sobre o fluxo, envie feedback.
```

Feedback de público relevante vale mais que opinião genérica.

## Métricas iniciais

Não precisa ter analytics complexo.

Pode registrar:

- visitas;
- cliques na demo;
- cliques no GitHub;
- contatos;
- feedbacks recebidos;
- erros reportados.

Evite tomar número pequeno como validação estatística.

## Feedback estruturado

Pergunte:

```text
1. O problema ficou claro?
2. O fluxo parece útil?
3. Qual etapa ficou confusa?
4. O que você esperava encontrar e não encontrou?
5. Você usaria algo assim em qual situação?
```

Não pergunte apenas:

> Gostou?

## O feedback não define automaticamente roadmap

Um usuário pedir feature não significa que deve entrar.

Registre:

```text
pedido
problema por trás
frequência
impacto
custo
```

Depois priorize.

## Release v0.1 deve permanecer pequena

Exemplo:

```text
v0.1.0
- create
- list
- resolve
- view
```

v0.2 pode explorar:

```text
search
```

v0.3:

```text
feedback/relevance
```

Não comprometa o ciclo atual com roadmap inteiro.

## Laboratório sugerido

```text
mvp-landing-lab/
  apps/
    web/
    api/
  packages/
    domain/
    contracts/
  tests/
    unit/
    integration/
    contract/
    e2e/
  docs/
    product/
      problem.md
      audience.md
      scope-v0.1.md
    decisions/
    release/
      v0.1.0.md
    screenshots/
  .github/
    workflows/
      ci.yml
  README.md
```

## `problem.md`

```md
# Problem

## User

Technical analyst.

## Current situation

Past solutions are difficult to recover.

## Cost

Repeated investigation and dependence on individual memory.

## MVP hypothesis

A structured record of problem and resolution can make
past knowledge easier to reuse.
```

## `scope-v0.1.md`

```md
# Scope v0.1

## Included

- create record
- list records
- resolve record
- view solution

## Not included

- AI
- SSO
- external integrations
- notifications
- roles
```

## ADR simples

```md
# ADR-001 — Use discriminated union for ticket lifecycle

## Context

The UI originally used optional fields for solution and resolvedAt.

## Options

1. one interface with optional fields;
2. discriminated union by status.

## Decision

Use a discriminated union.

## Consequences

Positive:
- invalid combinations are harder to represent;
- narrowing simplifies rendering.

Negative:
- more type declarations;
- transitions need explicit mapping.
```

## Experimento 1 — `any` versus `unknown`

Versão A:

```ts
function submit(input: any) {
  return input.title.trim();
}
```

Entrada:

```ts
submit({
  title: 42,
});
```

Runtime quebra.

Versão B:

```ts
function submit(input: unknown) {
  const command =
    parseCreateTicketInput(input);

  return command.title.trim();
}
```

Documente a diferença.

## Experimento 2 — campos opcionais versus union

Versão A:

```ts
type Ticket = {
  status: string;
  solution?: string;
};
```

Versão B:

```ts
type Ticket =
  | OpenTicket
  | ResolvedTicket;
```

Crie um estado inválido na A.

Mostre erro de compilação na B.

## Experimento 3 — generic útil versus excessivo

Implemente:

```ts
type ApiResult<T> = ...
```

Depois crie uma abstração excessiva.

Compare:

- leitura;
- número de parâmetros;
- reuse real;
- erro gerado;
- onboarding.

## Experimento 4 — CI quebrando mudança incompleta

Adicione um novo status:

```ts
"in_review"
```

Sem atualizar todos os switches.

Execute:

```bash
npm run typecheck
```

CI deve falhar.

Depois corrija.

Isso conecta tipos a processo.

## Experimento 5 — build da landing

Crie mudança visual que passa localmente.

CI deve executar build em PR.

Isso detecta:

- import quebrado;
- tipo inválido;
- bundle que não compila.

## Experimento 6 — release reproduzível

Clone tag:

```text
v0.1.0
```

Siga README.

Valide:

```text
install
test
build
run
```

Uma release que só funciona no seu diretório não é uma entrega profissional.

## Compare abordagens e registre onde falham

| Comparação | O que observar | Onde cada opção falha |
| --- | --- | --- |
| escopo por features vs. fluxo principal | foco e valor | lista de features cresce sem provar valor; fluxo pode ignorar necessidades secundárias |
| `any` vs. `unknown` | velocidade e segurança | `any` esconde erro; `unknown` exige validação |
| opcionais vs. discriminated union | simplicidade e estados inválidos | opcionais permitem contradição; union adiciona código |
| generic específico vs. genérico universal | reutilização e leitura | específico resolve relação real; universal aumenta complexidade |
| landing detalhada vs. landing focada | explicação e conversão | detalhada sobrecarrega; focada pode omitir contexto |
| demo local vs. demo pública | setup e acessibilidade | local exige esforço; pública exige hosting |
| CI mínimo vs. pipeline complexo | feedback e manutenção | mínimo pode deixar gaps; complexo custa tempo |
| v0.1 pequena vs. release ampla | velocidade e valor | pequena pode parecer limitada; ampla aumenta risco |
| feedback aberto vs. perguntas estruturadas | espontaneidade e sinal | aberto é vago; estruturado pode induzir respostas |
| arquitetura simples vs. abstração antecipada | velocidade e mudança | simples pode acoplar; abstração cedo demais vira overhead |

## Exemplos pequenos que devem quebrar

Faça:

1. payload com `title: 42`;
2. estado `resolved` sem `solution`;
3. novo status não tratado;
4. generic com parâmetros inúteis;
5. formulário com flags contraditórias;
6. build quebrado por import;
7. e2e quebrando fluxo principal;
8. README sem variável necessária;
9. release tag sem instrução atual;
10. landing com CTA apontando para demo inexistente.

Cada falha precisa virar correção documentada.

## Issue do ciclo

```text
feat: publish first usable MVP flow
```

Critérios:

```text
- user understands problem
- user can run/demo
- main flow works
- tests pass
- CI passes
- landing links to demo and GitHub
- v0.1.0 release exists
```

## PRs sugeridos

```text
feat: model ticket lifecycle with discriminated union
```

```text
feat: add public landing page for MVP
```

```text
ci: validate typecheck test and build on pull requests
```

```text
release: prepare v0.1.0
```

## README como avaliação externa

Uma pessoa deve conseguir responder:

- o que é?
- para quem?
- qual problema?
- o que a versão atual faz?
- como executar?
- como testar?
- onde está a demo?
- quais limitações?
- qual próxima etapa?

Sem mensagem privada.

## Evidência para portfólio

Descrição boa:

> Entreguei uma primeira versão pública de um MVP para registrar e consultar resoluções técnicas. Modelei o ciclo de vida com discriminated unions em TypeScript, validei entradas externas antes de convertê-las para tipos internos, protegi o fluxo principal com testes e automatizei typecheck, lint, testes e build em pull requests. A entrega inclui landing pública, documentação de escopo e release `v0.1.0`.

Melhor que:

> Criei um sistema completo de chamados.

Não é completo.

A precisão é vantagem.

## Impacto

Você pode descrever impacto em:

### Confiabilidade

> estados contraditórios deixaram de ser representáveis em partes centrais.

### Produtividade

> CI detecta mudança incompleta antes do merge.

### Manutenção

> o escopo `v0.1` reduz mudanças paralelas sem critério.

### Comunicação

> landing e README permitem avaliar o projeto sem explicação privada.

Não invente números.

## Artigo prático 1 — TypeScript no MVP

### Título sugerido

**Como usei TypeScript para modelar MVP e landing com mais segurança**

Estruture:

1. problema do produto;
2. tipo inicial fraco;
3. estado inválido;
4. `unknown`;
5. narrowing;
6. discriminated union;
7. utility type;
8. generic útil;
9. teste;
10. CI;
11. trade-off;
12. conclusão.

Exemplo ruim:

```ts
type Ticket = {
  status: string;
  solution?: string;
};
```

Exemplo melhor:

```ts
type Ticket =
  | OpenTicket
  | ResolvedTicket;
```

Mostre qual erro o compilador passou a evitar.

## Artigo prático 2 — `unknown`, `never` e generics

### Título sugerido

**unknown, never e generics: o que realmente muda no código do dia a dia**

Use exemplos pequenos.

### `unknown`

Entrada externa.

### `never`

Exhaustive checking.

### generic

Preservar relação de tipo.

Exemplo:

```ts
type Result<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };
```

Inclua uma seção:

> Quando eu não usaria isso?

## Artigo prático 3 — evolução como desenvolvedor

### Título sugerido

**O que meu laboratório TypeScript prova sobre minha evolução como desenvolvedor**

Mostre:

- problema;
- escopo;
- repository;
- modelagem;
- testes;
- CI;
- landing;
- release;
- limitações.

Não transforme o texto em autopromoção vazia.

Mostre artefatos.

## O que essa entrega prova para vaga internacional

Exemplo:

```text
- I can scope a small product.
- I can model business states with TypeScript.
- I can validate external data.
- I can write automated tests.
- I can configure CI.
- I can publish a reproducible release.
- I can explain technical trade-offs in English.
```

Isso é mais forte que:

> "Advanced TypeScript."

## Formato recomendado para os artigos

800 a 1.500 palavras.

Estrutura:

1. introdução;
2. problema;
3. código;
4. teste;
5. melhoria;
6. evidência;
7. trade-offs;
8. limitações;
9. conclusão;
10. GitHub/demo.

## Inglês técnico para entrevista

> I kept the first release intentionally small. The goal was to prove one end-to-end workflow instead of building many disconnected features. The v0.1.0 release includes the main flow, automated tests, CI, a public landing page, and clear limitations.

Outro:

> I replaced `any` at external boundaries with `unknown` and explicit validation. This added a small amount of parsing code, but it prevented untrusted values from silently entering the domain model.

Outro:

> I used a discriminated union for the ticket lifecycle because optional fields allowed contradictory states. The trade-off is additional type code, but product changes become easier to track through compiler errors.

Outro:

> I used generics only where they preserve a real relationship between values, such as `Result<T>`. I avoided generic service abstractions because they made the MVP harder to read without providing meaningful reuse.

Outro:

> Every pull request runs type checking, linting, tests, and the production build. This gives fast feedback when a product change breaks a contract or leaves a state unhandled.

## Checklist técnico de conclusão

Você terá concluído o E019 quando conseguir:

- definir problema e público;
- escrever hipótese do MVP;
- limitar escopo;
- definir out of scope;
- criar fluxo principal;
- modelar estado com TypeScript;
- remover `any` desnecessário;
- usar `unknown` em fronteira apropriada;
- fazer narrowing;
- usar discriminated union;
- aplicar `never` em exhaustive checking;
- usar generic com relação real;
- usar utility types sem liberar estados inválidos;
- explicar custo de complexidade de tipos;
- testar regra isolada;
- testar integração;
- proteger contrato relevante;
- criar e2e do fluxo principal;
- criar landing;
- comunicar problema;
- identificar público;
- mostrar demonstração;
- incluir CTA;
- incluir contato;
- documentar limitações;
- configurar CI em PR;
- executar typecheck;
- executar lint;
- executar testes;
- executar build;
- organizar issues;
- organizar PRs;
- criar release `v0.1.0`;
- escrever release notes;
- manter instruções reproduzíveis;
- escrever resumo em inglês;
- publicar evidência para portfólio;
- explicar trade-offs em inglês técnico simples.

## O que você deve levar deste ciclo

Um MVP profissional não é definido apenas pelo número de features.

Ele é definido pela clareza do problema que tenta provar.

A primeira release precisa ser pequena o suficiente para terminar e completa o suficiente para ser avaliada.

TypeScript entra como ferramenta de mudança segura.

A landing entra como ferramenta de comunicação.

Os testes entram como evidência de comportamento.

CI entra como proteção do processo.

A release entra como marco reproduzível.

O README entra como documentação para alguém de fora.

No fim, você precisa conseguir mostrar:

```text
problema
 -> público
 -> hipótese
 -> escopo
 -> código
 -> testes
 -> CI
 -> demo
 -> landing
 -> release
 -> feedback
```

Você terá concluído o E019 quando uma pessoa que nunca conversou com você conseguir abrir a landing, entender o problema, testar ou executar o MVP, consultar o GitHub, ver a `v0.1.0`, entender os limites e avaliar suas decisões técnicas.

Essa é a diferença entre um projeto que apenas existe no seu computador e uma entrega pública que funciona como evidência profissional.

## Referências primárias

- [TypeScript — Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript — Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript — Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [GitHub Actions — Quickstart](https://docs.github.com/en/actions/get-started/quickstart)
- [GitHub Actions — Example workflow](https://docs.github.com/en/actions/tutorials/create-actions/create-an-example-workflow)
- [GitHub — About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [GitHub — Managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Semantic Versioning 2.0.0](https://semver.org/)
