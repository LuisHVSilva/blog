---
translationId: 4e131313-1313-4313-8313-131313131313
articleId: e0131313-1313-4313-8313-131313131313
locale: en
slug: deep-typescript-quality-refactoring
title: "Deep TypeScript for Quality and Refactoring: Types as an Architecture Tool"
description: "A practical guide to using strict TypeScript, state modeling, narrowing, generics, and tests as tools for quality, safe refactoring, and error prevention before runtime."
status: draft
---

# Deep TypeScript for Quality and Refactoring: Types as an Architecture Tool

Learning TypeScript professionally does not mean memorizing every possible way to declare a type. The goal is to make the compiler work for the architecture: make contracts explicit, prevent invalid states, reduce ambiguity, and allow changes with less risk.

In this cycle, the context is **quality and refactoring**. Every concept should therefore answer a practical question: how does this feature make the code easier to understand, test, modify, and review?

TypeScript will be used as a tool for four capabilities:

1. modeling contracts between parts of the system;
2. representing valid states and eliminating impossible combinations;
3. making refactoring safer;
4. producing objective quality evidence through tests and tools.

> Strong typing does not replace testing or good design. It reduces one class of errors and makes design decisions verifiable before runtime.

<!-- VISUAL:
A four-block flow: external input -> validation/narrowing -> typed domain -> tests/refactoring.
Around the domain, highlight: contracts, valid states, compiler feedback, and coverage.
-->

## The problem that guides the lab

Imagine a service that receives payment requests. An initial version may represent state like this:

```ts
type Payment = {
  id: string;
  status: string;
  approvedAt?: Date;
  rejectedReason?: string;
};
```

This type accepts contradictory combinations:

```ts
const payment: Payment = {
  id: "pay-1",
  status: "approved",
  rejectedReason: "insufficient_funds",
};
```

The compiler does not complain. The structure allows an approved payment with a rejection reason and accepts any text as `status`.

The goal of the lab is to transform this code into a model where impossible states cannot be represented.

A first improvement:

```ts
type PendingPayment = {
  id: string;
  status: "pending";
};

type ApprovedPayment = {
  id: string;
  status: "approved";
  approvedAt: Date;
};

type RejectedPayment = {
  id: string;
  status: "rejected";
  rejectedReason: string;
};

type Payment =
  | PendingPayment
  | ApprovedPayment
  | RejectedPayment;
```

Now the compiler participates in the business rule. An invalid state requires an explicit contract violation instead of appearing silently.

## `tsconfig` is part of the architecture

A professional project should start with a compiler configured to expose ambiguity instead of hiding it.

One possible baseline:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"]
    }
  }
}
```

`strict` enables a set of checks that make absence, parameters, and returns more explicit. `noImplicitAny` prevents typing gaps from becoming `any` by accident.

`exactOptionalPropertyTypes` deserves attention. Without it, an optional property may explicitly accept `undefined` in situations where the original intention was only to allow absence:

```ts
type UserPatch = {
  displayName?: string;
};
```

With the option enabled, these operations carry different meanings:

```ts
const a: UserPatch = {};
const b: UserPatch = { displayName: undefined }; // error if undefined is not part of the type
```

This is especially useful for update DTOs, where "field missing" can mean "do not change it" and `undefined` should not necessarily be accepted as a value.

Module paths also require discipline. An alias can improve readability, but it should not hide circular dependencies or make the structure harder to understand.

## Primitive types, arrays, tuples, and inference

Simple types still matter because they compose larger contracts.

```ts
const active: boolean = true;
const retryCount: number = 3;
const customerId: string = "cus_123";

const tags: string[] = ["typescript", "quality"];
const point: readonly [number, number] = [10, 20];
```

A tuple represents positions with known meaning. An array represents a homogeneous collection. Replacing one with the other without thinking can destroy information.

Compare:

```ts
type CoordinatesArray = number[];
type CoordinatesTuple = readonly [latitude: number, longitude: number];
```

The tuple expresses a more precise contract. The array accepts zero, one, or fifty numbers.

Inference should also be used consciously:

```ts
const maxRetries = 3;
```

Repeating `: number` here adds little information. The goal is not to annotate everything; it is to make important boundaries explicit.

## Literal types and enums

Literal types restrict values without introducing a larger abstraction:

```ts
type LogLevel = "debug" | "info" | "warn" | "error";
```

An alternative is an enum:

```ts
enum LogLevelEnum {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
}
```

Both approaches can work.

Literal unions often integrate naturally with JSON data and produce little runtime code. Enums can be useful when a named runtime object is desirable or when the codebase already follows that convention.

The important exercise is not to define a universal rule. It is to compare the cost of each choice in the project context.

## `type` versus `interface`

Both constructs represent contracts, but they have different strengths.

```ts
interface User {
  id: string;
  name: string;
}
```

```ts
type User = {
  id: string;
  name: string;
};
```

Interfaces are naturally extensible:

```ts
interface Auditable {
  createdAt: Date;
}

interface User extends Auditable {
  id: string;
}
```

Types work naturally with unions, intersections, and aliases for non-object types:

```ts
type UserId = string;
type LoadState = "idle" | "loading" | "success" | "error";
type AdminUser = User & { permissions: string[] };
```

A reasonable convention is to use `interface` when the main goal is to describe an extensible public object shape and `type` when unions, intersections, or algebraic composition are central.

But a convention should reduce friction. Do not turn this choice into a style war.

## Unions: represent real possibilities

A union declares that a value may take one of a known set of forms:

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

This is stronger than returning ambiguous combinations:

```ts
type WeakResult<T> = {
  value?: T;
  error?: string;
};
```

In the weak type, `value` and `error` may both be present or both be missing.

In the stronger type:

```ts
function handleResult(result: Result<string>): string {
  if (result.ok) {
    return result.value;
  }

  return result.error;
}
```

The `ok` discriminant enables automatic narrowing.

## Discriminated unions and invalid states

Consider a loading process:

```ts
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

The model prevents states such as:

```ts
{
  status: "loading",
  data: someData,
  error: new Error("x")
}
```

The idea is powerful because it brings the type close to a state machine.

In larger systems, this reduces defensive conditionals spread across the code and makes tests easier: each variant can be validated independently.

## `never` and exhaustive checking

When a union represents all possible states, the compiler can verify that all of them are handled:

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function describePayment(payment: Payment): string {
  switch (payment.status) {
    case "pending":
      return "Pending";
    case "approved":
      return `Approved at ${payment.approvedAt.toISOString()}`;
    case "rejected":
      return `Rejected: ${payment.rejectedReason}`;
    default:
      return assertNever(payment);
  }
}
```

If a new variant is added:

```ts
type RefundedPayment = {
  id: string;
  status: "refunded";
  refundedAt: Date;
};
```

and `Payment` includes it, the `switch` stops compiling until the new case is handled.

This turns domain evolution into immediate refactoring feedback.

## Intersection types: compose without hiding intent

Intersections combine contracts:

```ts
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type User = {
  id: string;
  email: string;
};

type PersistedUser = User & Timestamped;
```

They are useful when concepts genuinely combine. However, deep compositions can produce types that are hard to read and long error messages.

Compare:

```ts
type Complex =
  A & B & C & D & E;
```

with a named contract that communicates intention:

```ts
interface RegisteredCustomer {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Less abstraction can be the more professional choice when it improves readability.

## Generics: preserve information

Generics are useful when an operation must work with multiple types without losing the relationship between input and output.

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

Without a generic:

```ts
function first(items: unknown[]): unknown {
  return items[0];
}
```

The second version loses information about the element type.

In repositories:

```ts
interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
}
```

In DTOs:

```ts
type ApiResponse<TData> = {
  data: TData;
  requestId: string;
};
```

But the goal is not to make everything generic.

This can be excessive:

```ts
class Processor<
  TInput,
  TOutput,
  TContext,
  TStrategy,
  TMetadata,
  TError
> {
  // ...
}
```

If nobody can quickly explain why every parameter exists, the abstraction may cost more than it provides.

> A generic should preserve a useful relationship between types. If it only makes the code more indirect, question the abstraction.

## Constraints and safer generics

A generic can restrict capabilities:

```ts
type Entity = {
  id: string;
};

function indexById<T extends Entity>(
  entities: readonly T[],
): Map<string, T> {
  return new Map(entities.map((entity) => [entity.id, entity]));
}
```

`extends Entity` communicates that the function does not accept any arbitrary value. It requires something with an `id`.

You can also use `keyof`:

```ts
function getProperty<T, K extends keyof T>(
  object: T,
  key: K,
): T[K] {
  return object[key];
}
```

The compiler preserves the relationship between the key and the returned value type.

## `unknown` instead of `any`

`any` disables checking:

```ts
function parseBody(value: any) {
  return value.user.profile.name.toUpperCase();
}
```

This compiles even when none of those properties exist.

`unknown` forces validation before use:

```ts
function parseBody(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string"
  ) {
    return value.name;
  }

  throw new Error("Invalid body");
}
```

In real systems, external data is a natural candidate for `unknown`:

- `JSON.parse`;
- request bodies;
- queue events;
- external API responses;
- file contents;
- integration inputs.

After validation, internal code can work with safe contracts.

## Type guards and narrowing

A type guard encapsulates a check:

```ts
type Customer = {
  id: string;
  email: string;
};

function isCustomer(value: unknown): value is Customer {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}
```

Usage:

```ts
function loadCustomer(input: unknown): Customer {
  if (!isCustomer(input)) {
    throw new Error("Invalid customer");
  }

  return input;
}
```

After the guard, the compiler knows that `input` is a `Customer`.

In larger applications, schema libraries can centralize runtime validation. Even then, understanding the underlying mechanism is important before delegating it.

## Null safety, optional chaining, and `??`

Absence should be modeled deliberately.

```ts
function findUser(id: string): User | null {
  // ...
  return null;
}
```

The caller must handle it:

```ts
const user = findUser("123");

if (user === null) {
  throw new Error("User not found");
}

console.log(user.name);
```

Optional chaining is useful when absence is expected:

```ts
const city = customer.address?.city;
```

But indiscriminate use can hide missing rules:

```ts
payment.customer?.account?.owner?.email
```

Ask: does every `?` represent legitimate absence, or an inconsistency that should have been rejected earlier?

For defaults, `??` is often semantically more accurate than `||`:

```ts
const retries = config.retries ?? 3;
```

`??` preserves valid values such as `0`, while `||` would treat them as falsy.

## Utility types without turning the domain into a puzzle

TypeScript provides utility types:

```ts
type User = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

type CreateUserInput = Omit<User, "id">;
type UserPatch = Partial<Pick<User, "name" | "email" | "active">>;
type PublicUser = Pick<User, "id" | "name">;
```

They reduce duplication, but they should not erase intention.

Compare:

```ts
type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt" | "status">;
```

with:

```ts
type CreateUserInput = {
  name: string;
  email: string;
};
```

If the second contract represents an important business boundary, writing it explicitly may be clearer and more resistant to accidental changes in `User`.

## Branded types to avoid mixing equal-looking values

Two identifiers may both be strings without meaning the same thing.

```ts
type UserId = string;
type OrderId = string;
```

This still allows:

```ts
const userId: UserId = "u1";
const orderId: OrderId = userId;
```

One possible technique is branding:

```ts
type Brand<T, TBrand extends string> =
  T & { readonly __brand: TBrand };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
```

Now the types are incompatible without an explicit conversion.

This approach has a cost: it requires creation functions, validation, and team understanding. Use it when confusion between structurally equal values is a real risk, not merely to make types look more sophisticated.

## Tests: each level answers a different question

TypeScript reduces static errors. Tests verify behavior.

### Unit test

Isolates a small unit:

```ts
import assert from "node:assert/strict";
import test from "node:test";

test("rejects an invalid state transition", () => {
  assert.throws(
    () => approveRejectedPayment(),
    /cannot approve rejected payment/,
  );
});
```

It is fast and useful for local rules.

### Integration test

Validates real components working together: repository + database, parser + filesystem, handler + service.

```ts
test("persists an approved payment with its timestamp", async () => {
  const payment = await service.approve("pay-1");

  const saved = await repository.findById(payment.id);

  assert.equal(saved?.status, "approved");
});
```

### Contract test

Verifies that two sides agree on the same contract. It can validate HTTP schemas, events, or service integrations.

The goal is to detect incompatible changes before producer and consumer are deployed separately.

### End-to-end test

Exercises the flow closest to the user or external client.

It is more expensive and usually slower, so it should not replace smaller tests.

A healthy strategy has layers: many fast tests for local rules, enough integration tests for real boundaries, and a small number of e2e tests for critical paths.

## Safe refactoring: small steps

Refactoring is not rewriting.

A safer sequence:

1. characterize current behavior with tests;
2. make one small structural change;
3. run the compiler, lint, and tests;
4. inspect the diff;
5. confirm observed behavior remains the same;
6. repeat.

Example: replacing free-form strings with a union.

Before:

```ts
type Ticket = {
  status: string;
};
```

First discover real values in tests and code. Then:

```ts
type TicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

type Ticket = {
  status: TicketStatus;
};
```

The compiler will point to locations that depended on invalid or undocumented values.

Compiler errors become a work list for the refactor.

## Characterization before change

Legacy code does not always have enough tests. Before changing a complex function, write tests that record its current behavior, including strange behavior that must remain until an explicit decision changes it.

```ts
test("keeps legacy rounding behavior", () => {
  assert.equal(calculateFee(10.005), 10.01);
});
```

This test does not declare that the behavior is ideal. It creates a safety net so the refactor does not alter rules accidentally.

## Code smells the lab should expose

### Coupling

A function that instantiates dependencies directly is difficult to test:

```ts
async function createReport() {
  const database = new ProductionDatabase();
  const mailer = new SmtpMailer();

  // ...
}
```

One alternative is to receive dependencies:

```ts
type ReportDependencies = {
  repository: ReportRepository;
  mailer: Mailer;
};

async function createReport(
  dependencies: ReportDependencies,
): Promise<void> {
  // ...
}
```

This makes the contract explicit and reduces hidden dependencies.

### Duplication

If several functions repeat the same validation, a rule change requires edits in multiple places.

Before extracting, verify whether the duplication is actually the same concept. Similar code does not necessarily mean the same rule.

### Poor names

```ts
function process(data: any): any {
  // ...
}
```

Compare with:

```ts
function calculateInvoiceTotal(
  invoice: Invoice,
): Money {
  // ...
}
```

The second contract reduces mental work before opening the implementation.

### Long functions

A long function often mixes abstraction levels: validation, calculation, persistence, and formatting.

Extraction should follow responsibility, not only line count.

### Hidden dependencies

Reading `process.env`, the system clock, or a global singleton inside domain logic makes tests harder.

```ts
interface Clock {
  now(): Date;
}
```

Injecting a small abstraction can make behavior deterministic.

## Before and after: refactoring a service

Before:

```ts
export async function updateOrder(
  order: any,
  data: any,
) {
  if (data.status === "paid") {
    order.status = data.status;
    order.paidAt = new Date();
  }

  if (data.status === "cancelled") {
    order.status = data.status;
    order.cancelReason = data.reason;
  }

  return db.save(order);
}
```

Problems:

- `any` removes guarantees;
- accepted states are undocumented;
- the clock is a hidden dependency;
- `reason` may be missing;
- invalid transitions are not explicit;
- persistence and domain rules are mixed.

After:

```ts
type UpdateOrderCommand =
  | { type: "pay" }
  | { type: "cancel"; reason: string };

type Order =
  | {
      id: string;
      status: "open";
    }
  | {
      id: string;
      status: "paid";
      paidAt: Date;
    }
  | {
      id: string;
      status: "cancelled";
      cancelReason: string;
    };

interface Clock {
  now(): Date;
}

function updateOrder(
  order: Order,
  command: UpdateOrderCommand,
  clock: Clock,
): Order {
  if (order.status !== "open") {
    throw new Error("Only open orders can change state");
  }

  switch (command.type) {
    case "pay":
      return {
        id: order.id,
        status: "paid",
        paidAt: clock.now(),
      };

    case "cancel":
      return {
        id: order.id,
        status: "cancelled",
        cancelReason: command.reason,
      };

    default:
      return assertNever(command);
  }
}
```

Persistence can stay outside the pure function. This makes unit testing easier and the domain easier to read.

## Lint: consistency and mechanical errors

Lint does not measure architecture, but it catches repetitive problem classes and keeps the project consistent.

Configure rules that matter for the lab, for example:

- unused imports;
- floating promises;
- explicit `any` without justification;
- unnecessary conditions;
- inconsistent returns;
- unsafe TypeScript patterns.

Do not turn lint into hundreds of cosmetic rules that make contribution harder without improving quality.

## Coverage: execution map, not a quality score

Coverage tells you which lines, branches, or functions were executed during tests.

A 100% report does not prove good assertions.

```ts
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("division by zero");
  }

  return a / b;
}
```

A test may execute every line and still validate very little.

Use coverage to find unexercised areas, not as a substitute for analysis.

For the lab, save:

- line coverage;
- branch coverage;
- uncovered functions;
- major gaps and the decision for each one.

## Mutation testing: would your tests notice a bug?

Mutation testing intentionally changes small parts of the code.

Original:

```ts
return total > limit;
```

Mutation:

```ts
return total >= limit;
```

If every test still passes, perhaps no test protects the exact boundary.

Mutation testing is more expensive than coverage, but it helps evaluate assertion strength.

It does not need to run on every commit. It can target a small module or run in a separate pipeline.

## Complexity: use numbers as signals, not verdicts

Metrics such as cyclomatic complexity can highlight functions with many decisions.

```ts
function processOrder(...) {
  if (...) {
    if (...) {
      // ...
    }
  }

  if (...) {
    // ...
  }

  switch (...) {
    // ...
  }
}
```

A high value may indicate a need for extraction or better state modeling, but a metric alone does not understand the domain.

Use the number to ask "why is this function difficult?" rather than automatically concluding that the code is bad.

## A lab that proves your knowledge

Create the `typescript-quality-refactoring-lab` repository:

```text
src/
  domain/
    payment.ts
    order.ts
  application/
    update-order.ts
  contracts/
    api.ts
  infrastructure/
    in-memory-order-repository.ts
tests/
  unit/
  integration/
  contract/
  e2e/
docs/
  adr/
  refactorings/
  measurements/
```

Set up:

- active Node.js LTS;
- TypeScript;
- strict `tsconfig`;
- ESLint;
- tests with `node:test`, Vitest, or Jest;
- coverage;
- CI;
- mutation testing for one small module;
- predictable scripts.

Example:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:mutation": "stryker run",
    "quality": "npm run typecheck && npm run lint && npm test"
  }
}
```

Another person should be able to clone the repository, install dependencies, and run the evidence without a private conversation.

## Study sequence inside the lab

### Experiment 1 — `strict`

Start with a loosely typed module.

Enable `strict` and record the errors found.

Classify them:

- null/undefined;
- implicit inference gaps;
- untyped parameters;
- unsafe access;
- ambiguous return.

Fix them without using `as` or `any` merely to silence the compiler.

### Experiment 2 — remove `any`

Choose an external boundary:

```ts
function handleMessage(message: any) {
  // ...
}
```

Change it to:

```ts
function handleMessage(message: unknown) {
  // ...
}
```

Implement narrowing or validation.

Record which assumptions had been hidden by `any`.

### Experiment 3 — model states

Start with independent booleans:

```ts
type Job = {
  loading: boolean;
  success: boolean;
  failed: boolean;
};
```

This type accepts:

```ts
{
  loading: true,
  success: true,
  failed: true
}
```

Refactor to:

```ts
type JobState =
  | { status: "loading" }
  | { status: "success"; completedAt: Date }
  | { status: "failed"; error: Error };
```

Show which combinations no longer compile.

### Experiment 4 — exhaustive checking

Add a new variant to the union and capture the error produced by code that did not handle the new state.

That CI output or screenshot is direct evidence that the compiler participates in domain evolution.

### Experiment 5 — useful generic versus excessive generic

Implement the same need in two ways:

1. a specific and explicit function;
2. a reusable generic abstraction.

Compare:

- readability;
- number of types involved;
- actual reuse;
- error messages;
- effort for new team members to understand it.

Do not choose the generic version merely because it looks more advanced.

### Experiment 6 — refactoring protected by tests

Choose a long function.

Before changing it:

- write characterization tests;
- record coverage;
- run mutation testing on a small section.

Afterward:

- extract responsibilities;
- improve types;
- remove hidden dependencies;
- run the same suite.

The expected outcome is not "more files." It is lower risk for future changes.

## Compare approaches and record where they fail

| Comparison | What to observe | Where each option fails |
| --- | --- | --- |
| `any` vs. `unknown` | initial speed, safety, and required narrowing | `any` allows silent errors; `unknown` requires extra validation |
| `type` vs. `interface` | extensibility, unions, composition, consistency | style dogma creates noise; inconsistent choice increases cognitive cost |
| enum vs. literal union | runtime, JSON interoperability, readability | enum adds runtime representation; union may not provide a named object |
| optional fields vs. discriminated union | representable states and clarity | optionals may allow invalid combinations; unions can be verbose |
| specific function vs. generic | reuse and readability | specific code duplicates if the pattern is real; excessive generic hides intent |
| unit vs. integration tests | speed, isolation, confidence | mocks can lie; integration tests can become slower and harder to diagnose |
| coverage vs. mutation testing | executed scope and assertion strength | high coverage does not prove quality; mutation costs more time |
| large refactor vs. small steps | diff size, risk, reversibility | rewrites are harder to review; small steps can feel slower initially |

## Build examples that break

Depth comes from understanding limits.

Run at least these experiments:

1. remove a case from the `switch` and observe exhaustive checking;
2. replace `unknown` with `any` and write an access that compiles but fails at runtime;
3. disable `exactOptionalPropertyTypes` and compare the meaning of absence;
4. create a poorly modeled union and force an impossible state;
5. add unnecessary generic parameters and record the loss of readability;
6. write tests with high coverage while allowing a mutation to survive;
7. introduce a global dependency and show how testing becomes less deterministic.

Explain the result with code and evidence, not personal preference.

## Evidence for GitHub and your portfolio

The proof should not be "I studied TypeScript."

Build a set of assessable artifacts:

- a public repository with a professional README in Portuguese;
- a technical summary in English;
- documented strict `tsconfig`;
- before/after refactoring examples;
- small issues describing problems;
- branches and pull requests with rationale;
- CI running `typecheck`, lint, and tests;
- a visible CI badge;
- coverage report;
- one mutation testing experiment;
- a short ADR for a typing decision;
- an article or vlog;
- a portfolio section explaining impact.

One example of well-described impact:

> The refactor replaced four independent boolean flags with a discriminated union containing four valid states. After the change, contradictory combinations were no longer representable, and adding a new state started producing compile-time errors in every non-exhaustive handling point.

This is verifiable. Avoid vague claims such as "the code became 80% safer" without a method that can support the number.

## Professional README

The README can contain:

1. lab objective;
2. selected quality problem;
3. minimal architecture;
4. requirements;
5. installation;
6. commands;
7. `tsconfig` decisions;
8. test structure;
9. completed refactorings;
10. metrics and limitations;
11. trade-offs;
12. next experiments.

Include a short English section:

```md
## English summary

This repository explores TypeScript as a design and refactoring tool.
It focuses on strict compiler settings, invalid-state prevention,
safe boundary validation, exhaustive checking, automated tests,
and measurable refactoring evidence.
```

## Issues and PRs even when working alone

Example sequence:

### Issue

`refactor: replace boolean payment flags with a discriminated union`

Describe:

- current problem;
- example invalid state;
- behavior that must remain;
- acceptance criteria;
- required tests.

### Pull request

Record:

- what changed;
- what did not change;
- which error the compiler now catches;
- tests executed;
- introduced trade-off;
- follow-ups.

Perform your own review before merge.

This process demonstrates engineering discipline, not only coding ability.

## Three practical articles derived from the lab

### 1. How I Used TypeScript to Model Quality and Refactoring More Safely

Start with a real problem from the lab.

Show the weak version:

```ts
type Process = {
  status: string;
  error?: string;
  data?: Data;
};
```

Then present a discriminated union.

Show:

- which invalid states existed;
- which errors became compile-time failures;
- how tests changed;
- what readability cost the new model introduced;
- where you would avoid this solution.

Finish with the repository link and a CI evidence snippet.

### 2. `unknown`, `never`, and Generics: What Actually Changes in Everyday Code

Use small executable examples.

Suggested structure:

1. an `any` that hides an error;
2. the same boundary with `unknown`;
3. a `switch` that uses `never`;
4. a generic that preserves information;
5. an excessive generic abstraction;
6. conclusions about cost and benefit.

The article should teach decisions, not only syntax.

### 3. What My TypeScript Lab Proves About My Growth as a Developer

Present the repository structure.

Explain:

- which files represent each concept;
- why each test exists;
- what CI verifies;
- where coverage helped;
- where mutation testing found a gap;
- which limitations remain;
- what you would refactor next.

Include a final section:

**What this project demonstrates for international roles**

Use simple, factual English to describe:

- type safety;
- test strategy;
- refactoring discipline;
- engineering process;
- trade-off communication.

## Recommended article format

Each article can contain 800 to 1,500 words.

Structure:

1. introduction;
2. problem;
3. code before;
4. design decision;
5. code after;
6. tests;
7. metrics or evidence;
8. trade-offs;
9. limitations;
10. conclusion;
11. GitHub link.

A vlog can follow the same narrative and show:

- terminal;
- TypeScript error;
- failing test;
- change;
- passing test;
- pull request;
- coverage or mutation report.

## How to explain trade-offs in an international interview

Use simple technical English and verifiable statements.

> We replaced multiple optional fields with a discriminated union because those fields allowed contradictory states. The compiler now narrows each case and exhaustive checking alerts us when a new state is added. The trade-off is that the model is more verbose, so we use this approach only where the state machine is meaningful.

Another example:

> We use `unknown` at external boundaries instead of `any`. It requires explicit validation before accessing data, which adds some code, but it prevents untrusted input from silently bypassing type checking.

Another:

> I introduced a generic repository only after two implementations showed the same contract. I avoided adding more type parameters because the abstraction was becoming harder to read than the duplicated code.

This type of answer shows context, decision, and cost.

## Technical completion checklist

You have completed E013 when you can:

- explain the effect of `strict`, `noImplicitAny`, and `exactOptionalPropertyTypes`;
- use inference without redundant annotations;
- consciously choose between `type` and `interface`;
- model a state machine with a discriminated union;
- implement exhaustive checking with `never`;
- replace `any` with `unknown` at a real boundary;
- write type guards or consciously use runtime validation;
- create generics that preserve information without excessive abstraction;
- explain null safety, optional chaining, and `??`;
- distinguish unit, integration, contract, and e2e tests;
- perform a refactor in small steps;
- identify coupling, duplication, poor names, long functions, and hidden dependencies;
- interpret coverage without treating it as a quality score;
- run at least one small mutation testing experiment;
- compare two approaches and record where each one fails;
- explain a trade-off in simple technical English;
- produce public evidence another person can run and assess.

## What you should take away from this cycle

Deep TypeScript is not a collection of type tricks.

It is the ability to turn implicit rules into verifiable contracts, prevent invalid states before runtime, and use compiler feedback to change software with less risk.

In the context of quality and refactoring, the language works best when combined with tests, lint, metrics, and engineering process. The compiler exposes broken contracts; tests protect behavior; coverage reveals unexecuted paths; mutation testing challenges assertion strength; issues and pull requests record how the change was reasoned about.

You have completed this cycle when you can take a fragile module, identify ambiguity, strengthen its contracts, refactor it in small steps, and demonstrate the improvement with reproducible evidence.

The final result must be assessable without a private conversation: a public repository, bilingual README, strict configuration, CI, tests at different levels, before/after refactoring evidence, measurements, and an article or vlog that explains both the gains and the limits of the approach.

## Primary references

- [TypeScript — The `tsconfig.json` File](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [TypeScript — TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [TypeScript — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript — More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [TypeScript — Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript — Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript — `strict`](https://www.typescriptlang.org/tsconfig/strict.html)
- [TypeScript — `noImplicitAny`](https://www.typescriptlang.org/tsconfig/noImplicitAny.html)
- [TypeScript — `exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- [TypeScript — `useUnknownInCatchVariables`](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html)
- [ESLint — Getting Started](https://eslint.org/docs/latest/use/getting-started)
- [Stryker Mutator — JavaScript/TypeScript](https://stryker-mutator.io/)
