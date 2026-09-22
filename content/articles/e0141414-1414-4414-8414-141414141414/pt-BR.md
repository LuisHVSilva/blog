---
translationId: 2e141414-1414-4414-8414-141414141414
articleId: e0141414-1414-4414-8414-141414141414
locale: pt-BR
slug: nodejs-runtime-qualidade-refatoracao
title: "Node.js por baixo do framework: runtime aplicado a qualidade e refatoração"
description: "Um guia prático para entender event loop, I/O assíncrono, streams, memória, profiling, cancelamento e erros em Node.js, aplicando o runtime a qualidade e refatoração."
status: draft
---

# Node.js por baixo do framework: runtime aplicado a qualidade e refatoração

Aprender Node.js profissionalmente não é aprender uma lista de métodos do Express ou decorar decorators de um framework. Frameworks organizam a aplicação. O runtime determina como o processo executa JavaScript, espera I/O, usa memória, agenda callbacks, processa streams e reage quando uma função bloqueia a thread principal.

Neste ciclo, o contexto é **qualidade e refatoração**. O objetivo não é estudar internals por curiosidade acadêmica, mas usar o conhecimento do runtime para responder perguntas de produção:

- por que uma rota simples começou a aumentar a latência de todas as outras?
- por que o processo consome centenas de megabytes ao processar um arquivo?
- por que uma Promise rejeitada desapareceu ou virou erro global?
- por que uma operação continua trabalhando depois que a requisição já foi cancelada?
- por que um código "assíncrono" ainda bloqueia o servidor?
- por que trocar `readFile` por stream alterou drasticamente o perfil de memória?
- por que um teste depende da ordem de `setTimeout`, `setImmediate`, Promise e `nextTick`?

O laboratório deste ciclo deve desenvolver quatro capacidades:

1. entender o modelo de execução do Node.js;
2. reconhecer se um problema é CPU-bound, I/O-bound, de memória ou de coordenação assíncrona;
3. refatorar sem alterar comportamento de forma acidental;
4. medir antes e depois para provar o efeito da mudança.

> Saber que Node.js é "single-threaded" é insuficiente. O JavaScript normalmente executa em uma thread por isolate, enquanto o runtime coordena I/O, recursos do sistema operacional e trabalho auxiliar de maneiras diferentes. O diagnóstico começa ao descobrir onde o trabalho realmente está acontecendo.

<!-- VISUAL:
Fluxo: requisição -> JavaScript/event loop -> operação.
Da operação, três caminhos:
1. I/O não bloqueante -> sistema operacional;
2. tarefas suportadas pelo worker pool/libuv;
3. CPU JavaScript -> event loop ou worker_threads.
Ao lado: CPU, memória, event loop delay e latência como evidências.
-->

## O problema que guia o laboratório

Crie um pequeno servidor HTTP nativo com três capacidades:

1. retornar um endpoint leve de saúde;
2. calcular uma tarefa CPU-intensiva;
3. processar um arquivo grande.

Uma implementação ingênua pode funcionar perfeitamente com um usuário e ainda degradar toda a aplicação sob concorrência.

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

As duas rotas possuem problemas de natureza diferente.

`/cpu` executa JavaScript pesado de forma síncrona. Enquanto a função roda, o event loop não consegue executar os callbacks das outras requisições naquele thread.

`/file` usa uma API assíncrona, portanto não bloqueia da mesma forma, mas carrega o conteúdo inteiro na memória. Dependendo do tamanho do arquivo e da concorrência, isso pode aumentar consumo de memória e pressão do garbage collector.

A meta é diagnosticar cada problema com evidência e refatorá-lo de maneira apropriada.

## Processo Node.js: comece pelo que está realmente rodando

Um processo Node possui estado e recursos próprios:

- heap do JavaScript;
- stack;
- handles e requests ativos;
- descritores e sockets;
- variáveis de ambiente;
- módulos carregados;
- event loop;
- integração com libuv e sistema operacional.

O objeto `process` permite observar parte desse estado:

```ts
console.log({
  pid: process.pid,
  platform: process.platform,
  node: process.version,
  uptimeSeconds: process.uptime(),
  memory: process.memoryUsage(),
});
```

`process.memoryUsage()` pode retornar informações como:

- `rss`: memória residente do processo;
- `heapTotal`: heap alocado pelo V8;
- `heapUsed`: parte usada do heap;
- `external`: memória associada a objetos externos ao heap;
- `arrayBuffers`: memória usada por `ArrayBuffer` e `SharedArrayBuffer`.

Não interprete um único número isoladamente. RSS, heap e memória externa representam coisas diferentes.

## "Single thread" precisa de precisão

É comum resumir Node.js como "single-threaded". A frase pode ajudar no início, mas esconde detalhes importantes.

Em um processo Node comum:

- o código JavaScript do seu fluxo principal executa em uma thread;
- o event loop coordena quando callbacks JavaScript podem voltar a executar;
- operações de rede podem ser coordenadas pelo sistema operacional sem ocupar uma thread JavaScript esperando;
- algumas APIs utilizam o worker pool do libuv;
- `worker_threads` permitem executar JavaScript em outras threads quando isso é justificável.

Portanto:

```ts
const data = await fetch(url);
```

não significa que uma thread JavaScript ficou parada esperando o servidor remoto.

E:

```ts
const result = expensiveCalculation();
```

continua bloqueando o thread JavaScript mesmo que a função que a chamou seja `async`.

Adicionar `async` não transforma trabalho síncrono em trabalho paralelo.

## libuv e o worker pool

libuv fornece ao Node uma abstração para event loop e operações assíncronas entre plataformas.

Algumas operações utilizam um pool de threads auxiliar. Exemplos importantes incluem determinadas operações de filesystem, criptografia e resolução de nomes.

O ponto profissional é evitar uma simplificação errada:

> Nem todo I/O "vai para a thread pool".

Sockets de rede normalmente dependem dos mecanismos assíncronos do sistema operacional. Outras APIs podem usar o pool porque não existe uma interface não bloqueante equivalente ou porque o trabalho é naturalmente executado em threads auxiliares.

Esse detalhe importa porque saturar o worker pool pode aumentar a latência de operações que compartilham esse recurso.

Crie um experimento com várias operações criptográficas ou de filesystem concorrentes e meça o comportamento. Não altere o tamanho do pool apenas por tentativa; primeiro prove que ele é o gargalo.

## Event loop: um modelo operacional

O event loop executa ciclos com fases associadas a tipos de callbacks. Uma visão útil inclui:

- timers;
- pending callbacks;
- poll;
- check;
- close callbacks.

Existem também etapas internas do libuv que não precisam ser tratadas como API de aplicação.

Duas filas frequentemente confundidas com fases são:

- fila de `process.nextTick`;
- fila de microtasks usada por Promises e `queueMicrotask`.

Elas não são simplesmente "mais duas fases do event loop".

O objetivo não é decorar um desenho. É conseguir explicar por que uma sequência executa em determinada ordem e reconhecer quando depender de detalhes finos de agendamento deixa o código frágil.

## Timers não são cronômetros exatos

```ts
const startedAt = Date.now();

setTimeout(() => {
  console.log(Date.now() - startedAt);
}, 100);
```

O `100` significa que o callback não deve ser considerado pronto antes daquele limiar. Não significa que será executado exatamente em 100 ms.

Se o event loop estiver ocupado por 500 ms:

```ts
setTimeout(() => {
  console.log("timer");
}, 10);

expensiveCalculation(80_000_000);
```

o timer espera até o JavaScript liberar o thread e o loop chegar a uma oportunidade adequada de executá-lo.

Isso é importante para:

- timeouts;
- retries;
- jobs periódicos;
- métricas;
- testes baseados em tempo.

Evite testes que dependam de precisão impossível.

## Poll e I/O

A fase de poll é central para o tratamento de eventos de I/O.

Em vez de imaginar que o runtime "verifica tudo em um while", pense que o sistema registra interesses, espera eventos de forma eficiente e, quando há trabalho pronto, o Node agenda callbacks JavaScript conforme as regras do loop.

Esse modelo permite milhares de conexões concorrentes quando grande parte do tempo é espera de I/O.

Ele não elimina o custo do JavaScript executado quando cada callback finalmente roda.

## `setImmediate` e `setTimeout`

Este código parece simples:

```ts
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
```

Fora de um contexto de I/O, não escreva lógica de negócio assumindo uma ordem universal apenas com base nesse exemplo.

Dentro de um callback de I/O, `setImmediate` possui uma relação mais previsível com a fase de `check`.

Crie testes pequenos para estudar o comportamento, mas evite construir contratos de aplicação sobre diferenças de scheduling que não são necessárias.

## Promises e microtasks

Handlers de Promises resolvidas são executados na fila de microtasks:

```ts
console.log("A");

Promise.resolve().then(() => {
  console.log("B");
});

console.log("C");
```

Resultado:

```text
A
C
B
```

A callback não interrompe o JavaScript que já está executando.

Uma cadeia extensa de microtasks também pode atrasar o retorno a outras partes do loop. Portanto "usar Promise" não significa automaticamente "ceder o processador de forma justa".

## `process.nextTick`

`process.nextTick()` possui uma fila específica e é executado antes de o event loop continuar para outras fases após a operação atual.

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

Em CommonJS, a ordem observada para exemplos simples pode colocar `nextTick` antes das microtasks de Promise. Em ESM, o contexto de avaliação do módulo altera detalhes de ordenação.

A documentação atual do Node recomenda preferir `queueMicrotask()` para a maior parte dos casos de userland quando as características especiais de `nextTick()` não são necessárias.

Mais importante: chamadas recursivas de `nextTick` podem impedir o loop de avançar.

```ts
function starve(): void {
  process.nextTick(starve);
}

starve();
```

Não rode isso sem controle em um ambiente importante. O exemplo existe para mostrar que uma fila prioritária pode causar starvation.

## `async`/`await` não muda a natureza da operação

Compare:

```ts
async function calculate(): Promise<number> {
  return expensiveCalculation(80_000_000);
}
```

com:

```ts
async function load(): Promise<Response> {
  return fetch("https://example.com");
}
```

As duas funções retornam Promise.

Mas a primeira executa CPU síncrona antes de resolver a Promise. A segunda inicia I/O assíncrono.

A assinatura `Promise<T>` informa como o resultado chega ao chamador. Ela não informa, sozinha, onde o trabalho foi executado.

## Erros assíncronos: a fronteira precisa ser explícita

Com `async/await`:

```ts
async function loadUser(id: string): Promise<User> {
  const response = await fetch(`/users/${id}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<User>;
}
```

O erro vira rejeição da Promise.

O chamador precisa decidir o que fazer:

```ts
try {
  const user = await loadUser("123");
  console.log(user);
} catch (error) {
  console.error(error);
}
```

Não espalhe `try/catch` mecanicamente por toda função. Coloque tratamento onde existe contexto suficiente para:

- converter o erro;
- adicionar contexto;
- executar compensação;
- responder ao cliente;
- registrar e encerrar um fluxo.

Capturar e ignorar é pior do que deixar a falha explícita.

## Não misture callbacks e Promises sem necessidade

Um código assim aumenta caminhos de erro:

```ts
someAsyncFunction()
  .then((value) => {
    callback(null, value);
  })
  .catch((error) => {
    callback(error);
  });
```

Em uma base moderna, escolha uma fronteira clara. Se precisar adaptar uma API antiga, faça isso em um ponto isolado.

Node oferece `util.promisify` para diversos padrões callback-first compatíveis, mas nem toda API deve ser convertida cegamente.

## Rejeições não tratadas não são estratégia de erro

Uma Promise criada e esquecida pode falhar fora do fluxo esperado:

```ts
void saveAuditLog(data);
```

O `void` pode tornar explícito que o resultado foi descartado, mas não resolve a política de erro.

Pergunte:

- a operação pode falhar silenciosamente?
- deve existir retry?
- o erro precisa ser logado?
- é uma tarefa crítica?
- o processo deve continuar?

A qualidade está na decisão, não em silenciar o linter.

## Cancelamento com `AbortController`

Operações assíncronas podem se tornar inúteis.

Um cliente pode desistir, um timeout pode expirar ou o processo pode iniciar shutdown.

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

Quando disponível, prefira APIs que aceitam `AbortSignal`.

Cancelamento deve atravessar as camadas relevantes. Não adianta cancelar o handler HTTP se uma função interna ignora completamente o sinal.

## Propagando cancelamento

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

A função não cria um controller interno desnecessário. Ela aceita o sinal do chamador.

Isso permite compor timeout de requisição, shutdown e cancelamento do usuário.

## Streams: processe dados ao longo do tempo

`readFile` precisa obter todo o conteúdo antes de entregar o resultado.

Streams permitem processar partes:

```ts
import { createReadStream } from "node:fs";

const stream = createReadStream("./data/large.csv");

stream.on("data", (chunk) => {
  console.log(chunk.length);
});
```

Para código de produção, ouvir apenas `data` raramente é suficiente. Você precisa considerar:

- erro;
- encerramento;
- backpressure;
- composição;
- cancelamento;
- cleanup.

## Tipos fundamentais de stream

### Readable

Produz dados.

Exemplos:

- arquivo sendo lido;
- corpo de uma requisição HTTP;
- resposta HTTP;
- gerador transformado em stream.

### Writable

Recebe dados.

Exemplos:

- arquivo de saída;
- resposta HTTP;
- destino de compressão ou armazenamento.

### Duplex

Pode ler e escrever de forma independente.

Sockets são um exemplo importante.

### Transform

Recebe dados e produz uma versão transformada.

```ts
import { Transform } from "node:stream";

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});
```

## `pipeline`: componha com política de erro

Em vez de encadear `.pipe()` e gerenciar manualmente todos os eventos, prefira `pipeline` quando ele se adequar ao fluxo.

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

`pipeline` ajuda a encaminhar erros e realizar cleanup dos streams envolvidos.

Também pode trabalhar com cancelamento em APIs compatíveis.

## Backpressure: o consumidor define um limite

Imagine um produtor capaz de ler dados mais rapidamente do que o destino consegue gravar.

Sem controle, chunks se acumulam em memória.

A interface `Writable.write()` informa se o produtor deve continuar:

```ts
const canContinue = writable.write(chunk);

if (!canContinue) {
  await once(writable, "drain");
}
```

Streams e `pipeline` implementam mecanismos para coordenar esse fluxo.

Backpressure não significa "o programa fica lento". Significa que o produtor respeita a capacidade do consumidor para manter uso de recursos previsível.

## Experimento: arquivo inteiro versus stream

Crie um arquivo grande reproduzível.

Versão A:

```ts
import { readFile, writeFile } from "node:fs/promises";

const content = await readFile(inputPath);
await writeFile(outputPath, content);
```

Versão B:

```ts
await pipeline(
  createReadStream(inputPath),
  createWriteStream(outputPath),
);
```

Registre durante a execução:

```ts
const memory = process.memoryUsage();

console.log({
  rssMb: memory.rss / 1024 / 1024,
  heapUsedMb: memory.heapUsed / 1024 / 1024,
  externalMb: memory.external / 1024 / 1024,
});
```

Não conclua que stream é "sempre mais rápido". O ganho mais importante pode ser previsibilidade de memória.

Meça:

- duração;
- pico aproximado de RSS;
- heap;
- volume processado;
- tamanho do arquivo;
- número de execuções;
- ambiente.

## Buffer: bytes, não texto mágico

Node usa `Buffer` para representar dados binários.

```ts
const buffer = Buffer.from("Olá", "utf8");

console.log(buffer);
console.log(buffer.length);
console.log(buffer.toString("utf8"));
```

O número de bytes não é necessariamente igual ao número de caracteres percebidos pelo usuário.

Isso importa para:

- protocolos;
- arquivos;
- criptografia;
- limites de payload;
- chunks de stream;
- encoding.

Nunca transforme binário em string e de volta apenas por conveniência sem entender o encoding e o custo.

## `Buffer.alloc` versus `Buffer.allocUnsafe`

```ts
const safe = Buffer.alloc(1024);
const fast = Buffer.allocUnsafe(1024);
```

`alloc` inicializa a memória.

`allocUnsafe` pode evitar inicialização e deve ser usado somente quando o conteúdo será completamente sobrescrito antes de ser lido ou exposto.

Aqui, "unsafe" é informação de projeto, não decoração no nome.

## Filesystem: async não significa sem custo

APIs de filesystem possuem versões diferentes:

```ts
import { readFile } from "node:fs/promises";

const content = await readFile(path);
```

e:

```ts
import { createReadStream } from "node:fs";

const stream = createReadStream(path);
```

Ambas podem ser assíncronas, mas possuem perfis diferentes de memória e composição.

Também existe API síncrona:

```ts
import { readFileSync } from "node:fs";

const config = readFileSync("./config.json", "utf8");
```

Uma operação síncrona durante inicialização pode ser aceitável em alguns programas. A mesma operação dentro de uma rota concorrente pode ser um problema grave.

Contexto importa.

## `path`: não monte caminhos manualmente

Evite:

```ts
const file = base + "/" + folder + "/" + name;
```

Prefira:

```ts
import path from "node:path";

const file = path.join(base, folder, name);
```

Além de portabilidade, a API deixa a intenção clara.

Para caminhos derivados de módulos ESM:

```ts
const file = new URL("./data/input.csv", import.meta.url);
```

Use a abordagem que combine com o contrato da API de destino.

## `crypto`: custo de segurança também é custo de CPU

Criptografia e hashing possuem custos intencionais.

```ts
import { scrypt } from "node:crypto";

scrypt(password, salt, 64, (error, derivedKey) => {
  if (error) {
    throw error;
  }

  console.log(derivedKey);
});
```

Ao testar operações criptográficas concorrentes, observe:

- latência;
- CPU;
- worker pool;
- fila;
- event loop;
- concorrência total.

Nunca reduza parâmetros de segurança apenas para melhorar benchmark sem entender o requisito criptográfico.

## HTTP nativo: veja o que o framework abstrai

```ts
import { createServer } from "node:http";

const server = createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify({ ok: true }));
});

server.listen(3000);
```

Estude ao menos uma vez:

- headers;
- status;
- request body como stream;
- response como writable;
- connection lifecycle;
- timeout;
- abort;
- erro;
- keep-alive.

Depois, quando um framework se comportar de forma inesperada, você terá um modelo mental abaixo dele.

## `fetch` nativo e fronteiras externas

Node possui `fetch` global em versões modernas.

```ts
const response = await fetch("https://example.com/api");

if (!response.ok) {
  throw new Error(`Unexpected status: ${response.status}`);
}
```

`fetch` resolver a Promise não significa que um status HTTP 500 virou rejeição. Você ainda precisa interpretar o protocolo.

Sempre diferencie:

- erro de transporte;
- timeout/cancelamento;
- status HTTP de erro;
- payload inválido;
- regra de negócio inválida.

## CommonJS e ESM são modelos diferentes

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

Node possui dois sistemas de módulos e interoperabilidade entre eles, mas as regras não são idênticas.

Estude:

- `"type"` no `package.json`;
- `.mjs`;
- `.cjs`;
- resolução;
- `exports`;
- `imports`;
- `import.meta`;
- `require`;
- dynamic `import()`;
- compatibilidade de ferramentas.

## Seja explícito sobre o formato do pacote

Um `package.json` com:

```json
{
  "type": "module"
}
```

torna a intenção explícita para `.js` dentro daquele escopo.

Mesmo quando uma ferramenta de build aceita imports sem configuração clara, o runtime que executará o artefato precisa interpretar o resultado corretamente.

Evite depender de "funcionou no meu test runner" como prova de compatibilidade.

## Resolução de módulos faz parte do design

Considere:

```ts
import { service } from "./service.js";
```

Em um projeto TypeScript configurado para ESM/NodeNext, extensões e resolução precisam combinar com o JavaScript emitido e o runtime.

O laboratório deve testar o artefato compilado, não apenas executar TypeScript diretamente com uma ferramenta que possui regras próprias.

Mantenha scripts separados:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "node --test",
    "start": "node dist/main.js"
  }
}
```

Adapte à sua ferramenta, mas garanta que o build real seja executável.

## CPU-bound versus I/O-bound

Essa distinção guia a solução.

### CPU-bound

O tempo é dominado por cálculo:

- parsing pesado;
- compressão específica;
- transformação intensiva;
- criptografia no JavaScript;
- processamento de imagem em código CPU-intensivo;
- algoritmos grandes.

Sinais possíveis:

- CPU alta;
- event loop delay aumentando;
- rota de saúde atrasando;
- profiler concentrado em funções JavaScript.

### I/O-bound

O tempo é dominado por espera de:

- rede;
- banco;
- disco;
- serviços externos.

Sinais possíveis:

- latência alta com CPU relativamente baixa;
- tempo concentrado em espera externa;
- event loop não necessariamente saturado;
- melhoria ao reduzir round trips ou paralelizar I/O independente com limites.

Não confunda "resposta lenta" com "CPU lenta".

## Paralelizar Promises não corrige CPU síncrona

Isto:

```ts
await Promise.all([
  calculateHeavyTask(),
  calculateHeavyTask(),
  calculateHeavyTask(),
]);
```

não transforma funções CPU-bound síncronas em execução paralela.

Se cada chamada bloqueia antes de retornar uma Promise, o problema permanece.

Para CPU JavaScript genuinamente paralela, investigue `worker_threads`.

## `worker_threads`: paralelismo para CPU

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

Workers possuem custo:

- criação;
- memória;
- serialização ou transferência de dados;
- coordenação;
- tratamento de erro;
- shutdown.

Para tarefas repetidas, criar um worker por unidade pode custar mais que o trabalho. Um pool pode ser mais apropriado.

Workers não são a primeira solução para I/O. O próprio runtime já possui mecanismos assíncronos mais adequados para isso.

## Refatorando a rota CPU-bound

Antes:

```ts
if (request.url === "/cpu") {
  const result = expensiveCalculation(80_000_000);
  response.end(String(result));
}
```

Depois, mova a tarefa para uma abstração:

```ts
interface CpuTaskRunner {
  run(iterations: number, signal?: AbortSignal): Promise<number>;
}
```

Uma implementação pode usar worker threads.

O handler passa a depender do contrato, não da estratégia:

```ts
const result = await cpuTaskRunner.run(
  80_000_000,
  requestSignal,
);
```

Isso reduz acoplamento e permite testar:

- regra do handler;
- implementação do worker;
- cancelamento;
- erro;
- timeout.

## Não esconda dependências de runtime

Código difícil de testar:

```ts
export async function buildReport(): Promise<Report> {
  const startedAt = Date.now();
  const response = await fetch(process.env.REPORT_URL!);
  // ...
}
```

Melhor:

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

O ponto não é criar interfaces para tudo. É controlar dependências que tornam comportamento não determinístico ou difícil de substituir em testes.

## Streams também melhoram arquitetura

Antes:

```ts
async function compressFile(path: string): Promise<Buffer> {
  const content = await readFile(path);
  return gzip(content);
}
```

A função exige que o conteúdo inteiro exista na memória.

Uma interface streaming permite trabalhar em fluxo:

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

Agora o contrato mudou: em vez de retornar todo o arquivo, a função produz uma saída.

Essa mudança pode melhorar consumo de memória, mas também altera uso, tratamento de erro e testabilidade. Registre o trade-off.

## Erros em streams precisam de estratégia

Streams envolvem múltiplos componentes que podem falhar:

- origem;
- transform;
- destino;
- abort;
- filesystem.

`pipeline` ajuda a centralizar a falha:

```ts
try {
  await pipeline(source, transform, destination);
} catch (error) {
  if (signal.aborted) {
    // tratar cancelamento conforme o contrato
  }

  throw error;
}
```

Não use `catch` para converter todo erro em "falha de leitura" se o problema poderia ter ocorrido no destino.

Preserve `cause` quando adicionar contexto:

```ts
throw new Error(
  "Failed to generate compressed report",
  { cause: error },
);
```

## Testes unitários, integração, contrato e e2e

### Unitário

Teste uma função CPU ou uma regra de transformação isolada.

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

### Integração

Teste filesystem, stream e componentes reais trabalhando juntos.

```ts
test("copies a file through pipeline", async () => {
  // cria arquivo temporário
  // executa pipeline
  // compara saída
});
```

### Contrato

Teste a interface externa:

- status HTTP;
- headers;
- formato JSON;
- comportamento de erro;
- cancelamento esperado.

### E2E

Suba o processo ou servidor real e execute o fluxo completo.

Inclua poucos caminhos críticos e mantenha diagnóstico simples.

## Testes de ordem do event loop

Use testes didáticos, não frágeis.

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

Para `nextTick`, `setImmediate` e timers, documente o contexto do teste. Não use uma ordem acidental como regra de negócio.

## Caracterização antes de refatorar código assíncrono

Uma função antiga pode possuir comportamento estranho:

```ts
async function legacyRetry(
  operation: () => Promise<string>,
): Promise<string> {
  // implementação antiga
}
```

Antes de mudar para uma política melhor, registre:

- número de tentativas;
- atraso;
- quais erros repetem;
- quais erros encerram;
- valor final;
- comportamento de cancelamento.

Characterization tests protegem o comportamento atual até você decidir conscientemente o que deve mudar.

## Pequenas etapas na refatoração

Uma sequência possível:

1. adicionar teste do comportamento atual;
2. extrair função longa;
3. tipar dependências;
4. introduzir `AbortSignal`;
5. manter API externa igual;
6. substituir `readFile` por stream internamente;
7. medir;
8. revisar resultados;
9. só então alterar contrato público, se necessário.

Cada PR deve ter uma pergunta clara.

Evite uma mudança única com:

- ESM migration;
- refactor;
- worker threads;
- troca de test runner;
- lint novo;
- stream;
- alteração de API.

Isso dificulta revisão e causa regressões difíceis de localizar.

## Cheiros de código no contexto do runtime

### Trabalho CPU escondido em handler

```ts
app.get("/report", async () => {
  return buildHugeReportSynchronously();
});
```

`async` mascara visualmente o fato de que o trabalho bloqueia.

### I/O síncrono em caminho quente

```ts
const template = readFileSync(file, "utf8");
```

Dentro de uma rota executada milhares de vezes, isso pode bloquear o loop.

### `Promise.all` sem limite

```ts
await Promise.all(
  ids.map((id) => loadRemoteResource(id)),
);
```

Com 100 mil IDs, você pode gerar concorrência descontrolada.

### Bufferização desnecessária

```ts
const entireFile = await readFile(path);
```

quando o consumidor aceita chunks.

### Dependência de tempo escondida

```ts
await new Promise((resolve) => setTimeout(resolve, 500));
```

espalhada em regras de negócio dificulta testes.

### Erro engolido

```ts
try {
  await operation();
} catch {
  return null;
}
```

Sem registrar por que `null` é um resultado válido.

## Concorrência não significa concorrência ilimitada

Para I/O independente, concorrência pode reduzir duração total.

Mas toda dependência possui limites:

- conexões;
- sockets;
- quotas;
- pool do banco;
- memória;
- serviço remoto.

Implemente limites quando necessário.

Uma fila simples de concorrência controlada pode ser mais saudável que um `Promise.all` gigante.

O laboratório deve medir ambos.

## Profiling: prove onde a CPU está

Node oferece mecanismos de profiling que podem gerar perfis consumíveis por ferramentas de análise.

Um exemplo simples:

```bash
node --cpu-prof dist/server.js
```

Depois execute carga que reproduza o problema.

O profile deve responder:

- quais funções consumiram CPU?
- quanto do tempo ficou nelas?
- a hipótese original estava correta?
- a carga representa o problema real?

Não escolha a função "que parece lenta" olhando apenas para o código.

## CPU profile antes e depois

Guarde artefatos em:

```text
docs/
  profiles/
    before/
    after/
```

Registre:

- versão do Node;
- máquina;
- comando;
- duração da carga;
- volume;
- concorrência;
- commit;
- interpretação.

Se a função CPU-bound some do perfil depois de usar workers, verifique onde o custo foi parar. Você não eliminou o cálculo; mudou onde ele executa.

## Memória: snapshot sem contexto pode enganar

Para estudar memória:

- `process.memoryUsage()`;
- heap profiling;
- snapshots em ambiente controlado;
- RSS ao longo do tempo;
- volume processado.

Diferencie:

- pico temporário;
- crescimento proporcional ao volume;
- cache intencional;
- leak real.

Um gráfico que sobe durante carga e desce depois do GC não prova vazamento.

## Heap profiling

Node pode produzir heap profiles por opções de runtime.

Em um experimento controlado:

```bash
node --heap-prof dist/process-file.js
```

Use o resultado para descobrir alocações relevantes.

Nunca capture dados sensíveis de produção sem política apropriada; profiles e snapshots podem conter valores do processo.

## Event loop delay

Node fornece `monitorEventLoopDelay` em `node:perf_hooks`.

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

Quando CPU síncrona bloqueia o loop, timers e callbacks atrasam. Essa métrica ajuda a observar o fenômeno.

Ela não explica sozinha a causa. Combine com CPU profile e contexto de carga.

## Event loop utilization

`performance.eventLoopUtilization()` ajuda a observar quanto tempo o event loop esteve ativo versus ocioso em uma janela.

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

Utilização alta pode ser sinal importante, mas não transforme um limite arbitrário em verdade universal.

## Microbenchmark não é benchmark de sistema

Um microbenchmark:

```ts
const start = performance.now();

for (let i = 0; i < 1_000_000; i += 1) {
  normalizeLine(input);
}

console.log(performance.now() - start);
```

pode comparar duas implementações locais.

Mas não prova automaticamente:

- throughput HTTP;
- comportamento sob concorrência;
- consumo de memória;
- custo de rede;
- impacto no banco;
- latência p99.

Use a menor ferramenta capaz de responder à pergunta.

## Simule carga com uma hipótese

Antes de executar carga, escreva:

> Hipótese: a rota CPU-bound aumenta o event loop delay e degrada a latência da rota `/health` quando há concorrência.

Meça:

- throughput;
- latência mediana;
- p95/p99, quando disponível;
- CPU;
- RSS;
- heap;
- event loop delay;
- erros.

Depois refatore e repita com condições semelhantes.

Não troque três variáveis ao mesmo tempo.

## Experimento de CPU-bound

Cenário A:

```text
/health -> resposta trivial
/cpu    -> cálculo síncrono
```

Gere chamadas concorrentes para `/cpu` enquanto mede `/health`.

Espere observar que `/health` também sofre, pois o cálculo ocupa a thread JavaScript principal.

Cenário B:

mova o cálculo para um worker/pool.

Repita.

Registre:

- melhora observada;
- overhead do worker;
- custo de memória;
- efeito em baixa concorrência;
- limite do teste.

## Experimento de I/O-bound

Crie um endpoint que consulta vários recursos independentes.

Versão sequencial:

```ts
const a = await loadA();
const b = await loadB();
const c = await loadC();
```

Versão concorrente:

```ts
const [a, b, c] = await Promise.all([
  loadA(),
  loadB(),
  loadC(),
]);
```

Se as operações são independentes, a segunda abordagem pode reduzir duração.

Mas crie também um cenário com centenas ou milhares de operações e mostre que concorrência ilimitada pode saturar recursos.

A lição não é "`Promise.all` é melhor". É "a estratégia depende do limite do sistema".

## Experimento de streams

Versão A:

```ts
const file = await readFile(path);
const compressed = await gzipAsync(file);
await writeFile(output, compressed);
```

Versão B:

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
- tempo;
- tamanho;
- CPU;
- comportamento com dois ou dez arquivos simultâneos.

O resultado mais importante pode aparecer sob concorrência, não em uma execução isolada.

## Qualidade: lint como proteção mecânica

Configure ESLint para capturar problemas que importam no laboratório:

- Promises esquecidas;
- `await` desnecessário;
- callbacks assíncronos usados incorretamente;
- imports não usados;
- `any` explícito sem justificativa;
- branches impossíveis;
- erros de tipos.

Lint não mede event loop, arquitetura ou performance. Ele reduz defeitos mecânicos.

## Coverage: comportamento não executado

Use coverage para descobrir:

- tratamento de abort não testado;
- branch de erro de stream nunca executado;
- worker que nunca falha em teste;
- timeout sem cobertura;
- shutdown não validado.

Não busque 100% por estética.

Um branch crítico de erro vale mais que dezenas de getters triviais.

## Mutation testing

Mutation testing pode revelar testes assíncronos fracos.

Exemplo:

```ts
if (attempt >= maxAttempts) {
  throw error;
}
```

Uma mutação para:

```ts
if (attempt > maxAttempts) {
  throw error;
}
```

deve ser percebida pelos testes de retry.

Use mutation testing em módulos pequenos:

- retry;
- timeout;
- parser;
- regras de chunk;
- transformação.

Não execute sobre todo o laboratório apenas para gerar um score.

## Complexidade

Uma função assíncrona longa tende a esconder:

- estado;
- tentativas;
- cleanup;
- timeout;
- parsing;
- persistência;
- logging.

Métricas simples de complexidade podem indicar onde investigar.

Refatore por responsabilidade e contratos, não por meta numérica isolada.

## Um laboratório que prova conhecimento

Crie o repositório:

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

Scripts possíveis:

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

Adapte scripts à versão LTS escolhida e às ferramentas reais do projeto.

O importante é que outra pessoa consiga reproduzir a evidência apenas com README e comandos versionados.

## Sequência de estudo no laboratório

### Experimento 1 — event loop

Crie um arquivo que combine:

- código síncrono;
- Promise;
- `queueMicrotask`;
- `process.nextTick`;
- timer;
- `setImmediate`;
- I/O.

Antes de executar, escreva sua previsão.

Depois:

1. rode em ESM;
2. registre a saída;
3. explique o resultado;
4. compare com a documentação;
5. identifique quais ordens são garantias relevantes e quais não devem virar contrato da aplicação.

### Experimento 2 — erro assíncrono

Crie três casos:

1. `throw` dentro de função síncrona;
2. rejeição de Promise aguardada;
3. Promise rejeitada criada e não aguardada.

Escreva testes que mostrem a diferença.

Depois refatore para uma política explícita de tratamento.

### Experimento 3 — cancelamento

Crie uma operação artificialmente lenta com `AbortSignal`.

Teste:

- completa normalmente;
- abort antes de iniciar;
- abort durante execução;
- cleanup executado;
- erro de cancelamento distinguível.

### Experimento 4 — stream e backpressure

Crie um `Readable` rápido e um `Writable` deliberadamente lento.

Observe:

- `highWaterMark`;
- retorno de `write`;
- evento `drain`;
- memória;
- comportamento com e sem pipeline adequado.

### Experimento 5 — CPU-bound

Use uma função reproduzível.

Meça:

- duração;
- CPU;
- event loop delay;
- latência de `/health`.

Depois mova o trabalho para worker thread e repita.

### Experimento 6 — arquivo grande

Compare:

- `readFile`;
- stream + pipeline.

Meça memória e duração.

### Experimento 7 — módulos

Crie duas pequenas variantes do mesmo módulo:

- CommonJS;
- ESM.

Teste:

- import;
- export;
- resolução;
- `__dirname` versus `import.meta`;
- execução do build;
- execução do test runner.

Registre dificuldades reais de interoperabilidade.

## Compare abordagens e registre onde falham

| Comparação | O que medir/observar | Onde cada opção falha |
| --- | --- | --- |
| CPU no event loop vs. worker thread | latência, CPU, event loop delay, overhead | event loop bloqueia outros callbacks; worker custa memória e coordenação |
| `readFile` vs. stream | memória, duração, simplicidade | buffer inteiro escala mal com volume; stream aumenta complexidade |
| sequencial vs. `Promise.all` | duração, concorrência e limites externos | sequencial perde paralelismo; concorrência ilimitada pode saturar recursos |
| `setTimeout` vs. `setImmediate` | contexto e ordem observada | depender de ordem fora do contexto correto cria código frágil |
| `nextTick` vs. `queueMicrotask` | prioridade e portabilidade | `nextTick` pode causar starvation; microtask não substitui toda semântica específica |
| CommonJS vs. ESM | interoperabilidade, tooling e runtime | CJS é legado em muitos projetos; ESM exige atenção a resolução e ecossistema |
| bufferização vs. pipeline | memória e facilidade de implementação | bufferização exige memória proporcional; pipeline exige gestão de fluxo |
| microbenchmark vs. carga integrada | custo local e comportamento do sistema | microbenchmark não representa produção; teste integrado dificulta isolar causa |
| refactor grande vs. etapas pequenas | diff, reversibilidade e diagnóstico | mudança grande mistura causas; etapas pequenas exigem disciplina |

## Crie exemplos pequenos que quebrem

Faça pelo menos estes experimentos:

1. bloqueie o event loop e observe timer atrasar;
2. crie recursão de `nextTick` em ambiente controlado e observe starvation;
3. dispare uma Promise sem tratamento e registre o comportamento;
4. ignore backpressure e observe o crescimento de memória;
5. tente processar arquivo grande inteiro sob concorrência;
6. mova I/O para worker thread e compare com o mecanismo nativo;
7. crie um worker por tarefa muito pequena e prove o overhead;
8. force abort durante `pipeline`;
9. provoque erro no Readable e no Writable;
10. migre um módulo para ESM sem ajustar a resolução e registre a falha.

O erro faz parte do material. Guarde:

- código que falhou;
- saída;
- hipótese;
- explicação;
- correção;
- limite da conclusão.

## Issues e PRs como evidência

Issue:

```text
perf: health endpoint stalls during CPU-heavy request
```

Descreva:

- cenário;
- reprodução;
- evidência;
- hipótese;
- critério de aceite.

PR:

```text
refactor: move CPU-heavy calculation behind worker task runner
```

Inclua:

- comportamento anterior;
- design escolhido;
- profile antes;
- profile depois;
- testes;
- custo introduzido;
- risco;
- follow-up.

Outro exemplo:

```text
refactor: replace buffered file processing with stream pipeline
```

Explique a mudança do contrato, memória observada e tratamento de erros.

## README profissional

O README deve explicar:

1. objetivo;
2. por que o runtime importa;
3. arquitetura;
4. requisitos;
5. comandos;
6. como gerar arquivos de teste;
7. como iniciar servidor;
8. como executar carga;
9. como gerar CPU profile;
10. como medir memória;
11. como rodar testes;
12. experimentos;
13. resultados;
14. limitações;
15. próximos passos.

Inclua um resumo em inglês:

```md
## English summary

This repository studies Node.js below the framework layer.
It focuses on the event loop, asynchronous I/O, streams,
backpressure, cancellation, memory, profiling, worker threads,
and safe refactoring supported by automated tests and measurements.
```

## Evidências para GitHub e portfólio

A comprovação não deve ser "sei Node.js".

Produza:

- repositório público;
- README em português;
- resumo em inglês;
- CI;
- badge;
- testes automatizados;
- issues;
- PRs;
- CPU profile antes/depois;
- medição de memória;
- experimento de event loop delay;
- exemplo de stream/backpressure;
- exemplo de cancelamento;
- comparação CommonJS/ESM;
- artigo ou vlog;
- seção de portfólio.

Uma descrição de impacto melhor:

> Em uma carga controlada, a rota CPU-bound executada no thread principal elevou o atraso do event loop e afetou uma rota de saúde independente. Após mover o cálculo para workers reutilizáveis, o cálculo continuou consumindo CPU, mas a thread do servidor permaneceu disponível para tratar outros callbacks. O experimento registra máquina, volume, concorrência e overhead dos workers.

Melhor do que:

> "Usei worker threads e deixei o Node 10x mais rápido."

Velocidade sem cenário é uma afirmação vazia.

## Artigo prático 1 — Node.js por baixo do framework: runtime aplicado a qualidade e refatoração

### Título sugerido

**Node.js por baixo do framework: runtime aplicado a qualidade e refatoração**

Comece com um problema do laboratório:

> Uma rota de cálculo fazia até `/health` responder lentamente.

Apresente:

1. modelo simplificado do processo;
2. event loop;
3. diferença entre I/O assíncrono e CPU síncrona;
4. medição;
5. profile;
6. refatoração;
7. worker ou outra solução escolhida;
8. testes;
9. trade-offs;
10. limites.

Mostre por que remover o framework do exemplo ajuda a enxergar o runtime.

Não transforme o artigo em "Node é single-threaded". Explique as camadas.

## Artigo prático 2 — Event loop, promises e erros assíncronos explicados com código testado

### Título sugerido

**Event loop, promises e erros assíncronos explicados com código testado**

Estruture como aula prática.

### Erro comum

```ts
async function heavy() {
  return expensiveCalculation();
}
```

Mostre por que `async` não remove bloqueio.

### Ordem de execução

Crie exemplos com:

- stack atual;
- Promise;
- `queueMicrotask`;
- `nextTick`;
- timer;
- immediate.

### Erros

Compare:

- throw síncrono;
- Promise rejeitada;
- `try/catch`;
- tarefa disparada sem `await`.

### Testes

Mostre testes que comprovam comportamento relevante.

### Conclusão

Explique quais detalhes são úteis para arquitetura e quais não devem virar dependência frágil.

## Artigo prático 3 — Como medir antes de otimizar em Node.js

### Título sugerido

**Como medir antes de otimizar em Node.js**

Comece com uma hipótese mensurável.

Exemplo:

> Processar o arquivo inteiro está causando pico de memória desnecessário.

Compare:

- `readFile`;
- stream.

Registre:

- máquina;
- Node;
- arquivo;
- tamanho;
- concorrência;
- duração;
- RSS;
- heap;
- número de repetições.

Ou use o caso CPU-bound:

- CPU profile;
- event loop delay;
- latência da rota de saúde.

Feche com uma seção obrigatória:

**O que este teste não prova**

Exemplo:

- não representa tráfego real;
- não mede banco;
- não prova comportamento em outra máquina;
- não mede custo operacional;
- não significa que uma solução vence em qualquer cenário.

Isso demonstra maturidade técnica.

## Formato recomendado para os artigos

Cada artigo pode ter entre 800 e 1.500 palavras.

Estrutura:

1. introdução;
2. problema;
3. hipótese;
4. código;
5. teste ou medição;
6. resultado;
7. refatoração;
8. nova medição;
9. trade-offs;
10. limitações;
11. conclusão;
12. link do GitHub.

Um vlog pode mostrar:

- terminal;
- servidor;
- carga;
- profiler;
- event loop delay;
- memória;
- testes;
- diff;
- PR.

## Como explicar trade-offs em uma entrevista internacional

Use inglês técnico simples.

> The endpoint was CPU-bound, so making the function `async` did not solve the problem. The calculation still ran on the main JavaScript thread and delayed unrelated callbacks. We moved the computation to a reusable worker pool and measured event loop delay before and after. The trade-off was additional memory and coordination overhead.

Outro exemplo:

> We replaced whole-file buffering with a stream pipeline because memory usage grew with file size and concurrency. The streaming version kept memory more predictable, but error handling and cancellation became more important, so we covered those paths with integration tests.

Outro:

> We use `AbortSignal` across I/O boundaries so work can be cancelled when the caller no longer needs it. Cancellation is part of the contract; it is not implemented only in the HTTP handler.

Outro:

> We kept the application on ESM and tested the compiled output directly. This avoided relying on behavior provided only by the TypeScript development runner.

Essas respostas mostram:

- contexto;
- evidência;
- decisão;
- custo.

## Checklist técnico de conclusão

Você terá concluído o E014 quando conseguir:

- explicar o que é um processo Node;
- explicar por que "Node é single-threaded" é uma simplificação;
- diferenciar event loop, sistema operacional, libuv worker pool e `worker_threads`;
- descrever timers, pending callbacks, poll, check e close callbacks em nível útil;
- explicar que Promise microtasks e `nextTick` não são simplesmente fases comuns;
- demonstrar uma ordem de execução com código e teste;
- explicar por que `async` não corrige CPU-bound;
- tratar erros de Promises conscientemente;
- propagar cancelamento com `AbortSignal`;
- usar Readable, Writable e Transform;
- usar `pipeline`;
- explicar backpressure;
- trabalhar conscientemente com Buffer;
- escolher entre bufferização e streaming;
- usar filesystem e path sem esconder custo;
- usar HTTP nativo ao menos em um laboratório;
- usar `fetch` com tratamento de protocolo e cancelamento;
- explicar diferenças práticas entre CommonJS e ESM;
- executar o build real e testar resolução;
- distinguir CPU-bound de I/O-bound;
- executar uma experiência com worker threads;
- produzir CPU profile;
- observar memória;
- medir event loop delay ou utilization;
- executar carga com hipótese;
- distinguir microbenchmark de teste integrado;
- explicar unitário, integração, contrato e e2e;
- fazer refatoração em etapas pequenas;
- identificar acoplamento, duplicação, função longa e dependência escondida;
- interpretar lint e coverage sem tratá-los como arquitetura;
- executar um pequeno mutation test ou análise equivalente;
- comparar ao menos duas abordagens e registrar onde falham;
- explicar um trade-off em inglês técnico simples;
- produzir evidência pública reproduzível.

## O que você deve levar deste ciclo

Node.js é um runtime, não um sinônimo de framework HTTP.

A qualidade de um backend depende de entender onde o trabalho executa, quanto tempo ocupa o event loop, quanta memória mantém, como reage a backpressure, como cancela tarefas, como propaga erros e como mede gargalos.

No contexto de qualidade e refatoração, esse conhecimento muda a forma de alterar código.

Em vez de:

> "acho que streams são mais rápidas",

você mede memória e throughput.

Em vez de:

> "vou colocar async",

você identifica se o trabalho é I/O ou CPU.

Em vez de:

> "worker thread deixa mais rápido",

você mede event loop, overhead e custo de coordenação.

Em vez de:

> "a aplicação está lenta",

você produz um profile e uma hipótese verificável.

Você terá concluído o E014 quando conseguir provocar um problema de runtime, medi-lo, localizar sua causa, refatorar em pequenas etapas e demonstrar o resultado de forma reproduzível.

O resultado final deve ser avaliável sem conversa privada: repositório público, README bilíngue, CI, testes, profiles, medições, issues, PRs, código antes/depois e um artigo ou vlog que reconheça os limites do experimento.

## Referências primárias

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
- [Node.js — Diagnostics: Profiling](https://nodejs.org/en/learn/diagnostics)
- [Node.js — Test Runner](https://nodejs.org/api/test.html)
