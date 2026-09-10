
title: "JavaScript and TypeScript Demystified: What They Are, Why They Exist, and What Is the Difference?"
slug: "/article/js-ts-demystified"
description: "A beginner-friendly guide to JavaScript, TypeScript, their history, where they are used, how they relate to each other, and when each one makes sense."
language: "en"
tags:
  - JavaScript
  - TypeScript
  - Programming
  - Web Development
  - Beginners


# JavaScript and TypeScript Demystified: What They Are, Why They Exist, and What Is the Difference?

If you are starting to learn programming, you will probably encounter the names **JavaScript** and **TypeScript** very early.

You may find a React course that uses TypeScript. Then you may see a Node.js tutorial written in JavaScript. Somewhere else, someone may tell you that TypeScript is "JavaScript with types."

At that point, it is completely normal to have several questions:

> Are JavaScript and TypeScript different languages?  
> Do I need to learn JavaScript before TypeScript?  
> Does TypeScript replace JavaScript?  
> Where is each one used?  
> Why does TypeScript exist if JavaScript already works?  
> Which one should I use?

This article was written to answer those questions **without assuming that you already know programming**.

The goal is not to teach the entire JavaScript syntax or the entire TypeScript type system. The goal is to build a clear mental model.

By the end of this article, you should understand:

- what JavaScript is;
- why JavaScript was created;
- where JavaScript can be used;
- what TypeScript is;
- why TypeScript was created;
- how TypeScript relates to JavaScript;
- what dynamic typing and static analysis mean;
- where each technology is applied;
- the main advantages and disadvantages of each one;
- and what learning path makes sense from here.



## First: what is a programming language?

Before talking about JavaScript or TypeScript, we need to understand what it means to call something a **programming language**.

A computer does not directly understand a sentence such as:

> "When the person clicks this button, open the menu."

We need to represent that intention through instructions that some piece of software can process.

A programming language gives us an organized way to write those instructions.

For example:

```js
const name = "Ana";

console.log(`Hello, ${name}!`);
```

Even if you have never programmed before, you can probably guess what this small piece of code is trying to do.

It stores the text `"Ana"` in a variable called `name` and then prints:

```text
Hello, Ana!
```

The goal of a programming language is to let us describe behavior in a way that is precise enough for a computer to process.

<!-- VISUAL:
Simple three-step illustration:

Person
  ↓ writes instructions
Code
  ↓ executed by an environment
Computer

Caption: "A programming language is a bridge between human intention and instructions that a machine can process."
-->



# Part 1 — What is JavaScript?

## JavaScript is a programming language

**JavaScript**, often shortened to **JS**, is a programming language.

It became especially famous because it allowed websites to move beyond static documents and start responding to user actions.

Imagine a page with a button:

```text
[ Open menu ]
```

Without programmed behavior, that button may simply do nothing.

With JavaScript, we can describe what should happen when it is clicked:

```js
const button = document.querySelector("#open-menu");

button.addEventListener("click", () => {
  console.log("The menu should open.");
});
```

Do not worry about understanding every symbol in this code yet.

The main idea is:

> JavaScript lets us write behavior.

It can react to a click, process information, perform calculations, request data from an API, change elements on a page, run code on a server, and much more.



## HTML, CSS, and JavaScript: what does each one do?

In a traditional web application, three technologies appear very often.

**HTML** describes structure.

**CSS** describes appearance.

**JavaScript** describes much of the behavior.

A simple analogy is to imagine a house.

HTML would be the structure: walls, doors, and rooms.

CSS would be the appearance: colors, sizes, and decoration.

JavaScript would be part of the behavior: turning on a light when a switch is pressed, opening an automatic door, or controlling an electronic system.

This analogy does not represent every technical detail, but it is a useful first mental model.

<!-- VISUAL:
Card divided into three columns:

HTML
"structure"
Examples: title, button, form

CSS
"appearance"
Examples: colors, spacing, layout

JavaScript
"behavior"
Examples: clicks, validation, requests, UI updates
-->



## A short history of JavaScript

JavaScript was created in **1995** at Netscape, one of the companies behind important browsers during the early web.

The language was created by **Brendan Eich**.

Its original goal was to allow web pages to run small pieces of behavior inside the browser.

During development, the language went through names such as **Mocha** and **LiveScript** before receiving the name JavaScript.

In 1997, the language began to be standardized. That standardization gave us the name **ECMAScript**, which you will still encounter when studying JavaScript.

That is why you may see names such as:

```text
ES2015
ES2020
ES2022
ESNext
```

The `ES` comes from **ECMAScript**.

JavaScript is the name of the language we use every day. ECMAScript is the standard that describes much of how the language behaves.

<!-- VISUAL:
Simplified timeline:

1995
JavaScript is created at Netscape
        ↓
1997
First ECMAScript standardization
        ↓
Following years
The language evolves with new versions
        ↓
2009
Node.js helps popularize JavaScript outside the browser
        ↓
Today
Web, servers, applications, tools, and many other environments
-->

### Related reading

[What Is ECMAScript and Why Do ES2015, ES2020, and ESNext Exist?](/blog/what-is-ecmascript)



## Does JavaScript only work on websites?

No.

This is one of the most important ideas for a beginner.

JavaScript became famous inside browsers, but today it is used in many other places.

To understand that, we need one new term: **runtime**.



## What is a runtime?

A JavaScript file contains code.

For example:

```js
const message = "Hello, world!";

console.log(message);
```

But the file does not "run" by itself.

It needs an environment that knows how to understand and execute those instructions.

That environment is called a **runtime**.

Browsers contain engines that can execute JavaScript.

There is also **Node.js**, which allows JavaScript to run outside a web page.

We can imagine it like this:

```text
                 JavaScript
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
        Browser               Node.js
          ↓                     ↓
   Web application       server, script,
                         tool, API...
```

This distinction matters because **JavaScript is the language**, while browsers and Node.js are environments where that language can be executed.

### Related reading

[Runtime, Compiler, and Build: What Do These Terms Mean?](/blog/runtime-compiler-build)



## JavaScript in the browser

Inside a browser, JavaScript can interact with features provided by that environment.

One example is `document`.

```js
const title = document.querySelector("h1");

title.textContent = "New title";
```

Here, JavaScript is used to find an element on the page and change its content.

The browser also provides features such as:

```text
document
window
localStorage
fetch
setTimeout
```

An important detail is that **not all of these features belong to the JavaScript language itself**.

Many are APIs provided by the browser.

This means that the language and the execution environment work together.

<!-- VISUAL:
Layer diagram:

Web Application
      ↑
Browser APIs
document | window | fetch | localStorage
      ↑
JavaScript
      ↑
Browser JavaScript engine
-->



## JavaScript on the server with Node.js

For many years, JavaScript was strongly associated with the browser.

That changed significantly with the growth of **Node.js**, released in 2009.

Node.js made it common to execute JavaScript on servers, in scripts, and in development tools.

For example, we can create a file:

```js
// index.js
console.log("Running JavaScript with Node.js");
```

And execute it:

```bash
node index.js
```

Now JavaScript is not controlling a page open in a browser.

It is being executed by Node.js.

This helped JavaScript expand into many more areas of software development.

Today it can appear in:

- web interfaces;
- backends;
- APIs;
- automation;
- command-line tools;
- mobile applications;
- desktop applications;
- serverless functions;
- tests;
- tools used by other developers.

This does not mean JavaScript is always the best technology for every one of these scenarios. It simply means its ecosystem allows it to be used in many environments.



# How does JavaScript work with values?

Look at this code:

```js
let age = 20;
```

We created a variable called `age` and stored the number `20` in it.

Later, JavaScript allows us to write:

```js
age = "twenty";
```

Now the same variable contains text.

This introduces an important concept.



## JavaScript is dynamically typed

Values have types.

For example:

```js
const name = "Ana";      // string
const age = 20;          // number
const active = true;     // boolean
```

`"Ana"` is text.

`20` is a number.

`true` is a logical value.

JavaScript understands these types while the program runs, but it usually does not require you to declare in advance:

> "This variable can only contain numbers."

This is related to JavaScript being **dynamically typed**.

For example:

```js
let value = 10;

value = "now I am text";
```

JavaScript allows this change.

That flexibility can be very useful.

On the other hand, it also means that some mistakes may only become obvious when a certain part of the program is executed.



## An example of the kind of problem that can appear

Consider:

```js
function add(a, b) {
  return a + b;
}
```

We can call:

```js
add(10, 20);
```

The result will be:

```text
30
```

But we can also call:

```js
add("10", "20");
```

And get:

```text
1020
```

This happens because the `+` operator can also concatenate text.

JavaScript does not know that our intention was to accept numbers only.

This idea is fundamental:

> Code can be valid JavaScript and still not represent what the programmer intended.

This kind of problem — especially in large systems — helped motivate the use of stronger analysis tools.

This is where TypeScript enters the story.



# Part 2 — What is TypeScript?

## TypeScript was built on top of JavaScript

**TypeScript**, often shortened to **TS**, is a language built on top of JavaScript.

A simple way to begin understanding it is:

```text
JavaScript
    +
type system
    +
analysis before execution
    =
TypeScript
```

This model is simplified, but it captures an essential idea.

When you program in TypeScript, you still use most of what exists in JavaScript:

```text
variables
functions
objects
arrays
classes
promises
if
for
map
filter
import
export
...
```

TypeScript adds features that help us **describe and verify the intent of the code more clearly**.



## A short history of TypeScript

As JavaScript began to be used in larger applications, teams faced a natural challenge: large projects have many functions, objects, modules, and relationships between data.

The larger the system becomes, the harder it can be to remember or discover what shape each part of the code expects.

Microsoft began developing TypeScript to help with this kind of problem.

TypeScript was publicly announced in **2012**, and **Anders Hejlsberg**, also known for his work on languages such as C#, was one of the main figures behind its development.

The goal was not to eliminate JavaScript.

The goal was to let developers continue using JavaScript and its ecosystem while adding tools that could improve analysis and maintainability.

<!-- VISUAL:
Timeline:

1995
JavaScript
   ↓
Web applications grow in size and complexity
   ↓
2012
Microsoft introduces TypeScript
   ↓
TypeScript evolves alongside JavaScript
   ↓
Today
Widely used in frontend, backend, libraries, and large codebases
-->



# TypeScript does not replace JavaScript

This is probably the most important sentence in the article:

> **TypeScript does not exist to replace JavaScript. It exists on top of JavaScript.**

Consider this JavaScript function:

```js
function greet(name) {
  return `Hello, ${name}`;
}
```

In TypeScript we can write:

```ts
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

The logic is still the same.

The difference is in these parts:

```ts
name: string
```

and:

```ts
): string
```

We are providing extra information about our intention.

The first one says:

> `name` should be a string.

The second one says:

> this function should return a string.

TypeScript can analyze this information before the program runs.



# But what is a type?

A **type** describes characteristics of a value.

For example:

```ts
const name: string = "Ana";
const age: number = 20;
const active: boolean = true;
```

We have three different types:

```text
string  → text
number  → number
boolean → true or false
```

This helps tools understand which operations make sense.

For example:

```ts
const age: number = 20;

age.toUpperCase();
```

`toUpperCase()` is an operation used with strings.

A number does not provide that behavior.

TypeScript can identify this incompatibility while analyzing the code.

<!-- IMAGE:
Suggested VS Code screenshot showing:

const age: number = 20;
age.toUpperCase();

With `toUpperCase()` underlined in red and the TypeScript tooltip explaining that the property does not exist on `number`.
-->



# Back to the addition example

In JavaScript we had:

```js
function add(a, b) {
  return a + b;
}

add("10", 20);
```

If our intention is to work with numbers only, TypeScript allows us to write:

```ts
function add(a: number, b: number): number {
  return a + b;
}

add("10", 20);
```

Now TypeScript can warn us:

```text
"10" is a string.
The function expected a number.
```

Notice that TypeScript did not have to wait for the application to run before finding the problem.

This leads us to another concept.



# What is static analysis?

**Static analysis** means analyzing characteristics of a program without depending on executing every possible path through that code.

In this example:

```ts
function double(value: number): number {
  return value * 2;
}

double("ten");
```

TypeScript already knows the function contract:

```text
input: number
output: number
```

So `"ten"` can be identified as incompatible before execution.

We can visualize the process like this:

```text
TypeScript code
       ↓
Type analysis
       ↓
Problems found
       ↓
Transformation / build
       ↓
JavaScript
       ↓
Runtime
```

This analysis does not make the program perfect.

It simply allows us to find **an important category of problems earlier**.



# Does TypeScript prevent every bug?

No.

This is a common misunderstanding among beginners.

Consider:

```ts
function divide(a: number, b: number): number {
  return a / b;
}

divide(10, 0);
```

The types are correct.

`10` is a number.

`0` is a number.

Even so, dividing by zero may not make sense for the rules of your application.

Another example:

```ts
function calculateDiscount(price: number): number {
  return price * 10;
}
```

Maybe the intention was to calculate a 10% discount, but the formula is wrong.

TypeScript cannot know every business rule.

So:

```text
type checking
      ≠
no bugs
```

We still need:

- tests;
- validation;
- error handling;
- business rules;
- security;
- code review;
- monitoring.

> TypeScript increases the amount of information we can verify before execution, but it does not replace software engineering.



# What happens to types when the program runs?

Consider:

```ts
const user: string = "Ana";
```

In a traditional transformation to JavaScript, the result will look similar to:

```js
const user = "Ana";
```

The information:

```ts
: string
```

is used by TypeScript during analysis, but it does not remain as an automatic runtime validation in the final JavaScript.

Another example:

```ts
interface User {
  name: string;
  age: number;
}
```

An `interface` helps TypeScript understand the expected shape of an object.

However, it does not automatically become a validation function running in production.

This matters a lot in APIs.

Imagine that we expect:

```ts
interface User {
  age: number;
}
```

But a server receives:

```json
{
  "age": "twenty"
}
```

Having a TypeScript interface does not convert `"twenty"` into a number and does not automatically reject the data.

External data still needs to be validated at runtime.

### Related reading

[TypeScript at Runtime: Why Types Do Not Validate an API by Themselves](/blog/typescript-runtime-validation)



# What transforms TypeScript?

The official TypeScript compiler is called:

```text
tsc
```

We can install TypeScript in a project and run:

```bash
npx tsc
```

The compiler can:

- analyze types;
- find incompatibilities;
- understand project configuration;
- and, depending on configuration, generate JavaScript.

This is where another important file appears:

```text
tsconfig.json
```

The `tsconfig.json` file tells TypeScript how it should understand the project.

It can answer questions such as:

```text
Which files belong to the project?
What JavaScript version are we targeting?
How should modules work?
How strict should type checking be?
Should TypeScript generate files?
```

### Recommended next reading

[TSConfig Demystified: Understanding the Configuration of a TypeScript Project](/blog/tsconfig-demystified)



# Part 3 — JavaScript vs TypeScript

Now that we understand both, we can compare them without oversimplifying.



## The main relationship

Many people imagine:

```text
JavaScript  OR  TypeScript
```

But a better mental model is:

```text
┌──────────────────────────────────────┐
│              TypeScript              │
│                                      │
│     types + analysis + tooling       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │          JavaScript            │  │
│  │ logic, syntax, and ecosystem   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

When you learn TypeScript, you still need to understand JavaScript.

TypeScript adds an extra layer of information and checking.



# The difference in a practical example

## JavaScript

```js
function calculateTotal(price, quantity) {
  return price * quantity;
}

calculateTotal("ten", 2);
```

The code may reach execution before we discover that `"ten"` does not represent the value we expected.

## TypeScript

```ts
function calculateTotal(
  price: number,
  quantity: number
): number {
  return price * quantity;
}

calculateTotal("ten", 2);
```

Now the editor and compiler can detect the incompatibility before execution.

The function logic is still almost the same.

What changed is the amount of information available about the code's intent.



# JavaScript is dynamic; TypeScript adds static checking

Consider JavaScript:

```js
let value = 10;

value = "ten";
```

This is allowed.

Now TypeScript:

```ts
let value: number = 10;

value = "ten";
```

TypeScript sees that we declared `value` as a `number` and reports that `"ten"` is a `string`.

The difference is not simply:

```text
JavaScript has no types.
TypeScript has types.
```

JavaScript also has value types.

The main difference is **how and when type information is used to check the program**.

JavaScript is dynamically typed.

TypeScript adds a type system that is analyzed statically during development.



# TypeScript does not require type annotations everywhere

A beginner may open a TypeScript project and imagine that every variable must be written like this:

```ts
const name: string = "Ana";
const age: number = 20;
const active: boolean = true;
```

That is not true.

TypeScript supports **type inference**.

This means it can often infer the type automatically:

```ts
const name = "Ana";
const age = 20;
const active = true;
```

Even without explicitly writing:

```text
string
number
boolean
```

TypeScript can understand a lot from values and context.

This allows TypeScript code to remain very close to JavaScript.

### Related reading

[Type Inference in TypeScript: When You Do Not Need to Write the Type](/blog/typescript-type-inference)



# A quick comparison

| Topic | JavaScript | TypeScript |
|---|---|---|
| What is it? | Programming language | Language built on top of JavaScript |
| Typing | Dynamic | Adds a type system with static analysis |
| Executed directly by browsers | Yes | Usually transformed/processed first |
| Executed by Node.js | JavaScript is the runtime's natural language | Depends on the tooling and workflow |
| Checks type incompatibilities before execution | Not as a native language feature | Yes |
| Types keep protecting the code at runtime | Not applicable in the same way | No |
| Can use existing JavaScript code | It is JavaScript itself | Yes, it is highly compatible with JavaScript |
| Extra configuration | Usually less | May require configuration and tooling |
| Initial learning curve | Smaller | Larger because it adds type concepts |

This table is only a summary.

The most important difference is not the number of features.

It is **when certain problems can be discovered**.

<!-- VISUAL:
Flow comparison:

JAVASCRIPT

Code
  ↓
Runtime
  ↓
Execution
  ↓
Some problems appear here


TYPESCRIPT

Code
  ↓
Type analysis
  ↓
Some problems appear here
  ↓
JavaScript / build
  ↓
Runtime
  ↓
Execution
-->



# Where is JavaScript used?

JavaScript has a very large ecosystem.

Some common applications are:

## Web frontend

Interfaces that run in the browser.

Examples from the ecosystem include:

```text
React
Vue
Angular
Svelte
```

These tools can be used with JavaScript and, in many cases, with TypeScript as well.



## Backend

With Node.js, JavaScript can be used to build:

- APIs;
- servers;
- web systems;
- services;
- workers;
- integrations;
- asynchronous processing.

Known frameworks and libraries include:

```text
Express
Fastify
NestJS
```



## Automation and tools

JavaScript can also be used for scripts and tools executed by Node.js.

For example:

```text
generating files
automating tasks
processing data
building CLIs
running build scripts
```



## Mobile and desktop

Technologies in the JavaScript ecosystem can also be used to create applications for other environments.

Examples include:

```text
React Native
Electron
```

This does not mean JavaScript is always the only or best choice, but it shows how broad the ecosystem has become.



# Where is TypeScript used?

TypeScript appears in the same kinds of projects because it is directly connected to the JavaScript ecosystem.

It is especially common in:

- React applications;
- Angular applications;
- Node.js backends;
- NestJS projects;
- npm libraries;
- monorepos;
- systems maintained by several people;
- large or long-lived projects;
- codebases with many data models and contracts.

But TypeScript is not limited to large projects.

Even small applications can benefit from autocomplete, type documentation, and early detection of incompatibilities.



# When can JavaScript make more sense?

JavaScript can be an excellent choice when:

- you are learning the fundamentals of the language;
- the project is small;
- you are writing a very simple automation;
- you want to experiment with an idea quickly;
- TypeScript's extra setup would not bring enough value;
- the existing project is already JavaScript and there is no need to migrate it.

One of JavaScript's biggest advantages is its **low barrier to entry**.

You can create:

```js
console.log("Hello");
```

and run it immediately in a browser or with Node.js.

That low barrier is extremely useful for learning, prototypes, and small scripts.



# Advantages of JavaScript

## Huge ecosystem

JavaScript is present throughout modern web development.

There is a massive amount of:

- libraries;
- frameworks;
- documentation;
- courses;
- communities;
- tools.

## Direct execution in browsers

It is the standard programming language for behavior in the browser.

## Flexibility

JavaScript can be used for everything from tiny scripts to large applications.

## Smaller initial learning curve

To begin, you do not need to learn an additional type system.



# Disadvantages or challenges of JavaScript

## Some errors appear later

Without an additional analysis layer, some incompatibilities may only become visible when the code runs.

## Large projects can be harder to understand

In a large codebase, it may not always be obvious what shape a function expects to receive or return.

## Refactoring may require more care

When a structure changes, finding every affected location can be harder without strong tests and tooling.

## Flexibility can allow inconsistencies

The same freedom that makes JavaScript quick to start with can also allow unexpected combinations of values.

That does not make JavaScript a bad language.

It simply means that flexibility has both benefits and costs.



# When can TypeScript make more sense?

TypeScript is often very valuable when:

- the project has many moving parts;
- several people work on the same codebase;
- the system will be maintained for years;
- there are many data shapes;
- APIs and modules need clear contracts;
- refactoring happens frequently;
- we want more precise autocomplete and navigation;
- we want to detect incompatibilities during development.



# Advantages of TypeScript

## Finds many problems before execution

Type-related errors can appear in the editor or during the build.

## Improves autocomplete

When a tool knows the shape of an object, it can offer more precise suggestions.

<!-- IMAGE:
Suggested screenshot:

user.

Autocomplete:
name
email
age
active

Caption:
"Types also provide information to the editor."
-->

## Helps document the code

Consider:

```ts
function createUser(name: string, age: number): User
```

Even without opening the implementation, we already know a lot about the function contract.

## Makes refactoring safer

A change to a type can help the compiler reveal many places that need to be updated.

## Can improve maintenance in teams

Types create an additional language for describing contracts between different parts of a system.



# Disadvantages or challenges of TypeScript

## There is an additional learning curve

Besides JavaScript, you will eventually need to learn concepts such as:

```text
types
interfaces
unions
generics
narrowing
inference
```

You do not need to learn all of them on your first day, but they are part of the journey.

## It may require configuration

TypeScript projects normally include extra tooling and files such as:

```text
tsconfig.json
```

Depending on the environment, there may also be configuration for builds, modules, and framework integration.

## Error messages can become complex

With advanced types, TypeScript errors can become long and difficult to read.

## Types do not solve every problem

A bad TypeScript project is still a bad project.

Types do not replace architecture, tests, security, or good business rules.



# So, is TypeScript better than JavaScript?

There is no universal answer.

A more useful question is:

> **What problem does my project have, and what cost am I willing to accept?**

TypeScript offers more information and analysis during development.

In exchange, it adds concepts and tooling that developers need to understand.

JavaScript offers a more direct and flexible entry point.

In exchange, some guarantees need to come from tests, discipline, documentation, and other tools.

We do not need to turn the comparison into a competition.

Both belong to the same ecosystem.



# Do I need to learn JavaScript before TypeScript?

You do not need to master all of JavaScript before writing your first line of TypeScript.

But you should understand one thing:

> **Learning TypeScript without learning JavaScript creates a weak foundation.**

TypeScript uses:

- JavaScript functions;
- JavaScript arrays;
- JavaScript objects;
- JavaScript promises;
- JavaScript modules;
- JavaScript classes;
- JavaScript operators;
- JavaScript runtime behavior.

A good strategy is to study both progressively.

For example:

```text
JavaScript basics
       ↓
variables, functions, objects, and arrays
       ↓
TypeScript basics
       ↓
types, inference, and typed functions
       ↓
Asynchronous JavaScript
       ↓
Promises and async/await
       ↓
TypeScript applied to these concepts
       ↓
TSConfig and modules
```



# A small complete example

Imagine a system that introduces a person.

## JavaScript

```js
function introducePerson(person) {
  return `${person.name} is ${person.age} years old.`;
}

const person = {
  name: "Ana",
  age: 20
};

console.log(introducePerson(person));
```

It works.

But nothing in this signature:

```js
function introducePerson(person)
```

tells us exactly what shape `person` should have.

Someone else might call:

```js
introducePerson({
  fullName: "Ana",
  years: 20
});
```

JavaScript will only reveal the problem when that code is used.

With TypeScript, we can make the contract explicit:

```ts
interface Person {
  name: string;
  age: number;
}

function introducePerson(person: Person): string {
  return `${person.name} is ${person.age} years old.`;
}
```

Now an incompatible call can be detected:

```ts
introducePerson({
  fullName: "Ana",
  years: 20
});
```

The benefit is not only "preventing errors."

The code also communicates its intention more clearly.



# One important point: TypeScript still needs a runtime

Even with TypeScript, the program eventually needs to run somewhere.

In a traditional workflow:

```text
TypeScript code
       ↓
TypeScript / build tool
       ↓
JavaScript
       ↓
Browser or Node.js
```

That is why it is important to separate:

```text
language
analysis tool
build process
runtime
```

They are related, but they are not the same thing.

This distinction becomes essential when studying `tsconfig.json`, `target`, `module`, and `moduleResolution`.



# Frequently asked questions

## Are JavaScript and Java the same thing?

No.

Despite the similar names, JavaScript and Java are different languages with different histories, ecosystems, and characteristics.

The name JavaScript often causes this confusion, especially for beginners.



## Is TypeScript another language?

Yes, TypeScript is a language.

But it was designed to be highly compatible with JavaScript and to add features on top of it.

That is why TypeScript is often described as a **superset** of JavaScript.

For a beginner, the most important idea is:

> TypeScript starts from the JavaScript world and mainly adds a type system and analysis tools.



## Does a browser run TypeScript directly?

In traditional web development, browsers run JavaScript.

TypeScript code normally goes through a tool that removes or transforms TypeScript-only features before the result is delivered to the browser.



## Does Node.js run TypeScript?

JavaScript is the natural language of the Node.js runtime.

TypeScript projects can use different strategies: they may compile before execution or use tools that process TypeScript during development.

For now, keep this mental model:

```text
TypeScript
   ↓
processing
   ↓
JavaScript
   ↓
Node.js
```



## Does TypeScript make an application faster?

Not necessarily.

TypeScript's main goal is to improve development experience and code analysis.

It should not be adopted with the expectation that it will automatically make production code faster.



## Does TypeScript make an application secure?

It helps find type incompatibilities.

But security involves much more:

- input validation;
- authentication;
- authorization;
- data handling;
- dependency updates;
- infrastructure;
- secure engineering practices.

TypeScript does not replace these measures.



## Does TypeScript remove the need for tests?

No.

Types and tests check different things.

TypeScript can verify:

```text
"This function expected number but received string."
```

A test can verify:

```text
"When a user has a 10% discount, the final value should be $90."
```

The two tools can work together.



## Can I mix JavaScript and TypeScript?

Yes.

Some projects migrate gradually from `.js` to `.ts`.

TypeScript itself includes options that make it possible to work with JavaScript files during a migration.

That is one reason adoption can be gradual.



## Which one should I learn first?

Start with JavaScript fundamentals.

Then introduce TypeScript early, without waiting until you master every detail of JavaScript.

The best approach is for both areas of study to support each other.



# A short history summary

If we need to compress the story into a few points:

```text
1995
JavaScript is created to add behavior to web pages.

1997
The language starts being standardized through ECMAScript.

2009
Node.js helps JavaScript expand outside the browser.

Over time
JavaScript applications become larger and more complex.

2012
Microsoft introduces TypeScript.

TypeScript
keeps JavaScript's ecosystem and foundation,
but adds types and static analysis.

Today
JavaScript and TypeScript coexist in the same ecosystem
and appear in frontend, backend, tools,
libraries, and many kinds of applications.
```



# What should you remember from this article?

If you forget every detail, remember these ideas.

**JavaScript** is a programming language.

It was born closely connected to the web, expanded far beyond the browser, and today can be used for interfaces, servers, tools, automation, and many other environments.

JavaScript is dynamically typed, which gives it a great deal of flexibility, but also means that some problems only become visible while the program is running.

**TypeScript** was created on top of JavaScript.

It keeps the language's foundations and ecosystem while adding a type system and tools that can analyze many incompatibilities before execution.

TypeScript does not eliminate JavaScript.

In practice, learning TypeScript also means continuing to learn JavaScript.

The main difference can be summarized like this:

> JavaScript describes the behavior that will be executed.  
> TypeScript lets us describe that same behavior with additional information that can be checked before execution.

Neither one removes the need for tests, good business rules, security, and understanding how the application actually works.

---

# Where should you go next?

If this was your first contact with JavaScript and TypeScript, a good sequence is:

1. [Variables and Value Types in JavaScript](/blog/javascript-variables-types)
2. [Functions in JavaScript](/blog/javascript-functions)
3. [Objects and Arrays in JavaScript](/blog/javascript-objects-arrays)
4. [What Is TypeScript? Types and Inference in Practice](/blog/typescript-types-inference)
5. [Asynchronous JavaScript: Promises and async/await](/blog/javascript-promises-async-await)
6. [JavaScript Modules: import, export, ESM, and CommonJS](/blog/javascript-modules)
7. [TSConfig Demystified](/blog/tsconfig-demystified)

From this point on, when you encounter a `.js`, `.ts`, or `tsconfig.json` file, it should no longer look like just another mysterious extension or configuration.

You will begin to understand **the role each piece plays inside an application**.
