---
translationId: 4e181818-1818-4818-8818-181818181818
articleId: e0181818-1818-4818-8818-181818181818
locale: en
slug: teaching-text-quality-refactoring
title: "Teaching Through Writing for Quality and Refactoring: Turning Study into Teachable Knowledge"
description: "A practical guide to turning technical study into articles, written lessons, and vlog scripts using reproducible examples, tests, sources, trade-offs, and public evidence of learning."
status: published
---

# Teaching Through Writing for Quality and Refactoring: Turning Study into Teachable Knowledge

Studying a subject and being able to explain it are different skills.

You can finish documentation, watch a lesson, implement an example, and still struggle to answer clearly:

- what problem does this concept solve?
- where does it fail?
- when should I not use it?
- how do I prove that the improvement actually happened?
- which parts do I understand from experience and which am I repeating from a source?
- how can someone else reproduce my example?
- how would I explain the same decision in a technical interview?

The goal of this cycle is to transform consumed knowledge into organized knowledge.

The context remains **quality and refactoring**. The content should therefore not be an abstract collection of best practices.

Choose a real problem from previous cycles, reproduce it, show a weak version, improve it in small steps, test the behavior, and turn the process into teaching material.

This cycle develops four capabilities:

1. structuring technical knowledge;
2. teaching through reproducible examples;
3. communicating uncertainty and trade-offs precisely;
4. turning study into public evidence of growth.

> Teaching does not prove that you know everything. It shows that you can organize what you know, separate fact from opinion, reproduce behavior, and explain limits.

<!-- VISUAL:
Flow:
Real problem -> hypothesis -> weak example -> test exposing the problem -> refactoring -> new evidence -> article -> vlog.
Beside it:
primary sources, GitHub, CI, trade-offs, limitations.
-->

## The problem that guides the lab

In this cycle, you do not need to invent a new system.

Use a real problem found during the TypeScript, Node.js, architecture, or persistence cycles.

A good lab example:

> an order-creation function mixes validation, business rules, persistence, and email delivery.

Initial code:

```ts
export async function createOrder(
  input: any,
): Promise<any> {
  if (!input.customerId) {
    throw new Error("customer required");
  }

  const customer = await db.customer.findUnique({
    where: {
      id: input.customerId,
    },
  });

  let total = 0;

  for (const item of input.items) {
    const product = await db.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    total += product.price * item.quantity;
  }

  const order = await db.order.create({
    data: {
      customerId: input.customerId,
      total,
    },
  });

  await sendEmail(
    customer.email,
    `Order ${order.id} created`,
  );

  return order;
}
```

You could study many concepts from this code:

- `any`;
- coupling;
- hidden dependencies;
- long functions;
- test difficulty;
- potential duplication;
- mixed domain and infrastructure;
- query-inside-loop behavior;
- unclear public contract;
- side effects coupled to persistence.

But the lesson should not try to teach everything at once.

Choose one question.

Example:

> How can I separate business rules from external dependencies without turning the project into a collection of interfaces?

That question becomes the narrative.

## A lesson needs a central question

A weak article often starts from a broad topic:

> Today we are going to talk about Clean Architecture.

That is too wide.

A stronger article starts from a problem:

> I wanted to test the order-creation rule without starting a database or email server, but the function depended directly on both.

The difference matters.

The reader knows:

- which pain will be addressed;
- why they should keep reading;
- what evidence to expect at the end.

Before writing, complete:

```text
Problem:
______________________________________

Who experiences this problem:
______________________________________

Why it matters:
______________________________________

What I will prove:
______________________________________

What I will NOT try to prove:
______________________________________
```

## Choose a real problem

The problem should come from:

- lab code;
- a bug you reproduced;
- a testing difficulty;
- an actual refactor;
- a query that degraded;
- a type error;
- incorrect runtime behavior;
- a design that became hard to change.

Avoid starting from:

> "I need to publish an article about generics."

Start from:

> "I had three duplicated functions because I had lost the relationship between input and output types. I want to verify whether a generic reduces that duplication without making the code harder to read."

That creates a decision-oriented lesson.

## From notes to a lesson

Study notes may look like:

```text
unknown = requires validation
any = disables checking
never = exhaustive checking
union = several states
```

That is not a lesson yet.

A lesson connects the concepts:

```text
External input is not trusted.
If I type it as `any`, the compiler stops protecting me.
Using `unknown` forces validation before property access.
After validation, a discriminated union can represent only
the allowed states.
If the application must handle all those states, `never`
can detect forgotten cases during refactoring.
```

The knowledge becomes reasoning instead of a list.

## Define the reader level

Write for someone specific.

Example:

> A junior-to-mid-level developer who already uses TypeScript and Node.js but still mixes business rules, infrastructure, and HTTP.

That determines:

- which terms need explanation;
- which can be assumed;
- how much code to show;
- how much context to include.

Do not try to write for:

> "everyone."

A lesson for everyone is often good for no one.

## Explain without hiding precision

Avoiding jargon does not mean removing technical vocabulary.

Weak:

> Dependency inversion decouples dependencies through inversion of control.

The sentence uses terms to explain terms.

Better:

> The use case needs to save an order, but it does not need to know that PostgreSQL is the implementation. It depends on a persistence contract, while application composition selects the concrete implementation.

Then introduce the name:

> This dependency direction is an application of dependency inversion.

The teaching order matters:

1. behavior;
2. problem;
3. solution;
4. name.

## Minimum necessary theory

A practical lesson needs theory.

But only the theory required to understand the experiment.

If the article is about refactoring a coupled handler, you may need to explain:

- responsibility;
- coupling;
- dependency inversion;
- boundaries;
- unit tests.

You probably do not need to explain:

- the full history of Clean Architecture;
- every SOLID principle;
- full DDD;
- CQRS;
- event sourcing.

Depth does not mean infinite breadth.

## The minimum reproducible example

The example should be small enough to understand and complete enough to run.

Structure:

```text
examples/
  order-refactoring/
    src/
    tests/
    package.json
    tsconfig.json
    README.md
```

The reader should be able to run:

```bash
npm install
npm test
npm run typecheck
```

and observe the behavior described in the article.

## An example should not depend on invisible context

Weak:

```ts
const result = await service.execute(input);
```

without explaining:

- what `service` is;
- what `input` is;
- how to run it;
- what result is expected.

Better:

```ts
type CreateOrderInput = {
  customerId: string;
  totalCents: number;
};

class InMemoryOrderRepository {
  readonly saved: CreateOrderInput[] = [];

  async save(
    order: CreateOrderInput,
  ): Promise<void> {
    this.saved.push(order);
  }
}
```

Even a simplified example should form a comprehensible unit.

## Show the weak version first

The reader learns better after seeing the problem.

Example:

```ts
export async function calculateAndSave(
  input: any,
): Promise<void> {
  const price = Number(input.price);
  const quantity = Number(input.quantity);

  await database.query(
    "INSERT INTO items(price, quantity) VALUES ($1, $2)",
    [price, quantity],
  );

  console.log(price * quantity);
}
```

Ask:

- who validates?
- what happens with `NaN`?
- why are calculation and persistence together?
- how can calculation be tested without a database?
- what is the input contract?

Do not call the code "terrible."

Explain the concrete cost.

## Explain why the weak version fails

Do not write only:

> This violates SOLID.

That does not teach.

Write:

> To test the calculation, the test has to cross a database dependency that does not participate in the rule. A change in the SQL client can break a calculation test. That shows that two different reasons for change live in the same module.

Now the reader understands the symptom.

## Create an improvement hypothesis

Example:

> If I separate calculation from persistence, I should be able to test the rule without a database and replace the persistence implementation without changing the calculation.

That hypothesis can be tested.

## Refactor in small steps

### Step 1 — characterization

```ts
test("calculates total before saving", async () => {
  // record current behavior
});
```

### Step 2 — extract the rule

```ts
export function calculateTotal(
  priceCents: number,
  quantity: number,
): number {
  if (quantity <= 0) {
    throw new Error("quantity must be positive");
  }

  return priceCents * quantity;
}
```

### Step 3 — introduce a persistence contract

```ts
export interface ItemRepository {
  save(item: Item): Promise<void>;
}
```

### Step 4 — use case

```ts
export class CreateItem {
  constructor(
    private readonly repository: ItemRepository,
  ) {}

  async execute(
    input: CreateItemInput,
  ): Promise<void> {
    const total = calculateTotal(
      input.priceCents,
      input.quantity,
    );

    await this.repository.save({
      ...input,
      totalCents: total,
    });
  }
}
```

The text should explain the purpose of every step.

## Do not hide the cost of the improvement

The new version added:

- more types;
- more files;
- an interface;
- composition.

That is cost.

The question is:

> does the cost pay for itself?

If the project has:

- multiple implementations;
- tests that need to isolate the database;
- growing rules;
- reuse requirements;

it may be worth it.

If it is a one-off 30-line script, maybe not.

That trade-off turns a tutorial into engineering.

## Before and after code should be comparable

Avoid showing:

### Before

```ts
function x() {
  // 5 lines
}
```

### After

```ts
// full architecture across 14 files
```

without a bridge.

Prefer small transformations.

Show a conceptual diff:

```text
Before:
handler -> database + email + rule

After:
handler -> use case -> repository port
                    -> notifier port
```

Then show the matching code.

## Tests as teaching tools

Tests are not only repository quality.

They are evidence inside the lesson.

Before:

```ts
test("requires real database", async () => {
  // heavy setup
});
```

After:

```ts
test("rejects zero quantity", async () => {
  const repository =
    new InMemoryItemRepository();

  const useCase =
    new CreateItem(repository);

  await assert.rejects(
    useCase.execute({
      priceCents: 1000,
      quantity: 0,
    }),
    /quantity must be positive/,
  );
});
```

The reader can see the benefit.

## Unit tests

Explain the role:

> A unit test verifies a small unit of behavior with controlled dependencies.

Good for:

- value objects;
- pure functions;
- rules;
- use cases with fakes.

Do not use "unit" merely as a synonym for "fast test."

## Integration tests

Explain:

> An integration test verifies that real components work correctly together.

Examples:

- repository + PostgreSQL;
- pipeline + filesystem;
- HTTP client + mock server;
- parser + real file.

Do not replace integration testing with mocks when the goal is to prove integration.

## Contract tests

Explain:

> A contract test protects the shape and behavior of communication between two parts.

Examples:

- HTTP JSON;
- events;
- schemas;
- gateway interfaces;
- simulated external APIs.

It is especially valuable during refactoring.

## E2E

Explain:

> An end-to-end test verifies an assembled flow from an external point of view.

Example:

```text
HTTP -> application -> database -> response
```

Useful for proving wiring.

Expensive for diagnosing the cause of failure.

## The article should teach the role of each test

Do not write only:

> Add unit, integration, and e2e tests.

Show:

```text
Unit:
proves isolated rule.

Integration:
proves real adapter.

Contract:
protects consumer.

E2E:
proves assembled system.
```

## Coverage in the article

If you mention coverage, explain what it answers.

Example:

> Before the refactor, the function's error branch was never executed by a test. Branch coverage exposed the gap. I then added a test for that scenario.

Avoid:

> "I reached 95%, therefore the code is good."

Coverage measures execution, not assertion quality.

## Mutation testing as a teaching argument

Example:

```ts
if (quantity <= 0) {
  throw new InvalidQuantityError();
}
```

A mutation tool may change:

```ts
quantity <= 0
```

to:

```ts
quantity < 0
```

If tests still pass, zero quantity is not protected.

That is an excellent way to teach:

- coverage versus test quality;
- boundary conditions;
- assertion strength.

## Complexity as evidence

You may record:

```text
function before:
- 85 lines
- 7 branches
- database + validation + calculation + email

after:
- rule: 12 lines
- use case: 28 lines
- adapter: 18 lines
```

Do not automatically conclude:

> fewer lines = better.

Explain what became:

- more cohesive;
- more isolated;
- easier to test;
- more explicit.

## Lint as complementary evidence

Lint can catch:

- forgotten Promises;
- `any`;
- unused imports;
- unnecessary branches;
- mechanical errors.

But lint does not prove architecture.

Explain its role precisely.

## Identifying coupling

Visual example:

```ts
import { db } from "../db";
import { sendEmail } from "../email";
import { env } from "../config";
import { logger } from "../logger";
```

inside a domain function.

Ask the reader:

> How many of these dependencies participate in the business rule?

Use questions to teach reasoning.

## Identifying duplication

Show two functions:

```ts
function createUser(...) {
  if (!email.includes("@")) {
    // ...
  }
}
```

```ts
function updateUser(...) {
  if (!email.includes("@")) {
    // ...
  }
}
```

Do not immediately say:

> extract a function.

Ask:

> Does this validation represent the same rule in both contexts?

Visual duplication and conceptual duplication are different.

## Poor names

Weak:

```ts
function process(
  data: any,
): any {}
```

Better:

```ts
function calculateInvoiceTotal(
  invoice: Invoice,
): Money {}
```

Explain why the name improves understanding before reading implementation.

## Long functions

Do not use a magic rule:

> every function over 20 lines is bad.

Show changes in abstraction level.

Example:

```ts
validateInput();
calculate();
save();
sendEmail();
formatResponse();
```

Each step has a different reason to change.

## Hidden dependencies

Example:

```ts
function calculateExpiration(): Date {
  return new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );
}
```

A test depends on the real clock.

Refactor:

```ts
interface Clock {
  now(): Date;
}
```

Now the lesson can show why dependency injection improves determinism.

## Answer a real question

A good lesson starts from a concrete doubt.

Examples:

- "Why create an interface if I only have one implementation?"
- "Does high coverage mean good tests?"
- "Why not put everything in a service?"
- "When is `unknown` better than `any`?"
- "Why does my async route still block?"
- "Why was my index not used?"
- "Why separate DTO and entity?"

Choose one and make the article answer it.

## Required teaching-text structure

Use:

```text
1. Context
2. Problem
3. Required theory
4. Initial version
5. Why it fails
6. Improvement hypothesis
7. Refactoring
8. Tests
9. Evidence
10. Trade-offs
11. Limitations
12. Exercises
13. Conclusion
14. References
15. GitHub
```

This creates continuity.

## Context

Explain where the problem appeared.

Example:

> During the backend architecture lab, I wanted to test the order-creation rule without PostgreSQL. The function depended directly on the database client, turning a simple rule into an integration test.

That is stronger than starting with a definition.

## Problem

Show code and symptom.

Do not only describe them.

## Required theory

Explain only the concepts used by the solution.

## Implementation

Show steps.

Do not jump directly from the problem to the finished solution.

## Tests

Use tests as evidence.

## Trade-offs

Write the cost of the decision.

## Conclusion

Return to the opening question.

Do not end with:

> "I hope you liked it."

End with what was demonstrated.

## Reader practice checklist

Every lesson should include exercises.

Example:

```text
□ Find a function that mixes rules and I/O.
□ Write a characterization test.
□ Extract the rule without changing behavior.
□ Replace an external dependency with a contract.
□ Run tests before and after.
□ Record one cost of the new abstraction.
□ Explain in three sentences when you would not use the solution.
```

That turns reading into practice.

## Exercise with a partial answer

You can provide:

```ts
export async function generateReport() {
  const data =
    await database.query("...");
  const now = new Date();

  // ...
}
```

Questions:

1. which dependencies are hidden?
2. what part is a rule?
3. which test should be written first?
4. which part should remain an integration concern?

Do not immediately provide every answer.

## References: use primary sources

For TypeScript:

- official TypeScript documentation.

For Node:

- official Node.js documentation.

For PostgreSQL:

- official PostgreSQL documentation.

For architecture:

- original author articles when possible;
- established books and references.

Secondary posts can help learning.

But important technical claims should be checked against primary sources when possible.

## Separate sources from observations

Example:

> Node documentation describes the behavior of `process.nextTick`. In my experiment with Node version X, I observed the sequence below.

That distinguishes:

- documented rule;
- observed behavior.

Do not turn a local experiment into universal truth.

## How to validate what you wrote

Before publishing:

### Code

Run:

```bash
npm test
npm run typecheck
npm run lint
```

### Links

Open the sources.

### Commands

Copy them from the article and execute them in a clean environment when possible.

### Results

Verify that:

- output;
- errors;
- coverage;
- benchmarks;

match the text.

### Claims

Ask:

> Did this come from a source, an experiment, or my interpretation?

That distinction increases credibility.

## Do not hide uncertainty

You can write:

> In this lab, the streaming version used less memory. This does not prove that it will be faster for every workload.

That is more technical than:

> Streams are always better.

Authority is not artificial certainty.

## Correcting an article

Create a small policy.

In the repository:

```text
CHANGELOG.md
```

or in the article:

```text
## Updates

2026-09-21:
Corrected the explanation about ...
```

If you discover an error:

1. validate it;
2. fix it;
3. record it;
4. explain the change when relevant.

Do not silently erase an important technical error if the correction can help the reader.

## Technical authority without pretending perfection

Public technical authority can come from:

- reproducible experiments;
- sources;
- clarity;
- consistency;
- correction history;
- GitHub;
- tests;
- transparent limitations.

It does not need to come from:

- speaking as if you never have doubts;
- using difficult words;
- hiding that you are studying;
- exaggerating benchmarks;
- creating a persona that knows everything.

## The teaching repository

Create:

```text
quality-refactoring-teaching-lab/
  examples/
    coupled-order/
    refactored-order/
  tests/
    unit/
    integration/
    contract/
    e2e/
  articles/
    pt-BR/
      quality-refactoring-lesson.md
    en/
      summary.md
  vlog/
    pt-BR/
      script.md
  docs/
    sources.md
    experiments.md
    trade-offs.md
    corrections.md
  README.md
```

The repository should make it possible to assess:

- code;
- teaching;
- process;
- evidence.

## Lab README

Structure:

```text
Objective
Studied problem
How to run
Structure
Before version
After version
Tests
Metrics
Article
Vlog
Sources
Limitations
```

English summary:

```md
## English summary

This repository turns a quality and refactoring study cycle
into a reproducible technical lesson.
It includes the original problem, a failing or weak implementation,
incremental refactoring, automated tests, trade-off analysis,
a Portuguese article, and a short English technical summary.
```

## The article and repository must agree

If the text says:

> The test fails before the refactor.

The repository should make that reproducible.

One strategy:

```text
git tag before-refactor
git tag after-refactor
```

Or educational branches:

```text
lesson/01-before
lesson/02-characterization-tests
lesson/03-refactor
lesson/04-final
```

Tags usually preserve a completed sequence better.

## Teaching-oriented commits

Example:

```text
test: characterize current order creation behavior
refactor: extract order total calculation
refactor: introduce order repository boundary
test: add integration coverage for postgres adapter
docs: explain dependency inversion trade-off
```

The history now tells the same story as the article.

## Issues

Create an issue:

```text
docs: explain why CreateOrder is hard to test
```

Another:

```text
refactor: isolate email notification from order rule
```

Another:

```text
test: protect public order response contract
```

Even when working alone, this shows process.

## Teaching-oriented pull request

Title:

```text
refactor: separate order rule from infrastructure
```

Description:

```text
Problem
Before
Change
Tests
Trade-offs
What remains coupled
Follow-up
```

Link the article when ready.

## CI

CI should execute at least:

```text
typecheck
lint
unit tests
required integration tests
```

If contract/e2e tests are lightweight, include them.

A badge in the README shows that the example still runs.

## Measuring quality

You do not need to invent a new metric in this cycle.

Use whatever matches the problem.

Examples:

### Coupling

Before:

```text
CreateOrder imports:
database
email
config
logger
```

After:

```text
CreateOrder imports:
Order
OrderRepository
OrderNotifier
```

### Testability

Before:

```text
rule requires real database
```

After:

```text
rule runs in unit test
adapter remains covered by integration test
```

### Coverage

An important branch becomes exercised.

### Mutation

A test now kills a mutation that previously survived.

### Complexity

A monolithic function is split according to responsibility.

Do not combine all of these into an artificial score.

## Compare at least two approaches

Every lesson should contain at least one real comparison.

Example:

```text
Option A:
use a repository.

Option B:
use the ORM directly in the use case.
```

Compare:

- simplicity;
- testability;
- coupling;
- cost;
- context.

Do not conclude:

> Repository is always better.

Conclude:

> In this lab, the repository was worth the cost because the use case needed to be tested without a database and reused outside HTTP. In a simple CRUD application with little business logic, I would evaluate keeping the ORM closer to the application.

That teaches decision-making.

## Other useful comparisons

- `any` vs. `unknown`;
- union vs. optional fields;
- `readFile` vs. stream;
- worker vs. main thread;
- ORM vs. SQL;
- OFFSET vs. cursor;
- direct handler vs. use case;
- interface vs. function;
- unit vs. integration;
- coverage vs. mutation testing.

## Write where each approach fails

Structure:

```text
Approach A fails when...
Approach B fails when...
```

Example:

> A unit test using a fake repository fails to prove SQL, mapping, and constraints. An integration test using PostgreSQL fails to provide the same isolation and speed for every domain rule.

That demonstrates maturity.

## Simple technical English

Every cycle should include a short English summary.

Do not aim for sophisticated vocabulary.

Example:

> I refactored the order creation flow because business rules were directly coupled to the database and email client. I first added characterization tests, then extracted the calculation and introduced small boundaries for external dependencies. The main trade-off was additional structure, but the business rule became easier to test and reuse.

Review questions:

- can I say this aloud?
- would someone from another country understand it?
- did I use concrete terms?
- did I explain the trade-off?
- did I avoid exaggeration?

## Technical English summary

Include in the article:

```md
## English summary

The original implementation mixed business rules,
database access, and notification logic in one function.

I first added tests to protect the current behavior.
Then I extracted the business rule and isolated external
dependencies behind small contracts.

The refactor added some structural code, but reduced coupling
and allowed the main rule to be tested without real infrastructure.
```

## Turning the article into a vlog

Written text and video do not share the same structure.

In an article, the reader can go back.

In video, the flow needs to be more direct.

Base script:

```text
1. Hook
2. Context
3. Problem
4. Error demo
5. Explanation
6. Refactoring
7. Test
8. Trade-off
9. Result
10. GitHub
```

## Vlog opening

Avoid:

> Hey everyone, today we are going to talk about code quality.

Prefer a problem:

> This function works, but to test a calculation rule I need to start a database. In this video I will show why that happens, refactor it in small steps, and prove that the behavior remains the same.

The viewer knows what they will get.

## Demo first

Show the problem early.

Example:

```bash
npm test
```

Result:

```text
connection refused: PostgreSQL
```

Explain:

> The test that should validate a simple rule depends on infrastructure.

Now the motivation is visible.

## Common mistake

Include a section:

```text
Common mistake:
creating an interface for every class.
```

Explain why that does not automatically solve the problem.

## Code in the vlog

Do not read code line by line.

Show:

- important snippet;
- diff;
- test;
- execution.

Use zoom or highlighting during editing.

## Run the test on screen

Execute:

```bash
npm test
```

Show the failure before.

Then the fix.

A short demonstration is stronger than saying:

> "now it is better."

## Vlog closing

Structure:

> The problem was not only the size of the function. The rule depended on details that change for different reasons. After the refactor, the rule can be tested in isolation, while PostgreSQL remains covered by integration tests. The cost was adding one boundary and more composition code. The full repository is on GitHub with tests and the refactoring history.

Then:

> If you want to practice, try replacing the email notifier with a fake without changing the use case.

That leaves an exercise.

## Detailed vlog script

File:

```text
vlog/en/script.md
```

Model:

```md
# Title

## 00:00 — Hook

Spoken:
...

Screen:
...

## 00:30 — Problem

Spoken:
...

Screen:
...

## 01:30 — Initial version

Code:
...

## 03:00 — Test

Command:
...

## 04:00 — Refactoring

...

## 07:00 — Trade-off

...

## 08:00 — Conclusion

...
```

This trains oral communication intentionally.

## Do not write the vlog as a spoken article

Video sentences can be shorter.

Article:

> Dependency inversion allows high-level policies to depend on abstractions representing capabilities instead of concrete implementation details.

Video:

> The use case needs to save the order. It does not need to know that the database is PostgreSQL. That difference is what matters here.

Then introduce the technical term.

## Use a short demo

The vlog does not need to show the whole repository.

Show:

```text
before
test
refactor
after
```

Link the rest.

## A lab that proves knowledge

E018 should finish with four connected deliverables:

### 1. Code

Reproducible example.

### 2. Tests

Behavioral evidence.

### 3. Article

Written explanation.

### 4. Vlog script

Planned oral explanation.

All four should tell the same story.

## Experiment 1 — explain without jargon

Choose one technical paragraph.

Version A:

> We apply DIP to decouple the application layer from infrastructure through abstractions.

Version B:

> The use case needs to save data, but it does not need to know the PostgreSQL client. We create a small contract for that need and keep the database implementation at the boundary.

Ask someone to read it, or reread it a day later.

Which version requires less context?

## Experiment 2 — weak versus improved example

Create two snippets.

The first should genuinely fail or create a real cost.

The second should address the hypothesis.

Avoid caricatures.

Do not make the "before" intentionally absurd just to make the solution look clever.

## Experiment 3 — reproducibility

Clone the repository into another directory.

Follow only the README.

Record every hidden step.

Fix them.

This tests documentation quality.

## Experiment 4 — article without oral context

Give the text to someone or reread it as if you did not know the project.

Ask:

- does the problem appear before the solution?
- are important names defined?
- does the example run?
- does the conclusion answer the opening question?

## Experiment 5 — primary source

Choose three technical claims.

For each one, record:

```text
Claim:
Source:
Section:
How it was applied:
```

This reduces accidental repetition of incorrect secondary content.

## Experiment 6 — English

Record 60–90 seconds explaining:

- problem;
- solution;
- trade-off.

Do not optimize for a perfect accent.

Optimize for technical clarity.

## Experiment 7 — correction

Deliberately revisit one claim later.

If you discover that it was incomplete:

- update the article;
- record the correction;
- adjust future vlog material.

Learning to correct yourself is part of the cycle.

## Compare approaches and record where they fail

| Comparison | What to observe | Where each option fails |
| --- | --- | --- |
| broad topic vs. specific problem | clarity and depth | broad topic becomes superficial; narrow problem may need context |
| theory first vs. problem first | motivation and understanding | theory without pain feels abstract; problem without theory feels like a recipe |
| isolated snippet vs. reproducible example | speed and confidence | snippet is fast but hides setup; complete example requires maintenance |
| final solution vs. incremental refactor | concision and learning | finished solution hides reasoning; too many steps can make the article long |
| article vs. vlog | depth and pacing | article can become dense; vlog can oversimplify |
| Portuguese vs. English summary | depth and international practice | literal translation feels unnatural; summary does not replace full content |
| coverage vs. mutation testing | execution and test strength | coverage does not measure assertions; mutation costs time |
| secondary vs. primary source | accessibility and precision | secondary source may distort; primary source may be harder to read |
| absolute certainty vs. explicit limitations | perceived authority and accuracy | artificial certainty creates errors; too many caveats can hide the conclusion |
| perfect tutorial vs. real failure | clarity and authenticity | perfect example hides diagnosis; real failure may need simplification |

## Build examples that break

Include at least some of these:

1. a test that depends on a database when it should not;
2. `any` that permits an error;
3. a forgotten Promise;
4. a mutation that survives;
5. a contract test broken by a refactor;
6. a query that degrades with volume;
7. a stream without error handling;
8. an unnecessary interface;
9. a function with a hidden clock dependency;
10. a README that fails in a clean environment.

The failure should have teaching value.

## Technical review checklist

Before publishing:

```text
□ The code compiles.
□ Tests pass.
□ The weak example really demonstrates the problem.
□ The improvement addresses the stated hypothesis.
□ Commands were executed.
□ Numbers have context.
□ Primary sources were opened.
□ Trade-offs are written.
□ Limitations are written.
□ GitHub is linked.
□ The README reproduces the example.
```

## Teaching review checklist

```text
□ The problem appears in the opening paragraphs.
□ The target reader is clear.
□ Jargon is explained through behavior.
□ I did not try to teach five subjects in one article.
□ Code has enough context.
□ Before and after are comparable.
□ Tests participate in the explanation.
□ There is at least one exercise.
□ The conclusion answers the opening question.
□ The text does not claim more than the experiment proves.
```

## Editorial review checklist

```text
□ The title describes the problem.
□ Headings make the article scannable.
□ Paragraphs are not excessively long.
□ Code appears near its explanation.
□ Names are consistent.
□ Acronyms are defined on first use.
□ Links work.
□ References appear at the end.
□ There are no empty authority statements.
```

## Three practical articles derived from the cycle

### 1. Written lesson: explaining quality and refactoring to someone one step behind me

Suggested title:

**Written Lesson: Explaining Quality and Refactoring to Someone One Step Behind Me**

Choose one real problem.

Structure:

```text
Context
Problem
Minimum theory
Code before
Test
Refactoring
Code after
Trade-offs
Exercises
Conclusion
```

The reader should finish able to reproduce the experiment.

## Practical article 2 — technical authority

Suggested title:

**How to Turn Study into Technical Authority Without Pretending to Know Everything**

Explain your process:

1. how you chose the subject;
2. what you did not know;
3. which sources you consulted;
4. which hypothesis you created;
5. which code you wrote;
6. how you validated it;
7. where you found contradictions;
8. which limitations you recorded;
9. how you would correct an error;
10. what you would publish on GitHub.

The central point:

> technical authority comes from traceability and clarity, not from appearing infallible.

## Practical article 3 — vlog script

Suggested title:

**Vlog Script: From Zero to a Published Repository**

Turn one full cycle into a video.

### Opening

Which problem will be solved?

### Context

Where did it appear?

### Demo

Show the weak behavior.

### Code

Show only what matters.

### Test

Prove it.

### Refactoring

Use small steps.

### Trade-off

Explain the cost.

### Conclusion

Answer the original question.

### GitHub

Show where the complete code lives.

## Recommended article format

Each article can contain 800 to 1,500 words.

Structure:

1. introduction;
2. problem;
3. code;
4. theory;
5. tests;
6. refactoring;
7. trade-offs;
8. limitations;
9. conclusion;
10. GitHub.

Word count is not the goal.

If 900 words teach the idea better than 1,500, stop at 900.

## How to explain this cycle in an international interview

Use simple technical English.

> I use technical writing as part of my study process. I start with a real problem from the repository, create a reproducible example, write tests, and then explain the refactoring step by step. I also document trade-offs and limitations so the article does not present one solution as universally correct.

Another:

> I separate what the documentation says from what I observed in my own experiment. If the result is only valid for my dataset or environment, I state that explicitly.

Another:

> Before publishing an article, I run the code from a clean setup, execute the tests, verify the primary references, and check that the README is enough to reproduce the example.

Another:

> If I discover an error after publication, I prefer to correct it transparently and keep a small record of the change. I see technical writing as a versioned engineering artifact, not a static proof that I know everything.

## Portfolio

In your portfolio, do not write only:

> Published an article about refactoring.

Write:

> Turned a real refactoring into a reproducible lab with before/after code, unit and integration tests, CI, and a technical article. The content explains why the original implementation was hard to test, which boundaries were introduced, and what structural cost the solution added.

Another:

> The article includes a technical English summary and a vlog script derived from the same example, demonstrating written and oral communication about an engineering decision.

## Possible impact metrics

Do not invent metrics.

You may track:

- views;
- average reading time;
- issues opened by readers;
- stars;
- clones;
- technical comments;
- questions received;
- corrections made;
- number of people reproducing the lab;
- invitations to discuss the topic.

But popularity is not proof of technical correctness.

## One answered question is worth more than ten mentioned topics

Compare:

Article A:

> TypeScript, Node, SQL, Clean Architecture, Docker, and testing.

Article B:

> Why did my `async` function still block the Node.js server?

The second may demonstrate more depth.

Public specialization grows from well-answered questions.

## Editorial process per cycle

Use a flow:

```text
1. capture problem
2. create issue
3. research primary source
4. build example
5. reproduce failure
6. write test
7. refactor
8. measure
9. write article
10. technical review
11. write English summary
12. write vlog script
13. publish
14. record feedback
15. correct when necessary
```

This turns content into an engineering process.

## Cycle board

You can keep:

```text
Backlog
Research
Code
Evidence
Draft
Technical review
English summary
Vlog script
Published
Corrections
```

You do not need a specific tool.

GitHub Projects, issues, Markdown, or another system is enough.

## Article issue template

```md
# Problem

What real problem will this article explain?

# Reader

Who is one step behind me?

# Evidence

What code/test/measurement will prove the point?

# Primary sources

- ...

# Before

What is wrong with the initial version?

# After

What changes?

# Trade-offs

What does the solution cost?

# Limitations

What does this example not prove?
```

## Definition of Done

The teaching artifact is finished only when:

```text
□ the article is written;
□ the code runs;
□ tests pass;
□ CI is green;
□ README reproduces;
□ sources were verified;
□ trade-offs are present;
□ limitations are present;
□ English summary exists;
□ vlog script exists;
□ GitHub is linked.
```

## What you should take away from this cycle

Writing and teaching are not separate from engineering.

When done well, they force you to:

- define the problem;
- remove ambiguity;
- build a minimum example;
- test behavior;
- compare alternatives;
- verify sources;
- record trade-offs;
- explain limits.

That exposes gaps that can remain hidden during passive study.

In the context of quality and refactoring, the written lesson should tell the story of change.

Not only:

> "Here is the solution."

But:

> "This was the behavior. This was the problem. This test makes it visible. This small change improves one responsibility. This test proves that behavior was preserved. This approach has this cost. In another context, I would choose differently."

You have completed E018 when you can turn a real engineering problem into a lesson that another person can read, execute, test, question, and reproduce.

The final result must be assessable without a private conversation: a public repository, before/after code, tests, CI, README, Portuguese article, technical English summary, vlog script, sources, and an honest record of limitations.

## Primary and recommended references

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [GitHub Docs — About READMEs](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub Docs — About Issues](https://docs.github.com/issues/tracking-your-work-with-issues/about-issues)
- [GitHub Docs — About Pull Requests](https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [Google Technical Writing Courses](https://developers.google.com/tech-writing)
- [Diátaxis — A systematic approach to technical documentation](https://diataxis.fr/)
