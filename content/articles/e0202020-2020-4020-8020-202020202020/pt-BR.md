---
translationId: 2e202020-2020-4020-8020-202020202020
articleId: e0202020-2020-4020-8020-202020202020
locale: pt-BR
slug: nodejs-runtime-mvp-landing
title: "Node.js por baixo do framework: runtime aplicado a MVP e landing"
description: "Um guia prático para usar event loop, I/O assíncrono, streams, memória, profiling, workers, CI e release na construção de um MVP Node.js demonstrável e publicável."
status: published
---

# Node.js por baixo do framework: runtime aplicado a MVP e landing

Node.js não é apenas Express, Nest ou qualquer outro framework HTTP.

Ele é um runtime com regras próprias de execução, concorrência, I/O, memória, streams, módulos, erros e profiling.

Quando você conhece apenas a camada do framework, consegue criar rotas.

Quando entende o runtime, começa a responder perguntas como:

- por que uma rota pesada faz a landing parecer lenta?
- por que uma operação `async` ainda bloqueia outras requisições?
- por que carregar um arquivo inteiro na memória funciona localmente e falha na demo?
- por que um request cancelado continua consumindo recurso?
- quando uma Promise resolve, quando uma callback executa e onde um erro pode escapar?
- quando worker thread ajuda e quando só adiciona complexidade?
- como provar que uma otimização realmente melhorou alguma coisa?

Neste ciclo, o contexto é **MVP e landing**.

O objetivo é transformar conhecimento de runtime em uma primeira entrega pública que funcione, seja demonstrável e tenha limites claros.

A meta não é construir uma plataforma complexa.

A meta é publicar uma `v0.1.0` em que:

1. o backend Node executa um fluxo real;
2. a landing explica o problema e aponta para a demonstração;
3. o código possui testes;
4. CI executa testes e build em pull requests;
5. gargalos importantes são medidos;
6. o README permite reprodução;
7. as limitações da release estão documentadas.

> Entender Node.js por baixo do framework ajuda a impedir que uma demo funcional em uma máquina se transforme em um MVP instável assim que recebe carga, arquivos maiores ou chamadas concorrentes.

<!-- VISUAL:
Landing -> Demo -> HTTP Node.js -> Event Loop
                               |-> I/O assíncrono
                               |-> Streams
                               |-> Worker Thread
                               |-> Métricas
Abaixo: CI -> build -> tests -> release v0.1.0
-->

## O problema que guia o laboratório

Crie um pequeno produto demonstrável.

Exemplo:

> Uma ferramenta que recebe um arquivo de incidentes, processa os dados e retorna um resumo simples para análise.

A primeira versão pode ter:

- landing pública;
- upload de arquivo;
- endpoint de processamento;
- status da execução;
- resultado resumido.

O MVP não precisa ter:

- autenticação;
- banco complexo;
- filas distribuídas;
- escalabilidade horizontal;
- Kubernetes;
- IA;
- multi-tenant.

O fluxo principal pode ser:

```text
landing
 -> usuário abre demo
 -> envia arquivo
 -> backend processa
 -> resultado aparece
```

Parece simples.

Mas esse fluxo já permite estudar:

- Buffer;
- streams;
- filesystem;
- event loop;
- CPU;
- I/O;
- cancelamento;
- erros;
- profiling;
- memória;
- HTTP nativo;
- fetch;
- CI;
- release.

## A versão ingênua

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

Esse código pode funcionar perfeitamente em desenvolvimento.

Mas ele esconde perguntas importantes.

### Pergunta 1

O arquivo inteiro precisa estar na memória?

### Pergunta 2

`parseAndSummarize` é CPU-bound?

### Pergunta 3

O que acontece se duas pessoas processarem arquivos ao mesmo tempo?

### Pergunta 4

A rota `/health` continua respondendo durante o processamento?

### Pergunta 5

Se o cliente cancelar a requisição, o trabalho continua?

### Pergunta 6

Como o erro chega ao usuário?

### Pergunta 7

Como provar que a solução é aceitável para o escopo da `v0.1`?

Essas perguntas definem o laboratório.

## Processo Node.js

Comece entendendo o processo.

```ts
console.log({
  pid: process.pid,
  version: process.version,
  uptime: process.uptime(),
  memory: process.memoryUsage(),
});
```

Um processo Node possui:

- heap;
- stack;
- handles;
- sockets;
- módulos carregados;
- event loop;
- integração com o sistema operacional;
- integração com libuv.

No MVP, isso importa porque toda a demo pode estar rodando em um único processo.

Se esse processo bloqueia, a demonstração inteira parece travar.

## "Node é single-thread" é uma simplificação

Uma explicação melhor:

- o JavaScript principal normalmente executa em uma thread por isolate;
- o event loop decide quando callbacks voltam a executar;
- operações de rede podem ser coordenadas pelo sistema operacional;
- algumas operações usam o worker pool do libuv;
- `worker_threads` permitem JavaScript paralelo em outras threads.

Isso explica por que:

```ts
await fetch(url);
```

não bloqueia a thread JavaScript esperando a rede.

Mas:

```ts
expensiveCalculation();
```

bloqueia.

Mesmo dentro de:

```ts
async function run() {
  return expensiveCalculation();
}
```

`async` não transforma CPU síncrona em paralelismo.

## libuv e thread pool

libuv participa da infraestrutura assíncrona do Node.

Algumas operações usam thread pool.

Outras dependem de mecanismos assíncronos do sistema operacional.

Evite a explicação:

> "Toda operação assíncrona vai para outra thread."

Isso é impreciso.

No laboratório, crie um experimento com:

- filesystem;
- crypto;
- network;
- CPU JavaScript.

Observe diferenças.

## Event loop

O event loop possui fases associadas a categorias de callbacks.

Uma visão útil inclui:

- timers;
- pending callbacks;
- poll;
- check;
- close callbacks.

Além disso:

- `process.nextTick`;
- microtasks de Promise;
- `queueMicrotask`;

possuem regras próprias.

O objetivo não é decorar uma imagem.

O objetivo é entender por que determinadas operações atrasam outras.

## Timer atrasado por CPU

```ts
setTimeout(() => {
  console.log("timer");
}, 10);

const startedAt = Date.now();

while (
  Date.now() - startedAt < 1000
) {
  // bloqueio proposital
}
```

O timer não executa em 10 ms.

Ele precisa esperar o JavaScript liberar a thread.

Esse exemplo conecta diretamente runtime e MVP.

Se uma rota de processamento ocupa 2 segundos de CPU:

```text
/health
/landing-data
/demo-status
```

também podem esperar.

## Microtasks

```ts
console.log("A");

Promise.resolve().then(() => {
  console.log("B");
});

console.log("C");
```

Saída:

```text
A
C
B
```

A Promise não interrompe o stack atual.

## `process.nextTick`

```ts
process.nextTick(() => {
  console.log("nextTick");
});
```

`nextTick` possui uma fila especial e pode executar antes de o loop continuar.

Uso excessivo ou recursivo pode causar starvation.

Exemplo controlado:

```ts
function starve(): void {
  process.nextTick(starve);
}
```

Não rode isso sem controle.

O exemplo existe para mostrar que prioridade pode impedir o loop de avançar.

## `queueMicrotask`

Quando você precisa apenas de uma microtask padrão, `queueMicrotask` costuma ser mais previsível para código de aplicação do que usar `nextTick` sem necessidade específica.

Compare em pequenos exemplos.

Não construa regra de negócio dependente de diferenças frágeis de scheduling.

## `setImmediate` e `setTimeout`

```ts
setTimeout(() => {
  console.log("timeout");
}, 0);

setImmediate(() => {
  console.log("immediate");
});
```

A ordem observada pode depender do contexto.

Em callback de I/O, `setImmediate` possui relação clara com a fase de `check`.

Crie exemplos.

Mas não use a diferença como contrato de produto.

## Promises

Promises ajudam a representar conclusão ou falha futura.

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

O chamador precisa decidir onde tratar o erro.

## Tratamento de erro assíncrono

```ts
try {
  const result =
    await processFile();

  return result;
} catch (error) {
  // adicionar contexto, mapear ou responder
}
```

Não use `try/catch` em todo lugar.

Trate onde existe contexto suficiente para decidir:

- retry;
- cancelamento;
- mensagem pública;
- logging;
- fallback;
- encerramento.

## Promise esquecida

```ts
void saveAnalytics(event);
```

O `void` apenas deixa explícito que a Promise não será aguardada.

Ainda precisa existir política de erro.

Pergunte:

- pode falhar silenciosamente?
- precisa retry?
- pode impedir resposta?
- é crítico?
- deve ser enviado depois?

## Cancelamento com AbortController

No MVP, o usuário pode fechar a aba ou cancelar o upload.

A operação pode deixar de ter valor.

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

Cancelamento economiza trabalho inútil.

## Propague AbortSignal

```ts
type ProcessOptions = {
  signal?: AbortSignal;
};

async function processIncidentFile(
  path: string,
  options: ProcessOptions = {},
): Promise<Result> {
  // propagar signal
}
```

Não crie cancelamento apenas no controller HTTP.

A operação interna precisa cooperar.

## Cancelamento e MVP

O cenário demonstrável:

```text
usuário inicia processamento
 -> usuário cancela
 -> backend interrompe trabalho possível
 -> UI volta a estado seguro
```

Teste isso.

É uma evidência de qualidade melhor que uma landing bonita com fluxo quebrado.

## Streams

Arquivo pequeno:

```ts
const content =
  await readFile(path);
```

pode ser suficiente.

Arquivo maior:

```ts
createReadStream(path)
```

permite processamento incremental.

## Readable

Produz dados.

```ts
const source =
  createReadStream(path);
```

## Writable

Consome dados.

```ts
const destination =
  createWriteStream(output);
```

## Transform

Transforma chunks.

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

`pipeline` ajuda a coordenar:

- fluxo;
- erro;
- cleanup.

## Backpressure

Se o produtor gera dados mais rápido que o consumidor:

```text
produtor >>> consumidor
```

chunks podem se acumular.

Streams possuem mecanismos de backpressure para limitar isso.

Ao usar Writable manualmente:

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

## O impacto de backpressure no MVP

Imagine upload de 500 MB.

Sem fluxo controlado:

```text
arquivo -> buffer inteiro -> transformação -> resposta
```

Memória cresce proporcionalmente.

Com stream:

```text
chunk -> processa -> libera -> próximo chunk
```

A memória pode ficar mais previsível.

Não conclua:

> stream é sempre mais rápido.

A principal vantagem pode ser memória.

## Buffer

Node representa dados binários com `Buffer`.

```ts
const buffer =
  Buffer.from(
    "Node",
    "utf8",
  );
```

Use Buffer conscientemente em:

- upload;
- hashing;
- parsing;
- protocolos;
- arquivos.

## Encoding

```ts
Buffer.byteLength(
  "Olá",
  "utf8",
);
```

bytes não são necessariamente iguais a caracteres.

Isso importa para limite de upload.

## `Buffer.alloc`

```ts
const buffer =
  Buffer.alloc(1024);
```

inicializa memória.

`Buffer.allocUnsafe` tem semântica diferente e exige garantia de sobrescrita completa antes de exposição.

Para um MVP, simplicidade e segurança normalmente valem mais que micro-otimização prematura.

## Filesystem

Use API assíncrona no caminho quente.

```ts
import {
  readFile,
} from "node:fs/promises";
```

Operação síncrona:

```ts
readFileSync(...)
```

pode ser aceitável em startup.

Dentro de request concorrente, pode bloquear.

## `path`

Não monte caminhos manualmente.

```ts
import path from "node:path";

const file =
  path.join(
    base,
    "uploads",
    name,
  );
```

## Segurança de path

Nunca use diretamente um nome recebido do usuário sem validação.

Exemplo perigoso:

```text
../../secret.txt
```

Para upload ou leitura, defina:

- diretório permitido;
- nome gerado internamente;
- validação;
- limite de tamanho.

## Crypto

O MVP pode precisar de hash para:

- deduplicação;
- integridade;
- identificador de arquivo;
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

Não invente criptografia.

Use APIs e algoritmos apropriados ao caso.

## HTTP nativo

Mesmo que o produto use framework, crie um laboratório com:

```ts
createServer(...)
```

Estude:

- request;
- response;
- headers;
- body;
- stream;
- timeout;
- abort;
- keep-alive.

Isso mostra o que o framework abstrai.

## Endpoint simples

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

Use `fetch` para integrações simples.

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

Status 500 não significa rejeição automática da Promise.

Você precisa interpretar protocolo.

## Distinga erros

- transporte;
- timeout;
- abort;
- HTTP 4xx/5xx;
- payload inválido;
- regra inválida.

Isso melhora UX da landing e demo.

## CommonJS e ESM

CommonJS:

```js
const fs = require("node:fs");
```

ESM:

```ts
import fs from "node:fs";
```

Não são apenas sintaxes diferentes.

Estude:

- `type` no package.json;
- `.cjs`;
- `.mjs`;
- resolução;
- `exports`;
- `imports`;
- `import.meta`;
- dynamic import;
- interoperabilidade.

## Escolha explícita

Exemplo:

```json
{
  "type": "module"
}
```

Use configuração coerente com:

- TypeScript;
- test runner;
- build;
- execução de produção.

## Teste o build real

Não basta:

```bash
tsx src/main.ts
```

funcionar.

Rode:

```bash
npm run build
node dist/main.js
```

A release precisa funcionar no artefato real.

## CPU-bound versus I/O-bound

Essa distinção é central.

### CPU-bound

Tempo dominado por cálculo.

Exemplos:

- parsing pesado;
- compressão;
- transformação;
- algoritmo;
- hashing em grande volume.

### I/O-bound

Tempo dominado por espera.

Exemplos:

- arquivo;
- rede;
- banco;
- API externa.

Solução depende da natureza.

## Erro comum

```ts
async function heavy() {
  return heavyCalculation();
}
```

Isso continua CPU-bound.

`async` não cria outra thread.

## Worker threads

Para CPU JavaScript realmente pesada:

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

Workers permitem paralelismo.

Mas custam:

- criação;
- memória;
- comunicação;
- serialização;
- coordenação;
- tratamento de erro.

## Worker por tarefa pequena

Criar um worker para calcular:

```ts
1 + 1
```

é pior que executar localmente.

Para trabalho frequente, um pool pode fazer mais sentido.

No MVP, use worker apenas se a medição justificar.

## Primeiro experimento: bloqueio

Crie:

```text
/health
/process-cpu
```

`/process-cpu` executa cálculo pesado.

Durante a carga, meça `/health`.

Hipótese:

> CPU na thread principal degrada a latência de `/health`.

## Depois use worker

Refatore:

```text
/process-cpu
 -> task runner
 -> worker
```

Meça novamente.

Registre:

- latência;
- CPU;
- event loop delay;
- overhead;
- memória.

## Não diga "ficou mais rápido" sem contexto

Talvez a tarefa individual demore parecido.

O ganho pode ser:

> o servidor continua responsivo.

Isso é muito mais importante para a demo.

## Profiling

Use profiling antes de otimizar.

Exemplo:

```bash
node --cpu-prof dist/server.js
```

Depois gere carga.

Perguntas:

- onde CPU está concentrada?
- qual função?
- quanto tempo?
- a hipótese estava correta?

## Heap profiling

```bash
node --heap-prof dist/process-file.js
```

Use em ambiente controlado.

Profiles podem conter dados do processo.

Não capture produção sensível sem política.

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

Registre durante experimento de arquivo.

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

Depois:

```ts
console.log({
  p50:
    histogram.percentile(50) / 1e6,
  p99:
    histogram.percentile(99) / 1e6,
});
```

Use para observar atraso.

Não use sozinho para explicar causa.

## Event loop utilization

```ts
import {
  performance,
} from "node:perf_hooks";

const utilization =
  performance
    .eventLoopUtilization();
```

Compare janelas.

Não transforme threshold arbitrário em regra universal.

## Simulação de carga

Não gere carga sem pergunta.

Escreva:

```text
Hipótese:
processamento CPU-bound degrada rota leve.

Carga:
20 chamadas concorrentes em /process-cpu.

Observação:
latência de /health, CPU, event loop delay.

Ambiente:
máquina, Node, commit.
```

Isso torna medição reproduzível.

## Microbenchmark

Exemplo:

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

Útil para comparar implementação local.

Não prova throughput HTTP.

## Benchmark de sistema

Meça:

- throughput;
- latência;
- p50;
- p95;
- p99;
- memória;
- CPU;
- erros.

Não precisa usar todos em todo experimento.

Use o que responde à hipótese.

## Experimento de Buffer versus stream

Versão A:

```ts
const content =
  await readFile(path);
```

Versão B:

```ts
await pipeline(
  createReadStream(path),
  transform,
  writable,
);
```

Compare:

- tempo;
- RSS;
- external memory;
- comportamento com concorrência.

## Uma demo realista

Gere arquivos:

```text
1 MB
50 MB
200 MB
```

Não precisa testar gigabytes se sua máquina não suporta.

A meta é observar tendência.

## O MVP deve definir limite

Exemplo:

```text
v0.1 aceita arquivos de até 50 MB.
```

Esse limite pode ser produto, não falha.

Documente.

## Teste de limite

```ts
test(
  "rejects file larger than v0.1 limit",
  async () => {
    // ...
  },
);
```

## Erros em stream

Teste:

- origem falha;
- transform falha;
- destino falha;
- abort;
- timeout.

Não teste apenas caminho feliz.

## Testes unitários

Use para:

- parser;
- transform;
- cálculo;
- validação;
- mapping.

## Teste de integração

Use para:

- filesystem real temporário;
- stream pipeline;
- worker;
- HTTP server.

## Contract test

Proteja:

```json
{
  "status": "completed",
  "summary": {
    "rows": 100
  }
}
```

durante refatoração.

## E2E

Fluxo:

```text
abrir demo
 -> enviar arquivo
 -> processar
 -> mostrar resultado
```

Esse é o teste mais importante da `v0.1`.

## Teste de cancelamento

Fluxo:

```text
iniciar upload/processamento
 -> cancelar
 -> backend aborta
 -> UI mostra cancelado
```

## Estado da UI

Evite:

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

A landing/demo representa o runtime de forma clara.

## Setup simples

Outro desenvolvedor deve conseguir:

```bash
git clone ...
npm install
npm run dev
```

ou:

```bash
docker compose up
```

se realmente necessário.

Não obrigue Docker se a aplicação é simples e não precisa.

## Documentação de ambiente

README:

```text
Node:
versão LTS suportada

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

## Variáveis de ambiente

Forneça:

```text
.env.example
```

Nunca publique segredo real.

Exemplo:

```env
PORT=3000
MAX_UPLOAD_MB=50
```

## Landing do MVP

Estrutura:

```text
Hero
Problema
Como funciona
Demo
O que mede
Limites v0.1
GitHub
Contato
```

## Hero

> Processe arquivos de incidentes sem travar o fluxo principal do servidor.

Subtexto:

> Um laboratório Node.js transformado em MVP para demonstrar streams, cancelamento, profiling e processamento seguro.

CTA:

```text
Testar demo
```

Secundário:

```text
Ver GitHub
```

## Seção problema

> Processar arquivos funciona facilmente com poucos dados. O desafio aparece quando tamanho, concorrência e CPU começam a afetar memória e responsividade.

## Seção público

```text
Para desenvolvedores backend que querem entender
como decisões de runtime afetam uma entrega real.
```

Se o MVP for voltado a outro público, ajuste.

## Demo

Mostre:

- upload;
- processamento;
- cancelamento;
- resultado;
- health status.

Não mostre console interno como única evidência.

## Seção técnica opcional

```text
O que esta demo prova:
- stream;
- backpressure;
- cancelamento;
- worker para CPU;
- medição de memória;
- CI.
```

Essa seção pode existir no portfólio, não necessariamente na landing comercial.

## Limitações da v0.1

Exemplo:

```text
- upload máximo de 50 MB;
- execução em um único processo;
- sem autenticação;
- sem persistência permanente;
- sem fila distribuída.
```

Isso demonstra maturidade.

## CTA de contato

```text
Quer discutir o experimento ou reproduzir o benchmark?
Entre em contato.
```

## CI

Crie:

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

E2E pode rodar se for estável e barato.

## Build real

CI deve compilar e executar testes.

Se possível, adicione smoke test do artefato:

```text
build
 -> start
 -> GET /health
 -> stop
```

Isso prova que `dist` funciona.

## Pull request

Cada mudança importante deve mostrar:

- problema;
- medição;
- solução;
- testes;
- trade-off.

Exemplo:

```text
perf: move CPU-heavy parser to worker
```

Descrição:

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

Inclua:

- cenário;
- reprodução;
- Node;
- arquivo;
- carga;
- resultado esperado.

## Release v0.1.0

Escopo:

```text
- landing pública;
- upload controlado;
- processamento por stream;
- cancelamento;
- health endpoint;
- teste de CPU-bound;
- métricas documentadas;
- CI;
```

Não inclua tudo que estudou.

Inclua o que forma produto demonstrável.

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

## Tag reproduzível

Antes de criar tag:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Depois:

```text
v0.1.0
```

## README

Estrutura:

```text
# Nome

Problema
Demo
Escopo v0.1
Como funciona
Arquitetura
Runtime concepts
Como executar
Testes
Profiling
Benchmarks
CI
Release
Limitações
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

## Estrutura do repository

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

## Módulo de runtime

```text
packages/runtime/
  event-loop-metrics.ts
  memory-metrics.ts
  worker-runner.ts
  stream-processor.ts
```

Não misture tudo em controller.

## Experimento 1 — event loop

Crie script:

```text
sync
Promise
queueMicrotask
nextTick
setTimeout
setImmediate
I/O
```

Antes de executar, escreva previsão.

Depois registre saída.

Explique.

## Experimento 2 — CPU

Versão A:

```text
parser pesado na thread principal
```

Versão B:

```text
parser em worker
```

Meça rota `/health`.

## Experimento 3 — streams

Versão A:

```text
readFile
```

Versão B:

```text
createReadStream + pipeline
```

Meça memória.

## Experimento 4 — cancelamento

Inicie processamento longo.

Cancele.

Meça:

- tempo até parar;
- memória;
- estado final;
- arquivos temporários.

## Experimento 5 — erro

Force:

- arquivo inválido;
- stream fail;
- worker fail;
- timeout.

Verifique resposta pública.

## Experimento 6 — CommonJS e ESM

Crie um pequeno módulo nos dois formatos.

Compare:

- import;
- build;
- testes;
- caminhos;
- tooling.

## Experimento 7 — load

Defina hipótese.

Exemplo:

> 10 processamentos concorrentes aumentam RSS acima do limite esperado na versão com buffer inteiro.

Teste.

Depois stream.

## Experimento 8 — microbenchmark

Compare dois parsers.

Registre:

- input;
- runs;
- ambiente;
- conclusão limitada.

## Compare abordagens

| Comparação | O que observar | Onde falha |
| --- | --- | --- |
| CPU no event loop vs. worker | responsividade e overhead | event loop bloqueia; worker custa coordenação |
| `readFile` vs. stream | memória e simplicidade | buffer escala mal; stream aumenta complexidade |
| sequential I/O vs. concorrente | duração e limite externo | sequencial perde tempo; concorrência ilimitada satura |
| `nextTick` vs. microtask | prioridade e clareza | `nextTick` pode causar starvation; microtask não substitui todos os casos |
| CommonJS vs. ESM | build e interoperabilidade | CJS limita algumas convenções modernas; ESM exige atenção à resolução |
| microbenchmark vs. load | isolamento e realismo | microbenchmark não representa sistema; load esconde causa |
| worker por tarefa vs. pool | simplicidade e overhead | worker por tarefa custa criação; pool adiciona gestão |
| buffer vs. pipeline | facilidade e memória | buffer usa mais memória; pipeline exige erro/cancelamento |
| landing técnica vs. landing focada | contexto e clareza | técnica demais assusta usuário; focada demais esconde evidência |
| release ampla vs. v0.1 pequena | escopo e risco | ampla atrasa; pequena pode exigir limites explícitos |

## Exemplos que precisam quebrar

Faça:

1. bloquear event loop;
2. timer atrasar;
3. Promise esquecida;
4. abort não propagado;
5. stream falhar;
6. memória crescer com buffer;
7. worker por tarefa pequena mostrar overhead;
8. módulo ESM quebrar por resolução;
9. build funcionar no dev runner e falhar em `dist`;
10. health degradar sob CPU.

Cada falha precisa virar documento.

## Medição

Registre:

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

Sem isso, números perdem significado.

## Impacto para portfólio

Boa descrição:

> Criei um MVP público em Node.js para processar arquivos e usei o projeto para estudar comportamento de runtime em condições controladas. A primeira implementação carregava o arquivo inteiro na memória e executava processamento CPU-bound na thread principal. Depois de medir memória, event loop delay e latência da rota de health, refatorei o fluxo para streaming e isolei o trabalho CPU pesado em worker. A release `v0.1.0` inclui testes, CI, landing e documentação dos benchmarks.

Evite:

> "Otimizei Node.js em 500%."

Sem contexto, não diz nada.

## Artigo prático 1

### Título

**Node.js por baixo do framework: runtime aplicado a MVP e landing**

Estrutura:

1. problema do MVP;
2. arquitetura mínima;
3. event loop;
4. I/O;
5. CPU;
6. stream;
7. worker;
8. medição;
9. trade-offs;
10. release.

Mostre como runtime afetou a demo real.

## Artigo prático 2

### Título

**Event loop, promises e erros assíncronos explicados com código testado**

Comece por erro comum:

```ts
async function heavy() {
  return expensiveCalculation();
}
```

Explique por que continua bloqueando.

Depois:

- Promise;
- microtask;
- nextTick;
- timer;
- immediate;
- erro;
- cancelamento.

Inclua testes.

## Artigo prático 3

### Título

**Como medir antes de otimizar em Node.js**

Escolha hipótese:

> stream reduz pico de memória no processamento do arquivo usado na demo.

Ou:

> worker mantém rota de health responsiva durante cálculo pesado.

Mostre:

- setup;
- benchmark;
- profiler;
- resultado;
- limitação.

Inclua seção:

```text
O que este teste não prova
```

## Formato recomendado

800 a 1.500 palavras.

Estrutura:

1. introdução;
2. problema;
3. hipótese;
4. código;
5. teste;
6. medição;
7. mudança;
8. nova medição;
9. trade-off;
10. limitação;
11. conclusão;
12. GitHub/demo.

## Inglês técnico para entrevista

> The first version processed the file in memory and performed CPU-heavy parsing on the main JavaScript thread. It worked with small examples, but the health endpoint became slower under concurrent load. I measured event loop delay and memory usage before changing the implementation.

Outro:

> I replaced whole-file buffering with a stream pipeline because the memory peak increased with file size and concurrency. The trade-off was more complex error handling and cancellation.

Outro:

> I used a worker only for the CPU-heavy part. Moving normal asynchronous I/O into a worker would not solve the same problem and would add unnecessary coordination overhead.

Outro:

> The v0.1.0 release has an explicit file-size limit. I preferred a documented product limit over pretending the MVP could process arbitrary workloads.

Outro:

> Every pull request runs type checking, linting, tests, and the production build. The release also documents the environment used for profiling so the measurements can be reproduced.

## Checklist técnico de conclusão

Você terá concluído o E020 quando conseguir:

- explicar processo Node;
- explicar limite da frase "single-thread";
- diferenciar event loop, OS, libuv pool e worker thread;
- explicar timers, poll, check e close callbacks;
- explicar microtasks e `nextTick`;
- demonstrar ordem com código;
- usar Promises;
- usar async/await;
- tratar erros assíncronos;
- propagar `AbortSignal`;
- implementar cancelamento;
- usar Readable;
- usar Writable;
- usar Transform;
- usar pipeline;
- explicar backpressure;
- trabalhar com Buffer;
- trabalhar com filesystem;
- usar path com segurança;
- usar crypto conscientemente;
- criar servidor com HTTP nativo;
- usar fetch;
- diferenciar erro de transporte e status HTTP;
- comparar CJS e ESM;
- executar build real;
- distinguir CPU-bound e I/O-bound;
- usar worker quando justificado;
- criar CPU profile;
- observar memória;
- medir event loop delay;
- simular carga;
- executar microbenchmark;
- explicar limites do benchmark;
- criar testes unitários;
- criar integração;
- criar contract test;
- criar e2e;
- criar landing;
- publicar demo;
- documentar escopo v0.1;
- configurar CI;
- criar release v0.1.0;
- documentar limitações;
- explicar trade-offs em inglês simples.

## O que você deve levar deste ciclo

Node.js deixa de ser apenas ferramenta de API quando você entende o runtime.

No contexto de MVP e landing, esse conhecimento precisa aparecer em uma entrega concreta.

A landing mostra o problema.

A demo mostra o comportamento.

O runtime explica por que o sistema se comporta daquele jeito.

Os testes protegem o fluxo.

O profiler mostra onde existe custo.

As métricas evitam otimização baseada em palpite.

CI protege cada mudança.

A release define um estado reproduzível.

O resultado final deve mostrar:

```text
problema
 -> demo
 -> runtime
 -> medição
 -> decisão
 -> testes
 -> CI
 -> landing
 -> release
```

Você terá concluído o E020 quando conseguir publicar um MVP pequeno em Node.js, provocar seus limites de forma controlada, explicar o que acontece por baixo do framework, medir o comportamento, corrigir gargalos relevantes e documentar claramente o que a `v0.1.0` faz e o que ela ainda não pretende fazer.

## Referências primárias

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
