---
translationId: 4e151515-1515-4515-8515-151515151515
articleId: e0151515-1515-4515-8515-151515151515
locale: en
slug: backend-architecture-quality-refactoring
title: "Backend Architecture Applied to Quality and Refactoring: Organizing Change Without Overengineering"
description: "A practical guide to separating domain, application, infrastructure, and public interfaces, using backend architecture as a tool for quality, safe refactoring, and lower change cost."
status: draft
---

# Backend Architecture Applied to Quality and Refactoring: Organizing Change Without Overengineering

Backend architecture is not choosing folder names, applying a famous diagram, or creating interfaces for every class.

Architecture is the ability to organize change.

A system starts simple. Then new rules, integrations, databases, queues, authentication, jobs, APIs, and operational requirements appear. The problem begins when every change requires touching many places, understanding unrelated details, and risking regressions far from the original modification.

In this cycle, the context is **quality and refactoring**. The goal is to use architecture to make changes:

1. more localized;
2. more testable;
3. more explicit;
4. less dependent on external details;
5. easier to review and revert.

> Good architecture does not eliminate change. It reduces the number of places that need to know about each change.

<!-- VISUAL:
Four concentric blocks or layers:
Interface -> Application -> Domain
Infrastructure enters through adapters at the boundaries.
Dependency arrows point inward.
Beside it: database, HTTP, queue, filesystem, and external services as replaceable details.
-->

## The problem that guides the lab

Imagine an order backend that started small.

An initial implementation may look convenient:

```ts
import { pool } from "./database.js";
import { sendEmail } from "./email.js";

export async function createOrderHandler(
  request: Request,
): Promise<Response> {
  const body = await request.json();

  if (!body.customerId) {
    return Response.json(
      { error: "customerId is required" },
      { status: 400 },
    );
  }

  const customer = await pool.query(
    "SELECT * FROM customers WHERE id = $1",
    [body.customerId],
  );

  if (customer.rowCount === 0) {
    return Response.json(
      { error: "customer not found" },
      { status: 404 },
    );
  }

  let total = 0;

  for (const item of body.items) {
    const product = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [item.productId],
    );

    total += Number(product.rows[0].price) * item.quantity;
  }

  const order = await pool.query(
    `INSERT INTO orders (customer_id, total)
     VALUES ($1, $2)
     RETURNING *`,
    [body.customerId, total],
  );

  await sendEmail(
    customer.rows[0].email,
    `Order ${order.rows[0].id} created`,
  );

  return Response.json(order.rows[0], {
    status: 201,
  });
}
```

The code may work.

The problem is the cost of the next change.

This function knows about:

- HTTP;
- JSON shape;
- validation;
- SQL;
- database schema;
- calculation rules;
- customer existence rules;
- order rules;
- email delivery;
- response format;
- HTTP status codes.

If the database changes, the handler changes.

If pricing rules change, the handler changes.

If email delivery changes, the handler changes.

If the same use case must also run from a CLI or queue, the rule must be duplicated or urgently extracted.

Our lab will refactor this kind of code without changing the public contract all at once.

## Architecture does not start with folders

A structure such as:

```text
controllers/
services/
repositories/
models/
```

does not guarantee real separation.

This code can still violate boundaries:

```ts
export class OrderService {
  async create(input: CreateOrderInput) {
    const response = await fetch(
      "https://external-pricing.example.com",
    );

    const price = await response.json();

    return pool.query(
      "INSERT INTO orders ...",
    );
  }
}
```

The file lives in `services/`, but it is still coupled to:

- `fetch`;
- an external service;
- database;
- external data shape;
- SQL.

Architecture should be observed through **dependencies**, not folder names.

## The first principle: dependency direction

A business rule should know as little as possible about external details.

For example, an order entity does not need to know it will be persisted in PostgreSQL:

```ts
export class Order {
  constructor(
    readonly id: string,
    readonly customerId: string,
    private readonly items: readonly OrderItem[],
  ) {}

  total(): number {
    return this.items.reduce(
      (sum, item) => sum + item.total(),
      0,
    );
  }
}
```

It also does not need to know whether it is invoked by:

- HTTP;
- CLI;
- a test;
- a queue;
- a job.

When a rule knows unnecessary external details, change cost rises.

## Four useful areas

For the lab, use four conceptual areas:

```text
src/
  domain/
  application/
  infrastructure/
  interfaces/
```

Do not treat this as a universal rule.

The value lies in the role of each part.

### Domain

Contains core concepts and business rules.

### Application

Orchestrates use cases.

### Infrastructure

Implements external details.

### Interfaces

Adapts system input and output, such as HTTP or CLI.

The architecture works when those responsibilities are respected, not merely when the folders exist.

## Entities

Entities have identity and behavior that matters to the domain.

```ts
type OrderId = string;
type CustomerId = string;

export class Order {
  private readonly items: OrderItem[] = [];

  constructor(
    readonly id: OrderId,
    readonly customerId: CustomerId,
  ) {}

  addItem(item: OrderItem): void {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    this.items.push(item);
  }

  total(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.total()),
      Money.zero(),
    );
  }
}
```

The entity centralizes rules that belong to the concept.

Avoid turning an entity into a passive property bag when important invariants could live inside it.

## Value objects

Value objects represent values defined by their content rather than identity.

Money is a classic example.

```ts
export class Money {
  private constructor(
    readonly cents: number,
  ) {
    if (!Number.isInteger(cents)) {
      throw new Error("Money must use integer cents");
    }
  }

  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  multiply(quantity: number): Money {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Invalid quantity");
    }

    return new Money(this.cents * quantity);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }
}
```

Now monetary rules no longer depend on loose `number` values scattered across the codebase.

Another example:

```ts
export class Email {
  private constructor(
    readonly value: string,
  ) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (!normalized.includes("@")) {
      throw new Error("Invalid email");
    }

    return new Email(normalized);
  }
}
```

The goal is not to turn every string into a class.

Create value objects when they:

- protect invariants;
- remove duplication;
- communicate meaning;
- reduce incorrect conversions.

## When not to create a value object

This may be bureaucracy:

```ts
class UserFirstName {
  constructor(readonly value: string) {}
}

class UserLastName {
  constructor(readonly value: string) {}
}

class UserMiddleName {
  constructor(readonly value: string) {}
}
```

If there is no behavior, rule, or risk that justifies the type, the abstraction may increase reading cost.

Mature architecture also knows when not to abstract.

## Domain services

Not every rule naturally belongs in one entity or value object.

Example:

```ts
export class DiscountPolicy {
  calculate(
    customer: Customer,
    order: Order,
  ): Money {
    if (customer.isPremium()) {
      return order.total().multiplyPercentage(10);
    }

    return Money.zero();
  }
}
```

A domain service represents a business rule without its own identity.

Do not create `SomethingService` simply because you do not know where to place a function.

Ask:

> Is this truly a domain rule involving multiple concepts?

If not, it may belong in:

- application;
- infrastructure;
- a local utility;
- the entity itself.

## Use cases

The application layer coordinates a system intention.

Example:

```ts
export type CreateOrderCommand = {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};
```

```ts
export class CreateOrderUseCase {
  constructor(
    private readonly customers: CustomerRepository,
    private readonly products: ProductRepository,
    private readonly orders: OrderRepository,
    private readonly notifier: OrderNotifier,
  ) {}

  async execute(
    command: CreateOrderCommand,
  ): Promise<CreateOrderResult> {
    const customer = await this.customers.findById(
      command.customerId,
    );

    if (customer === null) {
      throw new CustomerNotFoundError();
    }

    const order = Order.create(customer.id);

    for (const input of command.items) {
      const product = await this.products.findById(
        input.productId,
      );

      if (product === null) {
        throw new ProductNotFoundError(input.productId);
      }

      order.addItem(
        OrderItem.create(
          product.id,
          input.quantity,
          product.price,
        ),
      );
    }

    await this.orders.save(order);

    await this.notifier.orderCreated(
      customer,
      order,
    );

    return {
      orderId: order.id,
      totalCents: order.total().cents,
    };
  }
}
```

The use case knows the contracts required to execute the operation, but it does not know how PostgreSQL, SMTP, or HTTP works.

## Domain is not simply "the folder with no imports"

You can have a pure domain and still create poor design.

Example:

```ts
export class Order {
  updateCustomer(
    id?: string,
    name?: string,
    email?: string,
    status?: string,
    discount?: number,
    source?: string,
  ) {
    // ...
  }
}
```

The class lives in the correct layer but exposes a confusing contract.

Architecture does not replace good modeling.

## Application is not the place to hide business rules

Consider:

```ts
if (
  customer.type === "premium" &&
  order.total > 10000 &&
  currentMonth === 12
) {
  discount = 20;
}
```

If this represents a business policy, it should not remain buried in a use case only because the file lives under `application/`.

Move it into the domain when doing so improves meaning, testing, and reuse.

## Infrastructure is detail

Infrastructure implements contracts needed by internal layers.

Repository example:

```ts
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}
```

PostgreSQL implementation:

```ts
export class PostgresOrderRepository
  implements OrderRepository {
  constructor(
    private readonly database: DatabaseClient,
  ) {}

  async save(order: Order): Promise<void> {
    await this.database.query(
      `INSERT INTO orders (id, customer_id, total_cents)
       VALUES ($1, $2, $3)`,
      [
        order.id,
        order.customerId,
        order.total().cents,
      ],
    );
  }

  async findById(
    id: string,
  ): Promise<Order | null> {
    // ...
    return null;
  }
}
```

The contract represents an application need.

The implementation represents a technical decision.

## Dependency inversion

Dependency inversion does not mean "every class needs an interface."

The relevant principle is:

> high-level code should not directly depend on low-level details when that dependency increases change cost.

Without inversion:

```ts
export class CreateOrderUseCase {
  private readonly repository =
    new PostgresOrderRepository();
}
```

The use case chooses the technology.

With inversion:

```ts
export class CreateOrderUseCase {
  constructor(
    private readonly repository: OrderRepository,
  ) {}
}
```

Composition chooses the implementation:

```ts
const orderRepository =
  new PostgresOrderRepository(database);

const createOrder =
  new CreateOrderUseCase(orderRepository);
```

The use case depends on the capability to persist orders, not on PostgreSQL.

## When an interface is useful

An interface or contract is often useful at a meaningful boundary:

- database;
- external service;
- queue;
- filesystem;
- clock;
- ID generator;
- email delivery;
- payment gateway;
- cache;
- component with multiple real implementations.

It can also help deterministic testing.

## When an interface may be unnecessary

This adds little value:

```ts
interface UserNameFormatter {
  format(name: string): string;
}

class DefaultUserNameFormatter
  implements UserNameFormatter {
  format(name: string): string {
    return name.trim();
  }
}
```

If:

- there is one implementation;
- there is no realistic variation;
- there is no external dependency;
- tests do not need substitution;
- the abstraction does not protect a concept;

a function may be enough:

```ts
export function formatUserName(
  name: string,
): string {
  return name.trim();
}
```

Abstraction has a cost:

- more files;
- more names;
- more navigation;
- more indirection;
- more decisions.

## DTOs: data crossing boundaries

DTOs should represent an input or output contract.

HTTP:

```ts
export type CreateOrderHttpBody = {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};
```

Application:

```ts
export type CreateOrderCommand = {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};
```

They may look identical.

But they serve different roles.

The HTTP DTO belongs to the public interface.

The command belongs to the application.

They coincide today. They may diverge tomorrow.

## Do not reuse an entity as a DTO

Avoid:

```ts
return Response.json(order);
```

An entity may contain:

- internal fields;
- methods;
- data that should not be public;
- a representation different from the HTTP contract.

Prefer explicit mapping:

```ts
export type OrderHttpResponse = {
  id: string;
  total: number;
};

export function toOrderHttpResponse(
  order: Order,
): OrderHttpResponse {
  return {
    id: order.id,
    total: order.total().cents,
  };
}
```

The public contract becomes explicit.

## Mappers

Mappers translate representations across boundaries.

Database:

```ts
type OrderRow = {
  id: string;
  customer_id: string;
  total_cents: number;
};
```

Domain:

```ts
export function orderRowToDomain(
  row: OrderRow,
): Order {
  return Order.restore({
    id: row.id,
    customerId: row.customer_id,
    total: Money.fromCents(row.total_cents),
  });
}
```

HTTP:

```ts
export function orderToHttp(
  order: Order,
): OrderHttpResponse {
  return {
    id: order.id,
    total: order.total().cents,
  };
}
```

Mapping can look repetitive, but it protects boundaries.

If the database schema changes from `total_cents` to another representation, the domain does not necessarily need to change.

## When mapping becomes excessive

A very small application can end up with:

```text
UserEntity
UserModel
UserPersistenceModel
UserDto
UserResponseDto
UserViewModel
UserMapper
UserPersistenceMapper
UserResponseMapper
```

to move three identical fields.

That may cost more than it protects.

Use mappers where the boundary has a real risk of divergence.

## Validators

External input is not trusted domain data.

HTTP receives `unknown`.

```ts
export function parseCreateOrderBody(
  input: unknown,
): CreateOrderHttpBody {
  if (
    typeof input !== "object" ||
    input === null
  ) {
    throw new InvalidRequestError();
  }

  // additional validation
  return input as CreateOrderHttpBody;
}
```

In real applications, a schema library may be preferable.

The important part is keeping the decision explicit:

- structural validation happens at the boundary;
- business rules stay in domain/application.

For example, `quantity` being a positive integer may be protected at multiple levels:

- validator rejects clearly invalid payload;
- value object or entity protects the domain invariant;
- database can protect integrity where appropriate.

Each layer protects a different risk.

## Repository: a domain-oriented collection

A repository represents access to entities or aggregates according to application needs.

Good contract:

```ts
export interface OrderRepository {
  save(order: Order): Promise<void>;

  findById(
    id: string,
  ): Promise<Order | null>;
}
```

Suspicious contract:

```ts
export interface GenericRepository<T> {
  create(input: Partial<T>): Promise<T>;
  update(
    where: Record<string, unknown>,
    data: Partial<T>,
  ): Promise<number>;
  find(
    where: Record<string, unknown>,
    include?: string[],
  ): Promise<T[]>;
  delete(
    where: Record<string, unknown>,
  ): Promise<number>;
}
```

The second abstraction looks reusable, but it can expose ORM or query-builder concepts across the application.

It reduces repetition while increasing persistence-model coupling.

## Gateway: access to an external system

A gateway expresses a relevant external capability.

```ts
export interface PaymentGateway {
  authorize(
    input: AuthorizePaymentInput,
  ): Promise<PaymentAuthorization>;
}
```

Implementation:

```ts
export class AcmePaymentGateway
  implements PaymentGateway {
  constructor(
    private readonly client: AcmeClient,
  ) {}

  async authorize(
    input: AuthorizePaymentInput,
  ): Promise<PaymentAuthorization> {
    const response = await this.client.charge({
      amount: input.amount.cents,
      token: input.token,
    });

    return {
      authorizationId: response.id,
      approved: response.status === "approved",
    };
  }
}
```

The rest of the system does not need to know the vendor-specific format.

## Adapter

An adapter translates one contract into another.

An HTTP controller can be an input adapter:

```ts
export async function createOrderHttp(
  request: Request,
  useCase: CreateOrderUseCase,
): Promise<Response> {
  const body = await request.json();
  const dto = parseCreateOrderBody(body);

  try {
    const result = await useCase.execute(dto);

    return Response.json(
      {
        id: result.orderId,
        totalCents: result.totalCents,
      },
      { status: 201 },
    );
  } catch (error) {
    return mapApplicationErrorToHttp(error);
  }
}
```

A PostgreSQL repository is an output adapter.

Ports and adapters becomes useful when you see actual flows, not when you invent exotic folder names.

## Public contracts should be treated as products

Imagine clients already consume:

```json
{
  "id": "ord-123",
  "totalCents": 2500
}
```

During an internal refactor, you may change:

- entity;
- repository;
- database;
- folder organization;
- framework.

But the HTTP contract can remain the same.

This is one of the main exercises of the cycle:

> change the inside without forcing the outside to change.

## Contract tests protect refactoring

```ts
test("POST /orders keeps public response contract", async () => {
  const response = await app.request("/orders", {
    method: "POST",
    body: JSON.stringify(validOrder),
  });

  assert.equal(response.status, 201);

  const body = await response.json();

  assert.deepEqual(
    Object.keys(body).sort(),
    ["id", "totalCents"],
  );
});
```

A stronger test can use a formal schema.

The goal is to detect accidental public changes.

## Errors are part of the contract too

Avoid returning internal messages directly:

```ts
return Response.json({
  error: error.message,
});
```

That couples clients to internal wording and may expose details.

Prefer stable public codes:

```ts
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer was not found"
  }
}
```

Internally, the application can use specific classes or types.

## Error mapping by boundary

Domain:

```ts
export class InvalidOrderQuantityError
  extends Error {}
```

Application:

```ts
export class CustomerNotFoundError
  extends Error {}
```

HTTP:

```ts
export function mapApplicationErrorToHttp(
  error: unknown,
): Response {
  if (error instanceof CustomerNotFoundError) {
    return Response.json(
      {
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: "Customer was not found",
        },
      },
      { status: 404 },
    );
  }

  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected error",
      },
    },
    { status: 500 },
  );
}
```

The domain does not need to know HTTP status codes.

## Composition root

Somewhere, details must be connected.

That can happen through explicit composition:

```ts
const database = createDatabase(config.database);

const customerRepository =
  new PostgresCustomerRepository(database);

const productRepository =
  new PostgresProductRepository(database);

const orderRepository =
  new PostgresOrderRepository(database);

const notifier =
  new EmailOrderNotifier(emailClient);

const createOrderUseCase =
  new CreateOrderUseCase(
    customerRepository,
    productRepository,
    orderRepository,
    notifier,
  );
```

Do not hide composition inside a magic container before understanding what the container solves.

Dependency injection does not require a DI framework.

## Hexagonal, clean, and onion architecture

These styles share related ideas:

- core rules independent from details;
- explicit boundaries;
- dependencies directed toward the core;
- adapters for external technologies.

Names and diagrams differ.

For this cycle, you do not need to choose one school as an identity.

Use the concepts that reduce change cost.

## Traditional layered architecture

A traditional layered architecture can work well:

```text
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

It fails when every layer simply forwards calls:

```ts
controller -> service -> manager -> repository -> dao
```

without adding a clear responsibility.

It can also fail when the `service` knows every technology and becomes a new internal monolith.

## Ports and adapters

Another representation:

```text
         HTTP Adapter
             |
             v
        Application
        /         \
       v           v
   Domain        Ports
                  /   \
                 v     v
          DB Adapter  Email Adapter
```

The value lies in distinguishing:

- policy;
- orchestration;
- details.

You do not need interfaces for every arrow in the diagram.

## The most important question: what changes together?

Architecture should consider axes of change.

Example:

- discount rules change for business reasons;
- PostgreSQL changes for technical reasons;
- HTTP responses change because of external contracts;
- email provider changes for operational reasons.

If everything lives in the same module, independent changes contaminate one another.

Separating responsibilities reduces that coupling.

## Cohesion

High cohesion means grouping things that truly belong together.

Example:

```text
domain/order/
  order.ts
  order-item.ts
  order-errors.ts
```

may be more cohesive than:

```text
entities/
  order.ts
  order-item.ts

errors/
  order-errors.ts
```

in a larger system.

Feature-based organization can reduce navigation as the domain grows.

## Organization by layer versus feature

### By layer

```text
domain/
application/
infrastructure/
interfaces/
```

Good for studying boundaries and smaller projects.

### By feature

```text
orders/
  domain/
  application/
  infrastructure/
  interfaces/

customers/
  domain/
  application/
  infrastructure/
  interfaces/
```

May scale better when clear business modules exist.

Neither is universally superior.

Compare:

- frequency of change;
- team size;
- number of features;
- shared concepts;
- navigation cost.

## Structural coupling

Consider:

```ts
import { PrismaClient } from "@prisma/client";

export class CancelOrder {
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  async execute(id: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    });
  }
}
```

This use case directly depends on the ORM.

That may be acceptable in a small application.

The cost appears when:

- cancellation rules grow;
- tests require a database;
- the ORM changes;
- the domain must be reused;
- persistence has a different representation.

The decision depends on context.

## Not every application needs full Clean Architecture

A short-lived internal CRUD API may not justify:

- rich entities;
- ports;
- dozens of DTOs;
- multiple mappers;
- factories;
- DI container.

A simple application can begin with clear modules and minimal boundaries.

Architecture should grow with need.

> Architectural complexity is also debt when it solves no real problem.

## Refactoring guided by seams

A seam is a point where behavior can be replaced or isolated.

In the initial handler, one first step could extract database access:

Before:

```ts
const customer = await pool.query(...);
```

After:

```ts
const customer =
  await customerRepository.findById(customerId);
```

The HTTP contract remains unchanged.

Behavior remains covered by tests.

Then you can extract calculation.

Then notification.

Then a use case.

Architecture emerges through small steps.

## Safe refactoring: preserve observable behavior

Before changing structure, record:

- HTTP status;
- body;
- side effects;
- persistence;
- events;
- errors;
- relevant logs, when they are part of the operational contract.

Example:

```ts
test("creates order and sends notification", async () => {
  const response = await request(app)
    .post("/orders")
    .send(validPayload);

  assert.equal(response.status, 201);
  assert.equal(fakeNotifier.sent.length, 1);
});
```

The test may be imperfect, but it creates a safety net for the first extraction.

## Characterizing legacy code

In code without clear architecture, first discover behavior.

Create characterization tests for:

- happy path;
- invalid input;
- database failure;
- external-service failure;
- duplicate handling;
- special rule;
- retry behavior;
- error shape.

Then refactor.

Do not improve business rules and structural design in the same step unless necessary.

## Before and after

### Before

```ts
export async function createInvoice(
  input: any,
): Promise<any> {
  const customer = await db.customer.findUnique({
    where: { id: input.customerId },
  });

  const tax = input.amount * 0.17;

  const result = await db.invoice.create({
    data: {
      customerId: input.customerId,
      amount: input.amount,
      tax,
    },
  });

  await fetch(process.env.BILLING_WEBHOOK!, {
    method: "POST",
    body: JSON.stringify(result),
  });

  return result;
}
```

### After

Domain:

```ts
export class Invoice {
  static create(
    customerId: string,
    amount: Money,
    taxPolicy: TaxPolicy,
  ): Invoice {
    const tax = taxPolicy.calculate(amount);

    return new Invoice(
      createInvoiceId(),
      customerId,
      amount,
      tax,
    );
  }
}
```

Port:

```ts
export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
}
```

Gateway:

```ts
export interface BillingEvents {
  invoiceCreated(
    invoice: Invoice,
  ): Promise<void>;
}
```

Application:

```ts
export class CreateInvoice {
  constructor(
    private readonly invoices: InvoiceRepository,
    private readonly events: BillingEvents,
    private readonly taxPolicy: TaxPolicy,
  ) {}

  async execute(
    command: CreateInvoiceCommand,
  ): Promise<CreateInvoiceResult> {
    const invoice = Invoice.create(
      command.customerId,
      Money.fromCents(command.amountCents),
      this.taxPolicy,
    );

    await this.invoices.save(invoice);
    await this.events.invoiceCreated(invoice);

    return {
      id: invoice.id,
      amountCents: invoice.amount.cents,
      taxCents: invoice.tax.cents,
    };
  }
}
```

Now persistence and webhook changes do not require changing the tax rule.

## But beware of a "too perfect" after version

Even the refactored version may have problems:

- `createInvoiceId()` may be a hidden dependency;
- publishing after persistence may fail and create inconsistency;
- `TaxPolicy` may be unnecessary if there is one stable rule;
- repository abstraction may hide required transaction control.

The exercise does not end when the diagram looks clean.

Architecture is conscious trade-off management.

## Transactions cross boundaries

A use case may need to persist multiple aggregates atomically.

Avoid abstractions that make transactions impossible to express.

One option:

```ts
export interface UnitOfWork {
  run<T>(
    work: (
      context: TransactionContext,
    ) => Promise<T>,
  ): Promise<T>;
}
```

Another option is exposing a high-level transactional operation on the repository.

Another is allowing infrastructure to coordinate part of the flow.

There is no universal answer.

Compare:

- clarity;
- coupling;
- testability;
- database support;
- required consistency.

## Domain events

Events can represent something that happened:

```ts
export type OrderCreated = {
  type: "ORDER_CREATED";
  orderId: string;
  customerId: string;
};
```

They can reduce coupling between secondary effects.

But they introduce:

- ordering;
- delivery;
- duplication;
- retry;
- observability;
- eventual consistency.

Do not adopt events to replace a simple method call without a real need.

## A domain event is not automatically a message broker event

A domain event may exist only in memory.

Publishing it to Kafka, RabbitMQ, or another broker is a separate decision.

Separate:

- domain fact;
- transport mechanism.

That reduces conceptual coupling.

## ADR: record important decisions

ADR stands for Architecture Decision Record.

A useful ADR answers:

1. context;
2. decision;
3. alternatives;
4. consequences;
5. risks;
6. status.

Example:

```md
# ADR-003 — Specific repository per aggregate

## Context

Use cases started receiving ORM query objects,
making the application layer aware of filters and includes.

## Decision

Create specific repositories for Order and Customer,
with methods oriented to use-case needs.

## Alternatives considered

1. continue using the ORM directly;
2. create GenericRepository<T>;
3. use specific repositories per aggregate.

## Consequences

Positive:
- application no longer knows ORM details;
- application tests can use small fakes;
- queries express intent more clearly.

Negative:
- more mapping code;
- repositories may grow if use cases are poorly modeled.

## Risks

Creating too many methods and turning repositories into generic services.
```

## ADRs should record rejected alternatives

Weak ADR:

```md
We decided to use repository because it is better.
```

Useful ADR:

```md
GenericRepository was rejected because it would expose
ORM operators to the application and would not represent
domain-specific queries.
```

This allows the decision to be reevaluated later.

## ADRs are not eternal minutes

An ADR can change status:

```text
Proposed
Accepted
Deprecated
Superseded
```

If a decision is replaced, keep the old record and reference the new ADR.

Architecture is also a history of reasoning.

## Unit tests by layer

### Domain

```ts
test("order rejects zero quantity", () => {
  const order = Order.create("cus-1");

  assert.throws(
    () => order.addItem(
      OrderItem.create(
        "prod-1",
        0,
        Money.fromCents(1000),
      ),
    ),
  );
});
```

Fast, no database.

### Application

Use small fakes:

```ts
class InMemoryOrderRepository
  implements OrderRepository {
  readonly orders: Order[] = [];

  async save(order: Order): Promise<void> {
    this.orders.push(order);
  }
}
```

Test orchestration without starting PostgreSQL.

## Integration tests

The PostgreSQL implementation needs a real database.

```ts
test("persists and restores an order", async () => {
  const repository =
    new PostgresOrderRepository(testDatabase);

  const order = buildOrder();

  await repository.save(order);

  const restored =
    await repository.findById(order.id);

  assert.equal(
    restored?.total().cents,
    order.total().cents,
  );
});
```

A fake repository does not prove SQL, constraints, or mapping.

## Contract tests

Important contracts include:

- HTTP;
- events;
- external gateways;
- schemas;
- consumer/provider relationships.

HTTP example:

```ts
test("keeps order response contract", async () => {
  const response = await createOrder(validPayload);

  assert.equal(response.status, 201);
  assert.match(
    response.headers.get("content-type") ?? "",
    /application\/json/,
  );
});
```

Use formal schemas when they increase confidence.

## E2E tests

Test the assembled system:

```text
HTTP
 -> controller
 -> use case
 -> domain
 -> Postgres adapter
 -> database
```

They validate wiring and critical flow.

Do not try to prove every rule only through e2e tests.

When an e2e test fails, diagnosis costs more.

## The test pyramid is not dogma

The important part is understanding cost and purpose.

Unit tests:

- fast;
- focused;
- little integration.

Integration tests:

- more realistic;
- slower;
- validate boundaries.

Contract tests:

- protect consumers and providers.

E2E tests:

- validate the assembled system;
- expensive;
- valuable for critical paths.

Distribution depends on the system.

## Lint and architectural rules

Lint can help prevent forbidden imports.

Conceptual example:

```text
domain/ cannot import infrastructure/
application/ cannot import interfaces/http/
```

Tools can validate dependencies by directory or graph.

Even without a tool, document the rule and review it in pull requests.

## Coverage

Coverage can reveal:

- untested error mapper;
- uncovered domain branch;
- adapter without a failure path;
- use case missing an important scenario.

Do not use coverage as an architecture score.

You can have 100% coverage in an extremely coupled system.

## Mutation testing

Mutation testing helps validate central rules.

Example:

```ts
if (quantity <= 0) {
  throw new InvalidQuantityError();
}
```

If a mutation changes `<=` to `<` and tests still pass, quantity zero is not protected by tests.

Use it on:

- value objects;
- entities;
- policies;
- critical use cases.

## Complexity

Simple complexity metrics can highlight:

- giant handlers;
- services with dozens of branches;
- excessive mappers;
- generic repository methods that do too much.

But a short function can still be badly coupled.

Use the metric as an investigation signal, not a verdict.

## The dependency graph is a useful metric

Beyond counting lines, inspect imports.

Ask:

- how many modules know the ORM?
- how many know HTTP?
- how many know `process.env`?
- how many import an external SDK?
- how many use cases depend on the same concrete implementation?

A good architectural refactor often reduces the spread of details.

## A lab that proves your knowledge

Create the repository:

```text
backend-architecture-quality-lab/
  src/
    domain/
      order/
        order.ts
        order-item.ts
        money.ts
        errors.ts
    application/
      create-order/
        create-order.ts
        create-order-command.ts
        create-order-result.ts
      ports/
        order-repository.ts
        customer-repository.ts
        product-repository.ts
        order-notifier.ts
    infrastructure/
      database/
        postgres-order-repository.ts
        postgres-customer-repository.ts
      notification/
        email-order-notifier.ts
    interfaces/
      http/
        create-order-handler.ts
        create-order-validator.ts
        order-http-mapper.ts
      cli/
        create-order-command.ts
    main/
      composition-root.ts
  tests/
    unit/
    integration/
    contract/
    e2e/
  docs/
    adr/
    diagrams/
    refactorings/
    metrics/
```

Do not copy the structure blindly.

It exists to make boundaries visible during study.

## Lab scenario

Start with an intentionally coupled version.

Version `v1`:

```text
HTTP handler
  -> validates
  -> queries database
  -> calculates
  -> persists
  -> calls email
  -> builds response
```

Then refactor in steps.

### Step 1

Characterize the HTTP contract.

### Step 2

Extract calculation rules.

### Step 3

Create entity/value objects where invariants exist.

### Step 4

Extract a use case.

### Step 5

Isolate persistence behind a contract.

### Step 6

Isolate notification.

### Step 7

Create boundary mappers where necessary.

### Step 8

Add a CLI adapter that reuses the same use case.

### Step 9

Replace one external implementation without changing the domain.

This sequence demonstrates the reason for the architecture.

## Experiment 1 — change the database

Start with an in-memory repository:

```ts
class InMemoryOrderRepository
  implements OrderRepository {
  // ...
}
```

Then implement PostgreSQL.

The use case should not change.

Record:

- files changed;
- tests reused;
- new tests needed;
- database-specific code.

The question is:

> did the architecture localize the change?

## Experiment 2 — add a CLI

The system already has HTTP.

Create:

```text
node dist/cli/create-order.js \
  --customer cus-1 \
  --product prod-1 \
  --quantity 2
```

The CLI should adapt arguments into the same application command.

Do not duplicate business rules.

Compare how many files had to change.

## Experiment 3 — replace the notifier

Implement:

```ts
class ConsoleOrderNotifier
  implements OrderNotifier {}
```

and:

```ts
class EmailOrderNotifier
  implements OrderNotifier {}
```

Switch only in composition.

If domain and use case need SMTP knowledge, the boundary failed.

## Experiment 4 — change HTTP contract while preserving application

Before:

```json
{
  "customerId": "cus-1"
}
```

New API:

```json
{
  "customer_id": "cus-1"
}
```

The HTTP mapper can adapt:

```ts
return {
  customerId: input.customer_id,
};
```

The application remains unchanged.

This demonstrates that transport contracts and application contracts do not need to be the same type.

## Experiment 5 — unnecessary abstraction

Deliberately create:

```text
ICreateOrderService
CreateOrderService
ICreateOrderFactory
CreateOrderFactory
IOrderMapper
DefaultOrderMapper
```

Measure:

- files;
- lines;
- navigation;
- real implementations;
- replaceable decisions.

Then simplify.

Document why removing abstraction is also architectural refactoring.

## Experiment 6 — GenericRepository versus specific repository

Version A:

```ts
GenericRepository<Order>
```

Version B:

```ts
OrderRepository.findOpenByCustomer(...)
```

Compare:

- clarity;
- ORM dependency;
- testability;
- number of generic parameters;
- use-case intention;
- ability to optimize a specific query.

Do not declare a universal winner.

## Experiment 7 — refactoring with a stable contract

Record contract tests first.

Refactor:

```text
monolithic handler
```

into:

```text
handler -> use case -> domain -> ports/adapters
```

The external consumer should not notice the change.

Save:

- test before;
- test after;
- diff;
- diagram;
- ADR.

## Compare approaches and record where they fail

| Comparison | What to observe | Where each option fails |
| --- | --- | --- |
| direct handler vs. use case | simplicity, reuse, testability | handler grows and mixes responsibilities; use case adds structure |
| direct ORM vs. repository | initial speed, isolation, intention | ORM leaks details; repository can hide important query behavior |
| GenericRepository vs. specific repository | reuse, clarity, coupling | generic can become ORM in disguise; specific can repeat code |
| anemic vs. rich entity | location of rules and flexibility | anemic model spreads rules; rich model can concentrate too much responsibility |
| shared DTO vs. DTO per boundary | duplication and independence | sharing couples contracts; separation can duplicate shapes |
| explicit mapper vs. shared object | clarity and extra code | mapper costs lines; sharing propagates unrelated changes |
| manual DI vs. container | visibility and convenience | manual setup grows; container can hide the graph |
| layer folders vs. feature folders | boundaries and navigation | layer layout spreads features; feature layout can duplicate structure |
| direct call vs. event | simplicity and decoupling | direct call couples flow; event adds consistency and observability concerns |
| large refactor vs. incremental | apparent speed and risk | rewrite makes comparison hard; incremental requires discipline |

## Build small examples that break

Run at least these experiments:

1. import infrastructure into the domain and record the coupling created;
2. return an entity directly over HTTP and then change the entity;
3. reuse an external DTO in the domain and force an external contract change;
4. create a `GenericRepository` that starts receiving ORM-specific filters;
5. create an interface with one implementation and no substitution reason;
6. replace PostgreSQL with a fake without changing the use case;
7. force an external gateway error and test mapping;
8. change database representation without changing the entity;
9. change HTTP response without changing the domain;
10. create an ADR without alternatives and compare it with a complete ADR.

The goal is to understand limits, not just the happy path.

## Measuring change cost

Architecture is difficult to reduce to one number.

Still, record useful signals.

### Change surface

How many files changed when you:

- replace the database?
- replace the notifier?
- add CLI?
- rename an HTTP field?
- change a domain rule?

### Dependency spread

How many modules import:

- ORM;
- HTTP framework;
- external SDK;
- `process.env`;
- filesystem?

### Test speed

Which rules require real infrastructure to test?

### Mutation confidence

Do tests detect changes in central rules?

### Complexity

Are there handlers/services with many responsibilities?

These numbers do not form a universal score.

They make the discussion more concrete.

## A real ADR from the lab

Create:

```text
docs/adr/0001-use-specific-repositories.md
```

Content:

```md
# ADR-0001 — Specific repositories for aggregates

## Status

Accepted

## Context

The first prototype accessed the ORM directly in use cases.
Queries, includes, and ORM types started leaking into the application.

## Options

1. keep direct ORM usage;
2. create GenericRepository;
3. create specific repositories.

## Decision

Adopt specific repositories only at boundaries where
ORM coupling already increased test and change cost.

## Positive consequences

- application depends on intent;
- tests use smaller fakes;
- specific queries can be optimized inside adapters.

## Negative consequences

- more code;
- mapping between persistence and domain;
- risk of large repositories.

## Risks

Creating abstractions too early in simple modules.
```

This ADR communicates context and limits.

## Issues and PRs

Issue:

```text
refactor: isolate order creation from HTTP and database
```

Describe:

- current problem;
- behavior that must remain;
- dependencies to extract;
- existing tests;
- acceptance criteria.

PR:

```text
refactor: introduce CreateOrder use case without changing HTTP contract
```

Include:

- before;
- after;
- simple diagram;
- contract tests;
- removed/added files;
- trade-off;
- follow-up.

Another PR:

```text
refactor: replace ORM dependency in application with OrderRepository
```

Explain why the abstraction became worth its cost.

## Simple README diagram

Use Mermaid or text.

Text example:

```text
HTTP / CLI
    |
    v
Application Use Cases
    |
    v
Domain
    ^
    |
Ports
 /   \
v     v
DB   External Services
Adapters
```

Rule:

```text
Domain         -> knows no HTTP, database, or framework
Application    -> knows domain and ports
Infrastructure -> implements ports
Interfaces     -> converts input/output
Main           -> connects implementations
```

## Professional README

The README should explain:

1. original problem;
2. architectural objective;
3. structure;
4. dependency direction;
5. how to run;
6. how to test;
7. HTTP contract;
8. main use case;
9. adapters;
10. ADRs;
11. experiments;
12. metrics;
13. limitations;
14. next steps.

English summary:

```md
## English summary

This repository studies backend architecture as a way to organize change.
It separates domain rules, application use cases, infrastructure adapters,
and public interfaces while preserving external contracts during refactoring.
The project documents trade-offs, rejected abstractions, automated tests,
and architecture decisions through ADRs.
```

## Evidence for GitHub and your portfolio

Produce:

- public repository;
- README in Portuguese;
- English summary;
- diagram;
- ADRs;
- issues;
- PRs;
- contract tests;
- domain unit tests;
- adapter integration tests;
- e2e for a critical flow;
- CI;
- badge;
- coverage;
- mutation testing on a central rule;
- before/after refactoring;
- abstraction comparison;
- article or vlog.

A strong impact description:

> The first version of the use case directly depended on the ORM, HTTP framework, and email client. The refactor isolated those dependencies behind adapters and kept the HTTP contract protected by contract tests. As a result, a second CLI interface reused the same use case without duplicating business rules.

That demonstrates observable impact.

Avoid:

> "I implemented Clean Architecture and made the system scalable."

Architecture should not be proven with adjectives.

## Practical article 1 — Backend architecture applied to quality and refactoring

### Suggested title

**Backend Architecture Applied to Quality and Refactoring: Separating Business Rules from Technical Details**

Start with the coupled code.

Show:

```text
HTTP + SQL + business rule + email
```

inside one handler.

Then present the target:

```text
HTTP
 -> Application
 -> Domain
 -> Ports
 -> Adapters
```

Explain:

- which dependencies were inverted;
- which contract remained stable;
- which tests enabled the change;
- which files no longer know the ORM;
- what new complexity was introduced.

Include a diagram.

Finish with one concrete change that became localized.

## Practical article 2 — Clean Architecture without overengineering

### Suggested title

**Clean Architecture Without Overengineering: What to Abstract and What Not to Abstract**

Use real examples from the repository.

### Useful abstraction

```ts
interface PaymentGateway {
  authorize(...): Promise<...>;
}
```

because it represents an external boundary.

### Suspicious abstraction

```ts
interface StringTrimmer {
  trim(value: string): string;
}
```

with no variation or risk.

Show:

- file cost;
- cognitive cost;
- testing impact;
- ease of change;
- realistic substitution.

The goal is to show that architectural maturity includes removing unnecessary abstractions.

## Practical article 3 — ADR in practice

### Suggested title

**ADR in Practice: How I Documented a Technical Decision in My Project**

Choose a real decision:

- specific repository;
- manual DI;
- separate DTO;
- event versus direct call;
- feature organization strategy.

Structure:

1. context;
2. problem;
3. constraints;
4. options;
5. criteria;
6. decision;
7. positive consequences;
8. negative consequences;
9. risks;
10. condition for reevaluation.

Include a link to the ADR on GitHub.

Show that engineering means justifying a decision, not only implementing it.

## Recommended article format

Each article can contain 800 to 1,500 words.

Structure:

1. introduction;
2. problem;
3. code before;
4. chosen architecture;
5. code after;
6. tests;
7. trade-offs;
8. limitations;
9. conclusion;
10. GitHub link.

A vlog can show:

- diagram;
- test;
- refactor;
- diff;
- adapter;
- ADR;
- PR.

## How to explain trade-offs in an international interview

Use simple technical English.

> We separated the use case from HTTP and database details because the same business flow needed to be reused from a CLI. The application layer now depends on repository and gateway contracts, while PostgreSQL and HTTP remain adapters. The trade-off is additional mapping and more files, so we only introduced boundaries where they reduced real coupling.

Another example:

> We did not create interfaces for every class. We introduced an abstraction only when there was an external dependency, a testability problem, or a realistic axis of change. This kept the architecture explicit without turning simple code into unnecessary indirection.

Another:

> We preserved the public HTTP contract during the refactor and protected it with contract tests. Internally, the persistence model and domain model changed, but API consumers did not need to change.

Another:

> We documented the repository decision in an ADR. We rejected a generic repository because it exposed ORM-style filters to the application layer and made the abstraction less domain-oriented.

These answers show:

- context;
- alternatives;
- decision;
- consequences.

## Technical completion checklist

You have completed E015 when you can:

- explain architecture as the organization of change;
- distinguish domain, application, infrastructure, and interface;
- model at least one entity with invariants;
- create a value object when there is a real benefit;
- explain when a domain service makes sense;
- create a use case with clear responsibility;
- apply dependency inversion at a meaningful boundary;
- explain why not every class needs an interface;
- create input and output DTOs;
- keep an entity separate from the HTTP contract when necessary;
- create persistence or transport mappers when a real boundary exists;
- validate external input without moving business rules into the controller;
- design a repository around application needs;
- distinguish repository, gateway, and adapter;
- create a composition root;
- preserve a public contract during refactoring;
- write a domain unit test;
- write an application test using a fake;
- write integration tests for a real adapter;
- write a contract test;
- write an e2e test for a critical flow;
- write an ADR with rejected alternatives;
- explain positive and negative consequences of a decision;
- compare layer-based and feature-based organization;
- identify coupling through imports;
- recognize unnecessary abstraction;
- remove an abstraction when it increases cost;
- perform refactoring in small steps;
- use coverage as a signal rather than a score;
- apply mutation testing or equivalent analysis to an important rule;
- compare two approaches and record where each fails;
- explain trade-offs in simple technical English;
- produce reproducible public evidence.

## What you should take away from this cycle

Backend architecture is not drawing boxes.

It is deciding where each type of change should happen.

A business rule should change for a business reason.

A database adapter should change for a persistence reason.

A controller should change for a transport reason.

A gateway should change when an external integration changes.

A public DTO should change when the external contract changes.

When those reasons for change are mixed together, the system loses predictability.

When they are separated deliberately, refactoring becomes more localized and tests can protect each boundary.

But separation also has a cost.

More layers, ports, DTOs, and mappers do not automatically mean better architecture.

The goal of this cycle is to learn to answer:

> Does this abstraction reduce the cost of a likely change, or does it only move code into more files?

You have completed E015 when you can take a coupled backend, characterize its behavior, create boundaries only where they solve real problems, keep the public contract stable, and prove the improvement through tests, ADRs, and evidence of localized change.

The final result must be assessable without a private conversation: a public repository, bilingual README, diagram, tests, CI, ADRs, issues, pull requests, before/after refactoring, and articles that show not only what was created, but why each abstraction exists.

## Primary and classic references

- [Martin Fowler — Patterns of Enterprise Application Architecture](https://martinfowler.com/books/eaa.html)
- [Martin Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Martin Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html)
- [Martin Fowler — Data Mapper](https://martinfowler.com/eaaCatalog/dataMapper.html)
- [Martin Fowler — Dependency Injection](https://martinfowler.com/articles/injection.html)
- [Alistair Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Robert C. Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [TypeScript Handbook — Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [TypeScript Handbook — Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
