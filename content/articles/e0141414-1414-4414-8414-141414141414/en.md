---
translationId: 4e141414-1414-4414-8414-141414141414
articleId: e0141414-1414-4414-8414-141414141414
locale: en
slug: nodejs-runtime-quality-refactoring
title: "Node.js Below the Framework: Runtime Applied to Quality and Refactoring"
description: "A practical guide to understanding the event loop, asynchronous I/O, streams, memory, profiling, cancellation, and errors in Node.js, applying runtime knowledge to quality and refactoring."
status: draft
---

# Node.js Below the Framework: Runtime Applied to Quality and Refactoring

Learning Node.js professionally is not learning a list of Express methods or memorizing framework decorators. Frameworks organize applications. The runtime determines how the process executes JavaScript, waits for I/O, uses memory, schedules callbacks, processes streams, and behaves when a function blocks the main thread.

In this cycle, the context is **quality and refactoring**. The goal is not to study internals for academic curiosity, but to use runtime knowledge to answer production questions:

- why did one simple route increase latency for unrelated requests?
- why does the process consume hundreds of megabytes while processing a file?
- why did a rejected Promise disappear or become a global error?
- why does an operation continue after the request has already been cancelled?
- why does "asynchronous" code still block the server?
- why did replacing `readFile` with a stream change the memory profile?
- why does a test depend on the ordering of `setTimeout`, `setImmediate`, Promise, and `nextTick`?

The lab in this cycle should develop four capabilities:

1. understand the Node.js execution model;
2. recognize whether a problem is CPU-bound, I/O-bound, memory-related, or asynchronous coordination-related;
3. refactor without accidentally changing behavior;
4. measure before and after to prove the effect of a change.

> Knowing that Node.js is "single-threaded" is not enough. JavaScript normally executes on one thread per isolate, while the runtime coordinates I/O, operating-system resources, and auxiliary work in different ways. Diagnosis starts by finding where the work is actually happening.

<!-- VISUAL:
Flow: request -> JavaScript/event loop -> operation.
From the operation, three paths:
1. non-blocking I/O -> operating system;
2. tasks supported by the libuv worker pool;
3. JavaScript CPU work -> event loop or worker_threads.
Beside it: CPU, memory, event loop delay, and latency as evidence.
-->

## The problem that guides the lab

Create a small native HTTP server with three capabilities:

1. return a lightweight health endpoint;
2. calculate a CPU-intensive task;
3. process a large file.

A naive implementation may work perfectly with one user and still degrade the whole application under concurrency.

```ts
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

function expensiveCalculation(iterations: number): number {
  let result = 0;

  for (let i = 0; i < iterations; i += 1) {
    result += Math.sqrt(i);
  }

  return result;
}

const server = createServer(async (request, response) => {
  if (request.url === "/health") {
    response.end("ok");
    return;
  }

  if (request.url === "/cpu") {
    const result = expensiveCalculation(80_000_000);
    response.end(String(result));
    return;
  }

  if (request.url === "/file") {
    const content = await readFile("./data/large.csv");
    response.end(String(content.length));
    return;
  }

  response.statusCode = 404;
  response.end("not found");
});

server.listen(3000);
```

The two routes have problems of different kinds.

`/cpu` executes heavy JavaScript synchronously. While the function runs, the event loop cannot execute callbacks for other requests on that thread.

`/file` uses an asynchronous API, so it does not block in the same way, but it loads the entire contents into memory. Depending on file size and concurrency, this may increase memory consumption and garbage-collector pressure.

The goal is to diagnose each problem with evidence and refactor it appropriately.

## The Node.js process: start with what is actually running

A Node process owns state and resources such as:

- JavaScript heap;
- stack;
- active handles and requests;
- descriptors and sockets;
- environment variables;
- loaded modules;
- event loop;
- integration with libuv and the operating system.

The `process` object exposes part of that state:

```ts
console.log({
  pid: process.pid,
  platform: process.platform,
  node: process.version,
  uptimeSeconds: process.uptime(),
  memory: process.memoryUsage(),
});
```

`process.memoryUsage()` can report information such as:

- `rss`: resident memory of the process;
- `heapTotal`: heap allocated by V8;
- `heapUsed`: used portion of the heap;
- `external`: memory associated with objects external to the JavaScript heap;
- `arrayBuffers`: memory used by `ArrayBuffer` and `SharedArrayBuffer`.

Do not interpret one number in isolation. RSS, heap, and external memory represent different things.

## "Single thread" needs precision

Node.js is often summarized as "single-threaded." The phrase can help initially, but it hides important details.

In a typical Node process:

- JavaScript in the main flow executes on one thread;
- the event loop coordinates when JavaScript callbacks can execute again;
- network operations can be coordinated by the operating system without a JavaScript thread waiting for them;
- some APIs use the libuv worker pool;
- `worker_threads` can execute JavaScript on additional threads when justified.

Therefore:

```ts
const data = await fetch(url);
```

does not mean a JavaScript thread is sitting idle while waiting for the remote server.

And:

```ts
const result = expensiveCalculation();
```

still blocks the JavaScript thread even if the calling function is declared `async`.

Adding `async` does not turn synchronous work into parallel work.

## libuv and the worker pool

libuv provides Node with abstractions for the event loop and asynchronous operations across platforms.

Some operations use an auxiliary thread pool. Important examples include certain filesystem, cryptographic, and name-resolution operations.

The professional lesson is to avoid a wrong simplification:

> Not every I/O operation "goes to the thread pool."

Network sockets normally depend on asynchronous operating-system mechanisms. Other APIs may use the pool because there is no equivalent non-blocking interface or because the work is naturally executed by auxiliary threads.

This matters because saturating the worker pool may increase the latency of other operations that share that resource.

Create an experiment with several concurrent cryptographic or filesystem operations and measure the behavior. Do not change pool size by trial and error; first prove that the pool is the bottleneck.

## Event loop: an operational model

The event loop runs iterations with phases associated with callback categories. A useful view includes:

- timers;
- pending callbacks;
- poll;
- check;
- close callbacks.

There are also internal libuv stages that application code does not need to treat as public APIs.

Two queues often confused with phases are:

- the `process.nextTick` queue;
- the microtask queue used by Promises and `queueMicrotask`.

They are not simply "two more event-loop phases."

The goal is not to memorize a diagram. It is to explain why a sequence runs in a particular order and recognize when depending on fine scheduling details makes code fragile.

## Timers are not exact clocks

```ts
const startedAt = Date.now();

setTimeout(() => {
  console.log(Date.now() - startedAt);
}, 100);
```

The `100` means the callback should not be considered ready before that threshold. It does not mean it will run at exactly 100 ms.

If the event loop is busy for 500 ms:

```ts
setTimeout(() => {
  console.log("timer");
}, 10);

expensiveCalculation(80_000_000);
```

the timer waits until JavaScript releases the thread and the loop reaches an appropriate opportunity to execute it.

This matters for:

- timeouts;
- retries;
- periodic jobs;
- metrics;
- time-based tests.

Avoid tests that depend on impossible precision.

## Poll and I/O

The poll phase is central to handling I/O events.

Instead of imagining the runtime "checking everything in a while loop," think of the system registering interests, waiting efficiently for events, and scheduling JavaScript callbacks when work becomes ready according to event-loop rules.

This model allows thousands of concurrent connections when much of their lifetime is spent waiting for I/O.

It does not remove the cost of JavaScript that runs when each callback eventually executes.

## `setImmediate` and `setTimeout`

This looks simple:

```ts
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
```

Outside an I/O context, do not write business logic that assumes one universal ordering based only on this example.

Inside an I/O callback, `setImmediate` has a more predictable relationship with the `check` phase.

Build small tests to study the behavior, but avoid building application contracts on unnecessary scheduling differences.

## Promises and microtasks

Handlers of resolved Promises execute through the microtask queue:

```ts
console.log("A");

Promise.resolve().then(() => {
  console.log("B");
});

console.log("C");
```

Result:

```text
A
C
B
```

The callback does not interrupt JavaScript that is already executing.

A long chain of microtasks can also delay progress to other parts of the loop. "Using a Promise" does not automatically mean "fairly yielding the processor."

## `process.nextTick`

`process.nextTick()` has a specific queue and runs before the event loop continues to other phases after the current operation.

```ts
import { nextTick } from "node:process";

console.log("A");

nextTick(() => {
  console.log("nextTick");
});

Promise.resolve().then(() => {
  console.log("promise");
});

console.log("B");
```

In CommonJS, the observed order for simple examples can place `nextTick` before Promise microtasks. In ESM, module evaluation context changes details of the ordering.

Current Node documentation recommends preferring `queueMicrotask()` for most userland cases when the special capabilities of `nextTick()` are not required.

More importantly, recursive `nextTick` calls can prevent the loop from progressing.

```ts
function starve(): void {
  process.nextTick(starve);
}

starve();
```

Do not run this uncontrolled in an important environment. The example exists to show how a priority queue can cause starvation.

## `async`/`await` does not change the nature of the operation

Compare:

```ts
async function calculate(): Promise<number> {
  return expensiveCalculation(80_000_000);
}
```

with:

```ts
async function load(): Promise<Response> {
  return fetch("https://example.com");
}
```

Both functions return a Promise.

But the first performs synchronous CPU work before resolving the Promise. The second starts asynchronous I/O.

The `Promise<T>` signature tells the caller how the result arrives. By itself, it does not tell you where the work executed.

## Asynchronous errors: the boundary must be explicit

With `async/await`:

```ts
async function loadUser(id: string): Promise<User> {
  const response = await fetch(`/users/${id}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<User>;
}
```

The error becomes a Promise rejection.

The caller must decide what to do:

```ts
try {
  const user = await loadUser("123");
  console.log(user);
} catch (error) {
  console.error(error);
}
```

Do not mechanically spread `try/catch` across every function. Handle an error where there is enough context to:

- translate it;
- add context;
- perform compensation;
- respond to the client;
- log and terminate a flow.

Catching and ignoring is worse than keeping the failure explicit.

## Do not mix callbacks and Promises without a reason

Code like this increases error paths:

```ts
someAsyncFunction()
  .then((value) => {
    callback(null, value);
  })
  .catch((error) => {
    callback(error);
  });
```

In a modern codebase, choose a clear boundary. If you must adapt a legacy API, isolate the adapter.

Node provides `util.promisify` for many compatible callback-first patterns, but not every API should be converted blindly.

## Unhandled rejections are not an error strategy

A Promise that is created and forgotten can fail outside the expected flow:

```ts
void saveAuditLog(data);
```

The `void` can make it explicit that the result was discarded, but it does not define the failure policy.

Ask:

- may the operation fail silently?
- should it retry?
- must the error be logged?
- is the task critical?
- should the process continue?

Quality lies in the decision, not in silencing the linter.

## Cancellation with `AbortController`

Asynchronous work can become useless.

A client may disconnect, a timeout may expire, or the process may start shutting down.

```ts
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort(new Error("timeout"));
}, 2_000);

try {
  const response = await fetch(
    "https://example.com/data",
    { signal: controller.signal },
  );

  console.log(await response.text());
} finally {
  clearTimeout(timeout);
}
```

When available, prefer APIs that accept `AbortSignal`.

Cancellation should flow through relevant layers. Cancelling an HTTP handler is not enough if an inner function completely ignores the signal.

## Propagating cancellation

```ts
type LoadOptions = {
  signal?: AbortSignal;
};

async function loadReport(
  id: string,
  options: LoadOptions = {},
): Promise<string> {
  const response = await fetch(
    `https://example.com/reports/${id}`,
    { signal: options.signal },
  );

  return response.text();
}
```

The function does not create an unnecessary internal controller. It accepts the caller's signal.

This allows request timeouts, shutdown, and user cancellation to compose.

## Streams: process data over time

`readFile` must obtain the full contents before returning the result.

Streams let you process pieces:

```ts
import { createReadStream } from "node:fs";

const stream = createReadStream("./data/large.csv");

stream.on("data", (chunk) => {
  console.log(chunk.length);
});
```

In production code, listening only to `data` is rarely enough. You need to consider:

- error;
- completion;
- backpressure;
- composition;
- cancellation;
- cleanup.

## Fundamental stream types

### Readable

Produces data.

Examples:

- a file being read;
- HTTP request body;
- HTTP response;
- a generator converted to a stream.

### Writable

Consumes data.

Examples:

- output file;
- HTTP response;
- compression or storage destination.

### Duplex

Can read and write independently.

Sockets are an important example.

### Transform

Receives data and produces a transformed version.

```ts
import { Transform } from "node:stream";

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});
```

## `pipeline`: compose with an error policy

Instead of chaining `.pipe()` and manually managing all events, prefer `pipeline` when it fits the flow.

```ts
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

await pipeline(
  createReadStream("./data/large.csv"),
  createGzip(),
  createWriteStream("./data/large.csv.gz"),
);
```

`pipeline` helps forward errors and clean up participating streams.

It can also work with cancellation in compatible APIs.

## Backpressure: the consumer defines a limit

Imagine a producer that can read data faster than the destination can write it.

Without control, chunks accumulate in memory.

The `Writable.write()` interface tells the producer whether to continue:

```ts
const canContinue = writable.write(chunk);

if (!canContinue) {
  await once(writable, "drain");
}
```

Streams and `pipeline` implement mechanisms that coordinate this flow.

Backpressure does not mean "the program becomes slow." It means the producer respects consumer capacity so resource usage remains predictable.

## Experiment: whole file versus stream

Create a reproducible large file.

Version A:

```ts
import { readFile, writeFile } from "node:fs/promises";

const content = await readFile(inputPath);
await writeFile(outputPath, content);
```

Version B:

```ts
await pipeline(
  createReadStream(inputPath),
  createWriteStream(outputPath),
);
```

Record during execution:

```ts
const memory = process.memoryUsage();

console.log({
  rssMb: memory.rss / 1024 / 1024,
  heapUsedMb: memory.heapUsed / 1024 / 1024,
  externalMb: memory.external / 1024 / 1024,
});
```

Do not conclude that streams are "always faster." The most important improvement may be memory predictability.

Measure:

- duration;
- approximate peak RSS;
- heap;
- processed volume;
- file size;
- number of runs;
- environment.

## Buffer: bytes, not magical text

Node uses `Buffer` to represent binary data.

```ts
const buffer = Buffer.from("Hello", "utf8");

console.log(buffer);
console.log(buffer.length);
console.log(buffer.toString("utf8"));
```

The number of bytes is not necessarily equal to the number of user-perceived characters.

This matters for:

- protocols;
- files;
- cryptography;
- payload limits;
- stream chunks;
- encoding.

Never convert binary to strings and back merely for convenience without understanding encoding and cost.

## `Buffer.alloc` versus `Buffer.allocUnsafe`

```ts
const safe = Buffer.alloc(1024);
const fast = Buffer.allocUnsafe(1024);
```

`alloc` initializes memory.

`allocUnsafe` can avoid initialization and should be used only when the content will be completely overwritten before it is read or exposed.

Here, "unsafe" is design information, not decoration in the method name.

## Filesystem: asynchronous does not mean cost-free

Filesystem APIs have different shapes:

```ts
import { readFile } from "node:fs/promises";

const content = await readFile(path);
```

and:

```ts
import { createReadStream } from "node:fs";

const stream = createReadStream(path);
```

Both can be asynchronous, but they have different memory and composition profiles.

There are synchronous APIs too:

```ts
import { readFileSync } from "node:fs";

const config = readFileSync("./config.json", "utf8");
```

A synchronous operation during startup may be acceptable in some programs. The same operation inside a highly concurrent route may be a serious problem.

Context matters.

## `path`: do not build paths manually

Avoid:

```ts
const file = base + "/" + folder + "/" + name;
```

Prefer:

```ts
import path from "node:path";

const file = path.join(base, folder, name);
```

Besides portability, the API makes intent explicit.

For paths derived from ESM modules:

```ts
const file = new URL("./data/input.csv", import.meta.url);
```

Use the approach that matches the destination API's contract.

## `crypto`: security cost is also CPU cost

Cryptography and password hashing intentionally have computational cost.

```ts
import { scrypt } from "node:crypto";

scrypt(password, salt, 64, (error, derivedKey) => {
  if (error) {
    throw error;
  }

  console.log(derivedKey);
});
```

When testing concurrent cryptographic operations, observe:

- latency;
- CPU;
- worker pool;
- queueing;
- event loop;
- total concurrency.

Never weaken security parameters merely to improve a benchmark without understanding the security requirement.

## Native HTTP: see what frameworks abstract

```ts
import { createServer } from "node:http";

const server = createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify({ ok: true }));
});

server.listen(3000);
```

Study at least once:

- headers;
- status;
- request body as a stream;
- response as a writable;
- connection lifecycle;
- timeout;
- abort;
- errors;
- keep-alive.

Then, when a framework behaves unexpectedly, you have a mental model beneath it.

## Native `fetch` and external boundaries

Modern Node versions expose global `fetch`.

```ts
const response = await fetch("https://example.com/api");

if (!response.ok) {
  throw new Error(`Unexpected status: ${response.status}`);
}
```

A resolved `fetch` Promise does not mean an HTTP 500 becomes a rejected Promise. You still need to interpret the protocol.

Always distinguish:

- transport failure;
- timeout/cancellation;
- HTTP error status;
- invalid payload;
- invalid business state.

## CommonJS and ESM are different models

CommonJS:

```js
const { readFile } = require("node:fs/promises");

module.exports = {
  load,
};
```

ESM:

```ts
import { readFile } from "node:fs/promises";

export function load() {
  // ...
}
```

Node supports two module systems and interoperability between them, but their rules are not identical.

Study:

- `"type"` in `package.json`;
- `.mjs`;
- `.cjs`;
- resolution;
- `exports`;
- `imports`;
- `import.meta`;
- `require`;
- dynamic `import()`;
- tooling compatibility.

## Be explicit about package format

A `package.json` with:

```json
{
  "type": "module"
}
```

makes the intention explicit for `.js` files in that scope.

Even when a build tool accepts imports without a clear configuration, the runtime that executes the artifact still needs to interpret the result correctly.

Do not rely on "it worked in my test runner" as proof of runtime compatibility.

## Module resolution is part of the design

Consider:

```ts
import { service } from "./service.js";
```

In a TypeScript project configured for ESM/NodeNext, extensions and resolution need to match emitted JavaScript and runtime behavior.

The lab should execute the compiled artifact, not only run TypeScript directly through a tool with its own resolution rules.

Keep explicit scripts:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "node --test",
    "start": "node dist/main.js"
  }
}
```

Adapt this to your tools, but make sure the real build is executable.

## CPU-bound versus I/O-bound

This distinction guides the solution.

### CPU-bound

Time is dominated by computation:

- heavy parsing;
- specific compression;
- intensive transformations;
- cryptography implemented in JavaScript;
- image processing in CPU-heavy code;
- large algorithms.

Possible signals:

- high CPU;
- increasing event loop delay;
- delayed health route;
- profiler concentrated in JavaScript functions.

### I/O-bound

Time is dominated by waiting for:

- network;
- database;
- disk;
- external services.

Possible signals:

- high latency with relatively low CPU;
- time concentrated in external waits;
- event loop not necessarily saturated;
- improvement by reducing round trips or running independent I/O concurrently with limits.

Do not confuse "slow response" with "slow CPU."

## Parallel Promises do not fix synchronous CPU work

This:

```ts
await Promise.all([
  calculateHeavyTask(),
  calculateHeavyTask(),
  calculateHeavyTask(),
]);
```

does not turn synchronous CPU-bound functions into parallel execution.

If each call blocks before returning a Promise, the problem remains.

For genuinely parallel JavaScript CPU work, investigate `worker_threads`.

## `worker_threads`: parallelism for CPU work

```ts
import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from "node:worker_threads";

if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url), {
    workerData: 80_000_000,
  });

  worker.on("message", (result) => {
    console.log(result);
  });
} else {
  const iterations = workerData as number;
  const result = expensiveCalculation(iterations);
  parentPort?.postMessage(result);
}
```

Workers have costs:

- creation;
- memory;
- serialization or transfer;
- coordination;
- error handling;
- shutdown.

For repeated tasks, creating one worker per operation may cost more than the work itself. A pool may be more appropriate.

Workers are not the first solution for I/O. The runtime already has more appropriate asynchronous mechanisms for it.

## Refactoring the CPU-bound route

Before:

```ts
if (request.url === "/cpu") {
  const result = expensiveCalculation(80_000_000);
  response.end(String(result));
}
```

Afterward, move the task behind an abstraction:

```ts
interface CpuTaskRunner {
  run(iterations: number, signal?: AbortSignal): Promise<number>;
}
```

One implementation may use worker threads.

The handler depends on the contract, not the strategy:

```ts
const result = await cpuTaskRunner.run(
  80_000_000,
  requestSignal,
);
```

This reduces coupling and allows you to test:

- handler rules;
- worker implementation;
- cancellation;
- failure;
- timeout.

## Do not hide runtime dependencies

Hard-to-test code:

```ts
export async function buildReport(): Promise<Report> {
  const startedAt = Date.now();
  const response = await fetch(process.env.REPORT_URL!);
  // ...
}
```

Better:

```ts
type ReportDependencies = {
  clock: {
    now(): number;
  };
  fetchReport(
    signal?: AbortSignal,
  ): Promise<ReportData>;
};

export async function buildReport(
  dependencies: ReportDependencies,
  signal?: AbortSignal,
): Promise<Report> {
  const startedAt = dependencies.clock.now();
  const data = await dependencies.fetchReport(signal);

  return {
    data,
    durationMs: dependencies.clock.now() - startedAt,
  };
}
```

The point is not to create interfaces for everything. It is to control dependencies that make behavior nondeterministic or difficult to replace in tests.

## Streams can improve architecture too

Before:

```ts
async function compressFile(path: string): Promise<Buffer> {
  const content = await readFile(path);
  return gzip(content);
}
```

The function requires the full contents to exist in memory.

A streaming interface works incrementally:

```ts
async function compressFile(
  inputPath: string,
  outputPath: string,
  signal?: AbortSignal,
): Promise<void> {
  await pipeline(
    createReadStream(inputPath),
    createGzip(),
    createWriteStream(outputPath),
    { signal },
  );
}
```

The contract changed: instead of returning the whole file, the function produces an output.

This may improve memory usage, but it also changes usage, error handling, and testability. Record the trade-off.

## Stream errors need a strategy

Streams involve multiple components that may fail:

- source;
- transform;
- destination;
- abort;
- filesystem.

`pipeline` helps centralize failure:

```ts
try {
  await pipeline(source, transform, destination);
} catch (error) {
  if (signal.aborted) {
    // handle cancellation according to the contract
  }

  throw error;
}
```

Do not convert every error into "read failure" when the problem could have occurred at the destination.

Preserve `cause` when adding context:

```ts
throw new Error(
  "Failed to generate compressed report",
  { cause: error },
);
```

## Unit, integration, contract, and e2e tests

### Unit

Test a CPU function or transformation rule in isolation.

```ts
import assert from "node:assert/strict";
import test from "node:test";

test("transforms a CSV line", () => {
  assert.equal(
    normalizeLine("  A,B  "),
    "A,B",
  );
});
```

### Integration

Test filesystem, streams, and real components working together.

```ts
test("copies a file through pipeline", async () => {
  // create temporary file
  // execute pipeline
  // compare output
});
```

### Contract

Test the external interface:

- HTTP status;
- headers;
- JSON format;
- error behavior;
- expected cancellation.

### E2E

Start the real process or server and execute the full flow.

Keep a small number of critical paths and preserve simple diagnostics.

## Testing event-loop ordering

Use educational tests, not fragile ones.

```ts
import assert from "node:assert/strict";
import test from "node:test";

test("promise callback runs after current stack", async () => {
  const events: string[] = [];

  events.push("sync-start");

  const promise = Promise.resolve().then(() => {
    events.push("promise");
  });

  events.push("sync-end");

  await promise;

  assert.deepEqual(events, [
    "sync-start",
    "sync-end",
    "promise",
  ]);
});
```

For `nextTick`, `setImmediate`, and timers, document the context of the test. Do not use accidental ordering as a business rule.

## Characterization before refactoring asynchronous code

An old function may have strange behavior:

```ts
async function legacyRetry(
  operation: () => Promise<string>,
): Promise<string> {
  // legacy implementation
}
```

Before replacing it with a better policy, record:

- number of attempts;
- delay;
- which errors retry;
- which errors stop;
- final value;
- cancellation behavior.

Characterization tests protect current behavior until you consciously decide what should change.

## Small refactoring steps

One possible sequence:

1. add a test for current behavior;
2. extract a long function;
3. type dependencies;
4. introduce `AbortSignal`;
5. keep the external API unchanged;
6. replace `readFile` with a stream internally;
7. measure;
8. review results;
9. only then change the public contract if necessary.

Each pull request should answer a clear question.

Avoid one change containing:

- ESM migration;
- refactor;
- worker threads;
- test-runner replacement;
- new lint configuration;
- streaming;
- API changes.

That makes reviews harder and regressions more difficult to locate.

## Code smells in runtime-oriented code

### Hidden CPU work in a handler

```ts
app.get("/report", async () => {
  return buildHugeReportSynchronously();
});
```

`async` visually hides the fact that the work blocks.

### Synchronous I/O in a hot path

```ts
const template = readFileSync(file, "utf8");
```

Inside a route executed thousands of times, this may block the loop.

### Unlimited `Promise.all`

```ts
await Promise.all(
  ids.map((id) => loadRemoteResource(id)),
);
```

With 100,000 IDs, this can create uncontrolled concurrency.

### Unnecessary buffering

```ts
const entireFile = await readFile(path);
```

when the consumer accepts chunks.

### Hidden time dependency

```ts
await new Promise((resolve) => setTimeout(resolve, 500));
```

spread through business rules makes testing difficult.

### Swallowed error

```ts
try {
  await operation();
} catch {
  return null;
}
```

without documenting why `null` is a valid result.

## Concurrency does not mean unlimited concurrency

For independent I/O, concurrency can reduce total duration.

But every dependency has limits:

- connections;
- sockets;
- quotas;
- database pool;
- memory;
- remote service capacity.

Introduce limits when necessary.

A small concurrency-controlled queue can be healthier than a giant `Promise.all`.

The lab should measure both.

## Profiling: prove where the CPU goes

Node provides profiling mechanisms that generate profiles for analysis tools.

A simple example:

```bash
node --cpu-prof dist/server.js
```

Then run the workload that reproduces the problem.

The profile should answer:

- which functions consumed CPU?
- how much time was concentrated there?
- was the original hypothesis correct?
- does the workload represent the real problem?

Do not select the function that "looks slow" only by reading code.

## CPU profile before and after

Store artifacts under:

```text
docs/
  profiles/
    before/
    after/
```

Record:

- Node version;
- machine;
- command;
- load duration;
- volume;
- concurrency;
- commit;
- interpretation.

If the CPU-bound function disappears from the main profile after moving to workers, find where the cost went. You did not eliminate the computation; you changed where it executes.

## Memory: a snapshot without context can mislead

To study memory, use:

- `process.memoryUsage()`;
- heap profiling;
- snapshots in a controlled environment;
- RSS over time;
- processed volume.

Distinguish:

- temporary peak;
- growth proportional to volume;
- intentional cache;
- actual leak.

A graph that rises under load and falls after GC does not prove a memory leak.

## Heap profiling

Node can generate heap profiles through runtime options.

In a controlled experiment:

```bash
node --heap-prof dist/process-file.js
```

Use the result to identify meaningful allocations.

Never capture production-sensitive data without appropriate policy; profiles and snapshots can contain values from the process.

## Event loop delay

Node provides `monitorEventLoopDelay` in `node:perf_hooks`.

```ts
import { monitorEventLoopDelay } from "node:perf_hooks";

const histogram = monitorEventLoopDelay({
  resolution: 20,
});

histogram.enable();

setInterval(() => {
  console.log({
    p50Ms: histogram.percentile(50) / 1e6,
    p99Ms: histogram.percentile(99) / 1e6,
    maxMs: histogram.max / 1e6,
  });

  histogram.reset();
}, 5_000);
```

When synchronous CPU work blocks the loop, timers and callbacks are delayed. This metric helps observe the effect.

It does not explain the cause by itself. Combine it with CPU profiling and load context.

## Event loop utilization

`performance.eventLoopUtilization()` helps observe how much time the event loop was active versus idle during a window.

```ts
import { performance } from "node:perf_hooks";

let previous = performance.eventLoopUtilization();

setInterval(() => {
  const current = performance.eventLoopUtilization();
  const delta = performance.eventLoopUtilization(
    current,
    previous,
  );

  previous = current;

  console.log(delta);
}, 5_000);
```

High utilization can be an important signal, but do not turn an arbitrary threshold into universal truth.

## A microbenchmark is not a system benchmark

A microbenchmark:

```ts
const start = performance.now();

for (let i = 0; i < 1_000_000; i += 1) {
  normalizeLine(input);
}

console.log(performance.now() - start);
```

can compare two local implementations.

But it does not automatically prove:

- HTTP throughput;
- behavior under concurrency;
- memory consumption;
- network cost;
- database impact;
- p99 latency.

Use the smallest tool capable of answering the question.

## Simulate load with a hypothesis

Before running load, write:

> Hypothesis: the CPU-bound route increases event loop delay and degrades `/health` latency under concurrency.

Measure:

- throughput;
- median latency;
- p95/p99 when available;
- CPU;
- RSS;
- heap;
- event loop delay;
- errors.

Then refactor and repeat under similar conditions.

Do not change three variables at once.

## CPU-bound experiment

Scenario A:

```text
/health -> trivial response
/cpu    -> synchronous calculation
```

Send concurrent calls to `/cpu` while measuring `/health`.

You should expect `/health` to suffer too because the computation occupies the main JavaScript thread.

Scenario B:

move the calculation to a worker or worker pool.

Repeat.

Record:

- observed improvement;
- worker overhead;
- memory cost;
- behavior at low concurrency;
- test limitations.

## I/O-bound experiment

Create an endpoint that loads several independent resources.

Sequential version:

```ts
const a = await loadA();
const b = await loadB();
const c = await loadC();
```

Concurrent version:

```ts
const [a, b, c] = await Promise.all([
  loadA(),
  loadB(),
  loadC(),
]);
```

If the operations are independent, the second approach may reduce duration.

But also create a scenario with hundreds or thousands of operations and show that unlimited concurrency can saturate resources.

The lesson is not "`Promise.all` is better." It is "the strategy depends on system limits."

## Stream experiment

Version A:

```ts
const file = await readFile(path);
const compressed = await gzipAsync(file);
await writeFile(output, compressed);
```

Version B:

```ts
await pipeline(
  createReadStream(path),
  createGzip(),
  createWriteStream(output),
);
```

Compare:

- RSS;
- heap;
- external memory;
- duration;
- size;
- CPU;
- behavior with two or ten simultaneous files.

The most important result may appear under concurrency rather than a single execution.

## Quality: lint as mechanical protection

Configure ESLint to catch problems that matter in the lab:

- forgotten Promises;
- unnecessary `await`;
- incorrectly used asynchronous callbacks;
- unused imports;
- explicit `any` without justification;
- impossible branches;
- type errors.

Lint does not measure the event loop, architecture, or performance. It reduces mechanical defects.

## Coverage: behavior that was never executed

Use coverage to find:

- untested abort handling;
- stream error branch never executed;
- worker that never fails in tests;
- uncovered timeout;
- unvalidated shutdown.

Do not chase 100% for aesthetics.

One critical error branch is worth more than dozens of trivial getters.

## Mutation testing

Mutation testing can expose weak asynchronous tests.

Example:

```ts
if (attempt >= maxAttempts) {
  throw error;
}
```

A mutation to:

```ts
if (attempt > maxAttempts) {
  throw error;
}
```

should be detected by retry tests.

Use mutation testing on small modules:

- retry;
- timeout;
- parser;
- chunk rules;
- transformation.

Do not run it across the entire lab merely to produce a score.

## Complexity

A long asynchronous function tends to hide:

- state;
- retries;
- cleanup;
- timeout;
- parsing;
- persistence;
- logging.

Simple complexity metrics can indicate where to investigate.

Refactor according to responsibility and contracts, not an isolated numeric target.

## A lab that proves your knowledge

Create the repository:

```text
node-runtime-quality-lab/
  src/
    server/
      http-server.ts
    cpu/
      expensive-calculation.ts
      worker-task-runner.ts
    files/
      buffered-copy.ts
      streamed-copy.ts
    runtime/
      event-loop-metrics.ts
      memory-metrics.ts
    application/
      generate-report.ts
  tests/
    unit/
    integration/
    contract/
    e2e/
  benchmarks/
    cpu/
    io/
    streams/
  docs/
    adr/
    profiles/
    measurements/
    refactorings/
```

Possible scripts:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "node --test",
    "test:coverage": "node --test --experimental-test-coverage",
    "profile:cpu": "node --cpu-prof dist/server/http-server.js",
    "profile:heap": "node --heap-prof dist/files/buffered-copy.js",
    "quality": "npm run typecheck && npm run lint && npm test"
  }
}
```

Adapt the scripts to the selected LTS version and the actual tools in the project.

The important requirement is that another person can reproduce the evidence using only the README and versioned commands.

## Study sequence inside the lab

### Experiment 1 — event loop

Create a file combining:

- synchronous code;
- Promise;
- `queueMicrotask`;
- `process.nextTick`;
- timer;
- `setImmediate`;
- I/O.

Before running it, write your prediction.

Then:

1. run it in ESM;
2. record the output;
3. explain the result;
4. compare it with the documentation;
5. identify which orders are useful guarantees and which should not become application contracts.

### Experiment 2 — asynchronous error

Create three cases:

1. `throw` inside a synchronous function;
2. rejection of an awaited Promise;
3. a rejected Promise that is created and not awaited.

Write tests showing the differences.

Then refactor toward an explicit error policy.

### Experiment 3 — cancellation

Create an artificially slow operation using `AbortSignal`.

Test:

- normal completion;
- abort before starting;
- abort during execution;
- cleanup executed;
- cancellation error distinguishable.

### Experiment 4 — streams and backpressure

Create a fast `Readable` and a deliberately slow `Writable`.

Observe:

- `highWaterMark`;
- return value of `write`;
- `drain` event;
- memory;
- behavior with and without a proper pipeline.

### Experiment 5 — CPU-bound

Use a reproducible function.

Measure:

- duration;
- CPU;
- event loop delay;
- `/health` latency.

Then move the work to a worker thread and repeat.

### Experiment 6 — large file

Compare:

- `readFile`;
- stream + pipeline.

Measure memory and duration.

### Experiment 7 — modules

Create two small variants of the same module:

- CommonJS;
- ESM.

Test:

- import;
- export;
- resolution;
- `__dirname` versus `import.meta`;
- build execution;
- test-runner execution.

Record real interoperability problems.

## Compare approaches and record where they fail

| Comparison | What to measure/observe | Where each option fails |
| --- | --- | --- |
| CPU on event loop vs. worker thread | latency, CPU, event loop delay, overhead | event loop blocks other callbacks; worker costs memory and coordination |
| `readFile` vs. stream | memory, duration, simplicity | full buffering scales poorly with volume; streams increase complexity |
| sequential vs. `Promise.all` | duration, concurrency, external limits | sequential loses parallel waiting; unlimited concurrency can saturate resources |
| `setTimeout` vs. `setImmediate` | context and observed order | relying on order in the wrong context creates fragile code |
| `nextTick` vs. `queueMicrotask` | priority and portability | `nextTick` can cause starvation; microtask does not replace every specific semantic |
| CommonJS vs. ESM | interoperability, tooling, runtime | CJS is legacy in many projects; ESM requires attention to resolution and ecosystem |
| buffering vs. pipeline | memory and implementation complexity | buffering needs proportional memory; pipeline requires flow management |
| microbenchmark vs. integrated load | local cost and system behavior | microbenchmark does not represent production; integrated tests make cause harder to isolate |
| large refactor vs. small steps | diff, reversibility, diagnosis | large changes mix causes; small steps require discipline |

## Build small examples that break

Run at least these experiments:

1. block the event loop and observe a delayed timer;
2. create `nextTick` recursion in a controlled environment and observe starvation;
3. fire a Promise without handling it and record the behavior;
4. ignore backpressure and observe memory growth;
5. process a large whole file under concurrency;
6. move I/O into a worker thread and compare it with native async mechanisms;
7. create one worker for every tiny task and prove the overhead;
8. force abort during `pipeline`;
9. trigger errors in both Readable and Writable;
10. migrate a module to ESM without adjusting resolution and record the failure.

The failure is part of the material. Preserve:

- failing code;
- output;
- hypothesis;
- explanation;
- fix;
- conclusion limits.

## Issues and PRs as evidence

Issue:

```text
perf: health endpoint stalls during CPU-heavy request
```

Describe:

- scenario;
- reproduction;
- evidence;
- hypothesis;
- acceptance criteria.

PR:

```text
refactor: move CPU-heavy calculation behind worker task runner
```

Include:

- previous behavior;
- chosen design;
- profile before;
- profile after;
- tests;
- introduced cost;
- risk;
- follow-up.

Another example:

```text
refactor: replace buffered file processing with stream pipeline
```

Explain the contract change, observed memory, and error handling.

## Professional README

The README should explain:

1. objective;
2. why runtime knowledge matters;
3. architecture;
4. requirements;
5. commands;
6. how to generate test files;
7. how to start the server;
8. how to run load;
9. how to produce a CPU profile;
10. how to measure memory;
11. how to run tests;
12. experiments;
13. results;
14. limitations;
15. next steps.

Include a short English summary:

```md
## English summary

This repository studies Node.js below the framework layer.
It focuses on the event loop, asynchronous I/O, streams,
backpressure, cancellation, memory, profiling, worker threads,
and safe refactoring supported by automated tests and measurements.
```

## Evidence for GitHub and your portfolio

The proof should not be "I know Node.js."

Produce:

- public repository;
- README in Portuguese;
- English summary;
- CI;
- badge;
- automated tests;
- issues;
- PRs;
- CPU profile before/after;
- memory measurement;
- event loop delay experiment;
- stream/backpressure example;
- cancellation example;
- CommonJS/ESM comparison;
- article or vlog;
- portfolio section.

A stronger impact statement:

> Under a controlled workload, the CPU-bound route running on the main thread increased event loop delay and affected an independent health route. After moving the computation to reusable workers, the calculation still consumed CPU, but the server thread remained available to process other callbacks. The experiment records machine, volume, concurrency, and worker overhead.

Better than:

> "I used worker threads and made Node 10x faster."

Speed without a scenario is an empty claim.

## Practical article 1 — Node.js Below the Framework: Runtime Applied to Quality and Refactoring

### Suggested title

**Node.js Below the Framework: Runtime Applied to Quality and Refactoring**

Start with a problem from the lab:

> A calculation route made even `/health` respond slowly.

Present:

1. simplified process model;
2. event loop;
3. asynchronous I/O versus synchronous CPU;
4. measurement;
5. profile;
6. refactoring;
7. worker or chosen alternative;
8. tests;
9. trade-offs;
10. limitations.

Show why removing the framework from the example helps expose the runtime.

Do not reduce the article to "Node is single-threaded." Explain the layers.

## Practical article 2 — Event Loop, Promises, and Asynchronous Errors Explained with Tested Code

### Suggested title

**Event Loop, Promises, and Asynchronous Errors Explained with Tested Code**

Structure it as a practical lesson.

### Common mistake

```ts
async function heavy() {
  return expensiveCalculation();
}
```

Show why `async` does not remove blocking.

### Execution order

Build examples with:

- current stack;
- Promise;
- `queueMicrotask`;
- `nextTick`;
- timer;
- immediate.

### Errors

Compare:

- synchronous throw;
- rejected Promise;
- `try/catch`;
- task fired without `await`.

### Tests

Show tests that prove relevant behavior.

### Conclusion

Explain which details are useful for architecture and which should not become fragile dependencies.

## Practical article 3 — How to Measure Before Optimizing Node.js

### Suggested title

**How to Measure Before Optimizing Node.js**

Start with a measurable hypothesis.

Example:

> Processing the entire file is causing an unnecessary memory peak.

Compare:

- `readFile`;
- stream.

Record:

- machine;
- Node version;
- file;
- size;
- concurrency;
- duration;
- RSS;
- heap;
- number of repetitions.

Or use the CPU-bound case:

- CPU profile;
- event loop delay;
- health-route latency.

Finish with a required section:

**What this test does not prove**

Example:

- it does not represent real traffic;
- it does not measure the database;
- it does not prove behavior on another machine;
- it does not measure operational cost;
- it does not mean one solution wins in every scenario.

This demonstrates technical maturity.

## Recommended article format

Each article can contain 800 to 1,500 words.

Structure:

1. introduction;
2. problem;
3. hypothesis;
4. code;
5. test or measurement;
6. result;
7. refactoring;
8. new measurement;
9. trade-offs;
10. limitations;
11. conclusion;
12. GitHub link.

A vlog can show:

- terminal;
- server;
- load;
- profiler;
- event loop delay;
- memory;
- tests;
- diff;
- PR.

## How to explain trade-offs in an international interview

Use simple technical English.

> The endpoint was CPU-bound, so making the function `async` did not solve the problem. The calculation still ran on the main JavaScript thread and delayed unrelated callbacks. We moved the computation to a reusable worker pool and measured event loop delay before and after. The trade-off was additional memory and coordination overhead.

Another example:

> We replaced whole-file buffering with a stream pipeline because memory usage grew with file size and concurrency. The streaming version kept memory more predictable, but error handling and cancellation became more important, so we covered those paths with integration tests.

Another:

> We use `AbortSignal` across I/O boundaries so work can be cancelled when the caller no longer needs it. Cancellation is part of the contract; it is not implemented only in the HTTP handler.

Another:

> We kept the application on ESM and tested the compiled output directly. This avoided relying on behavior provided only by the TypeScript development runner.

These answers show:

- context;
- evidence;
- decision;
- cost.

## Technical completion checklist

You have completed E014 when you can:

- explain what a Node process is;
- explain why "Node is single-threaded" is a simplification;
- distinguish the event loop, operating system, libuv worker pool, and `worker_threads`;
- describe timers, pending callbacks, poll, check, and close callbacks at a useful level;
- explain why Promise microtasks and `nextTick` are not simply ordinary phases;
- demonstrate execution ordering with code and a test;
- explain why `async` does not fix CPU-bound work;
- handle Promise errors deliberately;
- propagate cancellation with `AbortSignal`;
- use Readable, Writable, and Transform streams;
- use `pipeline`;
- explain backpressure;
- work consciously with Buffer;
- choose between buffering and streaming;
- use filesystem and path without hiding their cost;
- use native HTTP at least once in a lab;
- use `fetch` with protocol handling and cancellation;
- explain practical CommonJS and ESM differences;
- execute the real build and test resolution;
- distinguish CPU-bound from I/O-bound;
- run a worker-threads experiment;
- produce a CPU profile;
- observe memory;
- measure event loop delay or utilization;
- run load with a hypothesis;
- distinguish microbenchmark from integrated testing;
- explain unit, integration, contract, and e2e tests;
- perform refactoring in small steps;
- identify coupling, duplication, long functions, and hidden dependencies;
- interpret lint and coverage without treating them as architecture;
- run a small mutation test or equivalent analysis;
- compare at least two approaches and record where each one fails;
- explain a trade-off in simple technical English;
- produce reproducible public evidence.

## What you should take away from this cycle

Node.js is a runtime, not a synonym for an HTTP framework.

Backend quality depends on understanding where work runs, how long it occupies the event loop, how much memory it holds, how it reacts to backpressure, how it cancels tasks, how errors propagate, and how bottlenecks are measured.

In the context of quality and refactoring, that knowledge changes how you modify code.

Instead of:

> "I think streams are faster,"

you measure memory and throughput.

Instead of:

> "I'll make it async,"

you identify whether the work is I/O or CPU.

Instead of:

> "worker threads make it faster,"

you measure event loop behavior, overhead, and coordination cost.

Instead of:

> "the application is slow,"

you produce a profile and a verifiable hypothesis.

You have completed E014 when you can create a runtime problem, measure it, locate its cause, refactor it in small steps, and demonstrate the result reproducibly.

The final result must be assessable without a private conversation: a public repository, bilingual README, CI, tests, profiles, measurements, issues, pull requests, before/after code, and an article or vlog that acknowledges the limits of the experiment.

## Primary references

- [Node.js — The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Node.js — Don't Block the Event Loop (or the Worker Pool)](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Node.js — Process](https://nodejs.org/api/process.html)
- [Node.js — Timers](https://nodejs.org/api/timers.html)
- [Node.js — Streams](https://nodejs.org/api/stream.html)
- [Node.js — Buffer](https://nodejs.org/api/buffer.html)
- [Node.js — File System](https://nodejs.org/api/fs.html)
- [Node.js — Path](https://nodejs.org/api/path.html)
- [Node.js — Crypto](https://nodejs.org/api/crypto.html)
- [Node.js — HTTP](https://nodejs.org/api/http.html)
- [Node.js — Globals: fetch and AbortController](https://nodejs.org/api/globals.html)
- [Node.js — CommonJS Modules](https://nodejs.org/api/modules.html)
- [Node.js — ECMAScript Modules](https://nodejs.org/api/esm.html)
- [Node.js — Packages](https://nodejs.org/api/packages.html)
- [Node.js — Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js — Performance Measurement APIs](https://nodejs.org/api/perf_hooks.html)
- [Node.js — Diagnostics: Flame Graphs](https://nodejs.org/en/learn/diagnostics/flame-graphs)
- [Node.js — Diagnostics](https://nodejs.org/en/learn/diagnostics)
- [Node.js — Test Runner](https://nodejs.org/api/test.html)
