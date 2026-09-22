---
translationId: 4e191919-1919-4919-8919-191919191919
articleId: e0191919-1919-4919-8919-191919191919
locale: en
slug: mvp-landing-typescript
title: "MVP and Landing Page with TypeScript: From Problem to First Public Release"
description: "A practical guide to turning a problem into a publishable MVP, modeling states with TypeScript, building a landing page, automating CI, and releasing v0.1 with professional evidence."
status: published
---

# MVP and Landing Page with TypeScript: From Problem to First Public Release

Building an MVP does not mean finishing half of an application.

An MVP needs to prove something.

It may prove that one main workflow works.

It may prove that a product hypothesis is understandable.

It may prove that someone can use the solution without private explanation.

It may prove that a minimal architecture can support a real delivery.

It may prove that the project has enough quality to receive feedback without every change breaking previous behavior.

In this cycle, the deliverable becomes more than a technical study.

You will turn your knowledge into a small public product.

The goal is to move from:

> "I have a repository with code."

to:

> "I have a limited first version that is runnable, documented, tested, published, and understandable by someone who did not participate in development."

The cycle combines:

- problem definition;
- audience definition;
- MVP scope;
- TypeScript applied to the domain;
- landing page;
- demonstration;
- tests;
- CI;
- documentation;
- `v0.1` release;
- portfolio evidence.

> The MVP does not need to prove that the entire product will succeed. It needs to prove which problem you chose to attack, which workflow you delivered, and which limitations were intentionally left out.

<!-- VISUAL:
Problem -> Audience -> Hypothesis -> Minimum flow -> Implementation -> Tests -> CI -> Landing -> v0.1 release -> Feedback.
Below: "included" and "out of scope".
-->

## The problem that guides the lab

Imagine a simple product for recording and tracking internal technical issues.

The problem:

> analysts receive recurring requests, record context differently, and spend time discovering whether something similar was already solved.

The MVP does not need:

- artificial intelligence;
- automatic recommendations;
- enterprise authentication;
- advanced dashboards;
- complex permissions;
- multiple integrations;
- billing.

The minimum workflow may be:

1. create a problem record;
2. classify its status;
3. record a solution;
4. browse existing records;
5. open details;
6. clearly demonstrate the benefit.

That is small enough for a `v0.1`.

## Start with the problem, not the stack

Weak:

> I will build a project with React, Node, PostgreSQL, Docker, and Clean Architecture.

Better:

> I want to let an analyst record and retrieve past solutions through one simple workflow.

The stack serves the experiment.

The problem defines the product.

Before coding, write:

```text
Problem:
______________________________________

Audience:
______________________________________

Current situation:
______________________________________

Current cost:
______________________________________

Desired outcome:
______________________________________

MVP hypothesis:
______________________________________
```

## Example

```text
Problem:
past solutions are difficult to retrieve.

Audience:
technical analysts.

Current situation:
knowledge is distributed across tickets and comments.

Current cost:
time spent rebuilding context.

Desired outcome:
record and retrieve past solutions through a simple workflow.

Hypothesis:
if problem and resolution knowledge is stored in a structured form,
an analyst can reuse previous information without depending on individual memory.
```

There is no technology yet.

That is intentional.

## An MVP is not a feature list

A list like this is dangerous:

```text
login
dashboard
admin
AI
notification
filters
chat
analytics
profile
theme
export
```

It does not define value.

Define a workflow.

```text
User enters
 -> creates a record
 -> describes problem
 -> sets status
 -> adds solution
 -> finds record later
```

The MVP should protect this path.

## Define what stays out

Create:

```md
## Out of scope — v0.1

- SSO
- team permissions
- AI
- vector search
- notifications
- automatic import
- mobile application
- advanced analytics
```

This is part of engineering.

Explicit scope reduces uncontrolled change.

## Success criteria for v0.1

Example:

```text
A person should be able to:

1. open the landing page;
2. understand the problem in under one minute;
3. access the demonstration;
4. create a valid record;
5. retrieve the record;
6. open the solution;
7. return to GitHub and reproduce the project from the README.
```

That is stronger than:

> "finish the frontend."

## Model the MVP before creating screens

Start with the main states.

Weak version:

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

The type permits:

```ts
{
  status: "open",
  solution: "Fixed",
  closedAt: new Date()
}
```

The system accepts a contradictory combination.

## Model valid states

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

Now:

```ts
function renderTicket(ticket: Ticket) {
  if (ticket.status === "resolved") {
    console.log(ticket.solution);
  }
}
```

The compiler narrows through the discriminant.

## The benefit is not "using a union"

The benefit is:

> an open ticket does not carry fields that only make sense after resolution.

This modeling prevents invalid states before runtime.

## Avoid `any` at the boundary

Landing pages and MVPs often receive data from:

- forms;
- URLs;
- APIs;
- storage;
- JSON;
- analytics;
- query strings.

External input should be treated as untrusted.

Weak:

```ts
async function createTicket(
  input: any,
): Promise<Ticket> {
  return repository.save(input);
}
```

Better:

```ts
async function createTicket(
  input: unknown,
): Promise<Ticket> {
  const command =
    parseCreateTicketInput(input);

  return service.execute(command);
}
```

`unknown` requires validation before use.

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

In a real application, a schema library may be appropriate.

The concept remains:

```text
unknown
 -> validation
 -> trusted type
```

## `never` for forgotten states

Imagine:

```ts
type TicketStatus =
  | "open"
  | "resolved"
  | "archived";
```

Function:

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

After adding:

```ts
| "in_review"
```

the compiler points to places that are no longer exhaustive.

That is useful in an MVP because the product changes quickly.

## Fast change does not justify weak types

A common idea is:

> "It's an MVP, so I'll use any and fix it later."

But an MVP changes more than a stable product.

States and contracts move quickly.

Useful types can make those changes safer.

The goal is not to build the most sophisticated type system possible.

The goal is to make important changes visible.

## Generics: reuse relationships, not empty abstractions

Example:

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

Now:

```ts
type CreateTicketResult =
  ApiResult<Ticket>;

type ListTicketsResult =
  ApiResult<Ticket[]>;
```

The generic preserves a useful relationship.

## Unnecessary generic abstraction

Avoid:

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

when the product has one simple use case.

Ask:

> what duplication or relationship does this generic actually solve?

## Utility types

TypeScript provides utility types for common type transformations. citeturn554786search0

Example:

```ts
type TicketPreview =
  Pick<
    ResolvedTicket,
    "id" | "title" | "status"
  >;
```

Another:

```ts
type TicketPatch =
  Partial<
    Pick<
      ResolvedTicket,
      "title" | "description"
    >
  >;
```

Do not automatically use `Partial<Ticket>` for updates.

That may expose fields that should not be editable.

## Modeling actions

Instead of:

```ts
updateTicket(
  id: string,
  data: Partial<Ticket>,
);
```

consider explicit actions:

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

Different rules become visible.

## Minimum repository scope

Suggested structure:

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

If the MVP is frontend-only, simplify.

Do not create a backend only to satisfy an architecture diagram.

## An even simpler version

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

Architecture should match real need.

## The landing page as a product interface

The landing page should answer:

1. what problem exists?
2. who is this for?
3. what does the MVP do?
4. how does it work?
5. where can I try it?
6. why should I trust it?
7. how can I contact you?

## Suggested structure

```text
Hero
Problem
Audience
How it works
Demonstration
v0.1 limitations
Technology/evidence
CTA
Contact
```

## Hero

Avoid:

> Revolutionizing management with cutting-edge technology.

It communicates nothing.

Prefer:

> Reuse previous technical solutions instead of rebuilding the same context every time.

Subtext:

> An MVP for organizing technical problems, resolutions, and history in one simple workflow.

CTA:

```text
View demo
```

Secondary:

```text
View GitHub
```

## Problem section

Example:

> Similar incidents return, but the previous resolution is often buried in comments, history, or the memory of the person who solved it. The MVP organizes problem and solution into retrievable records.

Do not promise more than the MVP delivers.

## Audience

```text
For analysts who:

- handle recurring technical problems;
- need to recover previous context;
- want to record solutions in a structured way.
```

The audience does not need to be huge.

It needs to be clear.

## How it works

Use three steps.

```text
1. Record the problem.
2. Add the solution when it is resolved.
3. Browse history when something similar happens.
```

The landing page does not need to explain architecture.

## Demonstration

Show:

- screenshot;
- GIF;
- short video;
- public demo.

If the demo requires local setup:

```text
See GitHub instructions
```

Do not hide that it is a v0.1.

## Release state

Include:

```text
v0.1 — Experimental MVP
```

And:

```text
Includes:
- create;
- browse;
- resolve.

Does not include yet:
- AI;
- enterprise authentication;
- external integrations.
```

That sets correct expectations.

## CTA

The CTA should match the product stage.

Examples:

```text
Try the MVP
```

```text
View source
```

```text
Send feedback
```

```text
Discuss the project
```

Avoid aggressive commercial CTAs if the current goal is validation.

## Contact

Include:

```text
Found a case where the workflow does not work?
Want to discuss the architecture or suggest an improvement?
Get in touch.
```

The landing becomes a learning channel.

## The MVP needs one story

The landing page and README should tell the same story.

Landing:

```text
problem -> value -> demo
```

README:

```text
problem -> architecture -> setup -> tests -> limits
```

Portfolio:

```text
problem -> decision -> evidence -> impact
```

Avoid three unrelated narratives.

## Unit tests

Use them for pure rules:

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

## Integration tests

Use them for real boundaries:

```text
repository + database
API + validator
storage + mapper
```

If the MVP is frontend-only, integration may be:

```text
form -> state -> storage
```

## Contract tests

Protect:

- API payload;
- storage format;
- public response;
- shared schema.

Example:

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

Protect the main flow:

```text
open app
 -> create ticket
 -> view
 -> resolve
 -> retrieve
```

Do not test every variation with e2e.

## CI on every pull request

GitHub Actions stores workflows in the repository and provides CI workflow templates. citeturn640288search8turn640288search7

File:

```text
.github/workflows/ci.yml
```

Example:

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

Use versions compatible with the actual project.

The important part is that pull requests do not depend on manual confidence alone.

## Minimum pipeline

```text
install
 -> typecheck
 -> lint
 -> tests
 -> build
```

If e2e is lightweight:

```text
 -> e2e
```

## CI does not replace review

CI answers:

> did the automated checks pass?

It does not answer:

- does the scope make sense?
- is the name clear?
- is the abstraction necessary?
- does the landing communicate value?
- is the test actually strong?

Automation protects mechanics.

Review protects decisions.

## Badge

README:

```md
![CI](...)
```

A badge is useful because it shows current project status.

Do not use badges as decoration.

## Branch protection

When appropriate, configure `main` so changes enter through pull requests with checks.

Even when working alone, this creates process.

## One issue per important change

Example:

```text
feat: allow resolving a ticket with a documented solution
```

Description:

```text
Problem
Scope
Acceptance criteria
Out of scope
Test plan
```

This forces scope discipline.

## Pull request

Title:

```text
feat: add ticket resolution flow
```

Description:

```text
Problem
What changed
Screenshots
Tests
Trade-offs
Out of scope
```

Include landing screenshots when visual.

## Refactoring during an MVP

MVP does not mean no refactoring.

It means refactoring enough to keep learning without turning each change into a risk.

Signals:

- same rule duplicated;
- spreading `any`;
- huge component;
- use case with hidden dependencies;
- difficult tests;
- simple change touches many files.

## Refactor in small steps

Example:

1. add test;
2. type input;
3. replace `any` with `unknown`;
4. extract parser;
5. model state;
6. update UI;
7. preserve contract;
8. commit.

This produces a clear history.

## Avoid a rewrite close to release

If `v0.1` works, avoid replacing:

- framework;
- state manager;
- test runner;
- architecture;
- database;

without a concrete reason.

A small release needs stability.

## Release v0.1

GitHub Releases package iterations from repository tags and allow release notes and assets to be associated with a delivery. citeturn640288search0turn640288search2

Create the tag:

```text
v0.1.0
```

even if you informally call the milestone `v0.1`.

## Release notes

Structure:

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

A good release communicates limits.

## Why `v0.1.0`

Semantic versioning uses `MAJOR.MINOR.PATCH`; `0.y.z` versions are commonly used for initial development where the public API may still change rapidly.

For this cycle:

```text
v0.1.0
```

is a useful first limited public milestone.

Do not promise `1.0` stability.

## The tag should point to a reproducible state

Before release:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Then:

```text
tag
release notes
screenshots
demo
```

## Release checklist

```text
□ README is current.
□ Setup was validated.
□ CI is green.
□ Build passes.
□ Tests pass.
□ Scope is documented.
□ Limitations are documented.
□ Landing is published.
□ Demo works.
□ Tag exists.
□ Release notes are published.
□ Screenshots are current.
□ Contact link works.
```

## Professional README

Structure:

```text
# Name

Problem
MVP v0.1
Demo
Features
Out of scope
Architecture
TypeScript modeling
How to run
Tests
CI
Release
Roadmap
Limitations
English summary
```

## English summary

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

## Landing page and TypeScript

Even the landing can benefit from types.

Example:

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

It is a small example, but it models a real decision.

## Landing content data

Avoid:

```ts
const page: any = {
  hero: ...
};
```

Use simple contracts:

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

Do not turn local content into an advanced type-system exercise.

## Demo state

The UI may have:

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

Avoid:

```ts
{
  loading: boolean;
  error?: string;
  ticket?: Ticket;
}
```

because it permits:

```text
loading=true
error exists
ticket exists
```

at the same time.

## Types as product documentation

This:

```ts
type Ticket =
  | OpenTicket
  | ResolvedTicket;
```

documents that the product currently has two states.

When:

```ts
InReviewTicket
```

is introduced, the compiler helps locate affected areas.

TypeScript becomes a tool for MVP evolution.

## Types do not replace runtime validation

TypeScript disappears at runtime.

This code:

```ts
const ticket =
  JSON.parse(raw) as Ticket;
```

validates nothing.

Use a parser or schema at the boundary.

Explain this in the article.

## Invalid UI states

Weak:

```ts
type FormState = {
  submitting: boolean;
  success: boolean;
  error?: string;
};
```

Better:

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

Now the UI does not need to reconcile contradictory flags.

## Modeling cost

A union can become large:

```ts
type CheckoutState =
  | ...
  | ...
  | ...
```

Not every screen needs a formal state machine.

Use this pattern when:

- states are mutually exclusive;
- each state carries different data;
- invalid combinations are possible;
- change is frequent.

## Compare two approaches

### Flags

```ts
loading
success
error
```

Advantage:

- simple.

Failure:

- invalid combinations.

### Discriminated union

```ts
kind: "idle" | "loading" | ...
```

Advantage:

- explicit states.

Failure:

- more code for trivial flows.

Record the context.

## `unknown` versus `any`

TypeScript documentation describes `unknown` as a type that must be narrowed before safe use, while `any` effectively disables much of type checking. citeturn554786search1turn554786search3

In the MVP:

```ts
const raw: unknown =
  await response.json();
```

reminds you that external data should be validated.

## `never`

`never` represents values that should never occur and is useful for exhaustive checking. citeturn554786search4turn554786search5

Use it to detect incomplete product changes.

Do not use it as a type trick without a concrete benefit.

## Generics

Generics preserve relationships between types, while the compiler restricts operations on unconstrained type parameters. citeturn554786search2

In the MVP:

```ts
type Paginated<T> = {
  items: T[];
  nextCursor?: string;
};
```

may be justified.

This may not be:

```ts
class UniversalService<
  TEntity,
  TDto,
  TResponse,
  TFilter,
  TSort,
> {}
```

## Test that proves the state

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

## Exhaustiveness and CI

You do not runtime-test the compiler itself.

But you can keep:

```ts
function statusLabel(
  ticket: Ticket,
): string {
  switch (ticket.status) {
    // ...
  }
}
```

and run type checking in CI.

A new state breaks the build until all required cases are handled.

That is evidence of safer maintenance.

## The landing as public evidence

The landing should include:

```text
problem
audience
demo
release
GitHub
contact
```

It does not need to:

- pretend to be a company;
- use invented testimonials;
- claim nonexistent customers;
- present fake metrics.

A portfolio project gains credibility by being precise.

## Landing copy

Example:

### Title

> Reuse previous solutions instead of rebuilding the same context.

### Subtext

> An MVP for recording technical problems, documenting resolutions, and browsing history through a simple workflow.

### CTA

> Try the demo

Secondary:

> View source on GitHub

## Why it exists

> The project came from a simple problem: similar incidents return, but previous resolutions are not always organized in a way that is easy to retrieve.

That connects the project to a real problem.

## What the delivery proves

```text
- TypeScript modeling;
- end-to-end workflow;
- tests;
- CI;
- release;
- documentation.
```

This does not need to appear exactly like this to product users.

It belongs in the portfolio narrative.

## Empty demo

A demo without sample data may look broken.

Include a demo seed.

Example:

```text
INC-001
Login fails after password reset
Resolved
```

Make it clear that the content is sample data.

## Feedback CTA

```text
This is an experimental MVP.
If you work with technical support and want to comment
on the workflow, send feedback.
```

Feedback from a relevant audience is more useful than generic opinion.

## Initial metrics

You do not need complex analytics.

You may track:

- visits;
- demo clicks;
- GitHub clicks;
- contacts;
- feedback received;
- reported errors.

Do not treat small numbers as statistical validation.

## Structured feedback

Ask:

```text
1. Was the problem clear?
2. Does the workflow look useful?
3. Which step was confusing?
4. What did you expect but not find?
5. In which situation would you use something like this?
```

Do not ask only:

> Did you like it?

## Feedback does not automatically define the roadmap

A requested feature does not automatically belong in the product.

Record:

```text
request
underlying problem
frequency
impact
cost
```

Then prioritize.

## Keep v0.1 small

Example:

```text
v0.1.0
- create
- list
- resolve
- view
```

v0.2 may explore:

```text
search
```

v0.3:

```text
feedback/relevance
```

Do not pull the full roadmap into the current cycle.

## Suggested lab

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

## Simple ADR

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

## Experiment 1 — `any` versus `unknown`

Version A:

```ts
function submit(input: any) {
  return input.title.trim();
}
```

Input:

```ts
submit({
  title: 42,
});
```

Runtime fails.

Version B:

```ts
function submit(input: unknown) {
  const command =
    parseCreateTicketInput(input);

  return command.title.trim();
}
```

Document the difference.

## Experiment 2 — optional fields versus union

Version A:

```ts
type Ticket = {
  status: string;
  solution?: string;
};
```

Version B:

```ts
type Ticket =
  | OpenTicket
  | ResolvedTicket;
```

Create an invalid state in A.

Show the compiler error in B.

## Experiment 3 — useful versus excessive generic

Implement:

```ts
type ApiResult<T> = ...
```

Then create an over-general abstraction.

Compare:

- readability;
- number of parameters;
- real reuse;
- error quality;
- onboarding.

## Experiment 4 — CI catches incomplete product changes

Add a new status:

```ts
"in_review"
```

without updating every switch.

Run:

```bash
npm run typecheck
```

CI should fail.

Then fix it.

This connects types to engineering process.

## Experiment 5 — landing build

Create a visual change that works locally.

CI still runs the production build on the pull request.

This can catch:

- broken import;
- type error;
- production bundle failure.

## Experiment 6 — reproducible release

Clone tag:

```text
v0.1.0
```

Follow the README.

Validate:

```text
install
test
build
run
```

A release that works only in your local directory is not a professional delivery.

## Compare approaches and record where they fail

| Comparison | What to observe | Where each option fails |
| --- | --- | --- |
| feature list vs. main workflow | focus and value | feature list grows without proving value; flow can ignore secondary needs |
| `any` vs. `unknown` | speed and safety | `any` hides errors; `unknown` requires validation |
| optional fields vs. discriminated union | simplicity and invalid states | optional fields allow contradictions; union adds code |
| specific generic vs. universal generic | reuse and readability | specific generic preserves real relation; universal abstraction increases complexity |
| detailed landing vs. focused landing | explanation and conversion | detailed page overwhelms; focused page may omit context |
| local demo vs. public demo | setup and accessibility | local requires effort; public demo requires hosting |
| minimal CI vs. complex pipeline | feedback and maintenance | minimal can leave gaps; complex costs time |
| small v0.1 vs. broad release | speed and value | small may feel limited; broad increases risk |
| open feedback vs. structured questions | spontaneity and signal | open is vague; structured questions can bias answers |
| simple architecture vs. early abstraction | speed and change | simple can couple; early abstraction creates overhead |

## Small examples that should break

Create:

1. payload with `title: 42`;
2. `resolved` state without `solution`;
3. new status not handled;
4. generic with useless parameters;
5. contradictory form flags;
6. broken build import;
7. e2e breaking the main workflow;
8. README missing a required variable;
9. release tag with outdated instructions;
10. landing CTA pointing to a missing demo.

Every failure should become a documented correction.

## Cycle issue

```text
feat: publish first usable MVP flow
```

Criteria:

```text
- user understands problem
- user can run/demo
- main flow works
- tests pass
- CI passes
- landing links to demo and GitHub
- v0.1.0 release exists
```

## Suggested PRs

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

## README as external evaluation

A person should be able to answer:

- what is it?
- who is it for?
- what problem?
- what does the current version do?
- how do I run it?
- how do I test it?
- where is the demo?
- what are the limitations?
- what comes next?

Without a private message.

## Portfolio evidence

Strong description:

> Delivered the first public MVP of a workflow for recording and retrieving technical resolutions. I modeled the lifecycle with TypeScript discriminated unions, validated external inputs before converting them to internal types, protected the main flow with automated tests, and ran type checking, linting, tests, and the production build on pull requests. The delivery includes a public landing page, scoped release documentation, and a `v0.1.0` release.

Better than:

> Built a complete ticketing system.

It is not complete.

Precision is an advantage.

## Impact

You can describe impact through:

### Reliability

> contradictory states became harder to represent in central flows.

### Productivity

> CI detects incomplete changes before merge.

### Maintenance

> the explicit `v0.1` scope reduces uncontrolled parallel changes.

### Communication

> the landing page and README allow the project to be evaluated without private explanation.

Do not invent metrics.

## Practical article 1 — TypeScript in the MVP

### Suggested title

**How I Used TypeScript to Model an MVP and Landing Page More Safely**

Structure:

1. product problem;
2. weak initial type;
3. invalid state;
4. `unknown`;
5. narrowing;
6. discriminated union;
7. utility type;
8. useful generic;
9. test;
10. CI;
11. trade-off;
12. conclusion.

Weak example:

```ts
type Ticket = {
  status: string;
  solution?: string;
};
```

Improved example:

```ts
type Ticket =
  | OpenTicket
  | ResolvedTicket;
```

Show which error the compiler now prevents.

## Practical article 2 — `unknown`, `never`, and generics

### Suggested title

**unknown, never, and Generics: What Actually Changes in Everyday Code**

Use small examples.

### `unknown`

External input.

### `never`

Exhaustive checking.

### Generic

Preserve a type relationship.

Example:

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

Include:

> When would I not use this?

## Practical article 3 — growth as a developer

### Suggested title

**What My TypeScript Lab Proves About My Growth as a Developer**

Show:

- problem;
- scope;
- repository;
- modeling;
- tests;
- CI;
- landing;
- release;
- limitations.

Do not turn the article into empty self-promotion.

Show artifacts.

## What this proves for international roles

Example:

```text
- I can scope a small product.
- I can model business states with TypeScript.
- I can validate external data.
- I can write automated tests.
- I can configure CI.
- I can publish a reproducible release.
- I can explain technical trade-offs in English.
```

That is stronger than:

> "Advanced TypeScript."

## Recommended article format

800 to 1,500 words.

Structure:

1. introduction;
2. problem;
3. code;
4. tests;
5. improvement;
6. evidence;
7. trade-offs;
8. limitations;
9. conclusion;
10. GitHub/demo.

## Technical English for interviews

> I kept the first release intentionally small. The goal was to prove one end-to-end workflow instead of building many disconnected features. The v0.1.0 release includes the main flow, automated tests, CI, a public landing page, and clear limitations.

Another:

> I replaced `any` at external boundaries with `unknown` and explicit validation. This added a small amount of parsing code, but it prevented untrusted values from silently entering the domain model.

Another:

> I used a discriminated union for the ticket lifecycle because optional fields allowed contradictory states. The trade-off is additional type code, but product changes become easier to track through compiler errors.

Another:

> I used generics only where they preserve a real relationship between values, such as `Result<T>`. I avoided generic service abstractions because they made the MVP harder to read without providing meaningful reuse.

Another:

> Every pull request runs type checking, linting, tests, and the production build. This gives fast feedback when a product change breaks a contract or leaves a state unhandled.

## Technical completion checklist

You have completed E019 when you can:

- define problem and audience;
- write an MVP hypothesis;
- limit scope;
- define out of scope;
- define the main workflow;
- model state with TypeScript;
- remove unnecessary `any`;
- use `unknown` at an appropriate boundary;
- narrow values;
- use discriminated unions;
- apply `never` for exhaustive checking;
- use a generic with a real relationship;
- use utility types without exposing invalid states;
- explain the readability cost of complex types;
- test isolated rules;
- test integration;
- protect an important contract;
- create e2e coverage for the main workflow;
- build a landing page;
- communicate the problem;
- identify the audience;
- show a demonstration;
- include a CTA;
- include contact;
- document limitations;
- configure CI on pull requests;
- run type checking;
- run lint;
- run tests;
- run build;
- organize issues;
- organize pull requests;
- create a `v0.1.0` release;
- write release notes;
- maintain reproducible instructions;
- write an English summary;
- publish portfolio evidence;
- explain trade-offs in simple technical English.

## What you should take away from this cycle

A professional MVP is not defined only by how few features it has.

It is defined by the clarity of the problem it tries to prove.

The first release must be small enough to finish and complete enough to evaluate.

TypeScript becomes a tool for safer change.

The landing page becomes a communication tool.

Tests become behavioral evidence.

CI becomes process protection.

The release becomes a reproducible milestone.

The README becomes documentation for someone outside the project.

At the end, you should be able to show:

```text
problem
 -> audience
 -> hypothesis
 -> scope
 -> code
 -> tests
 -> CI
 -> demo
 -> landing
 -> release
 -> feedback
```

You have completed E019 when someone who has never spoken to you can open the landing page, understand the problem, try or run the MVP, inspect the GitHub repository, see the `v0.1.0` release, understand the limitations, and evaluate your technical decisions.

That is the difference between a project that merely exists on your computer and a public delivery that works as professional evidence.

## Primary references

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
