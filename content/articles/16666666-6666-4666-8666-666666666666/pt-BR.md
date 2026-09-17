---
translationId: 26666666-6666-4666-8666-666666666666
articleId: 16666666-6666-4666-8666-666666666666
locale: pt-BR
slug: typescript-profundo-apis-arquitetura
title: "TypeScript profundo em APIs e arquitetura: contratos que impedem estados inválidos"
description: "Um guia aplicado para usar TypeScript como ferramenta de contratos, validação, arquitetura e confiabilidade em APIs Node.js."
status: draft
---

# TypeScript profundo em APIs e arquitetura: contratos que impedem estados inválidos

Uma API recebe valores que ela não controla: JSON de um navegador, um token, dados de uma integração, uma linha do banco ou um erro de biblioteca. Escrever `request.body as CreateIncidentInput` faz o editor parar de reclamar, mas não torna o valor verdadeiro. Você apenas pediu ao TypeScript que confiasse em algo que ainda não foi provado.

O TypeScript profundo começa quando ele deixa de ser “tipos para autocomplete” e passa a responder perguntas de arquitetura:

- Quais estados do domínio são válidos?
- Em que ponto um dado externo é validado?
- Que contratos entram e saem de cada caso de uso?
- Que mudança deveria quebrar a compilação antes de quebrar produção?
- Onde uma abstração reduz custo de mudança e onde ela só esconde código?

Neste ciclo, aplicaremos o tema a uma pequena API de incidentes em Node.js. Ela cria e resolve incidentes, protege ações por papel, registra eventos e usa persistência transacional. O objetivo não é decorar recursos: é tornar o caminho correto mais simples de escrever que o incorreto.

> Tipos descrevem intenção durante o desenvolvimento. Validação prova dados externos em runtime. Uma API confiável precisa dos dois.

<!-- VISUAL:
JSON desconhecido -> validação de entrada -> DTO confiável -> caso de uso -> domínio -> repositório/transação -> resposta HTTP documentada.
Destacar que TypeScript participa do fluxo inteiro, mas não valida JSON sozinho.
-->

## O problema antes do termo técnico

Considere este endpoint:

```ts
app.post("/v1/incidents", async (request, response) => {
  const input = request.body as CreateIncidentInput;
  const incident = await createIncident.execute(input);

  response.status(201).json(incident);
});
```

Uma requisição real pode conter isto:

```json
{
  "title": 42,
  "priority": "urgentíssimo",
  "reportedBy": null
}
```

`as CreateIncidentInput` não converte, valida nem corrige JSON. Ele só informa ao compilador como tratar o valor. Uma API segura segue outro fluxo:

```text
requisição HTTP (unknown)
        ↓
validação em runtime
        ↓
DTO válido
        ↓
caso de uso e domínio
        ↓
persistência e resposta
```

O compilador ajuda a não pular essas etapas.

## Configure o compilador para participar da arquitetura

Para uma API Node.js moderna, comece com uma configuração explícita:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}
```

`strict` ativa uma família ampla de verificações; `noImplicitAny` já faz parte dela, mas mantê-lo explícito comunica uma regra da equipe: um tipo não pode virar `any` por acidente. `strictNullChecks`, incluído por `strict`, obriga tratar uma busca que pode não encontrar nada em vez de agir como se ela sempre retornasse um objeto.

`exactOptionalPropertyTypes` diferencia “a propriedade não foi enviada” de “a propriedade chegou com `undefined`”. Isso importa em DTOs de atualização:

```ts
interface UpdateIncidentInput {
  priority?: "low" | "medium" | "high";
}

const valid: UpdateIncidentInput = {};

// Com exactOptionalPropertyTypes: erro.
const invalid: UpdateIncidentInput = { priority: undefined };
```

`noUncheckedIndexedAccess` adiciona `undefined` onde um acesso por índice pode não existir. Ele deixa visíveis erros de array e `Record` que, de outra forma, surgiriam em produção.

Aliases melhoram imports em uma árvore grande:

```ts
import { CreateIncident } from "@/application/create-incident.js";
```

Mas `paths` só ensina o TypeScript a resolver o import; ele não reescreve o caminho emitido pelo `tsc`. Build, testes e runtime precisam conhecer o mesmo alias. Se isso não estiver configurado em todos os ambientes, use imports relativos claros ou escolha uma solução única de resolução.

> Configuração rigorosa não cria software perfeito. Ela faz alguns erros aparecerem no editor e no CI, quando ainda são baratos.

## Tipos básicos são a matéria-prima dos contratos

```ts
const title: string = "Falha ao gerar relatório";
const attempts: number = 3;
const isRecurring: boolean = true;
const correlationId: string | null = null;

const tags: string[] = ["etl", "reporting"];
const pageCursor: readonly [createdAt: string, id: string] = [
  "2026-09-16T10:00:00.000Z",
  "inc_123",
];
```

Um array é uma coleção de valores do mesmo tipo. Uma tuple representa posições com significado e ordem definidos; aqui, data sempre vem antes de id. Use tuple quando a posição realmente for parte do contrato. Para objetos enviados por HTTP, propriedades nomeadas quase sempre são mais legíveis.

O TypeScript infere muito sem annotation manual:

```ts
const retryLimit = 3;

const priorities = ["low", "medium", "high"] as const;
type Priority = (typeof priorities)[number];
// "low" | "medium" | "high"
```

`as const` preserva valores literais e torna a coleção somente leitura. Assim, uma lista que existe em runtime pode também gerar o tipo aceito em compile time.

### Literal types, unions e enums

Para valores externos pequenos, uma união de literais costuma ser transparente:

```ts
type Role = "reporter" | "analyst" | "manager" | "admin";
```

`enum` também define um conjunto nomeado de valores e deve ser estudado:

```ts
enum IncidentPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
}
```

Porém, enums comuns existem como objetos em runtime e geram JavaScript. Para contratos HTTP, union de literais e `as const` normalmente deixam o JSON mais próximo do código. Use enum quando seu comportamento em runtime ou sua ergonomia de nomes realmente trouxer valor; não por hábito.

## `type` ou `interface`? Escolha pela forma do contrato

Os dois descrevem objetos:

```ts
interface CreateIncidentInput {
  title: string;
  priority: Priority;
  description?: string;
}

type IncidentId = string;
```

Uma convenção simples funciona bem:

- `interface` para contratos de objeto que você espera implementar ou ampliar, como DTOs e portas de repositório;
- `type` para unions, intersections, aliases de primitivos e tipos derivados.

Uma union, por exemplo, pertence naturalmente a `type`:

```ts
type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };
```

Não existe vencedor universal. A escolha deve ser consistente e o nome deve representar um conceito, não uma oportunidade de “usar mais TypeScript”.

## Faça estados inválidos falharem antes de rodar

Um incidente aberto não tem resolução. Um incidente resolvido precisa de resolução. Campos opcionais demais tornam essa regra fácil de esquecer:

```ts
// Evite: aceita status resolvido sem resolução.
interface LooseIncident {
  status: string;
  resolution?: string;
}
```

Uma union discriminada representa cada estado válido:

```ts
type IncidentBase = {
  id: string;
  title: string;
  reportedBy: string;
};

type OpenIncident = IncidentBase & {
  status: "open" | "in_progress";
  resolution?: never;
};

type ResolvedIncident = IncidentBase & {
  status: "resolved";
  resolution: {
    summary: string;
    fixedInVersion: string;
  };
};

type Incident = OpenIncident | ResolvedIncident;

const valid: Incident = {
  id: "inc_123",
  title: "Falha ao gerar relatório",
  reportedBy: "usr_42",
  status: "resolved",
  resolution: {
    summary: "Ajustada a consulta de dados.",
    fixedInVersion: "2026.09.1",
  },
};

// Erro: resolução é obrigatória em status resolved.
const invalid: Incident = {
  id: "inc_124",
  title: "Falha ao enviar e-mail",
  reportedBy: "usr_42",
  status: "resolved",
};
```

`status` é o discriminante. Quando ele é testado, o TypeScript sabe qual formato existe no restante do objeto. Isso reduz `if`s defensivos espalhados pelo projeto.

### Exhaustive checking e `never`

```ts
function assertNever(value: never): never {
  throw new Error("Unexpected incident state.");
}

function describeIncident(incident: Incident): string {
  switch (incident.status) {
    case "open":
      return "Incident is waiting for analysis.";
    case "in_progress":
      return "Incident is being analyzed.";
    case "resolved":
      return `Resolved: ${incident.resolution.summary}`;
    default:
      return assertNever(incident);
  }
}
```

Se alguém acrescentar `cancelled` à union e esquecer esse `switch`, o `default` deixará de receber `never`, e a compilação apontará a mudança incompleta. Esse é o compilador participando da arquitetura.

Intersections também têm lugar quando combinam conceitos reais:

```ts
type AuthenticatedRequest = HttpRequest & { auth: AuthContext };
```

Mas uma intersection não valida dados e não deve ser usada para “colar” objetos sem relação até o compilador aceitar o código.

## `unknown`, narrowing e segurança contra `null`

Entrada externa deve começar como `unknown`, não como `any`:

```ts
function dangerous(body: any): string {
  return body.priority.toUpperCase();
}
```

`any` desliga a proteção justamente na fronteira mais perigosa. `unknown` obriga a provar o formato antes de acessar propriedades:

```ts
type ValidationIssue = { path: string; message: string };

type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (priorities as readonly string[]).includes(value);
}

function parseCreateIncident(value: unknown): ParseResult<CreateIncidentInput> {
  if (!isRecord(value)) {
    return { ok: false, issues: [{ path: "body", message: "Expected an object." }] };
  }

  const title = value["title"];
  const priority = value["priority"];
  const description = value["description"];

  if (typeof title !== "string" || title.trim().length < 5) {
    return { ok: false, issues: [{ path: "title", message: "Use at least 5 characters." }] };
  }

  if (!isPriority(priority)) {
    return { ok: false, issues: [{ path: "priority", message: "Use low, medium, or high." }] };
  }

  if (description !== undefined && typeof description !== "string") {
    return { ok: false, issues: [{ path: "description", message: "Expected a string." }] };
  }

  return {
    ok: true,
    value: {
      title: title.trim(),
      priority,
      ...(description === undefined ? {} : { description }),
    },
  };
}
```

Esse parser é curto para destacar o raciocínio. Em projeto real, uma biblioteca de schema pode reduzir repetição. O ponto é saber que annotation TypeScript não valida JSON.

`typeof`, `instanceof`, igualdade, operador `in` e funções que retornam `value is Type` são type guards. Refinar uma union depois dessas verificações se chama *narrowing*. O mesmo vale para erros:

```ts
try {
  await createIncident.execute(input);
} catch (error: unknown) {
  if (error instanceof DomainError) {
    return toProblemResponse(error);
  }

  throw error;
}
```

Use optional chaining só quando ausência for aceita pelo domínio: `incident.assignee?.email`. Não esconda uma falha de regra com `?.`; se o usuário deveria existir, trate esse estado explicitamente.

## Generics: preserve relações, não crie uma camada vazia

```ts
interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | undefined>;
  save(entity: TEntity): Promise<void>;
}

type IncidentRepository = Repository<Incident, string>;

async function requireEntity<T>(value: T | undefined, message: string): Promise<T> {
  if (value === undefined) {
    throw new Error(message);
  }

  return value;
}
```

O generic preserva o tipo de entrada na saída: incidente entra, incidente sai; usuário entra, usuário sai. `ApiResult<T>`, paginação e clientes HTTP são bons usos. Classes genéricas podem caber em detalhes de infraestrutura, mas cuidado com repositórios universais como `findBy(field: keyof T, value: unknown)`: eles costumam esconder consultas, regras e necessidades de índice.

> Se um generic exige muitos parâmetros, condicionais e uma página de explicação para resolver algo simples, ele provavelmente está aumentando o custo de mudança.

## A API REST é um contrato público

O adapter HTTP deve receber, validar, chamar o caso de uso e traduzir a resposta. Regra de negócio não deve depender de `request`, `response` ou de framework:

```ts
async function createIncidentHandler(request: HttpRequest): Promise<HttpResponse> {
  const parsed = parseCreateIncident(request.body);

  if (!parsed.ok) {
    return {
      status: 400,
      body: {
        code: "VALIDATION_ERROR",
        message: "The request body is invalid.",
        details: parsed.issues,
      },
    };
  }

  const incident = await createIncident.execute({
    input: parsed.value,
    actor: request.auth,
  });

  return { status: 201, body: toIncidentResponse(incident) };
}
```

Padronize erros:

```ts
type ApiError =
  | { code: "VALIDATION_ERROR"; status: 400; details: ValidationIssue[] }
  | { code: "UNAUTHENTICATED"; status: 401 }
  | { code: "FORBIDDEN"; status: 403 }
  | { code: "INCIDENT_NOT_FOUND"; status: 404 }
  | { code: "CONFLICT"; status: 409 };
```

Versionar por caminho, como `/v1/incidents`, é uma solução inicial compreensível. Ainda assim, preserve campos existentes quando possível, prefira alterações aditivas e documente remoções. Uma versão nova não substitui compatibilidade.

OpenAPI transforma o contrato público em documento verificável:

```yaml
openapi: 3.1.1
info:
  title: Incident API
  version: 1.0.0
paths:
  /v1/incidents:
    post:
      summary: Create an incident
      responses:
        "201": { description: Incident created }
        "400": { description: Invalid request body }
```

OpenAPI não substitui validação ou teste. Ele registra a promessa que pessoas e ferramentas podem consultar, testar ou usar para gerar uma collection.

## Autenticação, autorização e regra de negócio não são a mesma coisa

Autenticação responde “quem é esta pessoa?”. Autorização responde “ela pode realizar esta ação neste recurso?”. Papel não é permissão universal.

O middleware valida credencial e monta a identidade:

```ts
type AuthContext = {
  userId: string;
  roles: readonly Role[];
};
```

A decisão de resolver o incidente fica em uma policy ou no caso de uso, pois pode depender do incidente, do time e do papel:

```ts
interface IncidentPolicy {
  canResolve(actor: AuthContext, incident: Incident): boolean;
}

function ensureCanResolve(
  policy: IncidentPolicy,
  actor: AuthContext,
  incident: Incident,
): void {
  if (!policy.canResolve(actor, incident)) {
    throw new ForbiddenError("You cannot resolve this incident.");
  }
}
```

Cheque autorização no servidor em toda ação que altera dado e, quando houver recurso específico, valide também escopo, time ou posse. Comece negando por padrão e conceda permissões explícitas.

## O caso de uso coordena transação e persistência

Resolver um incidente atualiza status e cria um evento de auditoria. Os dois passos devem confirmar juntos:

```ts
interface TransactionManager {
  withTransaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T>;
}

class ResolveIncident {
  constructor(
    private readonly transactions: TransactionManager,
    private readonly incidents: IncidentRepositoryPort,
    private readonly events: IncidentEventRepositoryPort,
    private readonly policy: IncidentPolicy,
  ) {}

  async execute(input: ResolveIncidentInput): Promise<ResolvedIncident> {
    return this.transactions.withTransaction(async (tx) => {
      const current = await requireEntity(
        await this.incidents.lockById(tx, input.incidentId),
        "Incident not found.",
      );

      ensureCanResolve(this.policy, input.actor, current);

      const resolved: ResolvedIncident = {
        ...current,
        status: "resolved",
        resolution: input.resolution,
      };

      await this.incidents.save(tx, resolved);
      await this.events.append(tx, {
        type: "incident_resolved",
        incidentId: resolved.id,
        actorId: input.actor.userId,
      });

      return resolved;
    });
  }
}
```

O caso de uso conhece regra e coordena portas. A infraestrutura usa a mesma conexão de banco durante o bloco inteiro. Com `node-postgres`, `BEGIN`, queries e `COMMIT` precisam usar o mesmo `client` do pool.

Não faça chamada HTTP, envio de e-mail ou publicação externa dentro de transação longa. A transação protege o banco; ela não desfaz efeitos externos já enviados. Quando o problema exigir entrega confiável após commit, estude outbox como decisão separada.

## Testes de compilação, runtime e contrato

```ts
import assert from "node:assert/strict";
import test from "node:test";

test("rejects a request with an invalid priority", () => {
  const result = parseCreateIncident({
    title: "Report export fails",
    priority: "critical",
  });

  assert.equal(result.ok, false);
});

test("requires resolution for a resolved incident", () => {
  // @ts-expect-error: resolved incidents cannot omit resolution.
  const invalid: Incident = {
    id: "inc_1",
    title: "Example",
    reportedBy: "usr_1",
    status: "resolved",
  };

  assert.ok(invalid);
});
```

O segundo é um teste de compilação: se alguém enfraquecer a union, `@ts-expect-error` passa a falhar porque não haverá mais o erro esperado. Use-o de forma pontual. Complete com testes de integração para `400`, `401`, `403`, `404`, rollback de transação, contrato OpenAPI e alterações concorrentes de status.

Publique requests, responses e collection de testes. Um exemplo de cURL deixa o projeto demonstrável:

```bash
curl --request POST http://localhost:3000/v1/incidents \
  --header "Authorization: Bearer <token-de-teste>" \
  --header "Content-Type: application/json" \
  --data '{
    "title": "Falha ao gerar relatório mensal",
    "priority": "high",
    "description": "O arquivo não foi criado após o processamento."
  }'
```

Nunca coloque token real na collection ou no repositório.

## Um laboratório que comprova aprendizado

Crie `ts-api-architecture-lab` com separação de responsabilidades:

```text
src/
  domain/
    incident.ts
    incident-policy.ts
  application/
    create-incident.ts
    resolve-incident.ts
    ports/
  infrastructure/
    postgres/
    auth/
  interfaces/
    http/v1/
    openapi.yaml
tests/
  unit/
  integration/
  contract/
docs/
  adr/
  requests/
```

Prepare Node LTS, TypeScript, `pnpm` ou `npm`, terminal, Git, VS Code e scripts previsíveis: `dev`, `build`, `typecheck`, `test`, `test:integration`, `lint` e `openapi:validate`. Configure CI para rodar typecheck e testes, deixe o badge no README e publique `.env.example` sem segredos.

O README profissional deve explicar problema, arquitetura, pré-requisitos, variáveis, execução, endpoints, testes e decisões. Escreva-o em português e adicione um resumo técnico em inglês. Use issues, branches, commits atômicos, rebase simples, PR e code review próprio, mesmo trabalhando sozinho.

## Compare abordagens e registre os limites

| Comparação | Quando ajuda | Onde falha |
| --- | --- | --- |
| `any` vs. `unknown` | `unknown` obriga validação | `any` espalhado remove garantias; só aceite exceção temporária e delimitada |
| campos opcionais vs. union discriminada | union impede combinações inválidas | union muito grande pode prejudicar legibilidade |
| `interface` vs. `type` | interface para objeto; type para compor | alternar sem critério cria linguagem duplicada |
| generic pequeno vs. repositório universal | generic preserva relação reutilizável | abstração universal esconde consultas e regras |
| alias vs. import relativo | alias melhora árvore grande | runtime/teste podem quebrar se a resolução divergir |
| RBAC simples vs. policy por recurso | papel é um bom início | só checar papel ignora posse, time e escopo |

Crie exemplos que quebram: envie JSON com campo errado, acrescente status sem atualizar `switch`, tente resolver sem permissão e force falha ao gravar o evento para confirmar rollback. A pergunta certa é: em qual camada o erro deveria aparecer e qual teste prova isso?

## Três artigos práticos derivados do laboratório

### 1. TypeScript em APIs: como transformar JSON desconhecido em contrato confiável

Comece pelo erro de usar `as` no corpo da requisição. Depois mostre `unknown`, type guards ou schema, requests de erro e a diferença entre tipo estático e validação em runtime.

### 2. Unions discriminadas na prática: impedindo estados inválidos antes de rodar a API

Use o ciclo de vida do incidente para mostrar por que `status: "resolved"` exige resolução. Inclua `never`, exhaustive checking e um teste de compilação.

### 3. Autenticação, autorização e transação: três limites que uma API não pode confundir

Explique quem é o usuário, o que ele pode fazer e o que deve confirmar junto no banco. Mostre policy, caso de uso, rollback e o que a transação não resolve.

Cada artigo pode ter 800 a 1.500 palavras: introdução, problema, código, testes, trade-offs, conclusão e link para GitHub. Um vlog pode mostrar primeiro o teste falhando e depois a mudança de contrato eliminando o problema.

## Como explicar a decisão em inglês técnico simples

> TypeScript types do not validate incoming JSON at runtime, so the HTTP adapter treats request bodies as `unknown` and validates them before calling the use case. We use discriminated unions for the incident lifecycle because a resolved incident must contain a resolution. This makes invalid states fail during compilation, while integration tests still protect the runtime boundary and database transaction.

Essa resposta apresenta limite, decisão e evidência. É mais forte que apenas dizer “usei TypeScript strict”.

## Perguntas frequentes

### TypeScript elimina a validação da API?

Não. Tipos não permanecem protegendo a entrada depois que o JavaScript está em execução. JSON, banco, token e integração continuam exigindo validação e tratamento de erro em runtime.

### `strict` elimina todos os bugs?

Não. Ele não decide regra de negócio, não verifica credencial, não sabe se uma consulta trouxe o registro correto e não mede performance. Ele revela classes de erro antes da execução.

### Devo remover todo `any` imediatamente?

Priorize fronteiras externas e `any` que permitem operação perigosa. Em migração gradual, uma adaptação delimitada pode existir, mas deve ter motivo, dono e plano de remoção.

### Tipos mais avançados sempre melhoram arquitetura?

Não. Um tipo que ninguém consegue explicar torna mudanças caras. A complexidade precisa pagar uma conta real: impedir estado inválido, preservar uma relação ou tornar uma interface pública mais segura.

## O que você deve levar deste ciclo

TypeScript profundo não é uma coleção de truques de generics. É usar o sistema de tipos para expor decisões: o que entra na API, o que pode existir no domínio, o que cada camada pode chamar e o que deve quebrar quando a regra muda.

Você concluiu o E007 quando consegue construir uma API pequena com `strict`, tratar entrada como `unknown`, modelar estados incompatíveis, validar e documentar endpoints, separar autenticação de autorização, coordenar persistência transacional e provar tudo com testes, CI, requests e README. No portfólio, descreva impacto concreto: mais confiabilidade ao recusar payload inválido, mais segurança ao autorizar no servidor, menor custo de manutenção com contratos explícitos e mais produtividade com documentação executável.

## Referências primárias

- [TypeScript — strict](https://www.typescriptlang.org/tsconfig/strict.html)
- [TypeScript — noImplicitAny](https://www.typescriptlang.org/tsconfig/noImplicitAny.html)
- [TypeScript — exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- [TypeScript — paths](https://www.typescriptlang.org/tsconfig/paths.html)
- [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook — Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [node-postgres — Transactions](https://node-postgres.com/features/transactions)
