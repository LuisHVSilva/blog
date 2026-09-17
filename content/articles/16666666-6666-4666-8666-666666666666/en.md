---
translationId: 36666666-6666-4666-8666-666666666666
articleId: 16666666-6666-4666-8666-666666666666
locale: en
slug: typescript-deep-apis-architecture
title: "Deep TypeScript in APIs and Architecture: Contracts That Prevent Invalid States"
description: "An applied guide to using TypeScript as a tool for contracts, validation, architecture, and reliability in Node.js APIs."
status: draft
---

# Deep TypeScript in APIs and Architecture: Contracts That Prevent Invalid States

An API receives values it does not control: JSON from a browser, a token, data from an integration, a database row, or an error thrown by a library. Writing `request.body as CreateIncidentInput` makes the editor stop complaining, but it does not make the value true. You merely asked TypeScript to trust something that has not been proved yet.

Deep TypeScript begins when it stops being “types for autocomplete” and starts answering architecture questions:

- Which domain states are valid?
- Where is external data validated?
- Which contracts enter and leave each use case?
- Which change should break compilation before it breaks production?
- Where does an abstraction lower the cost of change, and where does it only hide code?

In this cycle, we will apply the subject to a small incident API in Node.js. It creates and resolves incidents, protects actions by role, records events, and uses transactional persistence. The goal is not to memorize features; it is to make the correct path easier to write than the incorrect one.

> Types describe intent during development. Validation proves external data at runtime. A reliable API needs both.

<!-- VISUAL:
Unknown JSON -> input validation -> trustworthy DTO -> use case -> domain -> repository/transaction -> documented HTTP response.
Highlight that TypeScript participates in the whole flow but does not validate JSON by itself.
-->

## The problem before the technical term

Consider this endpoint:

```ts
app.post("/v1/incidents", async (request, response) => {
  const input = request.body as CreateIncidentInput;
  const incident = await createIncident.execute(input);

  response.status(201).json(incident);
});
```

A real request might contain this:

```json
{
  "title": 42,
  "priority": "super-urgent",
  "reportedBy": null
}
```

`as CreateIncidentInput` does not convert, validate, or repair JSON. It only tells the compiler how to treat the value. A safe API follows a different flow:

```text
HTTP request (unknown)
        ↓
runtime validation
        ↓
valid DTO
        ↓
use case and domain
        ↓
persistence and response
```

The compiler helps us avoid skipping these stages.

## Configure the compiler to participate in architecture

For a modern Node.js API, begin with an explicit configuration:

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

`strict` enables a broad family of checks; `noImplicitAny` already belongs to that family, but keeping it explicit communicates a team rule: a type must not become `any` by accident. `strictNullChecks`, included by `strict`, forces you to handle a lookup that might not find anything instead of acting as if it always returns an object.

`exactOptionalPropertyTypes` distinguishes “the property was not sent” from “the property arrived as `undefined`.” This matters in update DTOs:

```ts
interface UpdateIncidentInput {
  priority?: "low" | "medium" | "high";
}

const valid: UpdateIncidentInput = {};

// With exactOptionalPropertyTypes: error.
const invalid: UpdateIncidentInput = { priority: undefined };
```

`noUncheckedIndexedAccess` adds `undefined` where an indexed access may not exist. It exposes array and `Record` mistakes that might otherwise appear in production.

Aliases can improve imports in a large tree:

```ts
import { CreateIncident } from "@/application/create-incident.js";
```

But `paths` only teaches TypeScript how to resolve the import; it does not rewrite the path emitted by `tsc`. Build, tests, and runtime need to know the same alias. If that is not configured in every environment, use clear relative imports or choose one resolution solution.

> Strict configuration does not create perfect software. It makes some errors appear in the editor and CI, when they are still cheap.

## Basic types are the raw material of contracts

```ts
const title: string = "Report generation failed";
const attempts: number = 3;
const isRecurring: boolean = true;
const correlationId: string | null = null;

const tags: string[] = ["etl", "reporting"];
const pageCursor: readonly [createdAt: string, id: string] = [
  "2026-09-16T10:00:00.000Z",
  "inc_123",
];
```

An array is a collection of values with the same type. A tuple represents positions with defined meaning and order; here, date always comes before id. Use a tuple when position truly belongs to the contract. For objects sent through HTTP, named properties are almost always easier to read.

TypeScript infers much without manual annotation:

```ts
const retryLimit = 3;

const priorities = ["low", "medium", "high"] as const;
type Priority = (typeof priorities)[number];
// "low" | "medium" | "high"
```

`as const` preserves literal values and makes the collection read-only. A list that exists at runtime can therefore also generate the accepted compile-time type.

### Literal types, unions, and enums

For small external values, a literal union is often transparent:

```ts
type Role = "reporter" | "analyst" | "manager" | "admin";
```

An `enum` also defines a named set of values and should be studied:

```ts
enum IncidentPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
}
```

However, regular enums exist as objects at runtime and generate JavaScript. For HTTP contracts, literal unions and `as const` usually keep JSON closer to the code. Use an enum when its runtime behavior or naming ergonomics brings real value; do not use it by habit.

## `type` or `interface`? Choose based on the contract shape

Both can describe objects:

```ts
interface CreateIncidentInput {
  title: string;
  priority: Priority;
  description?: string;
}

type IncidentId = string;
```

A simple convention works well:

- use `interface` for object contracts you expect to implement or extend, such as DTOs and repository ports;
- use `type` for unions, intersections, primitive aliases, and derived types.

A union, for example, naturally belongs to `type`:

```ts
type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };
```

There is no universal winner. The choice should be consistent, and a name should represent a concept rather than an opportunity to “use more TypeScript.”

## Make invalid states fail before the API runs

An open incident has no resolution. A resolved incident needs one. Too many optional fields make this rule easy to forget:

```ts
// Avoid this: it accepts a resolved status without a resolution.
interface LooseIncident {
  status: string;
  resolution?: string;
}
```

A discriminated union represents every valid state:

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
  title: "Report generation failed",
  reportedBy: "usr_42",
  status: "resolved",
  resolution: {
    summary: "The data query was corrected.",
    fixedInVersion: "2026.09.1",
  },
};

// Error: a resolution is required for resolved status.
const invalid: Incident = {
  id: "inc_124",
  title: "Email delivery failed",
  reportedBy: "usr_42",
  status: "resolved",
};
```

`status` is the discriminant. When it is tested, TypeScript knows which shape exists in the rest of the object. This reduces defensive `if` statements scattered through the project.

### Exhaustive checking and `never`

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

If someone adds `cancelled` to the union and forgets this `switch`, the `default` no longer receives `never`, and compilation points to the incomplete change. This is the compiler participating in architecture.

Intersections also have a place when they combine real concepts:

```ts
type AuthenticatedRequest = HttpRequest & { auth: AuthContext };
```

But an intersection does not validate data and should not be used to “glue” unrelated objects together until the compiler accepts the code.

## `unknown`, narrowing, and safety around `null`

External input should begin as `unknown`, not `any`:

```ts
function dangerous(body: any): string {
  return body.priority.toUpperCase();
}
```

`any` disables protection at the most dangerous boundary. `unknown` forces you to prove the shape before accessing properties:

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

This parser is intentionally short to highlight the reasoning. In a real project, a schema library can reduce repetition. The point is knowing that a TypeScript annotation does not validate JSON.

`typeof`, `instanceof`, equality, the `in` operator, and functions returning `value is Type` are type guards. Refining a union after these checks is called *narrowing*. The same applies to errors:

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

Use optional chaining only when absence is accepted by the domain: `incident.assignee?.email`. Do not hide a broken rule with `?.`; if a user should exist, handle that state explicitly.

## Generics: preserve relationships, do not create an empty layer

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

The generic preserves the input type in the output: an incident goes in, an incident comes out; a user goes in, a user comes out. `ApiResult<T>`, pagination, and HTTP clients are good uses. Generic classes can fit infrastructure details, but be careful with universal repositories such as `findBy(field: keyof T, value: unknown)`: they often hide queries, rules, and index needs.

> If a generic needs many parameters, conditionals, and a page of explanation to solve something simple, it is probably increasing the cost of change.

## A REST API is a public contract

The HTTP adapter should receive, validate, call the use case, and translate the response. Business rules should not depend on `request`, `response`, or a framework:

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

Standardize errors:

```ts
type ApiError =
  | { code: "VALIDATION_ERROR"; status: 400; details: ValidationIssue[] }
  | { code: "UNAUTHENTICATED"; status: 401 }
  | { code: "FORBIDDEN"; status: 403 }
  | { code: "INCIDENT_NOT_FOUND"; status: 404 }
  | { code: "CONFLICT"; status: 409 };
```

Versioning through a path, such as `/v1/incidents`, is an understandable initial solution. Still, preserve existing fields where possible, prefer additive changes, and document removals. A new version does not replace compatibility.

OpenAPI turns the public contract into a verifiable document:

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

OpenAPI does not replace validation or testing. It records the promise that people and tools can inspect, test, or use to generate a collection.

## Authentication, authorization, and business rules are not the same thing

Authentication answers “who is this person?”. Authorization answers “can this person perform this action on this resource?”. A role is not a universal permission.

Middleware validates a credential and builds the identity:

```ts
type AuthContext = {
  userId: string;
  roles: readonly Role[];
};
```

The decision to resolve an incident belongs in a policy or use case because it may depend on the incident, team, and role:

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

Check authorization on the server for every action that changes data and, when a specific resource exists, validate scope, team, or ownership too. Start by denying access by default and grant explicit permissions.

## The use case coordinates transaction and persistence

Resolving an incident changes its status and writes an audit event. Both steps must commit together:

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

The use case knows the rule and coordinates ports. Infrastructure uses the same database connection for the whole block. With `node-postgres`, `BEGIN`, queries, and `COMMIT` must use the same client from the pool.

Do not make HTTP calls, send email, or publish external messages inside a long transaction. A transaction protects the database; it does not undo external effects that have already been sent. When the problem needs reliable delivery after commit, study the outbox pattern as a separate decision.

## Compilation, runtime, and HTTP-contract tests

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

The second is a compilation test: if someone weakens the union, `@ts-expect-error` starts failing because the expected error no longer exists. Use it deliberately. Add integration tests for `400`, `401`, `403`, `404`, transaction rollback, the OpenAPI contract, and concurrent status changes.

Publish requests, responses, and a test collection. A cURL example makes the project demonstrable:

```bash
curl --request POST http://localhost:3000/v1/incidents \
  --header "Authorization: Bearer <test-token>" \
  --header "Content-Type: application/json" \
  --data '{
    "title": "Monthly report generation failed",
    "priority": "high",
    "description": "The file was not created after processing."
  }'
```

Never place a real token in the collection or repository.

## A lab that proves learning

Create `ts-api-architecture-lab` with separated responsibilities:

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

Prepare Node LTS, TypeScript, `pnpm` or `npm`, a terminal, Git, VS Code, and predictable scripts: `dev`, `build`, `typecheck`, `test`, `test:integration`, `lint`, and `openapi:validate`. Configure CI to run typecheck and tests, show the badge in the README, and publish a secret-free `.env.example`.

The professional README should explain the problem, architecture, prerequisites, variables, execution, endpoints, tests, and decisions. Write it in Portuguese and add a technical English summary. Use issues, branches, atomic commits, a simple rebase, pull requests, and self-review even when you work alone.

## Compare approaches and record the limits

| Comparison | When it helps | Where it fails |
| --- | --- | --- |
| `any` vs. `unknown` | `unknown` requires validation | widespread `any` removes guarantees; accept only a temporary, contained exception |
| optional fields vs. discriminated union | a union blocks invalid combinations | a very large union can harm readability |
| `interface` vs. `type` | interface for objects; type for composition | switching without criteria creates duplicate project language |
| small generic vs. universal repository | a generic preserves a reusable relationship | universal abstraction hides queries and rules |
| alias vs. relative import | alias helps a large tree | runtime or tests break if resolution diverges |
| simple RBAC vs. resource policy | a role is a good starting point | role-only checks ignore ownership, team, and scope |

Build examples that break: send JSON with a wrong field, add a status without updating `switch`, attempt resolution without permission, and force an event write failure to confirm rollback. The right question is: in which layer should the error appear, and which test proves that?

## Three practical articles derived from the lab

### 1. TypeScript in APIs: How to Turn Unknown JSON into a Reliable Contract

Start with the mistake of using `as` on a request body. Then show `unknown`, type guards or a schema, error requests, and the difference between static types and runtime validation.

### 2. Discriminated Unions in Practice: Preventing Invalid States Before the API Runs

Use the incident lifecycle to show why `status: "resolved"` requires a resolution. Include `never`, exhaustive checking, and a compilation test.

### 3. Authentication, Authorization, and Transactions: Three Boundaries an API Must Not Confuse

Explain who the user is, what the user can do, and what must commit together in the database. Show a policy, use case, rollback, and what a transaction does not solve.

Each article can have 800 to 1,500 words: introduction, problem, code, tests, trade-offs, conclusion, and GitHub link. A vlog can show the failing test first and then the contract change that removes the problem.

## How to explain the decision in simple technical English

> TypeScript types do not validate incoming JSON at runtime, so the HTTP adapter treats request bodies as `unknown` and validates them before calling the use case. We use discriminated unions for the incident lifecycle because a resolved incident must contain a resolution. This makes invalid states fail during compilation, while integration tests still protect the runtime boundary and database transaction.

This answer presents a limit, decision, and evidence. It is stronger than merely saying “I used TypeScript strict.”

## Frequently asked questions

### Does TypeScript remove the need for API validation?

No. Types do not keep protecting input after JavaScript is running. JSON, database records, tokens, and integrations still require runtime validation and error handling.

### Does `strict` remove every bug?

No. It does not decide business rules, verify credentials, know whether a query returned the correct record, or measure performance. It reveals classes of errors before execution.

### Should I remove every `any` immediately?

Prioritize external boundaries and `any` values that allow dangerous operations. In a gradual migration, a contained adapter can exist, but it needs a reason, owner, and removal plan.

### Do more advanced types always improve architecture?

No. A type no one can explain makes changes expensive. Complexity needs to pay for something real: blocking an invalid state, preserving a relationship, or making a public interface safer.

## What you should take away from this cycle

Deep TypeScript is not a collection of generic tricks. It is using the type system to expose decisions: what enters the API, what can exist in the domain, what each layer can call, and what must break when a rule changes.

You have completed E007 when you can build a small API with `strict`, treat input as `unknown`, model incompatible states, validate and document endpoints, separate authentication from authorization, coordinate transactional persistence, and prove it with tests, CI, requests, and a README. In your portfolio, describe concrete impact: more reliability by rejecting invalid payloads, more security through server-side authorization, lower maintenance cost through explicit contracts, and more productivity through executable documentation.

## Primary references

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
