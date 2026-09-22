---
translationId: 2e131313-1313-4313-8313-131313131313
articleId: e0131313-1313-4313-8313-131313131313
locale: pt-BR
slug: typescript-profundo-qualidade-refatoracao
title: "TypeScript profundo para qualidade e refatoração: tipos como ferramenta de arquitetura"
description: "Um guia prático para usar TypeScript strict, modelagem de estados, narrowing, generics e testes como ferramentas de qualidade, refatoração segura e redução de erros antes do runtime."
status: draft
---

# TypeScript profundo para qualidade e refatoração: tipos como ferramenta de arquitetura

Aprender TypeScript de forma profissional não significa memorizar todas as formas possíveis de declarar um tipo. O objetivo é fazer o compilador trabalhar a favor da arquitetura: tornar contratos explícitos, impedir estados inválidos, reduzir ambiguidades e permitir mudanças com menos risco.

Neste ciclo, o contexto é **qualidade e refatoração**. Por isso, cada conceito deve responder a uma pergunta prática: como este recurso torna o código mais fácil de entender, testar, modificar e revisar?

TypeScript será usado como uma ferramenta para quatro capacidades:

1. modelar contratos entre partes do sistema;
2. representar estados válidos e eliminar combinações impossíveis;
3. tornar refatorações mais seguras;
4. produzir evidências objetivas de qualidade por meio de testes e ferramentas.

> Tipagem forte não substitui testes nem bom design. Ela reduz uma classe de erros e torna decisões de design verificáveis antes do runtime.

<!-- VISUAL:
Fluxo em quatro blocos: entrada externa -> validação/narrowing -> domínio tipado -> testes/refatoração.
Ao redor do domínio, destacar: contratos, estados válidos, feedback do compilador e cobertura.
-->

## O problema que guia o laboratório

Imagine um serviço que recebe solicitações de pagamento. Uma versão inicial pode representar o estado assim:

```ts
type Payment = {
  id: string;
  status: string;
  approvedAt?: Date;
  rejectedReason?: string;
};
```

Esse tipo aceita combinações incoerentes:

```ts
const payment: Payment = {
  id: "pay-1",
  status: "approved",
  rejectedReason: "insufficient_funds",
};
```

O compilador não reclama. A estrutura permite um pagamento aprovado com motivo de rejeição e também permite qualquer texto em `status`.

O objetivo do laboratório será transformar esse código em uma modelagem na qual estados impossíveis deixem de ser representáveis.

Uma primeira evolução:

```ts
type PendingPayment = {
  id: string;
  status: "pending";
};

type ApprovedPayment = {
  id: string;
  status: "approved";
  approvedAt: Date;
};

type RejectedPayment = {
  id: string;
  status: "rejected";
  rejectedReason: string;
};

type Payment =
  | PendingPayment
  | ApprovedPayment
  | RejectedPayment;
```

Agora o compilador participa da regra de negócio. Um estado inválido exige uma quebra explícita do contrato, em vez de surgir silenciosamente.

## `tsconfig` é parte da arquitetura

Um projeto profissional deve começar com um compilador configurado para revelar ambiguidade, não para escondê-la.

Uma base possível:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"]
    }
  }
}
```

`strict` ativa um conjunto de verificações que tornam ausências, parâmetros e retornos mais explícitos. `noImplicitAny` impede que lacunas de tipagem virem `any` por acidente.

`exactOptionalPropertyTypes` merece atenção. Sem ele, uma propriedade opcional pode aceitar explicitamente `undefined` em situações nas quais a intenção original era apenas permitir ausência:

```ts
type UserPatch = {
  displayName?: string;
};
```

Com essa opção, estas duas operações carregam significados diferentes:

```ts
const a: UserPatch = {};
const b: UserPatch = { displayName: undefined }; // erro, se undefined não fizer parte do tipo
```

Isso é especialmente útil em DTOs de atualização, nos quais "campo ausente" pode significar "não alterar" e `undefined` não deveria ser tratado como um valor válido.

Caminhos de módulo também precisam ser tratados com disciplina. Um alias pode melhorar legibilidade, mas não deve esconder dependências circulares ou tornar a estrutura incompreensível.

## Tipos primitivos, arrays, tuples e inferência

Os tipos mais simples continuam sendo importantes porque compõem contratos maiores.

```ts
const active: boolean = true;
const retryCount: number = 3;
const customerId: string = "cus_123";

const tags: string[] = ["typescript", "quality"];
const point: readonly [number, number] = [10, 20];
```

Uma tuple representa posições com significado conhecido. Um array representa uma coleção homogênea. Trocar um pelo outro sem pensar pode destruir informação.

Compare:

```ts
type CoordinatesArray = number[];
type CoordinatesTuple = readonly [latitude: number, longitude: number];
```

A tuple deixa o contrato mais preciso. O array aceita zero, um ou cinquenta números.

A inferência também deve ser usada conscientemente:

```ts
const maxRetries = 3;
```

Aqui, repetir `: number` não acrescenta informação relevante. O objetivo não é anotar tudo; é tornar explícitos os limites que importam.

## Literal types e enums

Literal types permitem restringir valores sem introduzir uma abstração maior:

```ts
type LogLevel = "debug" | "info" | "warn" | "error";
```

Uma alternativa seria um enum:

```ts
enum LogLevelEnum {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
}
```

As duas abordagens podem funcionar.

Literal unions costumam integrar-se bem com dados vindos de JSON e geram pouco código em runtime. Enums podem ser úteis quando se deseja um objeto nomeado em runtime ou quando uma base de código já adotou esse padrão.

O exercício importante não é escolher uma regra universal. É comparar o custo de cada escolha no contexto do projeto.

## `type` versus `interface`

As duas construções representam contratos, mas possuem características diferentes.

```ts
interface User {
  id: string;
  name: string;
}
```

```ts
type User = {
  id: string;
  name: string;
};
```

Interfaces são naturalmente extensíveis:

```ts
interface Auditable {
  createdAt: Date;
}

interface User extends Auditable {
  id: string;
}
```

Types combinam bem com unions, intersections e aliases de tipos não-objeto:

```ts
type UserId = string;
type LoadState = "idle" | "loading" | "success" | "error";
type AdminUser = User & { permissions: string[] };
```

Uma convenção razoável é usar `interface` quando o principal objetivo é descrever a forma extensível de um objeto público e usar `type` quando unions, intersections ou composição algébrica são centrais.

Mas uma convenção deve reduzir atrito. Não transforme essa escolha em uma guerra de estilo.

## Unions: representar possibilidades reais

Uma union declara que um valor pode assumir um conjunto conhecido de formas:

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

Isso é superior a retornar combinações ambíguas:

```ts
type WeakResult<T> = {
  value?: T;
  error?: string;
};
```

No tipo fraco, `value` e `error` podem estar presentes juntos ou ausentes juntos.

No tipo forte:

```ts
function handleResult(result: Result<string>): string {
  if (result.ok) {
    return result.value;
  }

  return result.error;
}
```

O discriminante `ok` permite narrowing automático.

## Discriminated unions e estados inválidos

Considere um processo de carregamento:

```ts
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

A modelagem impede estados como:

```ts
{
  status: "loading",
  data: someData,
  error: new Error("x")
}
```

A ideia é poderosa porque aproxima o tipo de uma máquina de estados.

Em sistemas maiores, isso reduz condicionais defensivas espalhadas pelo código e facilita testes: cada variante pode ser validada isoladamente.

## `never` e exhaustive checking

Quando uma union representa todos os estados possíveis, o compilador pode verificar se todos foram tratados:

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function describePayment(payment: Payment): string {
  switch (payment.status) {
    case "pending":
      return "Pending";
    case "approved":
      return `Approved at ${payment.approvedAt.toISOString()}`;
    case "rejected":
      return `Rejected: ${payment.rejectedReason}`;
    default:
      return assertNever(payment);
  }
}
```

Se uma nova variante for adicionada:

```ts
type RefundedPayment = {
  id: string;
  status: "refunded";
  refundedAt: Date;
};
```

e `Payment` passar a incluí-la, o `switch` deixa de compilar até que o novo caso seja tratado.

Isso transforma evolução do domínio em feedback imediato de refatoração.

## Intersection types: compor sem esconder

Intersections combinam contratos:

```ts
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type User = {
  id: string;
  email: string;
};

type PersistedUser = User & Timestamped;
```

Elas são úteis quando os conceitos realmente se combinam. Porém, composições profundas podem gerar tipos difíceis de ler e mensagens de erro extensas.

Compare:

```ts
type Complex =
  A & B & C & D & E;
```

com um contrato nomeado que expressa intenção:

```ts
interface RegisteredCustomer {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Menos abstração pode ser a escolha mais profissional quando melhora legibilidade.

## Generics: preservar informação

Generics são úteis quando uma operação deve funcionar com vários tipos sem perder a relação entre entrada e saída.

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}
```

Sem generic:

```ts
function first(items: unknown[]): unknown {
  return items[0];
}
```

A segunda versão perde a informação do tipo dos elementos.

Em repositories:

```ts
interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
}
```

Em DTOs:

```ts
type ApiResponse<TData> = {
  data: TData;
  requestId: string;
};
```

Mas o objetivo não é tornar tudo genérico.

Isto pode ser exagero:

```ts
class Processor<
  TInput,
  TOutput,
  TContext,
  TStrategy,
  TMetadata,
  TError
> {
  // ...
}
```

Se ninguém consegue explicar rapidamente por que cada parâmetro existe, a abstração pode estar custando mais do que entrega.

> Um generic deve preservar uma relação útil entre tipos. Se ele apenas torna o código mais indireto, questione a abstração.

## Constraints e generics mais seguros

Um generic pode restringir capacidades:

```ts
type Entity = {
  id: string;
};

function indexById<T extends Entity>(
  entities: readonly T[],
): Map<string, T> {
  return new Map(entities.map((entity) => [entity.id, entity]));
}
```

O `extends Entity` comunica que a função não aceita qualquer valor. Ela precisa de algo com `id`.

Também é possível usar `keyof`:

```ts
function getProperty<T, K extends keyof T>(
  object: T,
  key: K,
): T[K] {
  return object[key];
}
```

Aqui, o compilador mantém a relação entre a chave e o tipo do valor retornado.

## `unknown` em vez de `any`

`any` desativa a verificação:

```ts
function parseBody(value: any) {
  return value.user.profile.name.toUpperCase();
}
```

Esse código compila mesmo quando nenhuma dessas propriedades existe.

`unknown` obriga validação antes do uso:

```ts
function parseBody(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string"
  ) {
    return value.name;
  }

  throw new Error("Invalid body");
}
```

Em sistemas reais, dados externos são candidatos naturais a `unknown`:

- `JSON.parse`;
- corpo de uma requisição;
- eventos de fila;
- respostas de APIs externas;
- conteúdo lido de arquivo;
- variáveis vindas de integrações.

Depois da validação, o código interno pode trabalhar com contratos seguros.

## Type guards e narrowing

Um type guard encapsula uma verificação:

```ts
type Customer = {
  id: string;
  email: string;
};

function isCustomer(value: unknown): value is Customer {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}
```

Uso:

```ts
function loadCustomer(input: unknown): Customer {
  if (!isCustomer(input)) {
    throw new Error("Invalid customer");
  }

  return input;
}
```

Depois do guard, o compilador sabe que `input` é `Customer`.

Em aplicações maiores, bibliotecas de schema podem centralizar validação de runtime. Mesmo assim, é importante entender o mecanismo antes de delegá-lo.

## Null safety, optional chaining e `??`

Ausência deve ser modelada deliberadamente.

```ts
function findUser(id: string): User | null {
  // ...
  return null;
}
```

O chamador precisa tratar o caso:

```ts
const user = findUser("123");

if (user === null) {
  throw new Error("User not found");
}

console.log(user.name);
```

Optional chaining é útil quando ausência é esperada:

```ts
const city = customer.address?.city;
```

Mas pode esconder uma regra ausente quando usado indiscriminadamente:

```ts
payment.customer?.account?.owner?.email
```

Pergunte: cada `?` representa ausência legítima ou uma inconsistência que deveria ter sido rejeitada antes?

Para defaults, `??` costuma ser semanticamente mais correto que `||`:

```ts
const retries = config.retries ?? 3;
```

`??` preserva valores válidos como `0`, enquanto `||` os trataria como falsy.

## Utility types sem transformar o domínio em quebra-cabeça

TypeScript oferece tipos utilitários:

```ts
type User = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

type CreateUserInput = Omit<User, "id">;
type UserPatch = Partial<Pick<User, "name" | "email" | "active">>;
type PublicUser = Pick<User, "id" | "name">;
```

Eles reduzem duplicação, mas não devem apagar intenção.

Compare:

```ts
type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt" | "status">;
```

com:

```ts
type CreateUserInput = {
  name: string;
  email: string;
};
```

Se o segundo contrato representa uma fronteira de negócio importante, escrevê-lo explicitamente pode ser mais claro e resistente a mudanças acidentais no tipo `User`.

## Branded types para evitar confusão entre valores iguais

Dois identificadores podem ser `string`, mas não significam a mesma coisa.

```ts
type UserId = string;
type OrderId = string;
```

Isso ainda permite:

```ts
const userId: UserId = "u1";
const orderId: OrderId = userId;
```

Uma técnica possível é branding:

```ts
type Brand<T, TBrand extends string> =
  T & { readonly __brand: TBrand };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
```

Agora os tipos são incompatíveis sem conversão explícita.

Essa abordagem tem custo: exige funções de criação, validação e compreensão pela equipe. Use quando a confusão entre valores estruturalmente iguais for um risco real, não apenas para tornar o tipo "mais sofisticado".

## Testes: cada nível responde a uma pergunta

TypeScript reduz erros estáticos. Testes verificam comportamento.

### Teste unitário

Isola uma unidade pequena:

```ts
import assert from "node:assert/strict";
import test from "node:test";

test("rejects an invalid state transition", () => {
  assert.throws(
    () => approveRejectedPayment(),
    /cannot approve rejected payment/,
  );
});
```

É rápido e útil para regras locais.

### Teste de integração

Valida componentes reais trabalhando juntos: repository + banco, parser + filesystem, handler + serviço.

```ts
test("persists an approved payment with its timestamp", async () => {
  const payment = await service.approve("pay-1");

  const saved = await repository.findById(payment.id);

  assert.equal(saved?.status, "approved");
});
```

### Teste de contrato

Verifica se dois lados concordam com o mesmo contrato. Pode validar schemas HTTP, eventos ou integrações entre serviços.

O objetivo é detectar mudanças incompatíveis antes que consumidor e produtor sejam implantados separadamente.

### Teste end-to-end

Percorre o fluxo mais próximo do usuário ou cliente externo.

É mais caro e geralmente mais lento, então não deve substituir testes menores.

Uma estratégia saudável possui camadas: muitos testes rápidos para regras locais, integração suficiente para fronteiras reais e poucos e2e para caminhos críticos.

## Refatoração segura: pequenas etapas

Refatorar não é reescrever.

Uma sequência mais segura:

1. caracterize o comportamento atual com testes;
2. faça uma pequena alteração estrutural;
3. rode compilador, lint e testes;
4. examine o diff;
5. confirme que o comportamento observado continua igual;
6. repita.

Exemplo: substituir strings livres por uma union.

Antes:

```ts
type Ticket = {
  status: string;
};
```

Primeiro, descubra os valores reais nos testes e no código. Depois:

```ts
type TicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

type Ticket = {
  status: TicketStatus;
};
```

O compilador passará a indicar os locais que dependiam de valores inválidos ou não documentados.

O erro de compilação se torna uma lista de trabalho para a refatoração.

## Caracterização antes da mudança

Código legado nem sempre possui testes suficientes. Antes de alterar uma função complexa, escreva testes que registrem seu comportamento atual — inclusive comportamentos estranhos que ainda precisam ser preservados até uma decisão explícita.

```ts
test("keeps legacy rounding behavior", () => {
  assert.equal(calculateFee(10.005), 10.01);
});
```

Esse teste não declara que o comportamento é ideal. Ele cria uma rede de segurança para que a refatoração não mude regras sem perceber.

## Cheiros de código que o laboratório deve expor

### Acoplamento

Uma função que instancia dependências diretamente é difícil de testar:

```ts
async function createReport() {
  const database = new ProductionDatabase();
  const mailer = new SmtpMailer();

  // ...
}
```

Uma alternativa é receber dependências:

```ts
type ReportDependencies = {
  repository: ReportRepository;
  mailer: Mailer;
};

async function createReport(
  dependencies: ReportDependencies,
): Promise<void> {
  // ...
}
```

Isso torna o contrato explícito e reduz dependências escondidas.

### Duplicação

Se várias funções repetem a mesma validação, uma mudança de regra exige alterações em diversos lugares.

Antes de extrair, confirme se a duplicação é realmente o mesmo conceito. Código parecido não significa necessariamente a mesma regra.

### Nomes ruins

```ts
function process(data: any): any {
  // ...
}
```

Compare com:

```ts
function calculateInvoiceTotal(
  invoice: Invoice,
): Money {
  // ...
}
```

O segundo contrato reduz trabalho mental antes mesmo de abrir a implementação.

### Funções longas

Uma função longa costuma misturar níveis de abstração: validação, cálculo, persistência e formatação.

A extração deve ocorrer por responsabilidade, não apenas por quantidade de linhas.

### Dependências escondidas

Ler `process.env`, relógio do sistema ou singleton global no meio da regra dificulta testes.

```ts
interface Clock {
  now(): Date;
}
```

Injetar uma abstração simples pode tornar o comportamento determinístico.

## Antes e depois: refatorando um serviço

Antes:

```ts
export async function updateOrder(
  order: any,
  data: any,
) {
  if (data.status === "paid") {
    order.status = data.status;
    order.paidAt = new Date();
  }

  if (data.status === "cancelled") {
    order.status = data.status;
    order.cancelReason = data.reason;
  }

  return db.save(order);
}
```

Problemas:

- `any` remove garantias;
- estados aceitos não estão documentados;
- o relógio é dependência escondida;
- `reason` pode faltar;
- transições inválidas não são explícitas;
- persistência e regra de domínio estão misturadas.

Depois:

```ts
type UpdateOrderCommand =
  | { type: "pay" }
  | { type: "cancel"; reason: string };

type Order =
  | {
      id: string;
      status: "open";
    }
  | {
      id: string;
      status: "paid";
      paidAt: Date;
    }
  | {
      id: string;
      status: "cancelled";
      cancelReason: string;
    };

interface Clock {
  now(): Date;
}

function updateOrder(
  order: Order,
  command: UpdateOrderCommand,
  clock: Clock,
): Order {
  if (order.status !== "open") {
    throw new Error("Only open orders can change state");
  }

  switch (command.type) {
    case "pay":
      return {
        id: order.id,
        status: "paid",
        paidAt: clock.now(),
      };

    case "cancel":
      return {
        id: order.id,
        status: "cancelled",
        cancelReason: command.reason,
      };

    default:
      return assertNever(command);
  }
}
```

A persistência pode ficar fora da função pura. Isso facilita teste unitário e torna o domínio legível.

## Lint: consistência e erros mecânicos

Lint não mede arquitetura, mas captura classes de problemas repetitivos e mantém o projeto consistente.

Configure regras relevantes para o laboratório, por exemplo:

- imports não usados;
- promises não aguardadas;
- `any` explícito sem justificativa;
- condições desnecessárias;
- retornos inconsistentes;
- padrões perigosos de TypeScript.

Não transforme lint em centenas de regras cosméticas que dificultam contribuição sem aumentar qualidade.

## Coverage: mapa de execução, não selo de qualidade

Coverage responde quais linhas, branches ou funções foram executadas durante os testes.

Um relatório de 100% não prova que os testes possuem boas asserções.

```ts
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("division by zero");
  }

  return a / b;
}
```

Um teste pode executar todas as linhas e ainda validar pouco.

Use coverage para encontrar áreas sem exercício, não como substituto de análise.

Para o laboratório, salve:

- line coverage;
- branch coverage;
- funções não cobertas;
- principais lacunas e decisão sobre cada uma.

## Mutation testing: seus testes perceberiam um erro?

Mutation testing altera pequenas partes do código de propósito.

Exemplo original:

```ts
return total > limit;
```

Mutação:

```ts
return total >= limit;
```

Se todos os testes continuam passando, talvez nenhum teste proteja a fronteira exata.

Mutation testing é mais caro que coverage, mas ajuda a avaliar a força das asserções.

Não precisa ser executado em todo commit. Pode rodar em escopo pequeno ou em pipeline separado.

## Complexidade: use números como sinal, não como sentença

Métricas como complexidade ciclomática podem destacar funções com muitas decisões.

```ts
function processOrder(...) {
  if (...) {
    if (...) {
      // ...
    }
  }

  if (...) {
    // ...
  }

  switch (...) {
    // ...
  }
}
```

Um valor alto pode indicar necessidade de extração ou melhor modelagem de estados, mas uma métrica isolada não entende o domínio.

Use o número para perguntar "por que esta função é difícil?" e não para concluir automaticamente que o código é ruim.

## Um laboratório que prova conhecimento

Crie o repositório `typescript-quality-refactoring-lab`:

```text
src/
  domain/
    payment.ts
    order.ts
  application/
    update-order.ts
  contracts/
    api.ts
  infrastructure/
    in-memory-order-repository.ts
tests/
  unit/
  integration/
  contract/
  e2e/
docs/
  adr/
  refactorings/
  measurements/
```

Prepare:

- Node.js LTS;
- TypeScript;
- `tsconfig` strict;
- ESLint;
- testes com `node:test`, Vitest ou Jest;
- coverage;
- CI;
- mutation testing em um módulo pequeno;
- scripts previsíveis.

Exemplo:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:mutation": "stryker run",
    "quality": "npm run typecheck && npm run lint && npm test"
  }
}
```

Outra pessoa deve conseguir clonar o repositório, instalar dependências e executar a evidência sem conversa privada.

## Sequência de estudo no laboratório

### Experimento 1 — `strict`

Comece com um módulo pouco tipado.

Ative `strict` e registre os erros encontrados.

Classifique-os:

- null/undefined;
- inferência implícita;
- parâmetros sem tipo;
- acesso inseguro;
- retorno ambíguo.

Corrija sem usar `as` ou `any` apenas para silenciar o compilador.

### Experimento 2 — remover `any`

Escolha uma fronteira externa:

```ts
function handleMessage(message: any) {
  // ...
}
```

Troque para:

```ts
function handleMessage(message: unknown) {
  // ...
}
```

Implemente narrowing ou validação.

Registre quais suposições estavam escondidas pelo `any`.

### Experimento 3 — modelar estados

Comece com booleans independentes:

```ts
type Job = {
  loading: boolean;
  success: boolean;
  failed: boolean;
};
```

Esse tipo aceita:

```ts
{
  loading: true,
  success: true,
  failed: true
}
```

Refatore para:

```ts
type JobState =
  | { status: "loading" }
  | { status: "success"; completedAt: Date }
  | { status: "failed"; error: Error };
```

Mostre quais combinações deixaram de compilar.

### Experimento 4 — exhaustive checking

Adicione uma nova variante à union e capture o erro gerado no código que não tratava o novo estado.

Esse screenshot ou trecho de CI é uma evidência direta de que o compilador participa da evolução do domínio.

### Experimento 5 — generic útil versus generic exagerado

Implemente a mesma necessidade de duas formas:

1. função específica e explícita;
2. abstração genérica reutilizável.

Compare:

- legibilidade;
- número de tipos envolvidos;
- reutilização real;
- mensagens de erro;
- esforço para novos membros entenderem.

Não escolha a versão genérica apenas porque ela parece mais avançada.

### Experimento 6 — refatoração protegida por testes

Pegue uma função longa.

Antes de alterar:

- escreva characterization tests;
- registre coverage;
- rode mutation testing em um trecho pequeno.

Depois:

- extraia responsabilidades;
- melhore tipos;
- remova dependências escondidas;
- execute a mesma suíte.

O resultado esperado não é "mais arquivos". É menor risco para futuras mudanças.

## Compare abordagens e registre onde falham

| Comparação | O que observar | Onde cada opção falha |
| --- | --- | --- |
| `any` vs. `unknown` | velocidade inicial, segurança e narrowing necessário | `any` permite erros silenciosos; `unknown` exige validação extra |
| `type` vs. `interface` | extensibilidade, unions, composição e consistência | dogma de estilo cria ruído; escolha inconsistente aumenta custo cognitivo |
| enum vs. literal union | runtime, interoperabilidade com JSON e legibilidade | enum adiciona representação em runtime; union pode não oferecer objeto nomeado |
| optional fields vs. discriminated union | estados representáveis e clareza | opcionais podem aceitar combinações inválidas; union pode ser verbosa |
| função específica vs. generic | reutilização e legibilidade | específico duplica se o padrão for real; generic exagerado esconde intenção |
| testes unitários vs. integração | velocidade, isolamento e confiança | mocks podem mentir; integração pode ficar lenta ou difícil de diagnosticar |
| coverage vs. mutation testing | alcance executado e força das asserções | coverage alto não prova qualidade; mutation custa mais tempo |
| grande refactor vs. pequenas etapas | tamanho do diff, risco e reversibilidade | reescrita dificulta revisão; passos pequenos podem parecer lentos no início |

## Crie exemplos que quebrem

O aprofundamento acontece quando você conhece os limites.

Faça pelo menos estes experimentos:

1. remova um caso do `switch` e observe o exhaustive checking;
2. troque `unknown` por `any` e escreva um acesso que compila e falha em runtime;
3. desative `exactOptionalPropertyTypes` e compare o significado de ausência;
4. crie uma union mal modelada e force um estado impossível;
5. adicione parâmetros genéricos sem necessidade e registre a perda de legibilidade;
6. escreva testes com coverage alto, mas permita que uma mutação sobreviva;
7. introduza uma dependência global e mostre como o teste fica menos determinístico.

Explique o resultado com código e evidência, não com preferência pessoal.

## Evidências para GitHub e portfólio

A comprovação não deve ser "estudei TypeScript".

Construa um conjunto de artefatos avaliáveis:

- repositório público com README profissional em português;
- resumo técnico em inglês;
- `tsconfig` strict documentado;
- exemplos antes/depois de refatoração;
- issues pequenas descrevendo problemas;
- branches e pull requests com justificativa;
- CI executando `typecheck`, lint e testes;
- badge de CI no README;
- relatório de coverage;
- experimento de mutation testing;
- ADR curto para uma decisão de tipagem;
- artigo ou vlog;
- seção do portfólio explicando impacto.

Um exemplo de impacto bem descrito:

> A refatoração substituiu quatro flags booleanas por uma discriminated union com quatro estados válidos. Depois da mudança, combinações contraditórias deixaram de ser representáveis e a adição de um novo estado passou a quebrar no compile-time todos os pontos sem tratamento exaustivo.

Isso é verificável. Evite frases vagas como "o código ficou 80% mais seguro" sem um método capaz de sustentar o número.

## README profissional

O README pode conter:

1. objetivo do laboratório;
2. problema de qualidade escolhido;
3. arquitetura mínima;
4. requisitos;
5. instalação;
6. comandos;
7. decisões de `tsconfig`;
8. estrutura dos testes;
9. refatorações executadas;
10. métricas e limitações;
11. trade-offs;
12. próximos experimentos.

Inclua uma seção curta em inglês:

```md
## English summary

This repository explores TypeScript as a design and refactoring tool.
It focuses on strict compiler settings, invalid-state prevention,
safe boundary validation, exhaustive checking, automated tests,
and measurable refactoring evidence.
```

## Issues e PRs mesmo trabalhando sozinho

Exemplo de sequência:

### Issue

`refactor: replace boolean payment flags with a discriminated union`

Descreva:

- problema atual;
- exemplo de estado inválido;
- comportamento que deve permanecer;
- critério de aceite;
- testes necessários.

### Pull request

Registre:

- o que mudou;
- o que não mudou;
- erro que o compilador agora detecta;
- testes rodados;
- trade-off introduzido;
- follow-ups.

Faça seu próprio review antes do merge.

Esse processo mostra disciplina de engenharia, não apenas capacidade de escrever código.

## Três artigos práticos derivados do laboratório

### 1. Como usei TypeScript para modelar qualidade e refatoração com mais segurança

Comece com um problema real do laboratório.

Mostre a versão fraca:

```ts
type Process = {
  status: string;
  error?: string;
  data?: Data;
};
```

Depois apresente uma discriminated union.

Mostre:

- quais estados inválidos existiam;
- quais erros passaram a ser detectados;
- como os testes mudaram;
- qual custo de legibilidade a nova modelagem introduziu;
- onde você evitaria essa solução.

Feche com o link do repositório e um trecho da evidência de CI.

### 2. `unknown`, `never` e generics: o que realmente muda no código do dia a dia

Use exemplos pequenos e executáveis.

Estrutura sugerida:

1. um `any` que esconde erro;
2. a mesma fronteira com `unknown`;
3. um `switch` que usa `never`;
4. um generic que preserva informação;
5. um generic exagerado;
6. conclusões sobre custo e benefício.

O artigo deve ensinar decisão, não apenas sintaxe.

### 3. O que meu laboratório TypeScript prova sobre minha evolução como desenvolvedor

Apresente a estrutura do repositório.

Explique:

- quais arquivos representam cada conceito;
- por que cada teste existe;
- o que CI verifica;
- onde coverage ajudou;
- onde mutation testing encontrou uma lacuna;
- quais limites ainda existem;
- qual refatoração você faria em seguida.

Inclua uma seção final:

**What this project demonstrates for international roles**

Use inglês simples e factual para descrever:

- type safety;
- test strategy;
- refactoring discipline;
- engineering process;
- trade-off communication.

## Formato recomendado para os artigos

Cada artigo pode ter entre 800 e 1.500 palavras.

Estrutura:

1. introdução;
2. problema;
3. código antes;
4. decisão de design;
5. código depois;
6. testes;
7. métricas ou evidências;
8. trade-offs;
9. limitações;
10. conclusão;
11. link do GitHub.

Um vlog pode seguir a mesma narrativa e mostrar:

- terminal;
- erro do TypeScript;
- teste falhando;
- alteração;
- teste passando;
- pull request;
- relatório de coverage ou mutação.

## Como explicar trade-offs em uma entrevista internacional

Use inglês técnico simples e afirmações verificáveis.

> We replaced multiple optional fields with a discriminated union because those fields allowed contradictory states. The compiler now narrows each case and exhaustive checking alerts us when a new state is added. The trade-off is that the model is more verbose, so we use this approach only where the state machine is meaningful.

Outro exemplo:

> We use `unknown` at external boundaries instead of `any`. It requires explicit validation before accessing data, which adds some code, but it prevents untrusted input from silently bypassing type checking.

Outro:

> I introduced a generic repository only after two implementations showed the same contract. I avoided adding more type parameters because the abstraction was becoming harder to read than the duplicated code.

Esse tipo de resposta mostra contexto, decisão e custo.

## Checklist técnico de conclusão

Você terá concluído o E013 quando conseguir:

- explicar o efeito de `strict`, `noImplicitAny` e `exactOptionalPropertyTypes`;
- usar inferência sem anotar tipos redundantes;
- escolher conscientemente entre `type` e `interface`;
- modelar uma máquina de estados com discriminated union;
- implementar exhaustive checking com `never`;
- substituir `any` por `unknown` em uma fronteira real;
- escrever type guards ou usar validação de runtime conscientemente;
- criar generics que preservam informação sem exagerar na abstração;
- explicar null safety, optional chaining e `??`;
- distinguir testes unitários, integração, contrato e e2e;
- executar uma refatoração em pequenas etapas;
- identificar acoplamento, duplicação, nomes ruins, funções longas e dependências escondidas;
- interpretar coverage sem tratá-lo como nota de qualidade;
- executar ao menos um pequeno experimento de mutation testing;
- comparar duas abordagens e registrar onde cada uma falha;
- explicar um trade-off em inglês técnico simples;
- produzir evidência pública que outra pessoa consiga executar e avaliar.

## O que você deve levar deste ciclo

TypeScript profundo não é uma coleção de truques de tipos.

É a capacidade de transformar regras implícitas em contratos verificáveis, impedir estados inválidos antes do runtime e usar o feedback do compilador para mudar software com menos risco.

No contexto de qualidade e refatoração, a linguagem funciona melhor quando combinada com testes, lint, métricas e processo de engenharia. O compilador mostra contratos quebrados; os testes protegem comportamento; coverage revela caminhos não executados; mutation testing questiona a força das asserções; issues e PRs registram como a mudança foi pensada.

Você terá concluído este ciclo quando conseguir pegar um módulo frágil, identificar ambiguidades, fortalecer os contratos, refatorar em etapas pequenas e demonstrar a melhoria com evidência reproduzível.

O resultado final deve ser avaliável sem conversa privada: repositório público, README bilíngue, configuração strict, CI, testes de diferentes níveis, antes/depois de uma refatoração, medições e um artigo ou vlog que explique tanto os ganhos quanto os limites da abordagem.

## Referências primárias

- [TypeScript — The `tsconfig.json` File](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [TypeScript — TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [TypeScript — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript — More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [TypeScript — Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript — Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript — `strict`](https://www.typescriptlang.org/tsconfig/strict.html)
- [TypeScript — `noImplicitAny`](https://www.typescriptlang.org/tsconfig/noImplicitAny.html)
- [TypeScript — `exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- [TypeScript — `useUnknownInCatchVariables`](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html)
- [ESLint — Getting Started](https://eslint.org/docs/latest/use/getting-started)
- [Stryker Mutator — JavaScript/TypeScript](https://stryker-mutator.io/)
