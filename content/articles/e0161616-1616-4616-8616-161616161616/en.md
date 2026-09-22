---
translationId: 4e161616-1616-4616-8616-161616161616
articleId: e0161616-1616-4616-8616-161616161616
locale: en
slug: persistence-sql-quality-refactoring
title: "Persistence and SQL for Quality and Refactoring: From Schema to Real Behavior"
description: "A practical guide to relational modeling, transactions, indexes, migrations, execution plans, and safe persistence refactoring in TypeScript and Node.js backends."
status: published
---

# Persistence and SQL for Quality and Refactoring: From Schema to Real Behavior

A database is not merely a place where an application "saves objects."

In a real backend, persistence directly participates in system reliability. A poorly modeled schema allows inconsistent states. A poorly defined transaction stores half of an operation. A bad index increases latency and cost. A poorly planned migration can block production. A query that looks simple can become the main application bottleneck when the dataset stops looking like a tutorial.

In this cycle, the context is **quality and refactoring**.

The goal is to improve persistence without relying on opinion or superstition. Every change should answer verifiable questions:

- which inconsistency does this constraint prevent?
- which anomaly does this transaction avoid?
- which query does this index accelerate?
- what write cost does the index add?
- what evidence shows the query improved?
- did the public contract remain stable?
- did the refactor change only structure or behavior too?
- is the migration safe for an existing database?

The goal is not only to master SQL syntax. It is to observe real database behavior and make evidence-based decisions.

> Safe persistence combines modeling, integrity, concurrency, and measurement. An ORM can improve productivity, but it does not replace any of those four responsibilities.

<!-- VISUAL:
Four-block flow:
HTTP/Use Case -> Repository -> SQL/Transaction -> PostgreSQL
Under PostgreSQL: integrity, concurrency, indexes, and execution plans.
Beside it: tests, migrations, and measurements as evidence.
-->

## The problem that guides the lab

Create a small order service with:

- customers;
- products;
- orders;
- order items.

The first intentionally fragile version may contain tables such as:

```sql
CREATE TABLE orders (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id integer,
  status text,
  total numeric
);

CREATE TABLE order_items (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id integer,
  product_id integer,
  quantity integer,
  unit_price numeric
);
```

This structure allows problematic states:

- order without a customer;
- arbitrary status;
- item referencing a missing order;
- zero or negative quantity;
- negative price;
- duplicate product in the same order;
- stored total inconsistent with items;
- deletes that leave orphaned data.

The lab begins by accepting that the database still does not protect the domain correctly.

The refactor will proceed in small steps:

1. characterize current behavior;
2. add constraints;
3. improve modeling;
4. create versioned migrations;
5. add transactions;
6. measure queries;
7. introduce indexes;
8. compare pagination strategies;
9. save plans before and after;
10. preserve integration and contract tests.

## A schema is not merely physical structure

The schema communicates which states the system considers valid.

A safer version:

```sql
CREATE TABLE customers (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  price numeric(12, 2) NOT NULL,
  stock integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT products_price_positive
    CHECK (price > 0),
  CONSTRAINT products_stock_nonnegative
    CHECK (stock >= 0)
);

CREATE TABLE orders (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id integer NOT NULL
    REFERENCES customers(id)
    ON DELETE RESTRICT,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_valid
    CHECK (
      status IN ('draft', 'confirmed', 'cancelled')
    )
);

CREATE TABLE order_items (
  order_id integer NOT NULL
    REFERENCES orders(id)
    ON DELETE CASCADE,
  product_id integer NOT NULL
    REFERENCES products(id)
    ON DELETE RESTRICT,
  quantity integer NOT NULL,
  unit_price numeric(12, 2) NOT NULL,
  CONSTRAINT order_items_quantity_positive
    CHECK (quantity > 0),
  CONSTRAINT order_items_price_positive
    CHECK (unit_price > 0),
  PRIMARY KEY (order_id, product_id)
);
```

Every element protects an intention.

## Primary key

```sql
id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

A primary key provides stable row identity.

Avoid relying on attributes that may change, such as name or email, as internal identity.

## Foreign key

```sql
customer_id integer NOT NULL
  REFERENCES customers(id)
```

The foreign key prevents an order from referencing a customer that does not exist.

Without it, every application path writing to the database must remember to protect the rule.

An import, script, or secondary service may bypass that validation.

The constraint centralizes integrity.

## `NOT NULL`

Legitimate absence and missing data are different things.

```sql
name text NOT NULL
```

makes the database reject incomplete rows.

Do not use `NULL` as a generic value for:

- unknown;
- not applicable;
- not calculated yet;
- empty;
- not provided;

without defining the semantics.

## `UNIQUE`

```sql
email text NOT NULL UNIQUE
```

protects uniqueness even when concurrent requests try to insert the same value.

Doing:

```ts
if (!(await emailExists(email))) {
  await createUser(email);
}
```

does not remove race conditions.

When integrity depends on uniqueness, the final rule belongs in the database.

## `CHECK`

```sql
CHECK (quantity > 0)
```

rejects meaningless data.

It can also restrict states:

```sql
CHECK (
  status IN ('draft', 'confirmed', 'cancelled')
)
```

But do not turn `CHECK` into a replacement for every business rule.

Simple local constraints work very well.

Rules involving multiple rows, tables, or processes may require another strategy.

## Correct data types matter

For money:

```sql
numeric(12, 2)
```

is generally more appropriate than binary floating point.

For timestamps:

```sql
timestamptz
```

represents instants with clearer time-zone semantics in PostgreSQL.

For booleans:

```sql
active boolean NOT NULL DEFAULT true
```

is better than strings such as:

```text
"Y"
"N"
"YES"
"NO"
```

when the domain is truly binary.

The database type is part of the contract.

## Modeling totals: store or calculate?

An interesting question:

```sql
orders.total
```

should it exist?

If the total is always:

```text
SUM(quantity * unit_price)
```

storing `total` duplicates information.

That creates risk:

```text
order.total != SUM(order_items)
```

On the other hand, storing the total may be useful when:

- it represents a finalized historical value;
- it includes rules that cannot be recalculated later;
- it is read very frequently;
- aggregation cost has been measured.

There is no automatic answer.

Record:

- source of truth;
- reason for duplication;
- consistency mechanism;
- measured impact.

## Normalization

Normalization aims to keep each fact in an appropriate place.

Poor model:

```text
orders
- customer_name
- customer_email
- customer_phone
- product_1_name
- product_1_price
- product_2_name
- product_2_price
...
```

Customer or product changes create conflicting versions of the same fact.

Better:

```text
customers
products
orders
order_items
```

with explicit relationships.

Normalization reduces:

- insert anomalies;
- update anomalies;
- delete anomalies.

## Controlled denormalization

Not every duplication is a mistake.

`order_items.unit_price` may intentionally repeat `products.price`.

Why?

`products.price` represents the current price.

`order_items.unit_price` represents the price charged at purchase time.

They are different facts.

Before denormalizing, answer:

1. which real problem are we solving?
2. is the duplicate a historical fact or a cache?
3. which value is the source of truth?
4. how will synchronization work?
5. how will divergence be detected?
6. what improvement was measured?

## Modeling around access patterns

The relational model should not be designed only from conceptual entities.

Ask which queries matter.

Example:

> list the latest 20 orders for one customer.

Query:

```sql
SELECT
  id,
  status,
  created_at
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

That access pattern suggests a specific index.

Another query:

> list all confirmed orders across all customers by date.

May require another path.

Access-oriented modeling does not mean abandoning normalization.

It means considering how data will actually be read and written.

## SELECT

A backend developer should know explicit selection.

Avoid:

```sql
SELECT *
FROM orders;
```

when the contract needs only a few columns.

Prefer:

```sql
SELECT
  id,
  customer_id,
  status,
  created_at
FROM orders
WHERE id = $1;
```

Benefits:

- clearer contract;
- less transfer;
- less accidental dependency on future columns;
- easier plan analysis.

## JOIN

To load an order with its customer:

```sql
SELECT
  o.id,
  o.status,
  o.created_at,
  c.id AS customer_id,
  c.name AS customer_name
FROM orders AS o
JOIN customers AS c
  ON c.id = o.customer_id
WHERE o.id = $1;
```

JOIN is not "bad."

A relational database exists to relate data.

The problem is using JOIN without understanding:

- cardinality;
- filters;
- indexes;
- volume;
- selected columns.

## JOIN with items

```sql
SELECT
  o.id,
  o.status,
  p.id AS product_id,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  oi.quantity * oi.unit_price AS line_total
FROM orders AS o
JOIN order_items AS oi
  ON oi.order_id = o.id
JOIN products AS p
  ON p.id = oi.product_id
WHERE o.id = $1;
```

If an order has many items, the query returns multiple rows for the same order.

The application must understand that cardinality.

## GROUP BY

Total per order:

```sql
SELECT
  order_id,
  SUM(quantity * unit_price) AS total
FROM order_items
GROUP BY order_id;
```

Total per customer:

```sql
SELECT
  o.customer_id,
  SUM(oi.quantity * oi.unit_price) AS total
FROM orders AS o
JOIN order_items AS oi
  ON oi.order_id = o.id
GROUP BY o.customer_id;
```

Aggregations may need to read many rows.

Measure them with representative volume.

## CTE

A CTE can make stages explicit:

```sql
WITH order_totals AS (
  SELECT
    order_id,
    SUM(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT
  o.id,
  o.created_at,
  ot.total
FROM orders AS o
JOIN order_totals AS ot
  ON ot.order_id = o.id
WHERE o.customer_id = $1
ORDER BY o.created_at DESC;
```

A CTE is an expression tool.

Do not conclude it is automatically:

- faster;
- slower;
- more readable.

Inspect the plan.

## Subqueries

Example:

```sql
SELECT
  id,
  name,
  price
FROM products
WHERE price > (
  SELECT AVG(price)
  FROM products
);
```

Subqueries are not automatically a problem either.

Ask:

- is it correlated?
- how many times does it run?
- did the planner rewrite it?
- what is the volume?
- is there an appropriate index?

## Safe INSERT

Use parameters.

```sql
INSERT INTO customers (
  email,
  name
)
VALUES ($1, $2)
RETURNING id, email, name;
```

Never concatenate user input:

```ts
const sql =
  "SELECT * FROM users WHERE email = '" +
  email +
  "'";
```

That increases SQL injection risk.

Parameters represent values.

Dynamic identifiers, such as column names, require another strategy such as an allowlist.

## Safe UPDATE

An update should clearly delimit the target.

```sql
UPDATE products
SET price = $2
WHERE id = $1
RETURNING id, price;
```

Additional conditions can protect state:

```sql
UPDATE orders
SET status = 'cancelled'
WHERE id = $1
  AND status = 'draft'
RETURNING id;
```

If no row is returned, that may be a business outcome.

Do not always treat it as a technical error.

## Safe DELETE

```sql
DELETE FROM orders
WHERE id = $1
  AND status = 'draft'
RETURNING id;
```

For important entities, logical deletion may make sense.

But soft delete has costs:

- mandatory filters;
- larger indexes;
- more complex uniqueness;
- "dead" data in queries;
- cleanup difficulty.

Do not adopt soft delete automatically.

## Migrations are production code

Schema evolution should be versioned.

Structure:

```text
migrations/
  001_create_customers.up.sql
  001_create_customers.down.sql
  002_create_products.up.sql
  002_create_products.down.sql
```

A migration should be:

- versioned;
- reviewed;
- tested;
- observable;
- deployment-compatible when necessary.

## A simple migration

```sql
ALTER TABLE products
ADD COLUMN description text;
```

It may look harmless.

But ask:

- does the table have 100 rows or 500 million?
- will it rewrite the table?
- will it lock?
- can the old application version tolerate the new structure?
- is it reversible?

## Expand and contract

A large change may require stages.

Example: replacing `customer_name` with `customer_id`.

### Step 1

Add nullable `customer_id`.

### Step 2

Deploy code that writes both fields.

### Step 3

Backfill.

### Step 4

Validate.

### Step 5

Add constraint.

### Step 6

Switch reads.

### Step 7

Stop writing the old field.

### Step 8

Remove the old field in a later deployment.

This reduces incompatibility between versions during rollout.

## Reversible migrations have limits

A `down` migration:

```sql
DROP COLUMN important_data;
```

does not restore removed content.

"Reversible" may mean structurally reversible, not recoverable data.

For destructive changes, backups, expand/contract, and operational planning matter more than simply having a `.down.sql` file.

## Migration testing

Test:

1. empty database;
2. database at previous version;
3. forward migration;
4. new application;
5. rollback when supported;
6. repeatability;
7. relevant locking behavior.

CI can create a temporary database and apply all migrations.

## Transactions: a unit of consistency

Creating an order involves multiple steps:

1. create order;
2. validate inventory;
3. reduce inventory;
4. insert items;
5. confirm order.

If step 4 fails, earlier steps must not remain partially persisted.

```sql
BEGIN;

-- operations

COMMIT;
```

On failure:

```sql
ROLLBACK;
```

## ACID

### Atomicity

All or nothing.

### Consistency

Protected invariants remain valid.

### Isolation

Concurrent transactions should not produce forbidden combinations.

### Durability

After commit, data survives failures covered by the database mechanism.

These properties do not mean every bug disappears.

They define transaction guarantees.

## Transactions in Node.js

With `node-postgres`, every query in a transaction must use the same connection.

```ts
import type { PoolClient } from "pg";

export async function createOrder(
  client: PoolClient,
  input: CreateOrderInput,
): Promise<number> {
  await client.query("BEGIN");

  try {
    const order = await client.query<{ id: number }>(
      `INSERT INTO orders (
         customer_id,
         status
       )
       VALUES ($1, 'draft')
       RETURNING id`,
      [input.customerId],
    );

    const orderId = order.rows[0].id;

    for (const item of input.items) {
      const product = await client.query<{
        price: string;
      }>(
        `UPDATE products
         SET stock = stock - $2
         WHERE id = $1
           AND active = true
           AND stock >= $2
         RETURNING price`,
        [item.productId, item.quantity],
      );

      if (product.rowCount !== 1) {
        throw new Error(
          `Product ${item.productId} unavailable`,
        );
      }

      await client.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           quantity,
           unit_price
         )
         VALUES ($1, $2, $3, $4)`,
        [
          orderId,
          item.productId,
          item.quantity,
          product.rows[0].price,
        ],
      );
    }

    await client.query(
      `UPDATE orders
       SET status = 'confirmed'
       WHERE id = $1`,
      [orderId],
    );

    await client.query("COMMIT");

    return orderId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
```

The transaction belongs to the connection.

Using `pool.query()` inside the flow may send an operation to another connection.

## Avoiding fragile check-then-update

Fragile:

```sql
SELECT stock
FROM products
WHERE id = $1;
```

Then:

```ts
if (stock >= quantity) {
  // ...
}
```

Then:

```sql
UPDATE products
SET stock = stock - $2
WHERE id = $1;
```

Two transactions may read the same stock before either updates it.

A conditional operation:

```sql
UPDATE products
SET stock = stock - $2
WHERE id = $1
  AND stock >= $2
RETURNING stock;
```

performs validation and mutation as one database statement.

## Isolation levels

PostgreSQL provides levels such as:

- Read Committed;
- Repeatable Read;
- Serializable.

Do not choose based on the strongest name.

Ask which anomaly you need to prevent.

## Read Committed

This is PostgreSQL's default.

Each command observes an appropriate snapshot for the beginning of that command.

Two SELECTs in the same transaction may see different results if another transaction commits changes between them.

That may be acceptable.

## Repeatable Read

Maintains a stable view throughout the transaction.

Prevents some changes from becoming visible between reads.

May abort operations in conflicting scenarios.

The application must be prepared.

## Serializable

Attempts behavior equivalent to serial execution.

It may abort transactions when PostgreSQL detects incompatible dependencies.

The application must implement retry for appropriate transient errors.

`SERIALIZABLE` does not mean "no concurrency errors."

It can mean more aborts in exchange for stronger guarantees.

## Locks

Locks coordinate incompatible access.

Example:

```sql
SELECT
  id,
  stock
FROM products
WHERE id = $1
FOR UPDATE;
```

The row remains locked against incompatible changes until the transaction ends.

Locks are necessary.

Waiting for locks increases latency.

Therefore:

- keep transactions short;
- avoid HTTP calls inside transactions;
- access shared resources in consistent order;
- index searches used to locate rows.

## Deadlocks

Consider:

Transaction A:

1. locks product 1;
2. tries product 2.

Transaction B:

1. locks product 2;
2. tries product 1.

Each waits for the other.

PostgreSQL detects the deadlock and aborts one transaction.

The application must handle that failure.

## Reducing deadlocks

- lock resources in consistent order;
- keep transactions short;
- avoid external work while holding locks;
- create appropriate indexes;
- retry only known transient failures;
- record cause and duration.

Do not hide contention behind infinite retries.

## Indexes: acceleration with a cost

An index is not decoration.

A B-tree:

```sql
CREATE INDEX idx_orders_customer_created
ON orders (
  customer_id,
  created_at DESC,
  id DESC
);
```

can support:

```sql
SELECT
  id,
  status,
  created_at
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

The index was designed for a specific access path.

## Column order in a composite index

Index:

```sql
(customer_id, created_at DESC, id DESC)
```

is different from:

```sql
(created_at DESC, customer_id, id DESC)
```

The order affects how conditions limit the scan.

Do not create a composite index merely by combining columns from the `WHERE`.

Consider:

- equality;
- ranges;
- ordering;
- selectivity;
- real queries.

## Partial index

```sql
CREATE INDEX idx_orders_open_created
ON orders (
  created_at DESC,
  id DESC
)
WHERE status IN ('draft', 'confirmed');
```

It may be smaller than indexing the full history.

It helps when the query is compatible with the predicate.

It is not automatically useful for every query on `orders`.

## Indexes also cost

Every index adds:

- disk usage;
- cache usage;
- INSERT work;
- UPDATE work;
- DELETE work;
- maintenance.

"Index everything" merely moves the bottleneck.

## Foreign keys and indexes

In PostgreSQL, creating a foreign key does not automatically create an index on the referencing column.

Example:

```sql
customer_id integer REFERENCES customers(id)
```

may need an index when queries and operations depend on that access path.

Measure and analyze.

## EXPLAIN

```sql
EXPLAIN
SELECT
  id,
  status
FROM orders
WHERE customer_id = 42;
```

Shows the estimated plan.

You may observe:

- Seq Scan;
- Index Scan;
- Bitmap Scan;
- join types;
- Sort;
- Aggregate;
- estimated rows;
- cost.

Cost is not milliseconds.

It is an internal planner unit.

## EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT
  id,
  status,
  created_at
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Executes the query and adds real measurements.

Observe:

- actual time;
- actual rows;
- loops;
- buffers;
- filters;
- sorts;
- estimate versus reality.

## Seq Scan is not automatically bad

On a small table:

```text
Seq Scan
```

may be cheaper than an index.

If the query returns 80% of the rows, an index may not help either.

The question is not:

> does it use an index scan?

The question is:

> is the plan appropriate for the data volume and access pattern?

## Index Scan does not prove performance

An Index Scan may still:

- visit many rows;
- perform expensive heap fetches;
- execute thousands of loops;
- sort afterward;
- compete for cache.

Read the full plan.

## Estimate versus reality

If the planner expects:

```text
rows=10
```

and finds:

```text
actual rows=100000
```

there is a major mismatch.

That can affect join and access choices.

Investigate:

- statistics;
- distribution;
- correlation;
- filters;
- parameters;
- modeling.

## BUFFERS

With:

```sql
EXPLAIN (ANALYZE, BUFFERS)
```

you can observe pages found in cache or read.

This helps distinguish:

- CPU;
- reads;
- cache;
- volume of data touched.

Use it in a controlled environment.

## EXPLAIN ANALYZE executes the statement

This:

```sql
EXPLAIN ANALYZE
DELETE FROM orders;
```

executes the DELETE.

For experiments:

```sql
BEGIN;

EXPLAIN ANALYZE
UPDATE products
SET price = price * 1.05
WHERE active = true;

ROLLBACK;
```

Even then, the operation may:

- acquire locks;
- execute triggers;
- consume resources;
- cause external effects through extensions.

Test carefully.

## Pagination with OFFSET

```sql
SELECT
  id,
  created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20
OFFSET 100000;
```

The database still has to locate and discard many earlier rows.

Deep pages tend to become more expensive.

## Cursor pagination

```sql
SELECT
  id,
  created_at
FROM orders
WHERE (
  created_at,
  id
) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

With a compatible index, this avoids part of the deep-page work.

But it changes the API contract.

## OFFSET versus cursor

OFFSET helps when:

- there are few pages;
- direct page-number access matters;
- simplicity is more valuable.

Cursor helps when:

- navigation is sequential;
- datasets are large;
- pages become deep;
- stability during inserts matters.

Compare with real data.

Do not choose by fashion.

## Direct SQL versus ORM

An ORM can help with:

- CRUD;
- mapping;
- migrations;
- productivity;
- common query composition.

Direct SQL can help with:

- complex queries;
- database-specific features;
- sensitive plans;
- debugging;
- performance.

The problem is not using an ORM.

The problem is not knowing:

- which SQL it generated;
- how many queries it executed;
- where the transaction begins;
- whether N+1 exists;
- which index is used;
- how to leave the abstraction when needed.

## N+1

Apparently simple code:

```ts
const orders = await orm.order.findMany();

for (const order of orders) {
  order.items =
    await orm.orderItem.findMany({
      where: {
        orderId: order.id,
      },
    });
}
```

With 100 orders:

```text
1 orders query
+ 100 item queries
```

This can degrade badly with network latency and volume.

Compare:

- eager loading;
- JOIN;
- batching;
- specific queries.

Measure.

## A repository should not hide SQL from you

An abstraction can be useful:

```ts
orderRepository.findRecentByCustomer(...)
```

But the developer should still know:

- executed query;
- required index;
- cardinality;
- cost.

Abstraction does not remove physics.

## Unit tests

Test rules that do not need a real database.

For example, filter construction or domain rules.

But do not use a mock to "prove" that a database constraint exists.

A mock can accept any state.

## Integration tests

Integration tests should use a real database when you want to prove:

- constraints;
- transactions;
- isolation;
- SQL;
- mapping;
- migrations;
- index-related behavior.

Example:

```ts
test(
  "database rejects zero quantity",
  async () => {
    await assert.rejects(
      pool.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           quantity,
           unit_price
         )
         VALUES ($1, $2, 0, 10.00)`,
        [1, 1],
      ),
      /order_items_quantity_positive/,
    );
  },
);
```

This proves real database behavior.

## Transaction test

```ts
test(
  "rolls back order when item insertion fails",
  async () => {
    await assert.rejects(
      createOrder(invalidInput),
    );

    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM orders`,
    );

    assert.equal(
      result.rows[0].count,
      0,
    );
  },
);
```

Do not test only that an exception happened.

Test persisted state after failure.

## Concurrency test

Use two connections.

Scenario:

```text
stock = 1
```

Two transactions attempt to buy one unit.

Expected outcome can be:

- one commits;
- one fails.

This test is far more valuable than a mock for understanding concurrent integrity.

## Contract tests

If the API exposes:

```json
{
  "id": 10,
  "status": "confirmed"
}
```

a persistence refactor should not accidentally change that shape.

Contract tests protect consumers while you change schema, ORM, or queries internally.

## E2E

An e2e can validate:

```text
HTTP
 -> use case
 -> repository
 -> SQL
 -> PostgreSQL
```

Use a small number of critical paths.

Do not place every rule in e2e tests.

## Safe persistence refactoring

Database refactoring has two dimensions:

1. code;
2. existing data.

A safer sequence:

1. characterize behavior;
2. introduce a compatible new structure;
3. write both formats when necessary;
4. migrate data;
5. validate;
6. switch reads;
7. remove the old path;
8. remove the old column or structure.

Avoid big-bang migrations.

## Example: replacing textual status with a table

Before:

```sql
status text
```

You may consider:

```text
order_statuses
orders.status_id
```

But ask:

- is there a real need?
- is status configurable?
- does status have attributes?
- does this improve integrity?
- does it add JOINs without benefit?

More normalization does not always improve the model.

## Persistence smells

### Duplicated query

The same query appears in multiple services with small differences.

May indicate a need to centralize intent.

### `SELECT *`

Creates dependency on columns the code may not use.

### Overly generic repository

Exposes ORM filters across the application.

### Hidden transaction

Nobody knows which steps are atomic.

### Query inside a loop

Potential N+1.

### Index created without a hypothesis

Adds write cost without proven gain.

### Manual migration outside version control

The environment stops being reproducible.

### Hidden timezone dependency

Dates are interpreted differently across application and database.

## Lint and quality

Lint does not measure SQL.

But it can catch:

- forgotten Promises;
- query concatenation patterns;
- `any` in mapping;
- inconsistent imports.

Use it as mechanical protection.

## Coverage

Coverage can show that:

- rollback was never exercised;
- a constraint error is untested;
- null mapping never executed;
- pagination branch is uncovered.

Do not use coverage to claim persistence is correct.

## Mutation testing

Mutation testing is more useful for application rules around persistence.

Example:

```ts
if (result.rowCount !== 1) {
  throw new NotFoundError();
}
```

If mutation changes it to:

```ts
if (result.rowCount === 1) {
```

tests should fail.

For SQL itself, real integration behavior and database constraints are often more direct evidence.

## Complexity

A function that:

- opens a transaction;
- validates DTO;
- loads customer;
- loads products;
- calculates;
- updates inventory;
- persists;
- publishes an event;
- builds the response;

mixes responsibilities.

Refactoring should separate rules without hiding transaction boundaries.

## A lab that proves your knowledge

Create:

```text
persistence-sql-quality-lab/
  src/
    application/
      create-order.ts
      list-orders.ts
    domain/
      order.ts
      money.ts
    repositories/
      order-repository.ts
    infrastructure/
      database/
        pool.ts
        postgres-order-repository.ts
  migrations/
  tests/
    unit/
    integration/
    contract/
    e2e/
    concurrency/
  benchmarks/
    pagination/
    indexes/
  docs/
    adr/
    query-plans/
      before/
      after/
    measurements/
    migrations/
```

Use PostgreSQL as the practical reference.

The reasoning remains useful with other relational databases, but details of:

- indexes;
- locks;
- isolation;
- syntax;
- planner behavior;

are database-specific.

## Reproducible scripts

Example:

```json
{
  "scripts": {
    "db:migrate": "node dist/scripts/migrate.js",
    "db:seed": "node dist/scripts/seed.js",
    "db:reset": "node dist/scripts/reset.js",
    "test": "node --test",
    "test:integration": "node --test tests/integration",
    "test:concurrency": "node --test tests/concurrency",
    "benchmark:indexes": "node dist/benchmarks/indexes.js",
    "benchmark:pagination": "node dist/benchmarks/pagination.js"
  }
}
```

Another person should be able to reproduce the environment.

## Dataset larger than a tutorial

Generate volume.

Example:

```text
customers: 10,000
products: 20,000
orders: 500,000
order_items: 2,000,000
```

Exact numbers depend on your machine.

The important point is to leave the scenario:

```text
5 customers
10 orders
```

Some plans become interesting only with volume.

## Representative data

Do not generate completely uniform distributions if production is not uniform.

Example:

- a few customers with many orders;
- many customers with few orders;
- very popular products;
- uneven status distribution;
- dates concentrated in specific periods.

Distribution affects selectivity and planner decisions.

## Experiment 1 — constraints

Version A:

permissive schema.

Insert:

- zero quantity;
- negative price;
- order without customer;
- duplicate item.

Record what the database accepts.

Version B:

add constraints.

Repeat.

Save:

- migration;
- error;
- test;
- explanation.

## Experiment 2 — transaction

Version A:

create an order without a transaction.

Force failure on the second item.

Observe partial state.

Version B:

use a transaction.

Repeat.

Show:

```text
before: partial order persisted
after: complete rollback
```

That is reliability evidence.

## Experiment 3 — concurrency

Create inventory:

```text
product.stock = 1
```

Run two concurrent purchases.

Compare:

- check-then-update;
- conditional UPDATE;
- explicit lock when necessary.

Explain the behavior.

## Experiment 4 — index

Target query:

```sql
SELECT
  id,
  status,
  created_at
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Capture:

```text
EXPLAIN (ANALYZE, BUFFERS)
```

before.

Then create:

```sql
CREATE INDEX idx_orders_customer_created
ON orders (
  customer_id,
  created_at DESC,
  id DESC
);
```

Capture after.

Compare:

- time;
- buffers;
- rows visited;
- plan;
- INSERT cost in a separate benchmark.

## Experiment 5 — useless index

Create an index that looks reasonable but does not help enough:

```sql
CREATE INDEX idx_orders_created_customer
ON orders (
  created_at DESC,
  customer_id
);
```

Compare with the index aligned with the filter.

Document why column order matters.

## Experiment 6 — partial index

Query:

```sql
SELECT
  id,
  created_at
FROM orders
WHERE status = 'confirmed'
ORDER BY created_at DESC
LIMIT 50;
```

Compare:

- no index;
- full index;
- partial index for relevant active states.

Observe size and maintenance cost.

## Experiment 7 — OFFSET versus cursor

Generate hundreds of thousands of orders.

Measure:

```text
OFFSET 0
OFFSET 1,000
OFFSET 10,000
OFFSET 100,000
```

Then cursor.

Record:

- latency;
- buffers;
- plan;
- API contract;
- stability during inserts.

## Experiment 8 — ORM versus direct SQL

Implement the same query:

1. ORM;
2. explicit SQL.

Compare:

- readability;
- number of queries;
- produced SQL;
- plan;
- maintainability.

Do not declare a universal winner.

## Experiment 9 — migration

Create an index migration on a large table.

Compare:

```sql
CREATE INDEX ...
```

with:

```sql
CREATE INDEX CONCURRENTLY ...
```

Study:

- locks;
- duration;
- tool restrictions;
- transaction block behavior.

In PostgreSQL, `CREATE INDEX CONCURRENTLY` has specific rules and cannot run inside a regular transaction block.

## Experiment 10 — bad estimates

Create skewed data distribution.

Observe estimate versus actual rows.

Update statistics.

Compare the plan.

The goal is to understand that the planner depends on information about data.

## Compare approaches and record where they fail

| Comparison | What to measure | Where each option fails |
| --- | --- | --- |
| application validation vs. database constraint | integrity and concurrency | application may be bypassed; database does not replace complex domain rules |
| normalized vs. denormalized | consistency, reads, writes | normalization can increase JOINs; duplication can diverge |
| check-then-update vs. conditional update | race conditions | separate check can become stale; conditional update may not cover complex rules |
| Read Committed vs. Serializable | anomalies, aborts, retries | weaker isolation allows anomalies; stronger isolation increases conflicts |
| no index vs. composite B-tree | buffers, time, write cost | no index hurts search; index increases mutation cost |
| full vs. partial index | size, write cost, supported queries | full index costs more; partial index serves only compatible predicates |
| OFFSET vs. cursor | deep pages, stability | OFFSET degrades; cursor lacks simple numbered-page access |
| ORM vs. direct SQL | productivity, clarity, plan | ORM can hide cost; manual SQL can duplicate code |
| destructive migration vs. expand/contract | deployment risk | destructive migration breaks compatibility; expand/contract is slower and more complex |
| fake repository vs. real database | speed and fidelity | fake does not prove SQL; real database costs setup |

## Build small examples that break

Run at least:

1. insert a missing foreign key;
2. insert zero quantity;
3. insert duplicate item;
4. run an operation without a transaction and force failure;
5. create a controlled deadlock;
6. use an index with the wrong order;
7. run a deep OFFSET;
8. generate N+1;
9. create an incompatible migration;
10. concatenate input into SQL in an isolated environment and show why it is unsafe;
11. compare a small and large table;
12. compare uniform and skewed distributions.

Failure is evidence.

Document:

- hypothesis;
- setup;
- command;
- result;
- explanation;
- limitation.

## Execution plans as artifacts

Save:

```text
docs/query-plans/
  list-orders-before.txt
  list-orders-after.txt
```

Include in the README:

```text
Query: list recent orders by customer
Dataset: 500k orders
Node: ...
PostgreSQL: ...
Machine: ...
Runs: ...
```

Do not publish only:

```text
"it became 3x faster"
```

without context.

## Responsible measurement

Record:

- hardware;
- PostgreSQL version;
- Node version;
- dataset;
- distribution;
- cache state;
- concurrency;
- repetitions;
- mean/median when relevant;
- p95/p99 when useful;
- plan.

A small difference may be noise.

Repeat the experiment.

## Query-guided refactoring

Imagine a repository:

```ts
findAll(filters: any): Promise<Order[]>
```

It starts simple.

Then it receives:

```ts
{
  customerId,
  status,
  from,
  to,
  page,
  sort,
  include,
  search,
}
```

It becomes a pseudo-ORM.

Refactor toward clear access patterns:

```ts
findRecentByCustomer(
  customerId: string,
  cursor?: OrderCursor,
): Promise<Order[]>;
```

and:

```ts
findOpenForProcessing(
  limit: number,
): Promise<Order[]>;
```

The query now represents intent.

## Refactoring and stable contracts

Before:

```text
GET /orders?page=5000
```

If you move to cursor pagination, the public contract changes.

You may need versioning:

```text
GET /v2/orders?after=...
```

Or keep OFFSET externally and optimize another way.

Architecture and persistence must consider consumers.

## Repository and transaction boundaries

Be careful not to create repositories so isolated that a transaction across them becomes impossible.

Example:

```ts
await customerRepository.save(...);
await orderRepository.save(...);
await eventRepository.save(...);
```

If they must be atomic, infrastructure must share transaction context.

Document the strategy.

## Unit of Work

One approach:

```ts
interface UnitOfWork {
  run<T>(
    work: (
      repositories: TransactionRepositories,
    ) => Promise<T>,
  ): Promise<T>;
}
```

It may help.

But it adds abstraction.

Compare it with passing `PoolClient` internally within infrastructure.

Choose based on change cost.

## Tests from the first commit

The lab should include:

- migration test;
- constraint test;
- transaction rollback;
- commit;
- concurrency;
- repository mapping;
- critical query path;
- contract test;
- e2e.

CI should execute reproducible tests.

## CI

Pipeline:

```text
install
 -> start PostgreSQL service
 -> migrate
 -> seed minimal data
 -> unit tests
 -> integration tests
 -> contract tests
 -> build
```

Large benchmarks do not need to run on every pull request if they are expensive.

Run them in a separate pipeline or reproducible manual process.

## Lint, coverage, and mutation

Possible reports:

```text
lint
coverage/
mutation/
query-plans/
```

The goal is not collecting badges.

It is combining complementary evidence:

- lint: mechanical defects;
- coverage: executed paths;
- mutation: test strength;
- integration: real database behavior;
- EXPLAIN: query cost.

## Issues

Example:

```text
perf: recent orders query performs sequential scan at 500k rows
```

Include:

- query;
- dataset;
- plan;
- hypothesis;
- acceptance criteria.

Another:

```text
bug: concurrent checkout can oversell product
```

Include reproduction with two connections.

## PRs

Example:

```text
perf: add composite index for customer order history
```

Description:

- problem;
- plan before;
- index;
- plan after;
- cost;
- migration;
- risk;
- rollback.

Another:

```text
refactor: make order creation atomic
```

Include the test that failed before.

## ADRs

Create ADRs for important decisions.

Example:

```md
# ADR-002 — Cursor pagination for order history

## Context

OFFSET became increasingly expensive on deep pages
with 500k+ orders.

## Options

1. keep OFFSET;
2. use cursor pagination;
3. materialize pages/cache.

## Decision

Use cursor pagination for sequential order history.

## Positive consequences

- less work on deep navigation;
- stable ordering with compound cursor.

## Negative consequences

- no direct numbered-page access;
- API contract becomes more complex.

## Risks

Incorrect cursor ordering can duplicate or skip rows.
```

## Professional README

Structure it with:

1. objective;
2. problem;
3. relational model;
4. diagram;
5. invariants;
6. migrations;
7. setup;
8. seed process;
9. tests;
10. transactions;
11. concurrency;
12. indexes;
13. query plans;
14. benchmarks;
15. ADRs;
16. limitations;
17. next steps.

English summary:

```md
## English summary

This repository studies relational persistence as an engineering concern.
It focuses on schema integrity, transactions, isolation, indexes,
execution plans, migrations, pagination, and safe refactoring.
Every optimization is accompanied by tests or measurements,
and the project records both benefits and trade-offs.
```

## Evidence for GitHub and your portfolio

Produce:

- public repository;
- professional README;
- English summary;
- ER diagram;
- migrations;
- reproducible seed;
- automated tests;
- CI;
- badge;
- execution plans;
- documented benchmark;
- ADRs;
- issues;
- PRs;
- article or vlog.

Strong impact statement:

> The order-history query performed a sequential scan over hundreds of thousands of rows. After adding a composite index aligned with the filter and ordering, the plan reduced the amount of data visited in the tested scenario. The repository includes before/after plans, volume, environment, and the additional write cost of the index.

Another:

> Order creation persisted partial data when an item insert failed. The refactor moved order creation, inventory updates, and item inserts into one transaction, with an integration test proving complete rollback.

Avoid:

> "The database became much faster."

Performance needs a scenario.

## Practical article 1 — Data modeling for quality and refactoring

### Suggested title

**Data Modeling for Quality and Refactoring: From Schema to Real Behavior**

Structure:

1. problem;
2. initial model;
3. possible inconsistencies;
4. improved schema;
5. PK/FK;
6. constraints;
7. types;
8. normalization;
9. intentional denormalization;
10. indexes;
11. tests;
12. trade-offs.

Show at least one inconsistency rejected by the database.

Example:

```sql
INSERT INTO order_items (
  order_id,
  product_id,
  quantity,
  unit_price
)
VALUES (
  1,
  1,
  0,
  100
);
```

Explain why the database rejected it.

## Practical article 2 — The SQL every backend developer should know before blaming the ORM

### Suggested title

**The SQL Every Backend Developer Should Know Before Blaming the ORM**

Use one query from the lab.

Show:

- SELECT;
- JOIN;
- GROUP BY;
- transaction;
- index;
- EXPLAIN;
- migration.

Then compare:

```text
ORM
```

and:

```text
explicit SQL
```

without declaring a universal winner.

Ask:

- is the SQL readable?
- did the ORM generate N+1?
- does the query use the index?
- did the plan change?
- which option is more maintainable?

## Practical article 3 — How I proved database performance or integrity

### Suggested title

**How I Proved Database Performance or Integrity**

Choose one hypothesis.

Example:

> The composite index reduces the work needed to load the latest orders for a customer.

Or:

> The transaction prevents an order from being partially persisted.

Structure:

1. hypothesis;
2. environment;
3. dataset;
4. scenario;
5. code;
6. test;
7. plan before;
8. change;
9. plan after;
10. result;
11. limitations.

Include a section:

**What this experiment does not prove**

Example:

- it does not represent production hardware;
- it does not measure real concurrency;
- cache can influence results;
- the dataset is synthetic;
- an observed improvement does not apply to every query.

## Recommended article format

Each article can contain 800 to 1,500 words.

Structure:

1. introduction;
2. problem;
3. hypothesis;
4. code/SQL;
5. tests;
6. measurement;
7. trade-offs;
8. limitations;
9. conclusion;
10. GitHub link.

A vlog can show:

- migration;
- psql;
- query;
- EXPLAIN;
- test;
- lock;
- rollback;
- benchmark;
- diff;
- PR.

## How to explain trade-offs in an international interview

Use simple technical English.

> We kept the order model normalized, but stored the unit price on each order item because it is a historical fact. The current product price can change, while the price paid for an existing order must remain stable.

Another:

> We added a composite B-tree index only after measuring the main query with `EXPLAIN ANALYZE`. The index reduced the amount of data scanned for that access path, but it also increased storage and write cost.

Another:

> We used a transaction for order creation because inventory updates and item inserts must succeed or fail as one unit. We also tested concurrent requests to verify that stock cannot become negative.

Another:

> We moved from OFFSET to cursor pagination for sequential history because deep pages required increasingly more work. The trade-off is that the API no longer provides simple numbered-page access.

Another:

> We still use an ORM for simple operations, but we inspect the generated SQL and use explicit SQL when the abstraction makes a critical query harder to understand or optimize.

## Technical completion checklist

You have completed E016 when you can:

- create schemas with PK, FK, `NOT NULL`, `UNIQUE`, and `CHECK`;
- choose SQL types deliberately;
- explain referential integrity;
- model relationships;
- explain normalization;
- justify a denormalization;
- use SELECT with explicit columns;
- write JOINs;
- use GROUP BY;
- write a CTE;
- explain subqueries;
- write parameterized INSERT;
- write safe UPDATE;
- write safe DELETE;
- create versioned migrations;
- explain why a `down` migration does not guarantee data recovery;
- apply expand/contract;
- explain ACID;
- start and complete transactions correctly;
- distinguish Read Committed, Repeatable Read, and Serializable;
- explain locks;
- reproduce a deadlock in a controlled environment;
- retry only appropriate transient failures;
- create B-tree indexes;
- create composite indexes;
- explain column order;
- create partial indexes;
- explain index cost;
- use `EXPLAIN`;
- use `EXPLAIN ANALYZE`;
- interpret rows, loops, scans, and buffers;
- explain why Seq Scan is not automatically bad;
- compare OFFSET and cursor pagination;
- detect N+1;
- compare ORM and direct SQL;
- test constraints against a real database;
- test rollback;
- test concurrency with two connections;
- preserve public contracts during refactoring;
- use a dataset larger than a tutorial;
- measure before and after;
- record limitations;
- use lint, coverage, and mutation testing as complementary evidence;
- write an ADR;
- explain trade-offs in simple technical English;
- produce reproducible public evidence.

## What you should take away from this cycle

Persistence is not a passive layer at the end of an application.

It defines part of system behavior.

The schema protects valid states.

Constraints prevent inconsistencies.

Transactions define units of change.

Isolation levels and locks determine what happens under concurrency.

Indexes change the cost of access paths.

Migrations evolve the model without erasing operational history.

Execution plans show what the database actually did.

In the context of quality and refactoring, the most important shift is to stop making decisions based on assumptions.

Instead of:

> "I think it needs an index,"

you measure.

Instead of:

> "the ORM is slow,"

you inspect the SQL and the plan.

Instead of:

> "the transaction should solve it,"

you reproduce concurrency.

Instead of:

> "the migration is simple,"

you test it against an existing database.

You have completed E016 when you can take fragile persistence, reproduce its problems, protect invariants, measure bottlenecks, refactor in small steps, and demonstrate the result with reproducible evidence.

The final result must be assessable without a private conversation: a public repository, migrations, tests, CI, query plans, measurements, ADRs, issues, pull requests, a bilingual README, and articles that explain both the solution and its limits.

## Primary references

- [PostgreSQL — Data Definition](https://www.postgresql.org/docs/current/ddl.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL — Queries](https://www.postgresql.org/docs/current/queries.html)
- [PostgreSQL — Table Expressions](https://www.postgresql.org/docs/current/queries-table-expressions.html)
- [PostgreSQL — WITH Queries](https://www.postgresql.org/docs/current/queries-with.html)
- [PostgreSQL — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL — Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL — Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL — Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL — Multicolumn Indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html)
- [PostgreSQL — Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [PostgreSQL — CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [node-postgres — Queries](https://node-postgres.com/features/queries)
- [node-postgres — Transactions](https://node-postgres.com/features/transactions)
