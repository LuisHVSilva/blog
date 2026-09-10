---
title: "Backend Architecture Applied to the TS/Node Foundation: Separating Business Rules from Technical Details"
slug: "backend-architecture-ts-node-foundation"
description: "A practical guide to organizing TypeScript/Node backends around domain, use cases, infrastructure, interfaces, DTOs, repositories, adapters, tests, and ADRs without overengineering."
language: "en"
tags:
  - Node.js
  - TypeScript
  - Backend
  - Architecture
  - Clean Architecture
  - DDD
  - Testing
  - ADR
  - TS/Node Foundation
---

# Backend Architecture Applied to the TS/Node Foundation: Separating Business Rules from Technical Details

When developers begin studying backend architecture, they often find diagrams full of boxes, arrows, and names such as `domain`, `application`, `infrastructure`, `adapter`, `gateway`, `repository`, and `mapper`.

This can create a dangerous impression:

> good architecture means having many layers.

It does not.

Architecture is primarily about **organizing change**.

A well-structured system lets you change databases, HTTP frameworks, persistence strategies, external libraries, or integrations without spreading the change through the entire codebase.

This article belongs to the **TS/Node Foundation** cycle. The goal is to study architecture with TypeScript and Node.js in a practical way without turning every file into an abstraction.

---

## The problem architecture is trying to solve

Imagine a simple user creation endpoint:

```ts
app.post("/users", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email
    }
  });

  res.status(201).json(user);
});
```

This may work perfectly in a small project.

The problem appears when rules begin to grow:

- email must be validated;
- duplicate users must be rejected;
- activation has business rules;
- auditing is required;
- the database may change;
- the same operation will be used by HTTP and CLI;
- tests should not require a real database.

When everything lives inside the route, technical and business changes affect the same place.

Architecture begins with a simple question:

> **what is a business rule and what is an external detail?**

---

# Domain, application, infrastructure, and interface

A useful mental model for a TS/Node backend is:

```text
HTTP / CLI Interface
        ↓
Application
        ↓
Domain

Infrastructure → implements required contracts
```

<!-- VISUAL:
Layer diagram:

┌──────────────────────────────┐
│ HTTP / CLI Interface         │
│ controllers, presenters      │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Application                  │
│ use cases                    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Domain                       │
│ entities, VOs, rules         │
└──────────────────────────────┘

Infrastructure sits around them:
DB, filesystem, queue, external APIs
-->

The important rule is not "every application must have exactly four folders."

The important rule is:

> business dependencies should not need to know external details.

---

# Entities and Value Objects

An entity represents something important in the domain and has identity.

Example:

```ts
export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly email: Email
  ) {}
}
```

A **Value Object** represents a value whose meaning comes from its content.

```ts
export class Email {
  private constructor(public readonly value: string) {}

  static create(value: string): Email {
    if (!value.includes("@")) {
      throw new Error("Invalid email");
    }

    return new Email(value);
  }
}
```

The benefit is not simply "using classes."

The benefit is preventing an important rule from being duplicated across controllers, services, and repositories.

If a valid email has its own rules, those rules should live close to the `Email` concept.

---

# Domain services: use them when the rule does not clearly belong to one entity

Not every rule needs a service.

If a rule clearly belongs to an entity, keep it there.

A domain service makes sense when a domain rule involves several concepts and does not naturally belong to one object.

Conceptual example:

```ts
class PricingService {
  calculatePrice(customer: Customer, plan: Plan): Money {
    // domain rule involving multiple concepts
  }
}
```

Creating `UserDomainService` only to move entity methods into another class does not improve architecture.

Abstraction is useful when it clarifies responsibility.

---

# Use cases: expressing application intentions

The application layer coordinates actions the system provides.

Example:

```ts
export type CreateUserInput = {
  name: string;
  email: string;
};

export class CreateUser {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = Email.create(input.email);

    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      throw new Error("User already exists");
    }

    const user = new User(
      crypto.randomUUID(),
      input.name,
      email
    );

    await this.userRepository.save(user);

    return user;
  }
}
```

Notice something important: this use case does not know whether it was called by Express, Nest, a CLI, or a test.

It knows the intention:

```text
create user
```

That separation makes the business flow reusable across interfaces.

---

# Dependency Inversion without turning everything into an interface

The use case needs to save a user.

It does not need to know whether storage uses PostgreSQL, MongoDB, or memory.

We can define a contract:

```ts
export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

Infrastructure implements the contract.

```ts
export class PostgresUserRepository implements UserRepository {
  async findByEmail(email: Email): Promise<User | null> {
    return null;
  }

  async save(user: User): Promise<void> {
    // real persistence
  }
}
```

This is **dependency inversion**: application rules depend on a contract representing what they need, while the external detail adapts to that contract.

A common mistake is:

```text
IUserService
IUserController
IUserMapper
IUserValidator
IUserFactory
IUserAnything
```

Not every class needs an interface.

Ask:

> is there a real boundary or multiple relevant implementations that need protection?

If not, the interface may simply increase maintenance cost.

---

# DTOs, mappers, and validators

HTTP input is not automatically a domain object.

Imagine:

```json
{
  "name": "Ana",
  "email": "ana@example.com"
}
```

That JSON belongs to an external interface.

We can represent it as:

```ts
export type CreateUserRequestDto = {
  name: string;
  email: string;
};
```

A validator checks the external format before calling the use case.

Then the use case transforms simple values into domain objects.

On the way out, a mapper can prevent direct exposure of internal entities:

```ts
export function toUserResponse(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email.value
  };
}
```

This keeps the HTTP contract separate from the internal model.

---

# Repository, Gateway, and Adapter

These names may sound sophisticated, but they all represent boundaries.

A **Repository** usually abstracts persistence of domain objects.

A **Gateway** often represents access to an external system.

For example:

```ts
interface PaymentGateway {
  charge(input: ChargeInput): Promise<ChargeResult>;
}
```

An **Adapter** translates an external API into the contract the application expects.

```ts
class StripePaymentAdapter implements PaymentGateway {
  async charge(input: ChargeInput): Promise<ChargeResult> {
    // translate Stripe input and output
  }
}
```

The goal is not to use every pattern in every project.

The goal is to make external boundaries explicit.

---

# A possible project structure

```text
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── services/
│
├── application/
│   ├── use-cases/
│   └── ports/
│
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   └── gateways/
│
└── interfaces/
    ├── http/
    └── cli/
```

This is not a law.

A small application may need fewer folders.

Good architecture is not the one that looks most sophisticated.

It is the one that makes clear:

```text
where business rules live
who can depend on whom
where external details enter
how to test without loading the whole system
```

---

# Clean Architecture without overengineering

A good abstraction reduces the cost of change.

A bad abstraction creates work without meaningful benefit.

Consider:

```ts
interface Clock {
  now(): Date;
}
```

This can make sense when business rules depend on time and tests need different dates.

Now imagine creating:

```ts
interface UserNameFormatter {
  format(name: string): string;
}
```

for a trivial one-line function used once.

The abstraction may cost more than the change it is meant to protect.

> The number of interfaces does not measure architectural quality.

---

# Tests help validate architecture

If a use case depends only on `UserRepository`, we can create an in-memory implementation:

```ts
class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find(
      user => user.email.value === email.value
    ) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }
}
```

Now the test does not need PostgreSQL:

```ts
it("should not create duplicated users", async () => {
  const repository = new InMemoryUserRepository();
  const useCase = new CreateUser(repository);

  await useCase.execute({
    name: "Ana",
    email: "ana@example.com"
  });

  await expect(
    useCase.execute({
      name: "Ana 2",
      email: "ana@example.com"
    })
  ).rejects.toThrow("User already exists");
});
```

When central rules can be tested without a framework and heavy infrastructure, that is usually a healthy sign.

---

# Refactoring while keeping the public contract stable

Imagine your API exposes:

```http
POST /users
```

with:

```json
{
  "id": "123",
  "name": "Ana",
  "email": "ana@example.com"
}
```

You should be able to replace:

```text
Prisma → Drizzle
PostgreSQL → another database
Express → Fastify
```

without automatically breaking that public contract.

This is a practical architecture test:

> does an internal change force an unnecessary change on the system's consumers?

The more implementation details leak outside, the more expensive change becomes.

---

# ADR: documenting decisions

**ADR** means *Architecture Decision Record*.

It is a short document used to record an important decision.

Example:

```md
# ADR-001 — Repository in the application boundary

## Context

We need to test use cases without a real database.

## Decision

The application will depend on a UserRepository contract.

## Alternatives considered

1. Use Prisma directly in the use case.
2. Create a repository abstraction.
3. Use a simple persistence function.

## Consequences

Positive:
- tests do not require a database;
- implementations are easier to replace.

Negative:
- more files and mapping;
- risk of over-abstraction.
```

A good ADR records more than the final decision.

It records:

```text
why we decided
what we rejected
which cost we accepted
```

---

# A lab for the TS/Node Foundation

Create a small repository:

```text
backend-architecture-lab/
├── src/
├── test/
├── docs/
│   └── adr/
├── package.json
├── tsconfig.json
└── README.md
```

Implement a simple flow such as:

```text
create user
find user
reject duplicates
```

Then build two versions:

```text
coupled version
responsibility-separated version
```

Compare:

- number of files;
- testability;
- impact of replacing the database;
- impact of replacing HTTP;
- clarity;
- maintenance cost.

Do not automatically conclude that the version with more layers is better.

Write down when each approach works and when it starts to fail.

---

# Professional process is part of the exercise

Use Node LTS, TypeScript, npm or pnpm, terminal, VS Code, and Git.

For each small change:

```text
issue
  ↓
branch
  ↓
atomic commits
  ↓
tests
  ↓
pull request
  ↓
self code review
  ↓
merge
```

Even when working alone.

The goal is to turn the repository into evidence of engineering process, not just a folder full of code.

Configure CI to run:

```text
lint
typecheck
test
build
```

---

# How to prove you learned it

At the end, your repository should let another engineer answer:

```text
Which architectural problem was being studied?
Which rule belongs to the domain?
Which responsibility belongs to the application layer?
What was considered infrastructure?
Where did dependency inversion provide value?
Where did you intentionally decide NOT to abstract?
Which alternatives were documented in an ADR?
Which tests protect the contract?
```

The README can be written in your primary language with a short technical English summary.

Example:

> This project explores backend architecture in TypeScript and Node.js by separating business rules from HTTP and persistence details. The goal is not to maximize abstractions, but to reduce the cost of change while keeping tests simple and public contracts stable.

That demonstrates much more maturity than simply placing "Clean Architecture" in the repository name.

---

# Questions you should be able to answer

After the cycle, try to explain:

**What is the difference between domain and application?**

**When should a rule live inside an entity?**

**When is a Value Object worth the cost?**

**When is a domain service necessary?**

**Why should a use case not depend on Express?**

**When does dependency inversion reduce change cost?**

**When is an interface just bureaucracy?**

**What is the difference between a DTO and an entity?**

**What should a repository hide?**

**When should you use a gateway or adapter?**

**How can you replace infrastructure without breaking the public contract?**

**Why are tests an architectural tool?**

**What should an ADR record besides the final decision?**

If you can answer these questions with examples from your own repository, the study is no longer decorative.

---

# What to take away from this article

Backend architecture is not a contest to create the most folders.

It is also not copying a Clean Architecture diagram and creating interfaces for everything.

Architecture means organizing dependencies and responsibilities so important changes have controlled impact.

In the TS/Node Foundation context, a useful mental model is:

```text
Interface
   ↓
Application
   ↓
Domain

Infrastructure
   ↓
adapts external details to the required contracts
```

The domain protects business rules.

The application coordinates use cases.

Infrastructure communicates with databases, networks, and external services.

The interface translates HTTP, CLI, or other mechanisms into application calls.

And abstractions should exist only when they protect a boundary or reduce the cost of change.

> The best architecture is not the one with the most patterns.  
> It is the one that lets the system change safely, clearly, and at a predictable cost.

---

# Suggested next readings

- Clean Architecture Without Overengineering: What to Abstract and What Not to Abstract
- ADR in Practice: How to Document a Technical Decision
- Entities and Value Objects in TypeScript
- Dependency Inversion Applied to Node.js
- Testing Use Cases Without a Database or Framework
