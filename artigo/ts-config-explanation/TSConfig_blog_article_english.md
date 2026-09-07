---
title: "TSConfig demystified"
description: "Understanding how TypeScript sees, analyzes, and builds a project."
slug: "/article/ts-config-explanation"
lang: "en"
tags: ["typescript", "tsconfig", "javascript", "beginners"]
---

# TSConfig demystified

> Understanding how TypeScript sees, analyzes, and builds a project.

<!-- VISUAL: Opening image for the article. Suggestion: a code editor with a tsconfig.json open, a few highlighted lines, and a clean background. Avoid generic “developer staring at multiple screens” imagery. -->

> **Who is this article for?**
>
> For anyone entering the TypeScript ecosystem who has already encountered a **tsconfig.json** but still does not understand why this file exists. The goal is not to memorize dozens of flags; it is to build a mental model that lets you open any configuration and begin to interpret it.

By the end of this article, you should be able to look at a TSConfig and answer three questions: which files are part of the project, how TypeScript should analyze them, and what happens to that code before it reaches the execution environment. That is the foundation. More advanced settings can come later.

## 1. Before TSConfig: what are we actually trying to configure?

If you have just discovered TypeScript, starting with the configuration file is a little like trying to understand a car dashboard before you know what the engine, fuel, and road are for. So the first step is to separate three things that are often mixed together at the beginning: JavaScript, TypeScript, and the compiler.

JavaScript is the language that browsers and environments such as Node.js execute. TypeScript grows on top of that world: you still write JavaScript logic, but you gain an analysis layer that can describe types, contracts, and relationships between values before the application runs.

_In JavaScript, the function accepts the values and its behavior is only determined at runtime:_

```ts
function sum(a, b) {
  return a + b;
}

sum(10, 20);
sum("10", 20);
```

In this example, JavaScript does not require the function to receive two numbers. The expression may add numbers or concatenate text, depending on the values it receives. In a tiny program this may look harmless.

In a larger application, however, discovering incompatibilities only after the code is already running makes the problem harder to locate. With TypeScript, we describe the expected contract to the type system:

```ts
function sum(a: number, b: number): number {
  return a + b;
}

sum("10", 20); // TypeScript reports the problem
```

The **: number** annotation is not a validation rule that will keep existing forever inside the running application. It is information used by TypeScript and development tools to analyze the program. In a traditional build, those type annotations are removed when the code is transformed into JavaScript.

### Diagram: The most important mental path in this article

1. **.ts code**: You write JavaScript + type information →
2. **TypeScript / tsc**: Analyzes the program and applies the configuration →
3. **JavaScript**: May be produced without the type annotations →
4. **Runtime**: Node.js or the browser executes JavaScript

> This flow is a teaching simplification. In modern projects, bundlers and frameworks may take over part of the transformation.

> **Related reading:** [What is JavaScript?](/blog/what-is-javascript)
>
> Before studying types, it helps to understand the language that will actually be executed.

> **Related reading:** [What is TypeScript?](/blog/what-is-typescript)
>
> An introduction to static typing, inference, and TypeScript’s relationship with JavaScript.

> **Related reading:** [JavaScript vs TypeScript](/blog/javascript-vs-typescript)
>
> Understand what changes - and, more importantly, what does not change - when TypeScript enters a project.

## 2. So what does “compiling” TypeScript mean?

The word “compile” can sound intimidating at first because it is often associated with a process far removed from web development. In TypeScript, it helps to split compilation into two ideas: checking the program and, when necessary, producing output files.

The first part is **type checking**. The compiler walks through the program, follows the known types, and produces diagnostics when it finds something incompatible. This step can happen without generating any file at all. That is exactly what **tsc --noEmit** does.

_Check types without generating JavaScript:_

```bash
npx tsc --noEmit
```

The second part is **emission**, or _emit_. When the configuration allows it, TypeScript can produce JavaScript, source maps, and, for libraries, type declaration files. Keeping these ideas separate matters because many React projects use TypeScript to analyze types while a tool such as Vite handles transformation and bundling.

> **Technical term, without the complication**
>
> A **build** is the process that prepares a project for execution or distribution. It may involve type checking, transformation, bundling, optimization, and copying files. TypeScript can take part in the build, but it does not need to perform every one of those steps by itself.

## 3. Why does tsconfig.json exist?

Now we can reach the problem TSConfig solves. Imagine a single **index.ts** file. You could call the compiler and pass options directly in the terminal. For an experiment, that is enough.

_A single file could be compiled like this:_

```bash
npx tsc index.ts --target ES2022 --module NodeNext --strict
```

But a real project stops being “one file” very quickly. Source folders, tests, external libraries, imports between modules, different environments, and compilation rules all appear. If those decisions existed only in terminal commands or in each developer’s memory, two machines could analyze the same repository in different ways.

The **tsconfig.json** puts those decisions inside the project itself. A useful way to understand it is as a technical contract: it tells the TypeScript ecosystem where the project boundary is and which rules should be considered when analyzing it.

### Diagram: TSConfig at the center of the project

1. **Project**: .ts/.tsx files, tests, and dependencies →
2. **tsconfig.json**: Describes the project configuration →
3. **TypeScript**: Finds files, resolves imports, and checks types →
4. **Result**: Diagnostics and/or generated files

> The file contains no business logic and does not “run” with the application. Its job is to guide analysis and build.

> **A distinction that prevents a lot of confusion**
>
> **package.json** and **tsconfig.json** live in the same project, but they do different jobs. package.json describes the package, scripts, and dependencies; TSConfig describes how TypeScript should understand and analyze the project.

## 4. What exactly is inside a tsconfig.json?

When you open a TSConfig, do not try to read every line as an isolated setting. First look for groups of responsibility. That immediately reduces the feeling that you are staring at a list of random words.

_A small configuration for learning might look like this:_

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

You do not need to know the meaning of every property from memory. For now, notice the structure. **compilerOptions** groups rules about TypeScript’s behavior. **include** and **exclude** help define which files are part of the project’s initial discovery.

### Diagram: Read the file as questions, not as flags

1. **Files**: Which files belong to the project? →
2. **Types**: How strict should the analysis be? →
3. **Environment**: Which JavaScript level and APIs exist? →
4. **Modules**: How should imports be interpreted? →
5. **Output**: What should be generated, and where?

> When you encounter a new option, first identify which of these questions it answers.

## 5. compilerOptions: the block that describes behavior

Most of the properties that catch your eye in a TSConfig live inside **compilerOptions**. The name is literal: these are compiler options. They can affect type analysis, the assumed environment, module resolution, or generated output.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true
  }
}
```

For a beginner, it is enough to know a few options as landmarks. Not because they are the only important ones, but because they help you recognize the different categories inside the file.

### strict: asking for more rigorous analysis

**strict** enables a family of strict checks. Instead of thinking of it as “a flag that makes TypeScript harder,” think of it as a project decision: we want the compiler to be more demanding when it finds situations that could hide type-related bugs.

Later, you can study checks such as **noImplicitAny** and **strictNullChecks** individually. In this article, it is enough to know that strict belongs to the group of rules that determines how careful static analysis should be.

> **Related reading:** [What does strict actually enable?](/blog/typescript-strict)
>
> A dedicated article can show, through small real errors, what changes when strict mode enters a project.

### target: which JavaScript are we aiming for?

**target** is related to the JavaScript version treated as the compilation destination. A modern environment may understand syntax that an older environment does not. This option helps TypeScript decide which level of JavaScript should be considered during transformation.

```json
{
  "compilerOptions": {
    "target": "ES2022"
  }
}
```

There is no universally “best” value. The choice depends on the real environment: your Node.js version, supported browsers, build tool, and distribution strategy. The key idea is not to confuse **target** with modules: target is about the JavaScript language level; **module** is about the module system.

### module and moduleResolution: similar names, different problems

This is one of the most common sources of confusion. When you write an **import**, there are actually two separate questions. The first is how the module system should be interpreted or emitted. The second is how the compiler finds the file or package that the import refers to.

_A seemingly simple line creates several questions for the compiler:_

```ts
import { createUser } from "./users";
```

Which file corresponds to **./users**? Which extensions should be considered? Is there a package.json with export rules? Are we using CommonJS, ESM, or a project processed by a bundler? **moduleResolution** is related to finding and resolving modules; **module** is related to the module system itself.

> **Do not try to master the whole topic here**
>
> Modules are large enough to deserve their own article. At this point, the goal is simply to recognize that **module** and **moduleResolution** are not synonyms.

> **Related reading:** [CommonJS, ESM, import, and export](/blog/javascript-modules)
>
> An introduction to module systems in the JavaScript and Node.js ecosystem.

## 6. rootDir and outDir: where code comes from and where it can go

These two properties are especially useful for learning because they make the build easier to visualize. **rootDir** helps describe the expected source-code structure. **outDir** indicates the directory where emitted files should be written.

### Diagram: Before and after a simple compilation

1. **src/**: TypeScript source: index.ts, services/, controllers/ →
2. **tsc + tsconfig**: Analyzes and, when allowed, emits files →
3. **dist/**: Generated JavaScript while preserving relevant structure

> In a simple backend, it is common to see a src → dist relationship. In other projects, another tool may own that output.

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

This does not mean **rootDir** alone chooses every file that belongs to the project. File selection is still related to **files**, **include**, **exclude**, and the import graph. That distinction matters: one property describes structure, while others participate in program discovery.

## 7. include and exclude: drawing the project boundary

When TypeScript analyzes a project, it needs to discover which files form that unit. **include** uses patterns to say where initial files should be searched for. **exclude** removes paths from that discovery. This is why TSConfig also acts as a kind of project boundary.

```json
{
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

The pattern **src/**/*.ts** can be read simply as “consider TypeScript files inside src, including subfolders.” node_modules and dist are removed from the initial discovery because they usually represent installed dependencies and build output.

There is one detail that often surprises beginners: **exclude** is not an absolute wall. If a file is needed because another project file imports it, that file can still become part of the program. The right way to think about exclude is as an adjustment to the initial discovery, not as a security rule that prevents imports.

<!-- VISUAL: Illustration: the project boundary. Suggestion: a folder tree with src/ highlighted inside the project boundary, dist/ and node_modules/ outside it, plus an import arrow showing that dependencies can expand the analyzed graph. -->

## 8. How does TypeScript find your tsconfig.json?

When you run **npx tsc** without specifying individual files, the compiler looks for a project configuration. It starts in the current directory and may walk up the directory tree until it finds a **tsconfig.json**. From that point on, the discovered configuration defines the files and options used by the compilation.

_Even from inside src, the compiler can find the configuration above:_

```text
my-project/
├── tsconfig.json
├── package.json
└── src/
    └── index.ts

$ cd my-project/src
$ npx tsc
```

This idea explains a classic mistake: running **npx tsc file.ts** and concluding that TSConfig was ignored. When you pass files directly on the command line, the execution context changes and no longer represents the normal configured-project workflow. To test the project configuration, prefer **npx tsc** or explicitly select the project with **-p**.

_Explicitly select a project:_

```bash
npx tsc -p tsconfig.json
```

> **A diagnostic command worth remembering**
>
> **npx tsc --showConfig** prints the effective configuration. It is one of the first commands to run when you believe TypeScript is using different options from the ones you expected.

## 9. Creating your first TypeScript project with intention

Now that the main pieces make sense, creating a project from scratch stops being a sequence of copied commands. Each command has a clear job.

_Start by creating the package, installing TypeScript locally, and generating the configuration:_

```bash
mkdir tsconfig-lab
cd tsconfig-lab
npm init -y
npm install --save-dev typescript
npx tsc --init
mkdir src
```

Installing TypeScript locally matters because it records a version inside the project. That way, your machine, another developer’s computer, and the continuous-integration pipeline can work with the version declared by the repository instead of depending on a different global installation in each environment.

_Your first file can be minimal:_

```ts
// src/index.ts
const message: string = "Hello, TypeScript";
console.log(message);
```

When you run **npx tsc**, the compiler finds the TSConfig, builds the program, resolves the required files, checks syntax and types, and — if emission is enabled — produces output. In a simple backend, you can then execute the generated JavaScript with Node.js.

```bash
npx tsc
node dist/index.js
```

## 10. What happens when you run npx tsc?

It is worth opening the black box for a few minutes. You do not need to know the compiler’s internal implementation to use TypeScript, but seeing the steps makes errors and configuration choices easier to interpret.

> **1. Locate the configuration**
>
> The compiler finds the selected TSConfig and calculates the effective configuration.

> **2. Discover files**
>
> include, files, and imports help form the set of files that make up the program.

> **3. Resolve modules and types**
>
> Every import must be associated with a file or package; libraries and visible type declarations are loaded as well.

> **4. Analyze syntax and types**
>
> TypeScript connects names, declarations, and types and checks whether operations are compatible.

> **5. Produce diagnostics**
>
> Configuration, syntax, resolution, and type problems appear as compiler messages.

> **6. Emit, when allowed**
>
> If the configuration permits it, the compiler can generate JavaScript and other artifacts.

This sequence also shows why “TypeScript compiled successfully” does not mean “the application is safe in production.” Types are a static-analysis tool. HTTP request data, permissions, databases, business rules, and security still require runtime validation.

## 11. Node.js and React can use the same TypeScript differently

One reason copying a TSConfig from another project creates confusion is that the compiler’s role changes with the environment. In a simple Node.js backend, **tsc** may check types and also generate JavaScript in dist. In a modern React application, TypeScript may mainly be used as a type analyzer while Vite or another tool transforms and bundles the code.

### Diagram: Two common flows

1. **Node.js**: src/*.ts → tsc + TSConfig → dist/*.js → Node.js →
2. **React + Vite**: src/*.tsx → TypeScript for types + Vite/esbuild for transformation and bundle

> The same configuration file participates in different contexts; that is why there is no universal TSConfig.

In the second scenario, you will often see **"noEmit": true**. TypeScript continues analyzing the project, but it does not generate JavaScript in that run because another tool has already taken responsibility for transforming and packaging the code.

```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

> **Related reading:** [Runtime, compiler, and bundler](/blog/runtime-compiler-bundler)
>
> A dedicated explanation helps separate who analyzes, who transforms, and who actually executes the code.

## 12. The commands that really help in day-to-day work

Instead of memorizing a list of options, it is more useful to remember a few commands that let you observe the project. They turn TSConfig from a “magic” file into something you can investigate.

```bash
npx tsc
# uses the configured project and compiles according to TSConfig

npx tsc --noEmit
# checks types without generating files

npx tsc -p tsconfig.json
# explicitly selects a configuration

npx tsc --showConfig
# prints the effective configuration

npx tsc --listFiles
npx tsc --explainFiles
# helps explain which files became part of the project
```

These commands are useful because they answer real questions: “which configuration is active?”, “why is this file being analyzed?”, “can I check types without generating a build?”. They teach you more about the project than simply copying additional flags.

## 13. Confusions you can avoid from the beginning

Some mistakes repeat because different tools work on the same project. Knowing them now prevents you from assigning responsibilities to TSConfig that it does not actually have.

> **Node.js reads my TSConfig**
>
> Usually, it does not. Node.js executes JavaScript and has its own module and resolution rules. TSConfig is read by TypeScript and by tools integrated with the TypeScript ecosystem.

> **If paths works in my editor, it will work at runtime**
>
> Not necessarily. A tool may understand an alias for type analysis, but the runtime or bundler also needs to know how to resolve that path.

> **target and module are the same thing**
>
> target is related to the JavaScript language level used as the destination; module is related to the module system.

> **If TypeScript reports no error, my API input is safe**
>
> Types disappear from the generated JavaScript. External data still needs real runtime validation.

> **There is a ready-made TSConfig that works for every project**
>
> A configuration that is appropriate for a library may be wrong for a Node.js API or an application created with Vite. Configuration needs to match the environment and the tools.

## 14. A small lab to turn theory into understanding

The best way to consolidate this article is to watch TSConfig change the behavior of a minimal project. It does not need to be a large exercise. The goal is to create a situation, run the compiler, and understand why the result changed.

### 1. Prepare a small project:

```bash
mkdir tsconfig-foundations
cd tsconfig-foundations
npm init -y
npm install -D typescript
npx tsc --init
mkdir src
```

### 2. Use a small configuration so the responsibilities are easy to see:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Create two files that import each other:

```ts
// src/greeting.ts
export function greet(name: string) {
  return `Hello, ${name}`;
}

// src/index.ts
import { greet } from "./greeting.js";
console.log(greet("TypeScript"));
```

Now run **npx tsc --showConfig** to inspect the effective configuration and **npx tsc --explainFiles** to investigate why each file was included. Then run **npx tsc --noEmit** and finally **npx tsc**. You will see the difference between only checking and actually allowing emission.

### 4. Finally, create an intentional type error:

```ts
console.log(greet(123));
```

When you run **npx tsc --noEmit**, the problem appears before the application runs. That experience summarizes much of TypeScript’s value: turning some classes of mistakes into diagnostics during development instead of late discoveries at runtime.

## 15. The mental model worth carrying into the next articles

After this first contact, TSConfig should no longer look like a list of secret commands. It is a description of how TypeScript should see your project. Some properties define the file boundary; others define how strict the analysis is; others describe the environment, modules, or output.

When you encounter a new option, avoid starting with “should I add this to my TSConfig?”. Begin with better questions: what problem does this option solve? Does it change analysis, module resolution, or emission? Who actually reads this option? Does it make sense for the environment where my code will run?

> **The goal is not to memorize flags**
>
> You become comfortable with TSConfig when you learn to investigate configuration as you need it. A modern project may have more than one TSConfig, and frameworks may generate their own options. The durable skill is understanding responsibilities and diagnosing project behavior.

## Suggested next readings

> **Related reading:** [JavaScript: what actually gets executed?](/blog/what-is-javascript)
>
> The foundation for understanding why TypeScript does not replace the runtime.

> **Related reading:** [TypeScript: types, inference, and static analysis](/blog/what-is-typescript)
>
> What TypeScript adds to JavaScript development.

> **Related reading:** [strict without fear](/blog/typescript-strict)
>
> How strict mode changes the analysis of your code.

> **Related reading:** [target and JavaScript versions](/blog/typescript-target)
>
> How to connect TSConfig to the destination environment.

> **Related reading:** [Modules: CommonJS, ESM, and NodeNext](/blog/typescript-modules)
>
> The context you need to understand module and moduleResolution.

> **Related reading:** [include, exclude, and the project graph](/blog/typescript-include-exclude)
>
> How TypeScript decides which files are part of the program.

## A quick glossary for the next articles

**Build** — The process that prepares a project for execution or distribution. It may include type checking, transformation, bundling, optimization, and copying files.

**Compiler** — A program that analyzes and/or transforms code. In TypeScript, the official compiler is tsc.

**Diagnostic** — A message produced by the compiler about configuration, syntax, resolution, or types.

**Emit / emission** — The generation of output files by TypeScript.

**Project boundary** — The set of files considered part of the same TypeScript program.

**Module resolution** — The process of discovering which file or package an import refers to.

**Runtime** — The environment where JavaScript is actually executed, such as Node.js or a browser.

**Type checking** — Static verification of type relationships before execution.

**tsc** — The official TypeScript compiler executable.

**tsconfig.json** — The file that defines the files and options of a TypeScript project.

## Technical references used in the source materials

The two source PDFs were built from the official TypeScript documentation. For the published version of the article, these links can remain in a short references section at the end:

- [What is a tsconfig.json?](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [Complete TSConfig reference](https://www.typescriptlang.org/tsconfig/)
- [tsc compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [Download TypeScript](https://www.typescriptlang.org/download/)
- [TypeScript 5.9 - changes to tsc --init](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)

<!-- EDITORIAL NOTE: This Markdown was adapted from the visual PDF simulation. Comments labeled VISUAL indicate places where an illustration, screenshot, or diagram can strengthen understanding without interrupting the narrative. -->
