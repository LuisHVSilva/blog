
title: "Node.js Under the Framework: Runtime Fundamentals Applied to the TS/Node Foundation"
slug: "/article/nodejs-por-baixo-do-framework"
description: "Understand Node.js beyond Express and Nest: process, event loop, libuv, asynchronous I/O, Promises, streams, Buffer, modules, profiling, and production-oriented engineering practices."
language: "en"
tags:
  - Node.js
  - TypeScript
  - Backend
  - Event Loop
  - Streams
  - Performance
  - TS/Node Foundation


# Node.js Under the Framework: Runtime Fundamentals Applied to the TS/Node Foundation

It is common to discover Node.js through a framework.

You learn to create a route with Express:

```ts
app.get("/users", async (_req, res) => {
  const users = await userService.list();
  res.json(users);
});
```

Or a controller with NestJS:

```ts
@Get()
findAll() {
  return this.userService.findAll();
}
```

These frameworks are important, but they represent only the most visible layer of the application.

Underneath them is **Node.js**.

Node.js is not simply a tool for building APIs. It is a **JavaScript runtime** with its own concurrency model, asynchronous I/O, streams, buffers, memory behavior, module systems, diagnostic tools, and rules for asynchronous errors.

This distinction may feel theoretical until an API starts taking seconds to respond, memory usage keeps growing, or one apparently simple operation begins delaying every other request.

> Frameworks help you build the application. Understanding the runtime helps you explain why it works — or why it fails.

This article belongs to the **TS/Node Foundation** cycle. The goal is to learn runtime fundamentals with small, testable TypeScript examples before framework layers hide what is actually happening.

<!-- VISUAL:
Layer diagram:

Your application
    ↓
Express / Nest / Fastify
    ↓
Node.js
    ↓
Operating system

Caption: "A framework is a layer. The runtime is underneath it."
-->



## Is Node.js single-threaded?

A very common sentence is:

> "Node.js is single-threaded."

It is useful as an introduction, but incomplete.

Your application **JavaScript** normally executes callbacks on one main thread, one JavaScript task at a time. This means expensive computation can occupy that thread long enough to prevent other callbacks from being served.

```ts
function heavyWork(): number {
  let total = 0;

  for (let i = 0; i < 5_000_000_000; i++) {
    total += i;
  }

  return total;
}

console.log(heavyWork());
```

While that loop is running, the main thread remains busy.

But this does not mean the entire Node process has only one thread. Node also relies on operating-system facilities, **libuv**, a **worker pool** for selected operations, and explicit Workers through `worker_threads` when needed.

<!-- VISUAL:
Node.js Process
│
├── Main thread
│   └── JavaScript + event loop
│
├── Operating system
│   └── network / sockets / I/O
│
└── libuv worker pool
    ├── filesystem
    ├── selected crypto operations
    └── other supported tasks
-->

A more useful sentence is:

> Main JavaScript executes one task at a time, but Node.js is not internally just one thread.



## Concurrency and asynchronous I/O

Imagine an API that needs data from two independent services.

A sequential version would be:

```ts
const user = await fetchUser();
const orders = await fetchOrders();
```

If the two calls do not depend on each other, we can start them together:

```ts
const [user, orders] = await Promise.all([
  fetchUser(),
  fetchOrders()
]);
```

This does not mean two ordinary JavaScript functions are now executing instructions simultaneously on the main thread.

The benefit comes from the runtime keeping **I/O** operations in progress while the JavaScript thread is free to process other work.

That is one reason Node is often effective for applications with large amounts of:

- HTTP traffic;
- database access;
- queues;
- calls to other APIs;
- file access;
- network connections.

The professional question is not only "is this `async`?"

Ask:

> **Who is doing the work while my JavaScript is waiting?**

That question leads to libuv, the operating system, and the worker pool.



## Event loop: who organizes callback execution?

The **event loop** coordinates when callbacks can execute JavaScript again.

In a simplified model, you will find phases associated with work such as:

```text
timers
pending callbacks
poll
check
close callbacks
```

There are also important queues, including the microtasks used by Promises and `queueMicrotask()`, plus the Node-specific `process.nextTick()` queue.

You do not need to memorize a complete event loop diagram. Your first goal is to understand that **source-code order is not necessarily the execution order of every callback**.

```ts
console.log("A");

setTimeout(() => {
  console.log("timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("promise");
});

console.log("B");
```

Expected output:

```text
A
B
promise
timeout
```

The Promise schedules a continuation as a microtask. A timer also does not mean "run exactly now." It becomes eligible only when its threshold has been reached and the event loop can process it.

<!-- VISUAL:
Synchronous code
    ↓
A
B
    ↓
Microtasks
    ↓
promise
    ↓
Event loop / timer
    ↓
timeout
-->

### What about `process.nextTick()`?

`process.nextTick()` uses a Node-specific queue. In modern Node documentation, `queueMicrotask()` is preferred for most application-level use cases.

The important idea is that repeatedly scheduling work before the loop can advance may delay I/O and other callbacks.

Do not use `nextTick` because it "sounds faster." Use it only when you understand the behavior you need.



## Promises, async/await, and asynchronous errors

`async/await` makes asynchronous code easier to read, but it does not remove the need to reason about errors.

```ts
async function loadUser(id: string) {
  const response = await fetch(`https://example.com/users/${id}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

The caller still needs a failure strategy.

```ts
try {
  const user = await loadUser("123");
  console.log(user);
} catch (error) {
  console.error("Failed to load user", error);
}
```

In production, more important questions appear:

- who catches the error?
- should we retry?
- is the operation idempotent?
- should we add contextual logging?
- should the error be converted into another type?
- should dependent work be cancelled?

### Cancellation with AbortController

Not every operation that starts is still useful when it finishes.

```ts
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 2_000);

try {
  const response = await fetch("https://example.com/data", {
    signal: controller.signal
  });

  console.log(await response.json());
} finally {
  clearTimeout(timeout);
}
```

The lesson is not only how to use `AbortController`.

It is recognizing that asynchronous systems need to reason about **success, failure, and cancellation**.



## Streams: large data without loading everything into memory

Imagine a 5 GB file.

A naive approach would load the entire file into memory before processing it. Streams let us work with data in chunks.

The three fundamental categories are:

```text
Readable   → produces data
Writable   → consumes data
Transform  → consumes, transforms, and produces
```

Example:

```ts
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

await pipeline(
  createReadStream("large.log"),
  createGzip(),
  createWriteStream("large.log.gz")
);
```

The entire file does not need to exist in memory at once.

### Backpressure

Imagine a faucet filling a bucket. If water enters faster than it leaves, the system eventually needs to slow the flow.

In streams, this problem is called **backpressure**.

If a producer creates data faster than the consumer can process it, ignoring the imbalance can increase buffering, memory pressure, and instability.

One advantage of APIs such as `pipeline()` is that they help coordinate flow, completion, and error propagation.

> Mastering streams is not about memorizing events. It is about understanding flow, pressure, shutdown, and errors.

## Buffer and native APIs

Not every piece of data is text. Networking, files, and cryptography often work with bytes.

That is where `Buffer` appears:

```ts
const data = Buffer.from("Node.js", "utf8");

console.log(data);
console.log(data.toString("utf8"));
```

During the TS/Node Foundation cycle, work directly with native modules such as:

```text
node:fs
node:path
node:crypto
node:http
Buffer
fetch
```

Build at least one small API with `node:http`.

Not because you should abandon Express, but because afterward you will understand **which problem the framework is solving for you**.



## CommonJS and ESM are not just syntax

CommonJS:

```js
const fs = require("node:fs");
module.exports = {};
```

ESM:

```ts
import fs from "node:fs";
export {};
```

The difference goes beyond `require` versus `import`.

The module system affects:

- file resolution;
- `package.json`;
- extensions;
- TypeScript builds;
- tests;
- package interoperability.

So when a test works under CommonJS but fails after an ESM migration, the investigation should not stop at "TypeScript is weird."

There is a module model underneath the toolchain.



## CPU-bound vs I/O-bound

This distinction is central to production diagnosis.

### I/O-bound

The application spends much of its time waiting for something external:

```text
database
network
filesystem
external API
queue
```

This is where Node's asynchronous model tends to be especially effective.

### CPU-bound

The process spends significant time performing computation:

```text
heavy compression
image processing
intensive cryptography
large algorithms
expensive parsing
```

If that work occupies the main thread for too long, the event loop cannot serve other clients responsively.

Depending on the problem, options may include:

```text
worker_threads
another process
job queue
specialized service
partitioning the work
```

But the rule comes before the solution:

> **do not choose before measuring.**



## Measure before optimizing

Imagine a slow route.

A bad reaction is:

> "It must be the database."

Another one is:

> "Node cannot handle this."

An engineer tries to create evidence.

Start simple:

```ts
import { performance } from "node:perf_hooks";

const start = performance.now();

await executeWork();

const duration = performance.now() - start;
console.log(`duration=${duration.toFixed(2)}ms`);
```

Then move toward CPU profiling, heap snapshots, `process.memoryUsage()`, and event loop metrics. Node also provides `monitorEventLoopDelay()` to observe event loop delays.

<!-- VISUAL:
Symptom
  ↓
Hypothesis
  ↓
Measurement
  ↓
Bottleneck identified
  ↓
Controlled change
  ↓
Measure again

Avoid:
Symptom → guess → rewrite everything
-->

Microbenchmarks have limits.

If you measure one isolated function for a few milliseconds, you cannot automatically conclude that it will be the bottleneck of a real application with networking, garbage collection, concurrency, and a database.

Always write:

> **What does this test NOT prove?**

That question forces more professional reasoning.



## A practical lab for the TS/Node Foundation

Instead of studying each concept only in notes, create a small laboratory.

```text
node-runtime-lab/
├── src/
│   ├── event-loop/
│   ├── promises/
│   ├── streams/
│   ├── buffers/
│   ├── http/
│   ├── workers/
│   └── profiling/
├── test/
├── package.json
├── tsconfig.json
└── README.md
```

Create examples that can fail on purpose:

- a route blocked by CPU work;
- an unhandled Promise;
- a cancelled `fetch`;
- a stream failure;
- a producer faster than its consumer;
- a large file processed with and without streams;
- equivalent CommonJS and ESM examples;
- an event loop delay measurement.

The goal is not only to make the correct version work.

You should be able to explain **why the wrong version fails**.



## Professional process is part of the foundation

Use the same lab to practice environment and process:

```text
Node on an LTS release
npm or pnpm
TypeScript
terminal
VS Code
Git
tests
CI
```

Work with small branches, atomic commits, and simple rebases. Open issues for experiments and create pull requests even when working alone.

Perform your own code review before merging.

Configure CI to run at least:

```text
lint
typecheck
test
build
```

A green badge does not prove quality by itself, but it shows that a reproducible automated process exists.



## How to prove you learned it

At the end of the cycle, your strongest evidence should not be:

> "I watched a Node course."

A stronger proof is a public repository where another engineer can see your reasoning.

In the README, explain:

- the problem studied;
- expected behavior;
- how to run it;
- how to test it;
- what was measured;
- which trade-offs appeared.

Write the main README in Portuguese or your primary language and add a short summary in simple technical English.

For example:

> This experiment compares a CPU-bound task on the main thread with the same workload moved to a worker. The goal is not to prove that workers are always faster, but to observe their impact on event loop responsiveness.

This trains the kind of explanation useful in international interviews and shows the ability to communicate engineering, not only code.

Your portfolio can also describe observed impact in terms of:

```text
performance
reliability
security
cost
productivity
```



## Questions you should be able to answer

At the end of the study, try to answer these without memorized definitions:

**If Node executes JavaScript on one main thread, how can it handle many connections?**

**What is the difference between concurrency and parallelism?**

**When does libuv use the worker pool?**

**Why does `await` not mean creating a thread?**

**Why can CPU-bound work degrade every request?**

**What is the difference between a Promise microtask and a timer?**

**Why should `process.nextTick()` be used carefully?**

**What problem does backpressure protect against?**

**Why can streams reduce memory pressure?**

**Where does `Buffer` appear in a real application?**

**Why do CommonJS and ESM affect builds and tests?**

**What evidence shows whether a bottleneck is in CPU, memory, I/O, or the event loop?**

If you can explain these questions using examples you built and measured, you have moved beyond surface-level Node.js study.



# What to take away from this article

Node.js is not Express.

Node.js is not Nest.

Those frameworks are important tools built on top of a much broader runtime.

Mastering Node means understanding at least the path between:

```text
JavaScript
   ↓
event loop
   ↓
I/O and libuv
   ↓
streams and memory
   ↓
modules
   ↓
errors
   ↓
measurement
   ↓
production
```

You do not need to memorize every internal implementation detail.

But you need enough understanding to form good hypotheses when a real system fails.

The study starts with:

> "How do I build an API?"

It matures when the question becomes:

> "Why does this system behave this way, how can I prove the cause, and what trade-off exists in the solution?"

That change in question is one of the clearest differences between copying framework code and building software that can survive production.



# Official references for deeper study

- [Node.js — The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Node.js — Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Node.js Streams API](https://nodejs.org/api/stream.html)
- [Node.js Process API](https://nodejs.org/api/process.html)
- [Node.js Performance Hooks](https://nodejs.org/api/perf_hooks.html)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js ECMAScript Modules](https://nodejs.org/api/esm.html)
