---
translationId: 4e202020-2020-4020-8020-202020202020
articleId: e0202020-2020-4020-8020-202020202020
locale: en
slug: nodejs-runtime-mvp-landing
title: "Node.js Below the Framework: Runtime Applied to an MVP and Landing Page"
description: "A practical guide to using the event loop, asynchronous I/O, streams, memory, profiling, workers, CI, and releases when building a demonstrable Node.js MVP."
status: published
---

# Node.js Below the Framework: Runtime Applied to an MVP and Landing Page

Node.js is not just Express, Nest, or another HTTP framework.

It is a runtime with its own execution, concurrency, I/O, memory, stream, module, error, and profiling rules.

When you know only the framework layer, you can build routes.

When you understand the runtime, you can answer questions such as:

- why does one heavy endpoint make the landing page feel slow?
- why can `async` code still block unrelated requests?
- why does loading a whole file work locally and fail in a public demo?
- why does cancelled work continue consuming resources?
- when do Promise handlers and callbacks run, and where can errors escape?
- when do worker threads help and when do they only add complexity?
- how do you prove that an optimization actually improved something?

In this cycle, the context is **MVP and landing page**.

The goal is to turn runtime knowledge into a first public release that works, can be demonstrated, and has explicit limitations.

The goal is not to build a complex platform.

The goal is to publish a `v0.1.0` where:

1. a Node backend delivers one real workflow;
2. a landing page explains the problem and links to the demo;
3. the code has automated tests;
4. CI runs tests and the build on pull requests;
5. important bottlenecks are measured;
6. the README is reproducible;
7. release limitations are documented.

> Understanding Node.js below the framework helps prevent a demo that works on one machine from becoming an unstable MVP as soon as it receives load, larger files, or concurrent requests.

<!-- VISUAL:
Landing -> Demo -> Node.js HTTP -> Event Loop
                               |-> Async I/O
                               |-> Streams
                               |-> Worker Thread
                               |-> Metrics
Below: CI -> build -> tests -> v0.1.0 release
-->

## The problem that guides the lab

Build a small demonstrable product.

Example:

> A tool that receives an incident file, processes the data, and returns a simple summary for analysis.

The first version may include:

- public landing page;
- file upload;
- processing endpoint;
- execution status;
- summarized result.

The MVP does not need:

- authentication;
- complex database;
- distributed queues;
- horizontal scaling;
- Kubernetes;
- AI;
- multi-tenancy.

The main flow can be:

```text
landing
 -> user opens demo
 -> uploads file
 -> backend processes
 -> result appears
```

It looks simple.

But this flow already allows you to study:

- Buffer;
- streams;
- filesystem;
- event loop;
- CPU;
- I/O;
- cancellation;
- errors;
- profiling;
- memory;
- native HTTP;
- fetch;
- CI;
- release.

## The naive version

```ts
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const server = createServer(
  async (request, response) => {
    if (request.url === "/health") {
      response.end("ok");
      return;
    }

    if (request.url === "/process") {
      const content =
        await readFile("./data/incidents.csv");

      const result =
        parseAndSummarize(content);

      response.setHeader(
        "content-type",
        "application/json",
      );

      response.end(
        JSON.stringify(result),
      );

      return;
    }

    response.statusCode = 404;
    response.end("not found");
  },
);

server.listen(3000);
```

This may work perfectly during development.

But it hides important questions.

### Question 1

Does the whole file need to be in memory?

### Question 2

Is `parseAndSummarize` CPU-bound?

### Question 3

What happens when two people process files at the same time?

### Question 4

Does `/health` remain responsive while processing?

### Question 5

If the client cancels the request, does the work continue?

### Question 6

How does the error reach the user?

### Question 7

How do you prove that the solution is acceptable for the `v0.1` scope?

Those questions define the lab.

## The Node.js process

Start by understanding the process.

```ts
console.log({
  pid: process.pid,
  version: process.version,
  uptime: process.uptime(),
  memory: process.memoryUsage(),
});
```

A Node process has:

- heap;
- stack;
- handles;
- sockets;
- loaded modules;
- event loop;
- operating-system integration;
- libuv integration.

In an MVP, this matters because the entire demo may run inside one process.

If that process blocks, the whole demo feels frozen.

## "Node is single-threaded" is a simplification

A better explanation:

- main JavaScript normally executes on one thread per isolate;
- the event loop controls when callbacks can execute again;
- network operations may be coordinated by the operating system;
- some operations use the libuv worker pool;
- `worker_threads` allow JavaScript to run in additional threads.

This explains why:

```ts
await fetch(url);
```

does not block a JavaScript thread waiting on the network.

But:

```ts
expensiveCalculation();
```

does block it.

Even inside:

```ts
async function run() {
  return expensiveCalculation();
}
```

`async` does not turn synchronous CPU work into parallel work.

## libuv and the thread pool

libuv is part of Node's asynchronous infrastructure.

Some operations use a thread pool.

Others rely on asynchronous operating-system mechanisms.

Avoid saying:

> "Every asynchronous operation goes to another thread."

That is inaccurate.

In the lab, create experiments involving:

- filesystem;
- crypto;
- network;
- JavaScript CPU work.

Observe the differences.

## Event loop

The event loop contains phases associated with callback categories.

A useful view includes:

- timers;
- pending callbacks;
- poll;
- check;
- close callbacks.

In addition:

- `process.nextTick`;
- Promise microtasks;
- `queueMicrotask`;

have their own scheduling rules.

The goal is not to memorize a picture.

The goal is to understand why certain operations delay others.

## Timer delayed by CPU

```ts
setTimeout(() => {
  console.log("timer");
}, 10);

const startedAt = Date.now();

while (
  Date.now() - startedAt < 1000
) {
  // intentional block
}
```

The timer does not execute in 10 ms.

It must wait until JavaScript releases the thread.

This connects runtime knowledge directly to the MVP.

If one processing route occupies two seconds of CPU:

```text
/health
/landing-data
/demo-status
```

may also wait.

## Microtasks

```ts
console.log("A");

Promise.resolve().then(() => {
  console.log("B");
});

console.log("C");
```

Output:

```text
A
C
B
```

The Promise handler does not interrupt the current stack.

## `process.nextTick`

```ts
process.nextTick(() => {
  console.log("nextTick");
});
```

`nextTick` has a special queue and may run before the event loop proceeds.

Recursive or excessive use may cause starvation.

Controlled example:

```ts
function starve(): void {
  process.nextTick(starve);
}
```

Do not run this uncontrolled.

It exists to demonstrate how priority can prevent the loop from progressing.

## `queueMicrotask`

When you only need a standard microtask, `queueMicrotask` is often a clearer userland primitive than using `nextTick` without a specific reason.

Compare them in small examples.

Do not build business logic that depends on fragile scheduling differences.

## `setImmediate` and `setTimeout`

```ts
setTimeout(() => {
  console.log("timeout");
}, 0);

setImmediate(() => {
  console.log("immediate");
});
```

Observed order can depend on context.

Inside an I/O callback, `setImmediate` has a clearer relationship with the `check` phase.

Study the behavior.

Do not turn the difference into a product contract.

## Promises

Promises model future completion or failure.

```ts
async function loadConfig(): Promise<Config> {
  const response =
    await fetch("/config");

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<Config>;
}
```

The caller decides where to handle failure.

## Asynchronous error handling

```ts
try {
  const result =
    await processFile();

  return result;
} catch (error) {
  // add context, map, or respond
}
```

Do not add `try/catch` everywhere.

Handle errors where there is enough context to decide:

- retry;
- cancellation;
- public message;
- logging;
- fallback;
- termination.

## Forgotten Promise

```ts
void saveAnalytics(event);
```

`void` only makes it explicit that the Promise is not awaited.

You still need an error policy.

Ask:

- can it fail silently?
- should it retry?
- can it delay the response?
- is it critical?
- should it be deferred?

## Cancellation with AbortController

In an MVP, the user may close the tab or cancel the upload.

The work may no longer have value.

```ts
const controller =
  new AbortController();

const timeout =
  setTimeout(() => {
    controller.abort();
  }, 5000);

try {
  const response =
    await fetch(url, {
      signal: controller.signal,
    });

  return await response.text();
} finally {
  clearTimeout(timeout);
}
```

Cancellation prevents unnecessary work.

## Propagate AbortSignal

```ts
type ProcessOptions = {
  signal?: AbortSignal;
};

async function processIncidentFile(
  path: string,
  options: ProcessOptions = {},
): Promise<Result> {
  // propagate signal
}
```

Do not implement cancellation only in the HTTP controller.

Inner operations need to cooperate.

## Cancellation and the MVP

Demonstrable scenario:

```text
user starts processing
 -> user cancels
 -> backend stops possible work
 -> UI returns to safe state
```

Test it.

That is stronger quality evidence than a beautiful landing page with a broken flow.

## Streams

For a small file:

```ts
const content =
  await readFile(path);
```

may be enough.

For a larger file:

```ts
createReadStream(path)
```

allows incremental processing.

## Readable

Produces data.

```ts
const source =
  createReadStream(path);
```

## Writable

Consumes data.

```ts
const destination =
  createWriteStream(output);
```

## Transform

Transforms chunks.

```ts
const normalize =
  new Transform({
    transform(
      chunk,
      encoding,
      callback,
    ) {
      callback(
        null,
        chunk.toString().toLowerCase(),
      );
    },
  });
```

## pipeline

```ts
import {
  pipeline,
} from "node:stream/promises";

await pipeline(
  source,
  transform,
  destination,
);
```

`pipeline` helps coordinate:

- flow;
- errors;
- cleanup.

## Backpressure

If the producer is faster than the consumer:

```text
producer >>> consumer
```

chunks may accumulate.

Streams include backpressure mechanisms.

When using a Writable manually:

```ts
const canContinue =
  writable.write(chunk);

if (!canContinue) {
  await once(
    writable,
    "drain",
  );
}
```

## Backpressure and the MVP

Imagine a 500 MB upload.

Without controlled flow:

```text
file -> full buffer -> transform -> response
```

Memory grows with the file.

With streams:

```text
chunk -> process -> release -> next chunk
```

Memory can remain more predictable.

Do not conclude:

> streams are always faster.

The main benefit may be memory.

## Buffer

Node uses `Buffer` for binary data.

```ts
const buffer =
  Buffer.from(
    "Node",
    "utf8",
  );
```

Use Buffer deliberately for:

- upload;
- hashing;
- parsing;
- protocols;
- files.

## Encoding

```ts
Buffer.byteLength(
  "Hello",
  "utf8",
);
```

Bytes are not necessarily equal to user-perceived characters.

This matters for upload limits.

## `Buffer.alloc`

```ts
const buffer =
  Buffer.alloc(1024);
```

initializes memory.

`Buffer.allocUnsafe` has different semantics and requires that the buffer be completely overwritten before exposure.

For an MVP, simplicity and safety usually matter more than premature micro-optimization.

## Filesystem

Use asynchronous APIs in hot paths.

```ts
import {
  readFile,
} from "node:fs/promises";
```

A synchronous operation:

```ts
readFileSync(...)
```

may be acceptable during startup.

Inside a concurrent request, it can block.

## `path`

Do not manually concatenate paths.

```ts
import path from "node:path";

const file =
  path.join(
    base,
    "uploads",
    name,
  );
```

## Path safety

Never use a user-supplied file name directly without validation.

Dangerous example:

```text
../../secret.txt
```

For uploads or reads, define:

- allowed directory;
- internally generated name;
- validation;
- size limit.

## Crypto

The MVP may need hashes for:

- deduplication;
- integrity;
- file identifier;
- token.

```ts
import {
  createHash,
} from "node:crypto";

const hash =
  createHash("sha256")
    .update(buffer)
    .digest("hex");
```

Do not invent cryptography.

Use established APIs and algorithms appropriate to the requirement.

## Native HTTP

Even if the product uses a framework, build one native HTTP lab.

```ts
createServer(...)
```

Study:

- request;
- response;
- headers;
- body;
- streams;
- timeout;
- abort;
- keep-alive.

This exposes what the framework abstracts.

## Simple endpoint

```ts
const server =
  createServer(
    async (
      request,
      response,
    ) => {
      if (
        request.method === "GET" &&
        request.url === "/health"
      ) {
        response.statusCode = 200;
        response.end("ok");
        return;
      }

      response.statusCode = 404;
      response.end();
    },
  );
```

## `fetch`

Use `fetch` for simple integrations.

```ts
const response =
  await fetch(
    "https://example.com/api",
    {
      signal,
    },
  );

if (!response.ok) {
  throw new Error(
    `Unexpected status ${response.status}`,
  );
}
```

HTTP 500 does not automatically reject the Promise.

You must interpret the protocol.

## Distinguish errors

- transport;
- timeout;
- abort;
- HTTP 4xx/5xx;
- invalid payload;
- invalid business rule.

That improves the landing/demo experience.

## CommonJS and ESM

CommonJS:

```js
const fs = require("node:fs");
```

ESM:

```ts
import fs from "node:fs";
```

They are not just different syntax.

Study:

- `type` in package.json;
- `.cjs`;
- `.mjs`;
- resolution;
- `exports`;
- `imports`;
- `import.meta`;
- dynamic import;
- interoperability.

## Make the choice explicit

Example:

```json
{
  "type": "module"
}
```

Use configuration consistent with:

- TypeScript;
- test runner;
- build;
- production execution.

## Test the real build

It is not enough that:

```bash
tsx src/main.ts
```

works.

Run:

```bash
npm run build
node dist/main.js
```

The release must work from the real artifact.

## CPU-bound versus I/O-bound

This distinction is central.

### CPU-bound

Time is dominated by computation.

Examples:

- heavy parsing;
- compression;
- transformation;
- algorithms;
- hashing at scale.

### I/O-bound

Time is dominated by waiting.

Examples:

- files;
- network;
- database;
- external API.

The solution depends on the nature of the work.

## Common mistake

```ts
async function heavy() {
  return heavyCalculation();
}
```

It is still CPU-bound.

`async` does not create another thread.

## Worker threads

For genuinely heavy JavaScript CPU work:

```ts
import {
  Worker,
} from "node:worker_threads";

const worker =
  new Worker(
    new URL(
      "./worker.js",
      import.meta.url,
    ),
  );
```

Workers enable parallelism.

But they cost:

- creation;
- memory;
- communication;
- serialization;
- coordination;
- error handling.

## One worker per tiny task

Creating a worker for:

```ts
1 + 1
```

is worse than executing locally.

For frequent work, a pool may be more appropriate.

In the MVP, use workers only when measurements justify them.

## First experiment: blocking

Create:

```text
/health
/process-cpu
```

`/process-cpu` runs heavy computation.

Measure `/health` under load.

Hypothesis:

> CPU on the main thread degrades `/health` latency.

## Then use a worker

Refactor:

```text
/process-cpu
 -> task runner
 -> worker
```

Measure again.

Record:

- latency;
- CPU;
- event loop delay;
- overhead;
- memory.

## Do not say "it became faster" without context

The individual task may take roughly the same time.

The benefit may be:

> the server remains responsive.

That is more valuable for the demo.

## Profiling

Profile before optimizing.

Example:

```bash
node --cpu-prof dist/server.js
```

Then generate load.

Ask:

- where is CPU concentrated?
- which function?
- how much time?
- was the hypothesis correct?

## Heap profiling

```bash
node --heap-prof dist/process-file.js
```

Use in a controlled environment.

Profiles can include process data.

Do not capture sensitive production data without policy.

## `process.memoryUsage`

```ts
const memory =
  process.memoryUsage();

console.log({
  rss:
    memory.rss,
  heapUsed:
    memory.heapUsed,
  external:
    memory.external,
});
```

Record during the file experiment.

## Event loop delay

```ts
import {
  monitorEventLoopDelay,
} from "node:perf_hooks";

const histogram =
  monitorEventLoopDelay({
    resolution: 20,
  });

histogram.enable();
```

Then:

```ts
console.log({
  p50:
    histogram.percentile(50) / 1e6,
  p99:
    histogram.percentile(99) / 1e6,
});
```

Use it to observe delay.

Do not use it alone to explain cause.

## Event loop utilization

```ts
import {
  performance,
} from "node:perf_hooks";

const utilization =
  performance
    .eventLoopUtilization();
```

Compare windows.

Do not convert arbitrary thresholds into universal rules.

## Load simulation

Do not generate load without a question.

Write:

```text
Hypothesis:
CPU-heavy processing degrades the light route.

Load:
20 concurrent calls to /process-cpu.

Observation:
health latency, CPU, event loop delay.

Environment:
machine, Node version, commit.
```

That makes measurement reproducible.

## Microbenchmark

Example:

```ts
const start =
  performance.now();

for (
  let i = 0;
  i < 100000;
  i += 1
) {
  parseLine(line);
}

console.log(
  performance.now() - start,
);
```

Useful for comparing local implementations.

Does not prove HTTP throughput.

## System benchmark

Measure:

- throughput;
- latency;
- p50;
- p95;
- p99;
- memory;
- CPU;
- errors.

You do not need every metric for every experiment.

Use what answers the hypothesis.

## Buffer versus stream experiment

Version A:

```ts
const content =
  await readFile(path);
```

Version B:

```ts
await pipeline(
  createReadStream(path),
  transform,
  writable,
);
```

Compare:

- time;
- RSS;
- external memory;
- concurrent behavior.

## A realistic demo

Generate files:

```text
1 MB
50 MB
200 MB
```

You do not need to test gigabytes if the machine is not suitable.

The goal is to observe trends.

## The MVP should define a limit

Example:

```text
v0.1 accepts files up to 50 MB.
```

That can be a product limit rather than a failure.

Document it.

## Limit test

```ts
test(
  "rejects file larger than v0.1 limit",
  async () => {
    // ...
  },
);
```

## Stream errors

Test:

- source failure;
- transform failure;
- destination failure;
- abort;
- timeout.

Do not test only the happy path.

## Unit tests

Use for:

- parser;
- transform;
- calculation;
- validation;
- mapping.

## Integration tests

Use for:

- real temporary filesystem;
- stream pipeline;
- worker;
- HTTP server.

## Contract test

Protect:

```json
{
  "status": "completed",
  "summary": {
    "rows": 100
  }
}
```

during refactoring.

## E2E

Flow:

```text
open demo
 -> upload file
 -> process
 -> show result
```

This is the most important test for `v0.1`.

## Cancellation test

Flow:

```text
start upload/processing
 -> cancel
 -> backend aborts
 -> UI shows cancelled
```

## UI state

Avoid:

```ts
type State = {
  loading: boolean;
  error?: string;
  result?: Result;
};
```

Use:

```ts
type State =
  | {
      kind: "idle";
    }
  | {
      kind: "uploading";
      progress: number;
    }
  | {
      kind: "processing";
    }
  | {
      kind: "success";
      result: Result;
    }
  | {
      kind: "cancelled";
    }
  | {
      kind: "error";
      message: string;
    };
```

The landing/demo now represents runtime state clearly.

## Simple setup

Another developer should be able to run:

```bash
git clone ...
npm install
npm run dev
```

or:

```bash
docker compose up
```

only if Docker is actually needed.

Do not require Docker for a simple app without reason.

## Environment documentation

README:

```text
Node:
supported LTS version

Install:
npm ci

Dev:
npm run dev

Test:
npm test

Build:
npm run build

Start:
npm start
```

## Environment variables

Provide:

```text
.env.example
```

Never publish a real secret.

Example:

```env
PORT=3000
MAX_UPLOAD_MB=50
```

## MVP landing page

Structure:

```text
Hero
Problem
How it works
Demo
What it measures
v0.1 limits
GitHub
Contact
```

## Hero

> Process incident files without freezing the server's main workflow.

Subtext:

> A Node.js MVP that demonstrates streaming, cancellation, profiling, and safer processing.

CTA:

```text
Try demo
```

Secondary:

```text
View GitHub
```

## Problem section

> Processing files works easily with small datasets. The challenge appears when size, concurrency, and CPU start affecting memory and responsiveness.

## Audience section

```text
For backend developers who want to understand
how runtime decisions affect a real delivery.
```

Adjust if your MVP targets another audience.

## Demo

Show:

- upload;
- processing;
- cancellation;
- result;
- health status.

Do not use internal console logs as the only evidence.

## Optional technical section

```text
What this demo proves:
- streams;
- backpressure;
- cancellation;
- worker for CPU;
- memory measurement;
- CI.
```

This may belong in a portfolio version rather than a product-facing landing page.

## v0.1 limitations

Example:

```text
- maximum upload size: 50 MB;
- single-process execution;
- no authentication;
- no permanent persistence;
- no distributed queue.
```

That demonstrates maturity.

## Contact CTA

```text
Want to discuss the experiment or reproduce the benchmark?
Get in touch.
```

## CI

Create:

```text
.github/workflows/ci.yml
```

Pipeline:

```text
install
 -> typecheck
 -> lint
 -> unit
 -> integration
 -> build
```

E2E can run if it is stable and inexpensive.

## Real build

CI should compile and run tests.

If possible, add a smoke test:

```text
build
 -> start
 -> GET /health
 -> stop
```

That proves the `dist` artifact works.

## Pull request

Each important change should show:

- problem;
- measurement;
- solution;
- tests;
- trade-off.

Example:

```text
perf: move CPU-heavy parser to worker
```

Description:

```text
Before:
health latency degrades under load.

Evidence:
event loop delay + profile.

Change:
worker task runner.

After:
health remains responsive in tested workload.

Cost:
worker overhead and more memory.
```

## Issue

```text
perf: file processing blocks health endpoint
```

Include:

- scenario;
- reproduction;
- Node version;
- file;
- load;
- expected result.

## Release v0.1.0

Scope:

```text
- public landing;
- controlled upload;
- streaming processing;
- cancellation;
- health endpoint;
- CPU-bound experiment;
- documented measurements;
- CI.
```

Do not include everything you studied.

Include what forms a demonstrable product.

## Release notes

```md
# v0.1.0

First public runtime-focused MVP.

## Included

- landing page
- file-processing demo
- streaming pipeline
- cancellation
- health endpoint
- automated tests
- CI

## Limits

- one process
- no authentication
- no distributed queue
- fixed upload limit

## Run

See README.
```

## Reproducible tag

Before creating the tag:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Then:

```text
v0.1.0
```

## README

Structure:

```text
# Name

Problem
Demo
v0.1 scope
How it works
Architecture
Runtime concepts
How to run
Tests
Profiling
Benchmarks
CI
Release
Limitations
English summary
```

## English summary

```md
## English summary

This project turns Node.js runtime concepts into a small public MVP.

The demo processes incident files while exploring event-loop behavior,
streaming, backpressure, cancellation, memory usage, and CPU-bound work.

The repository includes automated tests, CI, profiling instructions,
documented measurements, a landing page, and a reproducible v0.1.0 release.
```

## Repository structure

```text
node-runtime-mvp-lab/
  apps/
    api/
    web/
  packages/
    runtime/
    contracts/
  tests/
    unit/
    integration/
    contract/
    e2e/
  benchmarks/
    cpu/
    streams/
    load/
  docs/
    profiles/
      before/
      after/
    measurements/
    product/
      scope-v0.1.md
    release/
      v0.1.0.md
  .github/
    workflows/
      ci.yml
  README.md
```

## Runtime module

```text
packages/runtime/
  event-loop-metrics.ts
  memory-metrics.ts
  worker-runner.ts
  stream-processor.ts
```

Do not place everything in one controller.

## Experiment 1 — event loop

Create a script combining:

```text
sync
Promise
queueMicrotask
nextTick
setTimeout
setImmediate
I/O
```

Write your prediction first.

Then record the output.

Explain it.

## Experiment 2 — CPU

Version A:

```text
heavy parser on the main thread
```

Version B:

```text
parser in worker
```

Measure `/health`.

## Experiment 3 — streams

Version A:

```text
readFile
```

Version B:

```text
createReadStream + pipeline
```

Measure memory.

## Experiment 4 — cancellation

Start long processing.

Cancel it.

Measure:

- stop latency;
- memory;
- final state;
- temporary file cleanup.

## Experiment 5 — errors

Force:

- invalid file;
- stream failure;
- worker failure;
- timeout.

Verify the public response.

## Experiment 6 — CommonJS and ESM

Create the same small module in both formats.

Compare:

- import;
- build;
- tests;
- paths;
- tooling.

## Experiment 7 — load

Define a hypothesis.

Example:

> 10 concurrent jobs push RSS beyond the expected limit when using full-file buffering.

Test it.

Then stream it.

## Experiment 8 — microbenchmark

Compare two parsers.

Record:

- input;
- runs;
- environment;
- limited conclusion.

## Compare approaches

| Comparison | What to observe | Where it fails |
| --- | --- | --- |
| CPU on event loop vs. worker | responsiveness and overhead | event loop blocks; worker adds coordination |
| `readFile` vs. stream | memory and simplicity | buffering scales poorly; stream adds complexity |
| sequential I/O vs. concurrent I/O | duration and external limits | sequential wastes waiting time; unlimited concurrency saturates |
| `nextTick` vs. microtask | priority and clarity | `nextTick` can starve; microtask does not replace every special case |
| CommonJS vs. ESM | build and interoperability | CJS limits some modern conventions; ESM requires resolution discipline |
| microbenchmark vs. load | isolation and realism | microbenchmark does not represent the system; load hides cause |
| worker per task vs. pool | simplicity and overhead | one worker per task is expensive; pool requires management |
| buffer vs. pipeline | ease and memory | buffer consumes proportional memory; pipeline needs error/cancel handling |
| technical landing vs. focused landing | context and clarity | too technical scares users; too focused hides evidence |
| broad release vs. small v0.1 | scope and risk | broad release delays; small release needs explicit limits |

## Examples that should break

Create:

1. a blocked event loop;
2. a delayed timer;
3. a forgotten Promise;
4. cancellation not propagated;
5. a failing stream;
6. memory growth with buffering;
7. worker overhead on tiny tasks;
8. ESM resolution failure;
9. dev runner working while `dist` fails;
10. degraded health route under CPU load.

Each failure should become documentation.

## Measurement

Record:

```text
Node version:
OS:
CPU:
RAM:
commit:
dataset:
file size:
concurrency:
runs:
```

Without this, numbers lose meaning.

## Portfolio impact

Strong description:

> I built a public Node.js MVP for processing files and used it to study runtime behavior under controlled conditions. The first implementation loaded the entire file into memory and ran CPU-heavy parsing on the main thread. After measuring memory, event loop delay, and health-route latency, I refactored the flow to streaming and isolated heavy CPU work in a worker. The `v0.1.0` release includes tests, CI, a landing page, and documented benchmarks.

Avoid:

> "Optimized Node.js by 500%."

Without context, it says little.

## Practical article 1

### Title

**Node.js Below the Framework: Runtime Applied to an MVP and Landing Page**

Structure:

1. MVP problem;
2. minimal architecture;
3. event loop;
4. I/O;
5. CPU;
6. stream;
7. worker;
8. measurement;
9. trade-offs;
10. release.

Show how runtime knowledge changed the real demo.

## Practical article 2

### Title

**Event Loop, Promises, and Asynchronous Errors Explained with Tested Code**

Start with a common mistake:

```ts
async function heavy() {
  return expensiveCalculation();
}
```

Explain why it still blocks.

Then cover:

- Promise;
- microtask;
- nextTick;
- timer;
- immediate;
- error;
- cancellation.

Include tests.

## Practical article 3

### Title

**How to Measure Before Optimizing Node.js**

Choose a hypothesis:

> streaming reduces memory peak in the file-processing demo.

Or:

> a worker keeps the health route responsive during heavy computation.

Show:

- setup;
- benchmark;
- profiler;
- result;
- limitations.

Include:

```text
What this test does not prove
```

## Recommended format

800 to 1,500 words.

Structure:

1. introduction;
2. problem;
3. hypothesis;
4. code;
5. test;
6. measurement;
7. change;
8. new measurement;
9. trade-off;
10. limitation;
11. conclusion;
12. GitHub/demo.

## Technical English for interviews

> The first version processed the file in memory and performed CPU-heavy parsing on the main JavaScript thread. It worked with small examples, but the health endpoint became slower under concurrent load. I measured event loop delay and memory usage before changing the implementation.

Another:

> I replaced whole-file buffering with a stream pipeline because the memory peak increased with file size and concurrency. The trade-off was more complex error handling and cancellation.

Another:

> I used a worker only for the CPU-heavy part. Moving normal asynchronous I/O into a worker would not solve the same problem and would add unnecessary coordination overhead.

Another:

> The v0.1.0 release has an explicit file-size limit. I preferred a documented product limit over pretending the MVP could process arbitrary workloads.

Another:

> Every pull request runs type checking, linting, tests, and the production build. The release also documents the environment used for profiling so the measurements can be reproduced.

## Technical completion checklist

You have completed E020 when you can:

- explain the Node process;
- explain the limits of saying "Node is single-threaded";
- distinguish event loop, OS, libuv worker pool, and worker threads;
- explain timers, poll, check, and close callbacks;
- explain microtasks and `nextTick`;
- demonstrate ordering with code;
- use Promises;
- use async/await;
- handle asynchronous errors;
- propagate `AbortSignal`;
- implement cancellation;
- use Readable streams;
- use Writable streams;
- use Transform streams;
- use pipeline;
- explain backpressure;
- work with Buffer;
- use filesystem APIs;
- use path safely;
- use crypto deliberately;
- build a native HTTP server;
- use fetch;
- distinguish transport errors from HTTP status errors;
- compare CommonJS and ESM;
- execute the real build;
- distinguish CPU-bound from I/O-bound;
- use a worker when justified;
- produce a CPU profile;
- observe memory usage;
- measure event loop delay;
- simulate load;
- run a microbenchmark;
- explain benchmark limitations;
- write unit tests;
- write integration tests;
- write contract tests;
- write e2e tests;
- build a landing page;
- publish a demo;
- document v0.1 scope;
- configure CI;
- create a v0.1.0 release;
- document limitations;
- explain trade-offs in simple technical English.

## What you should take away from this cycle

Node.js stops being just an API tool when you understand the runtime.

In the context of an MVP and landing page, that knowledge should appear in a concrete delivery.

The landing page shows the problem.

The demo shows the behavior.

The runtime explains why the system behaves that way.

Tests protect the flow.

The profiler shows where cost exists.

Metrics prevent guess-based optimization.

CI protects every change.

The release defines a reproducible state.

The final result should show:

```text
problem
 -> demo
 -> runtime
 -> measurement
 -> decision
 -> tests
 -> CI
 -> landing
 -> release
```

You have completed E020 when you can publish a small Node.js MVP, reproduce its limits in a controlled way, explain what happens below the framework, measure the behavior, fix relevant bottlenecks, and clearly document what `v0.1.0` does and does not attempt to do.

## Primary references

- [Node.js — Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Node.js — Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Node.js — Process](https://nodejs.org/api/process.html)
- [Node.js — Timers](https://nodejs.org/api/timers.html)
- [Node.js — Streams](https://nodejs.org/api/stream.html)
- [Node.js — Buffer](https://nodejs.org/api/buffer.html)
- [Node.js — File System](https://nodejs.org/api/fs.html)
- [Node.js — Path](https://nodejs.org/api/path.html)
- [Node.js — Crypto](https://nodejs.org/api/crypto.html)
- [Node.js — HTTP](https://nodejs.org/api/http.html)
- [Node.js — Globals](https://nodejs.org/api/globals.html)
- [Node.js — CommonJS Modules](https://nodejs.org/api/modules.html)
- [Node.js — ECMAScript Modules](https://nodejs.org/api/esm.html)
- [Node.js — Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js — Performance Hooks](https://nodejs.org/api/perf_hooks.html)
- [Node.js — Test Runner](https://nodejs.org/api/test.html)
- [GitHub Actions](https://docs.github.com/actions)
- [GitHub Releases](https://docs.github.com/repositories/releasing-projects-on-github/about-releases)
