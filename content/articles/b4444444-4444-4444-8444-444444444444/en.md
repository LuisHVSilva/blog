---
translationId: 35555555-5555-4555-8555-555555555555
articleId: b4444444-4444-4444-8444-444444444444
locale: en
slug: persistence-sql-ts-node-foundation
title: "Persistence and SQL in the TS/Node Foundation: From Schema to Real Behavior"
description: "A practical guide to modeling data, preserving integrity, using transactions, and diagnosing queries in a TypeScript and Node.js backend."
status: draft
---

# Persistence and SQL in the TS/Node Foundation: From Schema to Real Behavior

When a backend saves an order, the job does not end when the ORM returns `success`. The system must prevent orders without customers, negative values, duplicate items, and half-finished updates. It must also find data at an acceptable speed when thousands or millions of rows replace the five records from a tutorial.

Safe persistence comes from combining four abilities:

1. modeling what the data means;
2. protecting invariants in the database;
3. controlling concurrent operations;
4. measuring how the database actually executes each query.

In this cycle, we will use TypeScript, Node.js, and PostgreSQL to build a small order service. PostgreSQL is our practical reference, but the reasoning—modeling, transactions, indexes, and measurement—remains useful with other relational databases.

> An ORM can make database access easier. It does not remove the need to understand the SQL being executed.

<!-- VISUAL:
A four-block flow: HTTP request -> TypeScript use case -> SQL/transaction -> PostgreSQL.
Under PostgreSQL, highlight: integrity, concurrency, and execution plan.
-->

## The problem that guides the lab

Our system must record customers, products, orders, and items. The initial rules are simple:

- an order belongs to an existing customer;
- an item belongs to an existing order and product;
- quantities and prices must be positive;
- the same product cannot appear twice in one order;
- a confirmed order must contain at least one item;
- the price paid must remain in the history even when the product price changes.

TypeScript will express these intentions in code. The database will protect the rules that cannot depend on every application path behaving correctly.

## A schema is not merely a collection of columns

Start with types and constraints, not with the ORM name:

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
  CONSTRAINT products_price_positive CHECK (price > 0),
  CONSTRAINT products_stock_nonnegative CHECK (stock >= 0)
);

CREATE TABLE orders (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_valid
    CHECK (status IN ('draft', 'confirmed', 'cancelled'))
);

CREATE TABLE order_items (
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12, 2) NOT NULL CHECK (unit_price > 0),
  PRIMARY KEY (order_id, product_id)
);
```

Each choice communicates and protects something:

- the primary key identifies a row without depending on a name or email;
- the foreign key prevents references to missing rows;
- `NOT NULL` separates required data from legitimate absence;
- `UNIQUE` protects uniqueness even when another routine writes to the database;
- `CHECK` rejects states that do not make sense;
- `numeric(12, 2)` avoids binary floating point for monetary values;
- `timestamptz` represents an instant in time and reduces time-zone ambiguity;
- `ON DELETE` actions make the behavior of dependent rows explicit.

In PostgreSQL, a foreign key does not automatically create an index on the column that references the parent table. Query and deletion paths must still be analyzed.

Not every rule crosses tables in a simple way. The condition “a confirmed order contains at least one item” does not fit a regular PostgreSQL `CHECK`, because that constraint type should not query other rows or tables. It must be preserved by the transactional flow or by a database mechanism designed for it, such as a carefully tested trigger. Document the choice and its reason.

## Normalization and controlled denormalization

Storing a customer's name, email, and address in every order row may look convenient. However, unnecessary repetition creates conflicting versions of the same fact. Normalization keeps each concept in its proper place and connects tables through keys.

Yet `order_items.unit_price` repeats the value from `products.price`. This is intentional: the catalog price is the current price, while the item price is a historical fact about the purchase. It is not an accidental cache; it is a domain decision.

Before denormalizing, answer these questions:

- which query or rule justifies the duplication?
- which value is the source of truth?
- how will the data be synchronized?
- was the improvement measured?
- what happens when the update fails?

> Model the domain truth and real access patterns first. Denormalize when there is an explicit, verifiable reason.

## The SQL a backend developer must understand

### SELECT and JOIN

To load an order with its items:

```sql
SELECT
  o.id,
  o.status,
  o.created_at,
  c.name AS customer_name,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  oi.quantity * oi.unit_price AS line_total
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id
JOIN order_items AS oi ON oi.order_id = o.id
JOIN products AS p ON p.id = oi.product_id
WHERE o.id = $1;
```

The `$1` placeholder is not merely a style choice. External values should be sent separately from SQL text to reduce SQL injection risk.

### GROUP BY, CTE, and subquery

A CTE can make the stages of a complex query explicit:

```sql
WITH order_totals AS (
  SELECT
    order_id,
    SUM(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT o.id, o.created_at, ot.total
FROM orders AS o
JOIN order_totals AS ot ON ot.order_id = o.id
WHERE o.customer_id = $1
  AND ot.total > (
    SELECT AVG(total) FROM order_totals
  )
ORDER BY o.created_at DESC, o.id DESC;
```

CTEs and subqueries are not automatically fast or slow. They express a query; you must inspect its actual plan.

### Safe INSERT, UPDATE, and DELETE

A dangerous modification does not clearly delimit its target. Prefer conditions based on identifiers and, when useful, inspect the returned result:

```sql
UPDATE products
SET price = $2
WHERE id = $1
  AND active = true
RETURNING id, price;
```

```sql
DELETE FROM orders
WHERE id = $1
  AND status = 'draft'
RETURNING id;
```

In code, handle `rowCount === 0` as a possible business outcome. Never concatenate user values into a query. Dynamic identifiers, such as column names, require an allowlist or a dedicated safe composition tool; regular parameters represent values, not SQL identifiers.

## Transactions: everything happens or nothing happens

Creating an order requires several statements. If inventory is reduced but inserting the items fails, the database cannot keep half of the operation.

ACID summarizes four properties:

- **atomicity:** the entire unit commits or rolls back;
- **consistency:** valid rules remain valid;
- **isolation:** concurrent operations must not observe forbidden combinations;
- **durability:** after commit, the result must survive the failures covered by the database.

With `node-postgres`, every statement in a transaction must use the same `client`, because a transaction belongs to one connection:

```ts
import type { PoolClient } from "pg";
import { pool } from "./database.js";

type OrderItemInput = {
  productId: number;
  quantity: number;
};

export async function createOrder(
  customerId: number,
  items: OrderItemInput[],
): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const orderId = await insertOrder(client, customerId);

    for (const item of items) {
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
        throw new Error(`Product ${item.productId} is unavailable`);
      }

      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, product.rows[0].price],
      );
    }

    await client.query(
      "UPDATE orders SET status = 'confirmed' WHERE id = $1",
      [orderId],
    );
    await client.query("COMMIT");
    return orderId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function insertOrder(
  client: PoolClient,
  customerId: number,
): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO orders (customer_id, status)
     VALUES ($1, 'draft')
     RETURNING id`,
    [customerId],
  );

  return result.rows[0].id;
}
```

The `UPDATE ... WHERE stock >= $2` statement validates and subtracts in one operation. Two requests cannot both read the same old balance and subtract from it without the database re-evaluating the condition.

## Isolation levels, locks, and deadlocks

A transaction does not mean that concurrency disappears. PostgreSQL's default level is `READ COMMITTED`: each command sees a snapshot valid at the beginning of that command. `REPEATABLE READ` keeps a stable view during the transaction and can abort operations that cannot be serialized in that context. `SERIALIZABLE` provides the strongest guarantee, but the application must be prepared to retry transactions aborted because of conflicts.

Locks coordinate incompatible access. They are necessary, but waiting for a lock increases latency. A deadlock happens when two transactions wait for each other in a cycle. PostgreSQL detects the situation and aborts one of them; the application must handle the failure.

Reduce the risk:

- keep transactions short;
- access shared resources in a consistent order;
- do not make HTTP calls while holding locks;
- index searches used to locate rows that will be modified;
- implement bounded retries only for known transient errors;
- record attempts, duration, and cause so permanent contention is not hidden.

Do not select `SERIALIZABLE` by reflex or remain on `READ COMMITTED` by habit. Describe the anomaly you must prevent, reproduce it with two connections, and select the smallest sufficient guarantee.

## Migrations are production code

A migration must be versioned, reviewed, and tested:

```sql
-- 004_add_order_search_index.up.sql
CREATE INDEX CONCURRENTLY idx_orders_customer_created
  ON orders (customer_id, created_at DESC, id DESC);
```

```sql
-- 004_add_order_search_index.down.sql
DROP INDEX CONCURRENTLY IF EXISTS idx_orders_customer_created;
```

In PostgreSQL, `CREATE INDEX CONCURRENTLY` cannot run inside a transaction block. If the migration tool automatically wraps every file in a transaction, this migration needs special configuration. Test this detail before deployment.

“Reversible when possible” is an important constraint. Dropping a column and recreating it does not restore its data. Large changes may require an expand-and-contract process:

1. add the new structure in a compatible way;
2. deploy code that works with both formats;
3. migrate and validate the data;
4. switch reads to the new format;
5. remove the old structure in another deployment.

Test an empty database, a database upgraded from the previous version, and the rollback path when a `down` migration exists. Also assess duration, locks, and compatibility with the application version that is still running.

## Indexes: useful structures, not decoration

B-tree is PostgreSQL's default index type and supports common equality, range, and ordering operations. To list a customer's orders from newest to oldest:

```sql
CREATE INDEX idx_orders_customer_created
  ON orders (customer_id, created_at DESC, id DESC);
```

Order matters. In a multicolumn B-tree index, conditions on the leading columns usually determine how much of the index can be used to limit the scan. The index above was designed for `customer_id` followed by date and id ordering; it is not automatically the best answer for searching only by `created_at` across all customers.

A partial index stores only rows that satisfy a predicate:

```sql
CREATE INDEX idx_orders_open_created
  ON orders (created_at DESC, id DESC)
  WHERE status IN ('draft', 'confirmed');
```

It can be smaller and cheaper than indexing the full history, but it helps only when PostgreSQL can prove that the query condition implies the index predicate.

Every index has a price: disk space, cache usage, and additional work during `INSERT`, `UPDATE`, and `DELETE`. “Index every column” merely exchanges one kind of slowness for another.

## EXPLAIN and EXPLAIN ANALYZE: measure before optimizing

`EXPLAIN` shows the estimated plan. `EXPLAIN ANALYZE` executes the statement and adds actual timing and row counts:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, status, created_at
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

When reading the result, look for:

- access type, such as `Seq Scan` or `Index Scan`;
- estimated cost and actual time;
- estimated rows versus actual rows;
- inner loops;
- filters that discard many rows;
- buffer reads;
- sorts and their memory or disk use.

A `Seq Scan` is not automatically bad: on a small table, or when almost every row will be returned, it can be the correct choice. An `Index Scan` is not proof of speed either. Compare latency, buffers, and stability with representative volume.

`EXPLAIN ANALYZE` really executes the statement. To inspect a modification without keeping its effect:

```sql
BEGIN;
EXPLAIN ANALYZE
UPDATE products SET price = price * 1.05 WHERE active = true;
ROLLBACK;
```

Even then, locks, triggers, and other external effects require caution. Run load experiments in a controlled environment.

## Pagination: OFFSET versus cursor

This query is simple:

```sql
SELECT id, created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 100000;
```

However, the database still has to locate and discard the earlier rows. For sequential navigation, cursor pagination often scales better:

```sql
SELECT id, created_at
FROM orders
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

`OFFSET` is convenient for a small number of pages and direct access to a numbered page. A cursor reduces work on deep pages and often gives more stable navigation during new inserts, but it requires deterministic ordering and changes the API contract. Measure both approaches with the real data distribution.

## Direct SQL and ORMs without fanaticism

An ORM can speed up CRUD work, standardize migrations, and improve composition for common operations. Direct SQL gives transparent control over complex queries, database-specific features, and performance investigations.

The mistake is not using an ORM. The mistake is not knowing:

- which SQL it generated;
- how many queries an operation triggered;
- where the transaction starts and ends;
- whether N+1 queries exist;
- whether the filter uses the expected index;
- how to leave the abstraction when it increases the cost.

A mature solution can use an ORM for simple operations and explicit SQL where clarity or performance justifies it. Record the decision and its limits.

## Tests from the first repository

Run integration tests against a real PostgreSQL instance, not only repository mocks. A valuable test proves that the database rejects an invalid state:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { pool } from "../src/database.js";

test("rejects an order item with zero quantity", async () => {
  await assert.rejects(
    pool.query(
      `INSERT INTO order_items
         (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, 0, 10.00)`,
      [1, 1],
    ),
    /order_items_quantity_check/,
  );
});
```

The lab should include tests for:

- migrations on an empty database;
- keys, `UNIQUE`, `CHECK`, and deletion actions;
- commit and rollback;
- two concurrent connections competing for the same inventory;
- the main query with more data than a tutorial;
- pagination without duplicate or missing results under the defined scenario.

Do not turn an exact query duration into a fragile CI test. Keep plans and measurements as engineering evidence, set budgets only in a controlled environment, and document hardware, volume, data distribution, cache state, and number of repetitions.

## A lab that proves your knowledge

Create a `ts-node-persistence-lab` repository with this foundation:

```text
src/
  application/create-order.ts
  database/pool.ts
  repositories/postgres-order-repository.ts
migrations/
tests/integration/
benchmarks/
docs/
  adr/
  query-plans/
```

Set up an active Node LTS release, TypeScript, `pnpm` or `npm`, an isolated PostgreSQL instance for development, and predictable scripts such as `db:migrate`, `db:seed`, `test`, `test:integration`, and `benchmark`. Use the terminal and VS Code as working tools, not as hidden dependencies: another person should be able to run the project from the README alone.

Practice the process every day:

1. open a small issue;
2. create a branch;
3. write atomic commits;
4. run tests and inspect the diff;
5. perform a simple rebase when needed;
6. open a pull request;
7. conduct your own code review before merging.

The professional README should describe the problem, architecture, prerequisites, environment variables, migrations, seed process, tests, and measurements. Write the main text in Portuguese and add a technical summary in English. Configure CI, add its badge, and keep secrets out of the repository.

## Compare approaches and record where they fail

Your study becomes deeper when a hypothesis can be disproved. Run at least these experiments:

| Comparison | What to measure | Where each option fails |
| --- | --- | --- |
| Normalized vs. denormalized | write complexity, JOINs, and consistency | normalization can make some reads more expensive; duplication can diverge |
| No index vs. multicolumn B-tree | time, buffers, visited rows, and write cost | no index hurts selective searches; excessive indexing makes mutations expensive |
| `OFFSET` vs. cursor | early/deep pages and stability | `OFFSET` degrades with depth; a cursor does not provide simple numbered pages |
| `READ COMMITTED` vs. `SERIALIZABLE` | anomalies, conflicts, and retries | weaker guarantees allow some anomalies; stronger isolation can abort more work |
| ORM vs. direct SQL | clarity, productivity, and resulting plan | abstraction can hide cost; handwritten SQL can spread repetition |

Build small examples that break: remove a constraint, force two transactions to acquire locks in opposite orders, reverse the columns in an index, and compare a database with 100 rows against one with 100,000. Explain the result from the plan and the experiment's limitations, not from personal preference.

## Evidence for GitHub and your portfolio

The proof should not be “I studied SQL,” but a set of artifacts another person can assess:

- a public repository with a professional README in Portuguese and an English summary;
- issues and pull requests that show decisions, atomic commits, and self-review;
- migrations, reproducible seed data, and automated CI tests with a visible badge;
- execution plans from before and after a change, accompanied by the measurement method;
- an article or vlog presenting the problem, solution, trade-offs, and limitations;
- a portfolio section translating the work into impact: fewer visited rows, protected integrity, lower injection risk, additional index cost, and productivity gained from reproducible scripts.

Avoid percentages without an experiment. If the improvement was observed only in the lab, say so. Honesty about the limits of the evidence also demonstrates technical maturity.

## Three practical articles derived from the lab

### 1. Data Modeling for the TS/Node Foundation: From Schema to Real Behavior

Present the tables, relationships, types, constraints, and indexes. Show an inconsistency rejected by the database and explain why `unit_price` is an intentional historical denormalization.

### 2. The SQL Every Backend Developer Should Know Before Blaming the ORM

Start from a real query in the repository. Show a `JOIN`, aggregation, transaction, migration, and execution plan. Compare the ORM implementation with explicit SQL without declaring a universal winner.

### 3. How I Proved Database Performance or Integrity

Choose one hypothesis: “this index reduces the work performed by the query” or “this transaction prevents negative inventory.” Record the data, method, test, plan before, plan after, result, and limitations. Do not hide an inconclusive measurement.

Each article can contain 800 to 1,500 words and follow this sequence: introduction, problem, code, tests, trade-offs, conclusion, and GitHub link. A vlog can tell the same story while showing the terminal, the plan, and the test failing before the fix.

## How to explain the trade-offs in an international interview

Use simple technical English and verifiable statements:

> We kept the order model normalized, but copied the unit price into each order item because it represents a historical fact. We added a composite B-tree index after measuring the main access path with `EXPLAIN ANALYZE`. The index improved selective reads, but it also increased storage and write cost.

This explanation presents a decision, evidence, and cost. It is stronger than listing tools.

## What you should take away from this cycle

Persistence is not merely the last layer of a backend. It participates in the system's behavior. Keys, types, and constraints protect truth; transactions and isolation levels coordinate concurrent changes; indexes and execution plans expose the cost of access paths.

You have completed E004 when you can model a small case, trigger inconsistencies and conflicts, explain why the database accepts or rejects them, and demonstrate an improvement with evidence. The final result must be assessable without a private conversation: a public repository, reproducible migrations, CI tests, saved plans, a bilingual README, and an article or vlog that acknowledges the experiment's limits.

## Primary references

- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL — Explicit Locking and Deadlocks](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL — Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL — Multicolumn Indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html)
- [PostgreSQL — Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [PostgreSQL — CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [node-postgres — Queries](https://node-postgres.com/features/queries)
- [node-postgres — Transactions](https://node-postgres.com/features/transactions)
