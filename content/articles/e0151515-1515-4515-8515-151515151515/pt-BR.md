---
translationId: 2e151515-1515-4515-8515-151515151515
articleId: e0151515-1515-4515-8515-151515151515
locale: pt-BR
slug: arquitetura-backend-qualidade-refatoracao
title: "Arquitetura backend aplicada a qualidade e refatoração: organizando mudanças sem exagero"
description: "Um guia prático para separar domínio, aplicação, infraestrutura e interfaces públicas, usando arquitetura backend como ferramenta de qualidade, refatoração segura e redução do custo de mudança."
status: draft
---

# Arquitetura backend aplicada a qualidade e refatoração: organizando mudanças sem exagero

Arquitetura backend não é escolher nomes de pastas, aplicar um diagrama famoso ou criar interfaces para cada classe.

Arquitetura é a capacidade de organizar mudanças.

Um sistema começa simples. Depois surgem novas regras, integrações, bancos, filas, autenticação, jobs, APIs e requisitos operacionais. O problema aparece quando cada alteração exige tocar em muitos pontos, entender detalhes não relacionados e correr o risco de quebrar comportamentos distantes.

Neste ciclo, o contexto é **qualidade e refatoração**. O objetivo é usar arquitetura para tornar mudanças:

1. mais localizadas;
2. mais testáveis;
3. mais explícitas;
4. menos dependentes de detalhes externos;
5. mais fáceis de revisar e reverter.

> Uma boa arquitetura não elimina mudanças. Ela reduz o número de lugares que precisam conhecer cada mudança.

<!-- VISUAL:
Quatro blocos concêntricos ou em camadas:
Interface -> Aplicação -> Domínio
Infraestrutura entra por adapters nas bordas.
Setas de dependência apontam para dentro.
Ao lado: banco, HTTP, fila, filesystem e serviços externos como detalhes substituíveis.
-->

## O problema que guia o laboratório

Imagine um backend de pedidos que começou pequeno.

Uma primeira implementação pode parecer conveniente:

```ts
import { pool } from "./database.js";
import { sendEmail } from "./email.js";

export async function createOrderHandler(
  request: Request,
): Promise<Response> {
  const body = await request.json();

  if (!body.customerId) {
    return Response.json(
      { error: "customerId is required" },
      { status: 400 },
    );
  }

  const customer = await pool.query(
    "SELECT * FROM customers WHERE id = $1",
    [body.customerId],
  );

  if (customer.rowCount === 0) {
    return Response.json(
      { error: "customer not found" },
      { status: 404 },
    );
  }

  let total = 0;

  for (const item of body.items) {
    const product = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [item.productId],
    );

    total += Number(product.rows[0].price) * item.quantity;
  }

  const order = await pool.query(
    `INSERT INTO orders (customer_id, total)
     VALUES ($1, $2)
     RETURNING *`,
    [body.customerId, total],
  );

  await sendEmail(
    customer.rows[0].email,
    `Order ${order.rows[0].id} created`,
  );

  return Response.json(order.rows[0], {
    status: 201,
  });
}
```

O código pode funcionar.

O problema é o custo da próxima mudança.

Esta função conhece:

- HTTP;
- formato do JSON;
- validação;
- SQL;
- schema do banco;
- regra de cálculo;
- regra de existência do cliente;
- regra de pedido;
- envio de e-mail;
- formato de resposta;
- códigos HTTP.

Se o banco mudar, o handler muda.

Se a regra de preço mudar, o handler muda.

Se o envio de e-mail mudar, o handler muda.

Se esse caso de uso também precisar ser executado por CLI ou fila, a regra precisa ser duplicada ou extraída às pressas.

Nosso laboratório será a refatoração desse tipo de código sem alterar o contrato público de uma vez.

## Arquitetura não começa pelas pastas

Uma estrutura como:

```text
controllers/
services/
repositories/
models/
```

não garante separação real.

Este código ainda pode violar limites:

```ts
export class OrderService {
  async create(input: CreateOrderInput) {
    const response = await fetch(
      "https://external-pricing.example.com",
    );

    const price = await response.json();

    return pool.query(
      "INSERT INTO orders ...",
    );
  }
}
```

O arquivo está em `services/`, mas continua acoplado a:

- `fetch`;
- serviço externo;
- banco;
- formato externo;
- SQL.

Arquitetura deve ser observada pelas **dependências**, não pelo nome da pasta.

## O primeiro princípio: direção das dependências

Uma regra de negócio deveria conhecer o mínimo possível sobre detalhes externos.

Por exemplo, uma entidade de pedido não precisa saber que será persistida em PostgreSQL:

```ts
export class Order {
  constructor(
    readonly id: string,
    readonly customerId: string,
    private readonly items: readonly OrderItem[],
  ) {}

  total(): number {
    return this.items.reduce(
      (sum, item) => sum + item.total(),
      0,
    );
  }
}
```

Ela também não precisa saber se será chamada por:

- HTTP;
- CLI;
- teste;
- fila;
- job.

Quando uma regra conhece detalhes externos desnecessários, o custo de mudança aumenta.

## Quatro áreas úteis

Para o laboratório, use quatro áreas conceituais:

```text
src/
  domain/
  application/
  infrastructure/
  interfaces/
```

Não trate isso como regra universal.

A utilidade da divisão está no papel de cada parte.

### Domínio

Contém regras e conceitos centrais.

### Aplicação

Orquestra casos de uso.

### Infraestrutura

Implementa detalhes externos.

### Interfaces

Adapta entrada e saída do sistema, como HTTP ou CLI.

A arquitetura funciona quando essas responsabilidades são respeitadas, não apenas quando as pastas existem.

## Entidades

Entidades possuem identidade e comportamento relevante ao domínio.

```ts
type OrderId = string;
type CustomerId = string;

export class Order {
  private readonly items: OrderItem[] = [];

  constructor(
    readonly id: OrderId,
    readonly customerId: CustomerId,
  ) {}

  addItem(item: OrderItem): void {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    this.items.push(item);
  }

  total(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.total()),
      Money.zero(),
    );
  }
}
```

A entidade concentra regras que pertencem ao conceito.

Evite transformar entidade em um simples objeto de propriedades se existirem invariantes importantes que poderiam viver nela.

## Value objects

Value objects representam valores definidos pelo conteúdo, não por identidade.

Dinheiro é um exemplo clássico.

```ts
export class Money {
  private constructor(
    readonly cents: number,
  ) {
    if (!Number.isInteger(cents)) {
      throw new Error("Money must use integer cents");
    }
  }

  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  multiply(quantity: number): Money {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Invalid quantity");
    }

    return new Money(this.cents * quantity);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }
}
```

Agora regras monetárias deixam de depender de `number` solto em vários lugares.

Outro exemplo:

```ts
export class Email {
  private constructor(
    readonly value: string,
  ) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (!normalized.includes("@")) {
      throw new Error("Invalid email");
    }

    return new Email(normalized);
  }
}
```

O objetivo não é transformar toda string em classe.

Crie value objects quando eles:

- protegem invariantes;
- evitam repetição;
- comunicam significado;
- reduzem conversões incorretas.

## Quando não criar value object

Isto pode ser burocracia:

```ts
class UserFirstName {
  constructor(readonly value: string) {}
}

class UserLastName {
  constructor(readonly value: string) {}
}

class UserMiddleName {
  constructor(readonly value: string) {}
}
```

Se não existe comportamento, regra ou risco que justifique o tipo, a abstração pode aumentar o custo de leitura.

Arquitetura madura também sabe não abstrair.

## Serviços de domínio

Nem toda regra cabe naturalmente em uma entidade ou value object.

Exemplo:

```ts
export class DiscountPolicy {
  calculate(
    customer: Customer,
    order: Order,
  ): Money {
    if (customer.isPremium()) {
      return order.total().multiplyPercentage(10);
    }

    return Money.zero();
  }
}
```

Um serviço de domínio representa regra de negócio sem identidade própria.

Evite criar `SomethingService` apenas porque não sabe onde colocar uma função.

Pergunte:

> Esta lógica é realmente uma regra de domínio que envolve múltiplos conceitos?

Se não, talvez seja:

- aplicação;
- infraestrutura;
- utilidade local;
- método da própria entidade.

## Casos de uso

A camada de aplicação coordena uma intenção do sistema.

Exemplo:

```ts
export type CreateOrderCommand = {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};
```

```ts
export class CreateOrderUseCase {
  constructor(
    private readonly customers: CustomerRepository,
    private readonly products: ProductRepository,
    private readonly orders: OrderRepository,
    private readonly notifier: OrderNotifier,
  ) {}

  async execute(
    command: CreateOrderCommand,
  ): Promise<CreateOrderResult> {
    const customer = await this.customers.findById(
      command.customerId,
    );

    if (customer === null) {
      throw new CustomerNotFoundError();
    }

    const order = Order.create(customer.id);

    for (const input of command.items) {
      const product = await this.products.findById(
        input.productId,
      );

      if (product === null) {
        throw new ProductNotFoundError(input.productId);
      }

      order.addItem(
        OrderItem.create(
          product.id,
          input.quantity,
          product.price,
        ),
      );
    }

    await this.orders.save(order);

    await this.notifier.orderCreated(
      customer,
      order,
    );

    return {
      orderId: order.id,
      totalCents: order.total().cents,
    };
  }
}
```

O caso de uso conhece contratos necessários para executar a operação, mas não sabe como PostgreSQL, SMTP ou HTTP funcionam.

## Domínio não deve ser sinônimo de "pasta sem import"

É possível ter domínio puro e ainda criar design ruim.

Exemplo:

```ts
export class Order {
  updateCustomer(
    id?: string,
    name?: string,
    email?: string,
    status?: string,
    discount?: number,
    source?: string,
  ) {
    // ...
  }
}
```

A classe está na camada certa, mas possui contrato confuso.

Arquitetura não substitui boa modelagem.

## Aplicação não é lugar para regra de negócio escondida

Considere:

```ts
if (
  customer.type === "premium" &&
  order.total > 10000 &&
  currentMonth === 12
) {
  discount = 20;
}
```

Se essa regra representa política de negócio, ela não deveria ficar perdida no caso de uso apenas porque o arquivo está em `application/`.

Extraia para o domínio quando isso melhora significado, teste e reutilização.

## Infraestrutura é detalhe

Infraestrutura implementa contratos necessários às camadas internas.

Exemplo de repository:

```ts
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}
```

Implementação PostgreSQL:

```ts
export class PostgresOrderRepository
  implements OrderRepository {
  constructor(
    private readonly database: DatabaseClient,
  ) {}

  async save(order: Order): Promise<void> {
    await this.database.query(
      `INSERT INTO orders (id, customer_id, total_cents)
       VALUES ($1, $2, $3)`,
      [
        order.id,
        order.customerId,
        order.total().cents,
      ],
    );
  }

  async findById(
    id: string,
  ): Promise<Order | null> {
    // ...
    return null;
  }
}
```

O contrato representa a necessidade da aplicação.

A implementação representa uma decisão técnica.

## Dependency inversion

Dependency inversion não significa "toda classe precisa de interface".

O princípio relevante é:

> código de alto nível não deve depender diretamente de detalhes de baixo nível quando essa dependência aumenta o custo de mudança.

Sem inversão:

```ts
export class CreateOrderUseCase {
  private readonly repository =
    new PostgresOrderRepository();
}
```

O caso de uso escolhe a tecnologia.

Com inversão:

```ts
export class CreateOrderUseCase {
  constructor(
    private readonly repository: OrderRepository,
  ) {}
}
```

A composição escolhe a implementação:

```ts
const orderRepository =
  new PostgresOrderRepository(database);

const createOrder =
  new CreateOrderUseCase(orderRepository);
```

O caso de uso depende da capacidade de persistir pedidos, não do PostgreSQL.

## Quando uma interface é útil

Uma interface ou contrato costuma ser útil quando existe uma fronteira significativa:

- banco;
- serviço externo;
- fila;
- filesystem;
- clock;
- gerador de IDs;
- envio de e-mail;
- gateway de pagamento;
- cache;
- componente com múltiplas implementações reais.

Ela também pode ser útil para permitir teste determinístico.

## Quando uma interface pode ser desnecessária

Isto adiciona pouco valor:

```ts
interface UserNameFormatter {
  format(name: string): string;
}

class DefaultUserNameFormatter
  implements UserNameFormatter {
  format(name: string): string {
    return name.trim();
  }
}
```

Se:

- existe uma implementação;
- não há variação real;
- não existe dependência externa;
- o teste não precisa substituí-la;
- a abstração não protege um conceito;

uma função pode ser suficiente:

```ts
export function formatUserName(
  name: string,
): string {
  return name.trim();
}
```

Abstração tem custo:

- mais arquivos;
- mais nomes;
- mais navegação;
- mais indireção;
- mais decisões.

## DTOs: dados atravessando fronteiras

DTOs devem representar um contrato de entrada ou saída.

HTTP:

```ts
export type CreateOrderHttpBody = {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};
```

Aplicação:

```ts
export type CreateOrderCommand = {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};
```

Eles podem parecer iguais.

Mas possuem papéis diferentes.

O DTO HTTP pertence à interface pública.

O command pertence à aplicação.

Hoje eles coincidem. Amanhã podem divergir.

## Não reuse entidade como DTO

Evite:

```ts
return Response.json(order);
```

Uma entidade pode possuir:

- campos internos;
- métodos;
- dados que não devem ser públicos;
- representação diferente do contrato HTTP.

Prefira mapear:

```ts
export type OrderHttpResponse = {
  id: string;
  total: number;
};

export function toOrderHttpResponse(
  order: Order,
): OrderHttpResponse {
  return {
    id: order.id,
    total: order.total().cents,
  };
}
```

O contrato público passa a ser explícito.

## Mappers

Mappers traduzem representações entre fronteiras.

Banco:

```ts
type OrderRow = {
  id: string;
  customer_id: string;
  total_cents: number;
};
```

Domínio:

```ts
export function orderRowToDomain(
  row: OrderRow,
): Order {
  return Order.restore({
    id: row.id,
    customerId: row.customer_id,
    total: Money.fromCents(row.total_cents),
  });
}
```

HTTP:

```ts
export function orderToHttp(
  order: Order,
): OrderHttpResponse {
  return {
    id: order.id,
    total: order.total().cents,
  };
}
```

Mapeamento parece repetitivo, mas protege fronteiras.

Se o schema do banco mudar de `total_cents` para outra estrutura, o domínio não precisa necessariamente mudar.

## Quando mapper vira excesso

Uma aplicação muito pequena pode acabar com:

```text
UserEntity
UserModel
UserPersistenceModel
UserDto
UserResponseDto
UserViewModel
UserMapper
UserPersistenceMapper
UserResponseMapper
```

para mover três campos idênticos.

Isso pode custar mais do que protege.

Use mappers onde a fronteira possui risco real de divergência.

## Validadores

Entrada externa não é domínio confiável.

HTTP recebe `unknown`.

```ts
export function parseCreateOrderBody(
  input: unknown,
): CreateOrderHttpBody {
  if (
    typeof input !== "object" ||
    input === null
  ) {
    throw new InvalidRequestError();
  }

  // validações adicionais
  return input as CreateOrderHttpBody;
}
```

Em aplicações reais, uma biblioteca de schema pode ser preferível.

O importante é manter a decisão clara:

- validação estrutural acontece na fronteira;
- regra de negócio permanece no domínio/aplicação.

Exemplo:

`quantity` ser número inteiro positivo pode ser protegido em múltiplos níveis:

- validador rejeita payload claramente inválido;
- value object ou entidade protege a invariância de domínio;
- banco pode proteger integridade quando aplicável.

Cada camada protege um tipo de risco.

## Repository: coleção orientada ao domínio

Um repository representa acesso a entidades ou agregados conforme a necessidade da aplicação.

Contrato bom:

```ts
export interface OrderRepository {
  save(order: Order): Promise<void>;

  findById(
    id: string,
  ): Promise<Order | null>;
}
```

Contrato suspeito:

```ts
export interface GenericRepository<T> {
  create(input: Partial<T>): Promise<T>;
  update(
    where: Record<string, unknown>,
    data: Partial<T>,
  ): Promise<number>;
  find(
    where: Record<string, unknown>,
    include?: string[],
  ): Promise<T[]>;
  delete(
    where: Record<string, unknown>,
  ): Promise<number>;
}
```

A segunda abstração parece reutilizável, mas pode expor detalhes de ORM ou query builder para a aplicação inteira.

Ela reduz repetição, porém aumenta acoplamento ao modelo de persistência.

## Gateway: acesso a um sistema externo

Um gateway expressa uma capacidade externa relevante.

```ts
export interface PaymentGateway {
  authorize(
    input: AuthorizePaymentInput,
  ): Promise<PaymentAuthorization>;
}
```

Implementação:

```ts
export class AcmePaymentGateway
  implements PaymentGateway {
  constructor(
    private readonly client: AcmeClient,
  ) {}

  async authorize(
    input: AuthorizePaymentInput,
  ): Promise<PaymentAuthorization> {
    const response = await this.client.charge({
      amount: input.amount.cents,
      token: input.token,
    });

    return {
      authorizationId: response.id,
      approved: response.status === "approved",
    };
  }
}
```

O restante do sistema não precisa conhecer o formato específico do fornecedor.

## Adapter

Adapter traduz um contrato para outro.

Um controller HTTP pode ser um adapter de entrada:

```ts
export async function createOrderHttp(
  request: Request,
  useCase: CreateOrderUseCase,
): Promise<Response> {
  const body = await request.json();
  const dto = parseCreateOrderBody(body);

  try {
    const result = await useCase.execute(dto);

    return Response.json(
      {
        id: result.orderId,
        totalCents: result.totalCents,
      },
      { status: 201 },
    );
  } catch (error) {
    return mapApplicationErrorToHttp(error);
  }
}
```

Um repository PostgreSQL é adapter de saída.

A ideia de ports and adapters fica mais útil quando você enxerga fluxos reais, não quando cria nomes exóticos para pastas.

## Contratos públicos devem ser tratados como produto

Imagine que clientes já consomem:

```json
{
  "id": "ord-123",
  "totalCents": 2500
}
```

Durante uma refatoração interna, você pode mudar:

- entidade;
- repository;
- banco;
- organização de pastas;
- framework.

Mas o contrato HTTP pode permanecer igual.

Esse é um dos principais exercícios do ciclo:

> mudar o interior sem obrigar o exterior a mudar.

## Teste de contrato protege a refatoração

```ts
test("POST /orders keeps public response contract", async () => {
  const response = await app.request("/orders", {
    method: "POST",
    body: JSON.stringify(validOrder),
  });

  assert.equal(response.status, 201);

  const body = await response.json();

  assert.deepEqual(
    Object.keys(body).sort(),
    ["id", "totalCents"],
  );
});
```

Um teste melhor pode usar schema formal.

O objetivo é detectar alteração pública acidental.

## Erros também fazem parte do contrato

Evite retornar diretamente mensagens internas:

```ts
return Response.json({
  error: error.message,
});
```

Isso acopla o cliente à mensagem e pode expor detalhes.

Prefira códigos públicos estáveis:

```ts
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer was not found"
  }
}
```

Internamente, a aplicação pode usar classes ou tipos específicos.

## Mapeamento de erro por fronteira

Domínio:

```ts
export class InvalidOrderQuantityError
  extends Error {}
```

Aplicação:

```ts
export class CustomerNotFoundError
  extends Error {}
```

HTTP:

```ts
export function mapApplicationErrorToHttp(
  error: unknown,
): Response {
  if (error instanceof CustomerNotFoundError) {
    return Response.json(
      {
        error: {
          code: "CUSTOMER_NOT_FOUND",
          message: "Customer was not found",
        },
      },
      { status: 404 },
    );
  }

  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected error",
      },
    },
    { status: 500 },
  );
}
```

O domínio não precisa conhecer status HTTP.

## Composition root

Em algum lugar, detalhes precisam ser conectados.

Esse lugar pode ser uma composição explícita:

```ts
const database = createDatabase(config.database);

const customerRepository =
  new PostgresCustomerRepository(database);

const productRepository =
  new PostgresProductRepository(database);

const orderRepository =
  new PostgresOrderRepository(database);

const notifier =
  new EmailOrderNotifier(emailClient);

const createOrderUseCase =
  new CreateOrderUseCase(
    customerRepository,
    productRepository,
    orderRepository,
    notifier,
  );
```

Não esconda composição em um container mágico antes de entender o que ele resolve.

Dependency injection não exige framework de DI.

## Arquitetura hexagonal, clean e onion

Esses estilos compartilham ideias relacionadas:

- regras centrais independentes de detalhes;
- fronteiras explícitas;
- dependências direcionadas para o núcleo;
- adapters para tecnologias externas.

Os nomes e diagramas diferem.

Para este ciclo, não precisa escolher uma escola como identidade.

Use os conceitos que reduzem custo de mudança.

## Arquitetura em camadas tradicional

Uma arquitetura tradicional pode funcionar bem:

```text
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

Ela falha quando cada camada apenas repassa chamadas:

```ts
controller -> service -> manager -> repository -> dao
```

sem adicionar uma responsabilidade clara.

Também pode falhar quando o `service` conhece todas as tecnologias e vira um novo monólito interno.

## Ports and adapters

Outra representação:

```text
         HTTP Adapter
             |
             v
        Application
        /         \
       v           v
   Domain        Ports
                  /   \
                 v     v
          DB Adapter  Email Adapter
```

A utilidade está em distinguir:

- política;
- orquestração;
- detalhes.

Não precisa criar interfaces para cada seta do desenho.

## A pergunta mais importante: o que muda junto?

Arquitetura deve considerar eixos de mudança.

Exemplo:

- regra de desconto muda por motivo de negócio;
- PostgreSQL muda por motivo técnico;
- resposta HTTP muda por contrato externo;
- provedor de e-mail muda por operação.

Se tudo vive no mesmo módulo, mudanças independentes se contaminam.

Separar responsabilidades reduz esse acoplamento.

## Coesão

Coesão alta significa agrupar coisas que realmente pertencem juntas.

Exemplo:

```text
domain/order/
  order.ts
  order-item.ts
  order-errors.ts
```

pode ser mais coeso do que:

```text
entities/
  order.ts
  order-item.ts

errors/
  order-errors.ts
```

em um sistema grande.

A organização por feature pode reduzir navegação quando o domínio cresce.

## Organização por camada versus por feature

### Por camada

```text
domain/
application/
infrastructure/
interfaces/
```

Boa para estudar fronteiras e projetos pequenos.

### Por feature

```text
orders/
  domain/
  application/
  infrastructure/
  interfaces/

customers/
  domain/
  application/
  infrastructure/
  interfaces/
```

Pode escalar melhor quando existem módulos de negócio claros.

Nenhuma é universalmente superior.

Compare:

- frequência de mudanças;
- tamanho da equipe;
- número de features;
- compartilhamento de conceitos;
- custo de navegação.

## Acoplamento estrutural

Considere:

```ts
import { PrismaClient } from "@prisma/client";

export class CancelOrder {
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  async execute(id: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    });
  }
}
```

Esse caso de uso depende diretamente do ORM.

Isso pode ser aceitável em uma aplicação pequena.

Mas o custo aparece quando:

- regra de cancelamento cresce;
- testes exigem banco;
- ORM muda;
- domínio precisa ser reutilizado;
- persistência possui representação diferente.

A decisão precisa considerar contexto.

## Nem toda aplicação precisa de Clean Architecture completa

Uma API CRUD interna com vida curta pode não justificar:

- entidades ricas;
- ports;
- dezenas de DTOs;
- múltiplos mappers;
- factories;
- DI container.

Uma aplicação simples pode começar com módulos claros e boundaries mínimas.

A arquitetura deve crescer com a necessidade.

> Complexidade arquitetural também é dívida quando não resolve um problema real.

## Refatoração guiada por seams

Um seam é um ponto em que o comportamento pode ser substituído ou isolado.

No handler inicial, uma primeira etapa poderia extrair o acesso ao banco:

Antes:

```ts
const customer = await pool.query(...);
```

Depois:

```ts
const customer =
  await customerRepository.findById(customerId);
```

O contrato HTTP permanece igual.

O comportamento permanece coberto por teste.

Depois você pode extrair cálculo.

Depois notificação.

Depois criar um caso de uso.

A arquitetura emerge por pequenas etapas.

## Refatoração segura: preserve comportamento observável

Antes de alterar estrutura, registre:

- status HTTP;
- body;
- side effects;
- persistência;
- eventos;
- erros;
- logs relevantes, se fizerem parte do contrato operacional.

Exemplo:

```ts
test("creates order and sends notification", async () => {
  const response = await request(app)
    .post("/orders")
    .send(validPayload);

  assert.equal(response.status, 201);
  assert.equal(fakeNotifier.sent.length, 1);
});
```

Esse teste pode ser imperfeito, mas cria uma rede de segurança para a primeira extração.

## Caracterização de código legado

Em código sem arquitetura clara, primeiro descubra o comportamento.

Crie testes de caracterização para:

- caminho feliz;
- entradas inválidas;
- falha do banco;
- falha do serviço externo;
- duplicidade;
- regra especial;
- comportamento de retry;
- formato de erro.

Depois refatore.

Não tente "melhorar a regra" e "melhorar a estrutura" no mesmo passo sem necessidade.

## Antes e depois

### Antes

```ts
export async function createInvoice(
  input: any,
): Promise<any> {
  const customer = await db.customer.findUnique({
    where: { id: input.customerId },
  });

  const tax = input.amount * 0.17;

  const result = await db.invoice.create({
    data: {
      customerId: input.customerId,
      amount: input.amount,
      tax,
    },
  });

  await fetch(process.env.BILLING_WEBHOOK!, {
    method: "POST",
    body: JSON.stringify(result),
  });

  return result;
}
```

### Depois

Domínio:

```ts
export class Invoice {
  static create(
    customerId: string,
    amount: Money,
    taxPolicy: TaxPolicy,
  ): Invoice {
    const tax = taxPolicy.calculate(amount);

    return new Invoice(
      createInvoiceId(),
      customerId,
      amount,
      tax,
    );
  }
}
```

Port:

```ts
export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
}
```

Gateway:

```ts
export interface BillingEvents {
  invoiceCreated(
    invoice: Invoice,
  ): Promise<void>;
}
```

Aplicação:

```ts
export class CreateInvoice {
  constructor(
    private readonly invoices: InvoiceRepository,
    private readonly events: BillingEvents,
    private readonly taxPolicy: TaxPolicy,
  ) {}

  async execute(
    command: CreateInvoiceCommand,
  ): Promise<CreateInvoiceResult> {
    const invoice = Invoice.create(
      command.customerId,
      Money.fromCents(command.amountCents),
      this.taxPolicy,
    );

    await this.invoices.save(invoice);
    await this.events.invoiceCreated(invoice);

    return {
      id: invoice.id,
      amountCents: invoice.amount.cents,
      taxCents: invoice.tax.cents,
    };
  }
}
```

Agora mudanças em persistência e webhook não exigem alterar a regra fiscal.

## Mas cuidado com o "depois" perfeito demais

Mesmo a versão refatorada pode ter problemas:

- `createInvoiceId()` pode ser dependência escondida;
- publicar evento depois de persistir pode falhar e gerar inconsistência;
- `TaxPolicy` pode ser uma abstração desnecessária se existe uma única regra estável;
- repository pode esconder transação necessária.

O exercício não termina quando o diagrama fica bonito.

Arquitetura é gerenciamento consciente de trade-offs.

## Transações atravessam fronteiras

Um caso de uso pode precisar persistir múltiplos agregados atomicamente.

Evite abstrações que tornem transação impossível de expressar.

Uma opção:

```ts
export interface UnitOfWork {
  run<T>(
    work: (
      context: TransactionContext,
    ) => Promise<T>,
  ): Promise<T>;
}
```

Outra opção é colocar uma operação transacional de alto nível no repository.

Outra é aceitar que infraestrutura coordene parte do fluxo.

Não existe solução universal.

Compare:

- clareza;
- acoplamento;
- testabilidade;
- suporte do banco;
- consistência necessária.

## Eventos de domínio

Eventos podem representar algo que aconteceu:

```ts
export type OrderCreated = {
  type: "ORDER_CREATED";
  orderId: string;
  customerId: string;
};
```

Eles podem reduzir acoplamento entre efeitos secundários.

Mas introduzem:

- ordenação;
- entrega;
- duplicidade;
- retry;
- observabilidade;
- consistência eventual.

Não adote eventos para substituir uma chamada de método simples sem necessidade.

## Domain event não é automaticamente message broker

Um evento de domínio pode existir apenas em memória.

Publicá-lo em Kafka, RabbitMQ ou outro broker é outra decisão.

Separe:

- fato de domínio;
- mecanismo de transporte.

Isso reduz acoplamento conceitual.

## ADR: registre decisões importantes

ADR significa Architecture Decision Record.

Um ADR útil responde:

1. contexto;
2. decisão;
3. alternativas;
4. consequências;
5. riscos;
6. status.

Exemplo:

```md
# ADR-003 — Repository específico por agregado

## Contexto

Os casos de uso começaram a receber objetos de query do ORM,
fazendo a camada de aplicação conhecer filtros e includes.

## Decisão

Criar repositories específicos para Order e Customer,
com métodos orientados às necessidades dos casos de uso.

## Alternativas consideradas

1. continuar usando ORM diretamente;
2. criar GenericRepository<T>;
3. repository específico por agregado.

## Consequências

Positivas:
- aplicação deixa de conhecer detalhes do ORM;
- testes de aplicação podem usar fakes pequenos;
- consultas passam a ter intenção explícita.

Negativas:
- mais código de mapeamento;
- repository pode crescer se os casos de uso forem mal modelados.

## Riscos

Criar métodos demais e transformar repository em serviço genérico.
```

## ADR deve registrar alternativas rejeitadas

Um ADR fraco:

```md
Decidimos usar repository porque é melhor.
```

Um ADR útil explica por que outras opções foram rejeitadas no contexto atual.

Exemplo:

```md
GenericRepository foi rejeitado porque exporia operadores
do ORM à aplicação e não representaria consultas específicas
do domínio.
```

Isso permite que uma decisão seja reavaliada no futuro.

## ADR não é ata eterna

Um ADR pode mudar de status:

```text
Proposed
Accepted
Deprecated
Superseded
```

Se uma decisão for substituída, preserve o registro anterior e referencie o novo ADR.

Arquitetura também é histórico de raciocínio.

## Testes unitários por camada

### Domínio

```ts
test("order rejects zero quantity", () => {
  const order = Order.create("cus-1");

  assert.throws(
    () => order.addItem(
      OrderItem.create(
        "prod-1",
        0,
        Money.fromCents(1000),
      ),
    ),
  );
});
```

Rápido, sem banco.

### Aplicação

Use fakes simples:

```ts
class InMemoryOrderRepository
  implements OrderRepository {
  readonly orders: Order[] = [];

  async save(order: Order): Promise<void> {
    this.orders.push(order);
  }
}
```

Teste a orquestração sem precisar subir PostgreSQL.

## Testes de integração

A implementação PostgreSQL precisa de banco real.

```ts
test("persists and restores an order", async () => {
  const repository =
    new PostgresOrderRepository(testDatabase);

  const order = buildOrder();

  await repository.save(order);

  const restored =
    await repository.findById(order.id);

  assert.equal(
    restored?.total().cents,
    order.total().cents,
  );
});
```

Fake de repository não prova SQL, constraints ou mapping.

## Testes de contrato

Contratos importantes:

- HTTP;
- eventos;
- gateway externo;
- schemas;
- consumer/provider.

Exemplo HTTP:

```ts
test("keeps order response contract", async () => {
  const response = await createOrder(validPayload);

  assert.equal(response.status, 201);
  assert.match(
    response.headers.get("content-type") ?? "",
    /application\/json/,
  );
});
```

Use schema quando isso aumentar confiança.

## Testes e2e

Teste o sistema montado:

```text
HTTP
 -> controller
 -> use case
 -> domain
 -> Postgres adapter
 -> database
```

Eles validam wiring e fluxo crítico.

Não tente provar todas as regras apenas com e2e.

Quando um teste e2e falhar, diagnóstico custa mais.

## Pirâmide não é dogma

O importante é entender custo e propósito.

Unitários:

- rápidos;
- focados;
- pouca integração.

Integração:

- mais reais;
- mais lentos;
- validam fronteiras.

Contrato:

- protegem consumidores e fornecedores.

E2E:

- validam sistema montado;
- caros;
- importantes em fluxos críticos.

Distribuição depende do sistema.

## Lint e regras arquiteturais

Lint pode ajudar a impedir imports proibidos.

Exemplo conceitual:

```text
domain/ não pode importar infrastructure/
application/ não pode importar interfaces/http/
```

Ferramentas podem validar dependências por diretório ou grafo.

Mesmo sem ferramenta, mantenha a regra documentada e revisada em PR.

## Coverage

Coverage pode revelar:

- mapper de erro não testado;
- branch de domínio sem teste;
- adapter sem caminho de falha;
- caso de uso sem cenário importante.

Não use coverage como nota de arquitetura.

É possível ter 100% de coverage em um sistema extremamente acoplado.

## Mutation testing

Mutation testing ajuda a validar regras centrais.

Exemplo:

```ts
if (quantity <= 0) {
  throw new InvalidQuantityError();
}
```

Se uma mutação troca `<=` por `<` e os testes continuam passando, faltou proteger quantidade zero.

Use em:

- value objects;
- entidades;
- políticas;
- casos de uso críticos.

## Complexidade

Métricas simples podem destacar:

- handlers gigantes;
- services com dezenas de branches;
- mappers excessivos;
- métodos de repository genéricos demais.

Mas uma função curta pode estar mal acoplada.

Use métrica como sinal de investigação, não como sentença.

## O grafo de dependências é uma métrica útil

Além de contar linhas, observe imports.

Pergunte:

- quantos módulos conhecem o ORM?
- quantos módulos conhecem HTTP?
- quantos conhecem `process.env`?
- quantos importam SDK externo?
- quantos casos de uso dependem da mesma implementação concreta?

Uma refatoração arquitetural boa frequentemente reduz a disseminação de detalhes.

## Um laboratório que prova conhecimento

Crie o repositório:

```text
backend-architecture-quality-lab/
  src/
    domain/
      order/
        order.ts
        order-item.ts
        money.ts
        errors.ts
    application/
      create-order/
        create-order.ts
        create-order-command.ts
        create-order-result.ts
      ports/
        order-repository.ts
        customer-repository.ts
        product-repository.ts
        order-notifier.ts
    infrastructure/
      database/
        postgres-order-repository.ts
        postgres-customer-repository.ts
      notification/
        email-order-notifier.ts
    interfaces/
      http/
        create-order-handler.ts
        create-order-validator.ts
        order-http-mapper.ts
      cli/
        create-order-command.ts
    main/
      composition-root.ts
  tests/
    unit/
    integration/
    contract/
    e2e/
  docs/
    adr/
    diagrams/
    refactorings/
    metrics/
```

Não copie a estrutura cegamente.

Ela existe para tornar fronteiras visíveis durante o estudo.

## O cenário do laboratório

Comece com uma versão propositalmente acoplada.

Versão `v1`:

```text
HTTP handler
  -> valida
  -> consulta banco
  -> calcula
  -> grava
  -> chama e-mail
  -> monta response
```

Depois refatore em etapas.

### Etapa 1

Caracterize o contrato HTTP.

### Etapa 2

Extraia regra de cálculo.

### Etapa 3

Crie entidade/value object onde existe invariância.

### Etapa 4

Extraia caso de uso.

### Etapa 5

Isole persistência por contrato.

### Etapa 6

Isole notificação.

### Etapa 7

Crie mappers de fronteira onde necessário.

### Etapa 8

Adicione adapter CLI usando o mesmo caso de uso.

### Etapa 9

Troque uma implementação externa sem mudar domínio.

Essa sequência demonstra o motivo da arquitetura.

## Experimento 1 — mudar banco

Comece com repository em memória:

```ts
class InMemoryOrderRepository
  implements OrderRepository {
  // ...
}
```

Depois implemente PostgreSQL.

O caso de uso não deve mudar.

Registre:

- arquivos alterados;
- testes reaproveitados;
- novos testes necessários;
- código específico de banco.

A pergunta é:

> a arquitetura localizou a mudança?

## Experimento 2 — adicionar CLI

O sistema já possui HTTP.

Crie:

```text
node dist/cli/create-order.js \
  --customer cus-1 \
  --product prod-1 \
  --quantity 2
```

O CLI deve adaptar argumentos para o mesmo command da aplicação.

Não duplique regra de negócio.

Compare quantos arquivos precisaram mudar.

## Experimento 3 — trocar notificador

Implemente:

```ts
class ConsoleOrderNotifier
  implements OrderNotifier {}
```

e:

```ts
class EmailOrderNotifier
  implements OrderNotifier {}
```

Troque apenas na composição.

Se domínio e caso de uso precisarem conhecer SMTP, a fronteira falhou.

## Experimento 4 — mudar contrato HTTP mantendo aplicação

Antes:

```json
{
  "customerId": "cus-1"
}
```

Nova API:

```json
{
  "customer_id": "cus-1"
}
```

O mapper HTTP pode adaptar:

```ts
return {
  customerId: input.customer_id,
};
```

A aplicação continua igual.

Isso mostra que contrato de transporte e aplicação não precisam ser o mesmo tipo.

## Experimento 5 — abstração desnecessária

Crie propositalmente:

```text
ICreateOrderService
CreateOrderService
ICreateOrderFactory
CreateOrderFactory
IOrderMapper
DefaultOrderMapper
```

Meça:

- arquivos;
- linhas;
- navegação;
- implementações reais;
- decisões substituíveis.

Depois simplifique.

Documente por que remover abstração também é refatoração arquitetural.

## Experimento 6 — GenericRepository versus específico

Versão A:

```ts
GenericRepository<Order>
```

Versão B:

```ts
OrderRepository.findOpenByCustomer(...)
```

Compare:

- clareza;
- dependência de ORM;
- facilidade de teste;
- quantidade de parâmetros genéricos;
- intenção do caso de uso;
- facilidade de otimizar query específica.

Não declare vencedor universal.

## Experimento 7 — refatoração com contrato estável

Grave contract tests antes.

Refatore:

```text
handler monolítico
```

para:

```text
handler -> use case -> domain -> ports/adapters
```

O consumidor externo não deve perceber a mudança.

Salve:

- teste antes;
- teste depois;
- diff;
- diagrama;
- ADR.

## Compare abordagens e registre onde falham

| Comparação | O que observar | Onde cada opção falha |
| --- | --- | --- |
| handler direto vs. caso de uso | simplicidade, reuso, testabilidade | handler cresce e mistura responsabilidades; caso de uso adiciona estrutura |
| ORM direto vs. repository | velocidade inicial, isolamento e intenção | ORM vaza detalhes; repository pode esconder consultas importantes |
| GenericRepository vs. repository específico | reuso, clareza e acoplamento | genérico pode virar ORM disfarçado; específico pode repetir código |
| entidade anêmica vs. entidade rica | localização das regras e flexibilidade | anêmica espalha regra; rica pode concentrar responsabilidade demais |
| DTO compartilhado vs. DTO por fronteira | duplicação e independência | compartilhamento acopla contratos; separação pode duplicar estruturas |
| mapper explícito vs. objeto compartilhado | clareza e código extra | mapper custa linhas; compartilhamento transmite mudanças indevidas |
| DI manual vs. container | visibilidade e conveniência | manual cresce; container pode esconder grafo |
| camadas vs. feature folders | fronteiras e navegação | camada espalha feature; feature pode duplicar estrutura |
| chamada direta vs. evento | simplicidade e desacoplamento | chamada acopla fluxo; evento adiciona consistência e observabilidade |
| refactor grande vs. incremental | velocidade aparente e risco | rewrite dificulta comparação; incremental exige disciplina |

## Crie exemplos pequenos que quebrem

Faça pelo menos estes experimentos:

1. importe infraestrutura dentro do domínio e registre o acoplamento criado;
2. retorne entidade diretamente pelo HTTP e depois altere a entidade;
3. reuse DTO externo no domínio e force mudança no contrato externo;
4. crie `GenericRepository` que começa a receber filtros específicos de ORM;
5. crie interface com uma única implementação e sem motivo de substituição;
6. troque PostgreSQL por fake sem alterar caso de uso;
7. force erro no gateway externo e teste mapeamento;
8. altere representação do banco sem mudar entidade;
9. altere resposta HTTP sem mudar domínio;
10. crie um ADR sem alternativas e compare com um ADR completo.

O objetivo é entender limites, não apenas o caminho feliz.

## Medindo custo de mudança

Arquitetura é difícil de reduzir a um número.

Mesmo assim, registre sinais:

### Change surface

Quantos arquivos foram alterados para:

- trocar banco?
- trocar notificador?
- adicionar CLI?
- mudar campo HTTP?
- mudar regra de domínio?

### Dependency spread

Quantos módulos importam:

- ORM;
- HTTP framework;
- SDK externo;
- `process.env`;
- filesystem?

### Test speed

Quais regras exigem infraestrutura real para serem testadas?

### Mutation confidence

Os testes detectam mudança em regras centrais?

### Complexity

Existem handlers/services com muitas responsabilidades?

Esses dados não formam uma nota universal.

Eles tornam a discussão mais concreta.

## Um ADR real do laboratório

Crie:

```text
docs/adr/0001-use-specific-repositories.md
```

Conteúdo:

```md
# ADR-0001 — Repositories específicos para agregados

## Status

Accepted

## Contexto

O primeiro protótipo acessava o ORM diretamente nos casos de uso.
Consultas, includes e tipos do ORM começaram a aparecer na aplicação.

## Opções

1. manter ORM direto;
2. criar GenericRepository;
3. criar repositories específicos.

## Decisão

Adotar repositories específicos apenas nas fronteiras em que
o acoplamento ao ORM já aumentou o custo de teste e mudança.

## Consequências positivas

- aplicação depende de intenção;
- testes usam fakes menores;
- queries específicas podem ser otimizadas no adapter.

## Consequências negativas

- mais código;
- mapping entre persistência e domínio;
- risco de repositories grandes.

## Riscos

Criar abstrações cedo demais em módulos simples.
```

Esse ADR mostra contexto e limite.

## Issues e PRs

Issue:

```text
refactor: isolate order creation from HTTP and database
```

Descreva:

- problema atual;
- comportamento que deve permanecer;
- dependências que serão extraídas;
- testes existentes;
- critério de aceite.

PR:

```text
refactor: introduce CreateOrder use case without changing HTTP contract
```

Inclua:

- antes;
- depois;
- diagrama simples;
- contract tests;
- arquivos removidos/adicionados;
- trade-off;
- follow-up.

Outro PR:

```text
refactor: replace ORM dependency in application with OrderRepository
```

Explique por que essa abstração passou a valer o custo.

## Diagrama simples no README

Use Mermaid ou texto.

Exemplo textual:

```text
HTTP / CLI
    |
    v
Application Use Cases
    |
    v
Domain
    ^
    |
Ports
 /   \
v     v
DB   External Services
Adapters
```

Regra:

```text
Domain       -> não conhece HTTP, banco ou framework
Application  -> conhece domínio e ports
Infrastructure -> implementa ports
Interfaces   -> converte entrada/saída
Main         -> conecta implementações
```

## README profissional

O README deve explicar:

1. problema original;
2. objetivo arquitetural;
3. estrutura;
4. direção das dependências;
5. como executar;
6. como testar;
7. contrato HTTP;
8. caso de uso principal;
9. adapters;
10. ADRs;
11. experimentos;
12. métricas;
13. limitações;
14. próximos passos.

Resumo em inglês:

```md
## English summary

This repository studies backend architecture as a way to organize change.
It separates domain rules, application use cases, infrastructure adapters,
and public interfaces while preserving external contracts during refactoring.
The project documents trade-offs, rejected abstractions, automated tests,
and architecture decisions through ADRs.
```

## Evidências para GitHub e portfólio

Produza:

- repository público;
- README em português;
- resumo em inglês;
- diagrama;
- ADRs;
- issues;
- PRs;
- contract tests;
- unit tests de domínio;
- integration tests de adapters;
- e2e de fluxo crítico;
- CI;
- badge;
- coverage;
- mutation testing em regra central;
- antes/depois da refatoração;
- comparação de abstrações;
- artigo ou vlog.

Impacto bem descrito:

> A primeira versão do caso de uso dependia diretamente do ORM, do framework HTTP e do cliente de e-mail. A refatoração isolou essas dependências em adapters e manteve o contrato HTTP coberto por testes de contrato. Com isso, uma segunda interface CLI passou a reutilizar o mesmo caso de uso sem duplicar regra de negócio.

Isso demonstra efeito observável.

Evite:

> "Implementei Clean Architecture e o sistema ficou escalável."

Arquitetura não deve ser provada por adjetivo.

## Artigo prático 1 — Arquitetura backend aplicada a qualidade e refatoração

### Título sugerido

**Arquitetura backend aplicada a qualidade e refatoração: separando regra de negócio de detalhe técnico**

Comece com o código acoplado.

Mostre:

```text
HTTP + SQL + regra + e-mail
```

no mesmo handler.

Depois apresente o objetivo:

```text
HTTP
 -> Application
 -> Domain
 -> Ports
 -> Adapters
```

Explique:

- quais dependências foram invertidas;
- qual contrato ficou estável;
- quais testes permitiram a mudança;
- quais arquivos deixaram de conhecer o ORM;
- qual complexidade nova foi introduzida.

Inclua diagrama.

Feche mostrando uma mudança concreta que ficou localizada.

## Artigo prático 2 — Clean Architecture sem exagero

### Título sugerido

**Clean Architecture sem exagero: o que abstrair e o que não abstrair**

Use exemplos reais do repository.

### Abstração útil

```ts
interface PaymentGateway {
  authorize(...): Promise<...>;
}
```

porque existe uma fronteira externa.

### Abstração suspeita

```ts
interface StringTrimmer {
  trim(value: string): string;
}
```

sem variação ou risco.

Mostre:

- custo em arquivos;
- custo cognitivo;
- impacto no teste;
- facilidade de mudança;
- possibilidade real de substituição.

O objetivo é mostrar que maturidade arquitetural inclui remover abstrações desnecessárias.

## Artigo prático 3 — ADR na prática

### Título sugerido

**ADR na prática: como documentei uma decisão técnica do meu projeto**

Escolha uma decisão real:

- repository específico;
- DI manual;
- DTO separado;
- evento versus chamada direta;
- estratégia de organização por feature.

Estruture:

1. contexto;
2. problema;
3. restrições;
4. opções;
5. critérios;
6. decisão;
7. consequências positivas;
8. consequências negativas;
9. riscos;
10. condição para reavaliar.

Inclua link para o ADR no GitHub.

Mostre que engenharia envolve justificar decisão, não apenas implementar.

## Formato recomendado para os artigos

Cada artigo pode conter 800 a 1.500 palavras.

Estrutura:

1. introdução;
2. problema;
3. código antes;
4. arquitetura escolhida;
5. código depois;
6. testes;
7. trade-offs;
8. limitações;
9. conclusão;
10. link do GitHub.

Um vlog pode mostrar:

- diagrama;
- teste;
- refactor;
- diff;
- adapter;
- ADR;
- PR.

## Como explicar trade-offs em entrevista internacional

Use inglês técnico simples.

> We separated the use case from HTTP and database details because the same business flow needed to be reused from a CLI. The application layer now depends on repository and gateway contracts, while PostgreSQL and HTTP remain adapters. The trade-off is additional mapping and more files, so we only introduced boundaries where they reduced real coupling.

Outro exemplo:

> We did not create interfaces for every class. We introduced an abstraction only when there was an external dependency, a testability problem, or a realistic axis of change. This kept the architecture explicit without turning simple code into unnecessary indirection.

Outro:

> We preserved the public HTTP contract during the refactor and protected it with contract tests. Internally, the persistence model and domain model changed, but API consumers did not need to change.

Outro:

> We documented the repository decision in an ADR. We rejected a generic repository because it exposed ORM-style filters to the application layer and made the abstraction less domain-oriented.

Essas respostas mostram:

- contexto;
- alternativa;
- decisão;
- consequência.

## Checklist técnico de conclusão

Você terá concluído o E015 quando conseguir:

- explicar arquitetura como organização de mudanças;
- diferenciar domínio, aplicação, infraestrutura e interface;
- modelar ao menos uma entidade com invariantes;
- criar um value object quando existe benefício real;
- explicar quando um domain service faz sentido;
- criar um caso de uso com responsabilidade clara;
- aplicar dependency inversion em uma fronteira significativa;
- explicar por que nem toda classe precisa de interface;
- criar DTOs de entrada e saída;
- manter entidade separada do contrato HTTP quando necessário;
- criar mapper de persistência ou transporte quando houver fronteira real;
- validar entrada externa sem colocar regra de negócio no controller;
- desenhar repository orientado à necessidade da aplicação;
- diferenciar repository, gateway e adapter;
- criar composition root;
- manter contrato público estável durante uma refatoração;
- criar teste unitário de domínio;
- criar teste de aplicação com fake;
- criar integração para adapter real;
- criar teste de contrato;
- criar e2e para fluxo crítico;
- escrever ADR com alternativas rejeitadas;
- explicar consequência positiva e negativa de uma decisão;
- comparar organização por camada e por feature;
- identificar acoplamento por imports;
- reconhecer abstração desnecessária;
- remover uma abstração quando ela aumenta custo;
- executar refatoração em etapas pequenas;
- usar coverage como sinal, não como nota;
- aplicar mutation testing ou análise equivalente em regra importante;
- comparar duas abordagens e registrar onde falham;
- explicar trade-offs em inglês técnico simples;
- produzir evidência pública reproduzível.

## O que você deve levar deste ciclo

Arquitetura backend não é desenhar caixas.

É decidir onde cada tipo de mudança deve acontecer.

Uma regra de negócio deve mudar por motivo de negócio.

Um adapter de banco deve mudar por motivo de persistência.

Um controller deve mudar por motivo de transporte.

Um gateway deve mudar quando uma integração externa muda.

Um DTO público deve mudar quando o contrato externo muda.

Quando essas razões de mudança ficam misturadas, o sistema perde previsibilidade.

Quando são separadas com intenção, a refatoração se torna mais localizada e os testes conseguem proteger cada fronteira.

Mas separação também tem custo.

Mais camadas, ports, DTOs e mappers não significam automaticamente melhor arquitetura.

O objetivo do ciclo é aprender a responder:

> Esta abstração reduz o custo de uma mudança provável ou apenas move o código para mais arquivos?

Você terá concluído o E015 quando conseguir pegar um backend acoplado, caracterizar seu comportamento, criar fronteiras apenas onde elas resolvem problemas reais, manter o contrato público estável e provar a melhoria com testes, ADRs e evidência de mudança localizada.

O resultado final deve ser avaliável sem conversa privada: repository público, README bilíngue, diagrama, testes, CI, ADRs, issues, PRs, antes/depois da refatoração e artigos que mostrem não apenas o que foi criado, mas por que cada abstração existe.

## Referências primárias e clássicas

- [Martin Fowler — Patterns of Enterprise Application Architecture](https://martinfowler.com/books/eaa.html)
- [Martin Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Martin Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html)
- [Martin Fowler — Data Mapper](https://martinfowler.com/eaaCatalog/dataMapper.html)
- [Martin Fowler — Dependency Injection](https://martinfowler.com/articles/injection.html)
- [Alistair Cockburn — Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Robert C. Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [TypeScript Handbook — Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [TypeScript Handbook — Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
