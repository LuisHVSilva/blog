---
title: "Node.js por baixo do framework: runtime aplicado a Base TS/Node"
slug: "/article/nodejs-por-baixo-do-framework"
description: "Entenda Node.js além de Express e Nest: processo, event loop, libuv, I/O assíncrono, Promises, streams, Buffer, módulos, profiling e práticas para diagnosticar problemas reais."
language: "pt-BR"
tags:
  - Node.js
  - TypeScript
  - Backend
  - Event Loop
  - Streams
  - Performance
  - Base TS/Node
---

# Node.js por baixo do framework: runtime aplicado a Base TS/Node

É comum conhecer Node.js por meio de um framework.

Você aprende a criar uma rota com Express:

```ts
app.get("/users", async (_req, res) => {
  const users = await userService.list();
  res.json(users);
});
```

Ou um controller com NestJS:

```ts
@Get()
findAll() {
  return this.userService.findAll();
}
```

Esses frameworks são importantes, mas representam apenas a camada mais visível da aplicação.

Por baixo deles existe o **Node.js**.

Node.js não é apenas uma ferramenta para criar APIs. Ele é um **runtime JavaScript** com modelo próprio de concorrência, I/O assíncrono, streams, buffers, gerenciamento de memória, módulos, ferramentas de diagnóstico e regras específicas para erros assíncronos.

Essa diferença parece teórica até o dia em que uma API passa a responder em segundos, o consumo de memória cresce sem parar ou uma operação aparentemente simples começa a atrasar todas as outras requisições.

> Frameworks ajudam você a construir a aplicação. Entender o runtime ajuda você a explicar por que ela funciona — ou por que está falhando.

Este artigo faz parte do ciclo **Base TS/Node**. A ideia é estudar os fundamentos do runtime em exemplos pequenos, testáveis e próximos de TypeScript antes que camadas de framework escondam o que realmente está acontecendo.

<!-- VISUAL:
Diagrama em camadas:

Sua aplicação
    ↓
Express / Nest / Fastify
    ↓
Node.js
    ↓
Sistema operacional

Legenda: "Framework é uma camada. O runtime está por baixo dela."
-->

---

## Node.js é single-thread?

Uma frase muito repetida é:

> "Node.js é single-thread."

Ela ajuda a começar, mas é incompleta.

O **JavaScript da aplicação**, por padrão, executa callbacks em uma thread principal, uma tarefa JavaScript por vez. Isso significa que um cálculo pesado pode ocupar essa thread por tempo suficiente para impedir que outros callbacks sejam atendidos.

```ts
function trabalhoPesado(): number {
  let total = 0;

  for (let i = 0; i < 5_000_000_000; i++) {
    total += i;
  }

  return total;
}

console.log(trabalhoPesado());
```

Enquanto esse loop está rodando, a thread principal continua ocupada.

Mas isso não significa que o processo Node inteiro possua apenas uma thread. Node também utiliza recursos do sistema operacional, a biblioteca **libuv**, um **worker pool** para determinadas operações e, quando necessário, Workers explícitos através de `worker_threads`.

<!-- VISUAL:
Processo Node.js
│
├── Thread principal
│   └── JavaScript + event loop
│
├── Sistema operacional
│   └── rede / sockets / I/O
│
└── libuv worker pool
    ├── filesystem
    ├── algumas operações de crypto
    └── outras tarefas suportadas
-->

A frase mais útil, portanto, é:

> O JavaScript principal executa uma tarefa por vez, mas Node.js não é internamente apenas uma thread.

---

## Concorrência e I/O assíncrono

Imagine uma API que precisa consultar dois serviços independentes.

Uma versão sequencial seria:

```ts
const user = await fetchUser();
const orders = await fetchOrders();
```

Se as duas chamadas não dependem uma da outra, podemos iniciá-las juntas:

```ts
const [user, orders] = await Promise.all([
  fetchUser(),
  fetchOrders()
]);
```

Isso não significa que duas funções JavaScript comuns passaram a executar instruções simultaneamente na thread principal.

O ganho vem do fato de o runtime poder deixar operações de **I/O** em andamento enquanto a thread JavaScript fica livre para processar outros trabalhos.

Por isso Node costuma funcionar muito bem em aplicações com muito:

- tráfego HTTP;
- banco de dados;
- filas;
- chamadas para outras APIs;
- leitura de arquivos;
- conexões de rede.

A pergunta profissional não é apenas "isso é `async`?".

Pergunte:

> **Quem está realizando o trabalho enquanto meu JavaScript aguarda?**

É aí que entram libuv, sistema operacional e worker pool.

---

## Event loop: quem organiza a volta dos callbacks?

O **event loop** coordena quando callbacks podem voltar a executar JavaScript.

Em um modelo simplificado, você encontrará fases associadas a tarefas como:

```text
timers
pending callbacks
poll
check
close callbacks
```

Também existem filas importantes, como as microtasks usadas por Promises e `queueMicrotask()`, além da fila específica de `process.nextTick()`.

Você não precisa decorar um desenho inteiro do event loop. O primeiro objetivo é entender que **a ordem visual do código não é necessariamente a ordem em que todos os callbacks serão executados**.

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

A saída esperada é:

```text
A
B
promise
timeout
```

A Promise agenda uma continuação como microtask. O timer também não significa "execute exatamente agora". Ele só poderá rodar quando estiver elegível e o event loop puder processá-lo.

<!-- VISUAL:
Código síncrono
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

### E o `process.nextTick()`?

`process.nextTick()` usa uma fila específica do Node. Em Node moderno, a própria documentação recomenda preferir `queueMicrotask()` na maioria dos casos de código de aplicação.

O ponto importante é que agendar trabalho continuamente antes de o loop avançar pode atrasar I/O e outros callbacks.

Não use `nextTick` porque ele "parece mais rápido". Use quando você entende o comportamento que precisa garantir.

---

## Promises, async/await e erros assíncronos

`async/await` deixa código assíncrono mais legível, mas não remove a necessidade de pensar em erros.

```ts
async function loadUser(id: string) {
  const response = await fetch(`https://example.com/users/${id}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

Quem chama essa função precisa definir o que fazer se ela falhar.

```ts
try {
  const user = await loadUser("123");
  console.log(user);
} catch (error) {
  console.error("Falha ao carregar usuário", error);
}
```

Em produção, surgem perguntas mais importantes:

- quem captura o erro?
- fazemos retry?
- a operação é idempotente?
- precisamos registrar contexto?
- devemos transformar o erro em outro tipo?
- trabalhos dependentes precisam ser cancelados?

### Cancelamento com AbortController

Nem toda operação que começou ainda será útil quando terminar.

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

O aprendizado aqui não é apenas memorizar `AbortController`.

É perceber que sistemas assíncronos precisam pensar em **sucesso, falha e cancelamento**.

---

## Streams: dados grandes sem carregar tudo na memória

Imagine um arquivo de 5 GB.

Uma estratégia ingênua seria carregar tudo para a memória antes de processar. Streams permitem trabalhar com os dados em partes.

Os três tipos fundamentais são:

```text
Readable   → produz dados
Writable   → recebe dados
Transform  → recebe, transforma e produz
```

Exemplo:

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

O arquivo inteiro não precisa existir na memória ao mesmo tempo.

### Backpressure

Imagine uma torneira enchendo um balde. Se a água entra mais rápido do que sai, em algum momento o sistema precisa reduzir o fluxo.

Em streams, esse problema é chamado de **backpressure**.

Se um produtor gera dados mais rápido do que o consumidor consegue processar, ignorar essa diferença pode aumentar buffers, memória e instabilidade.

Uma das vantagens de APIs como `pipeline()` é ajudar a coordenar fluxo, encerramento e propagação de erros.

> Dominar streams não significa decorar eventos. Significa entender fluxo, pressão, encerramento e erro.

## Buffer e APIs nativas

Nem todo dado é texto. Rede, arquivos e criptografia trabalham frequentemente com bytes.

É aí que aparece `Buffer`:

```ts
const data = Buffer.from("Node.js", "utf8");

console.log(data);
console.log(data.toString("utf8"));
```

Durante o ciclo Base TS/Node, vale trabalhar diretamente com módulos nativos:

```text
node:fs
node:path
node:crypto
node:http
Buffer
fetch
```

Crie pelo menos uma pequena API com `node:http`.

Não porque você precise abandonar Express, mas porque depois desse exercício ficará muito mais claro **qual problema o framework resolve para você**.

---

## CommonJS e ESM não são apenas sintaxe

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

A diferença vai além de `require` versus `import`.

O sistema de módulos afeta:

- resolução de arquivos;
- `package.json`;
- extensões;
- build TypeScript;
- testes;
- interoperabilidade entre pacotes.

Por isso, quando um teste funciona em CommonJS mas quebra depois de uma migração para ESM, a investigação não deve parar em "o TypeScript ficou estranho".

Existe um modelo de módulos por trás da ferramenta.

---

## CPU-bound vs I/O-bound

Essa distinção é central para diagnosticar produção.

### I/O-bound

A aplicação passa boa parte do tempo aguardando algo externo:

```text
banco de dados
rede
filesystem
outra API
fila
```

É o cenário em que o modelo assíncrono do Node tende a ser especialmente eficiente.

### CPU-bound

O processo passa muito tempo executando cálculo:

```text
compressão pesada
processamento de imagem
criptografia intensa
algoritmos grandes
parsing custoso
```

Se esse trabalho ocupar a thread principal por muito tempo, o event loop não consegue atender outros clientes de forma responsiva.

Dependendo do problema, opções podem incluir:

```text
worker_threads
outro processo
fila de jobs
serviço especializado
particionamento do trabalho
```

Mas a regra vem antes da solução:

> **não escolha antes de medir.**

---

## Como medir antes de otimizar

Imagine uma rota lenta.

Uma reação ruim é:

> "Deve ser o banco."

Outra é:

> "Node não aguenta."

Um engenheiro tenta criar evidência.

Comece simples:

```ts
import { performance } from "node:perf_hooks";

const start = performance.now();

await executeWork();

const duration = performance.now() - start;
console.log(`duration=${duration.toFixed(2)}ms`);
```

Depois avance para CPU profiling, heap snapshots, `process.memoryUsage()` e métricas do event loop. Node também oferece `monitorEventLoopDelay()` para observar atrasos do loop.

<!-- VISUAL:
Sintoma
  ↓
Hipótese
  ↓
Medição
  ↓
Gargalo identificado
  ↓
Mudança controlada
  ↓
Nova medição

Evitar:
Sintoma → palpite → reescrever tudo
-->

Um microbenchmark possui limites.

Se você mede uma função isolada por poucos milissegundos, não pode concluir automaticamente que ela será o gargalo de uma aplicação real com rede, garbage collection, concorrência e banco de dados.

Sempre escreva também:

> **O que este teste NÃO prova?**

Essa pergunta força um raciocínio mais profissional.

---

## Laboratório prático para Base TS/Node

Em vez de estudar cada conceito apenas em notas, crie um pequeno laboratório.

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

Crie exemplos que possam quebrar de propósito:

- uma rota bloqueada por CPU;
- uma Promise sem tratamento;
- um `fetch` cancelado;
- uma stream com erro;
- produtor mais rápido que consumidor;
- arquivo grande processado com e sem stream;
- exemplos equivalentes em CommonJS e ESM;
- uma medição de event loop delay.

A meta não é apenas fazer a versão correta funcionar.

Você deve conseguir explicar **por que a versão errada falha**.

---

## Processo profissional também faz parte da base

Use o mesmo laboratório para praticar ambiente e processo:

```text
Node em versão LTS
npm ou pnpm
TypeScript
terminal
VS Code
Git
testes
CI
```

Trabalhe com branches pequenas, commits atômicos e rebase simples. Abra issues para os experimentos e crie pull requests mesmo trabalhando sozinho.

Faça uma code review própria antes do merge.

Nos testes, configure CI para executar pelo menos:

```text
lint
typecheck
test
build
```

Um badge verde não prova qualidade por si só, mas mostra que existe um processo automatizado e reproduzível.

---

## Como comprovar que você aprendeu

Ao terminar o ciclo, sua principal evidência não deveria ser:

> "Assisti a um curso de Node."

Uma evidência mais forte é um repositório público em que outra pessoa consegue enxergar seu raciocínio.

No README, explique:

- o problema estudado;
- o comportamento esperado;
- como executar;
- como testar;
- o que foi medido;
- quais trade-offs apareceram.

Escreva o README principal em português e adicione um resumo em inglês técnico simples.

Exemplo:

> This experiment compares a CPU-bound task on the main thread with the same workload moved to a worker. The goal is not to prove that workers are always faster, but to observe their impact on event loop responsiveness.

Isso treina o tipo de explicação útil em entrevistas internacionais e também mostra capacidade de comunicar engenharia, não apenas código.

Seu portfólio também pode descrever o impacto observado em termos de:

```text
desempenho
confiabilidade
segurança
custo
produtividade
```

---

## Perguntas que você deve conseguir responder

Ao final deste estudo, tente responder sem decorar definições:

**Se Node executa JavaScript em uma thread principal, como consegue lidar com muitas conexões?**

**Qual é a diferença entre concorrência e paralelismo?**

**Quando libuv utiliza o worker pool?**

**Por que `await` não significa criar uma thread?**

**Por que uma tarefa CPU-bound pode degradar todas as requisições?**

**Qual é a diferença entre uma Promise microtask e um timer?**

**Por que `process.nextTick()` deve ser usado com cuidado?**

**O que backpressure protege?**

**Por que streams podem reduzir pressão de memória?**

**Quando `Buffer` aparece em uma aplicação real?**

**Por que CommonJS e ESM afetam build e testes?**

**Que evidência mostra se o gargalo está em CPU, memória, I/O ou event loop?**

Se você consegue explicar essas perguntas usando exemplos que criou e mediu, já deixou de estudar Node apenas na superfície.

---

# O que levar deste artigo

Node.js não é Express.

Node.js não é Nest.

Esses frameworks são ferramentas importantes construídas sobre um runtime muito mais amplo.

Dominar Node significa compreender pelo menos o caminho entre:

```text
JavaScript
   ↓
event loop
   ↓
I/O e libuv
   ↓
streams e memória
   ↓
módulos
   ↓
erros
   ↓
medição
   ↓
produção
```

Você não precisa decorar cada detalhe da implementação interna.

Mas precisa saber o suficiente para formular boas hipóteses quando um sistema real falha.

O estudo começa com:

> "Como faço uma API?"

E amadurece quando a pergunta passa a ser:

> "Por que este sistema se comporta assim, como eu provo a causa e qual trade-off existe na solução?"

Essa mudança de pergunta é uma das diferenças mais importantes entre copiar código de framework e desenvolver software capaz de sobreviver em produção.

---

# Referências oficiais para aprofundamento

- [Node.js — The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Node.js — Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Node.js Streams API](https://nodejs.org/api/stream.html)
- [Node.js Process API](https://nodejs.org/api/process.html)
- [Node.js Performance Hooks](https://nodejs.org/api/perf_hooks.html)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js ECMAScript Modules](https://nodejs.org/api/esm.html)
