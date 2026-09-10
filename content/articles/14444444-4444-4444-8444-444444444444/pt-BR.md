---
translationId: 24444444-4444-4444-8444-444444444444
locale: pt-BR
slug: arquitetura-backend-base-ts-node
title: "Arquitetura backend aplicada a Base TS/Node: separando regra de negócio
  de detalhe técnico"
description: Um guia prático para organizar backends TypeScript/Node com foco em
  domínio, casos de uso, infraestrutura, interfaces, DTOs, repositories,
  adapters, testes e ADRs sem exagerar nas abstrações.
articleId: 14444444-4444-4444-8444-444444444444
sourceRevision: 00f2e4cabdcbfdc968171bc571fccbd3be1805ca3bbc5cc151615880cb1fa9d3
---

# Arquitetura backend aplicada a Base TS/Node: separando regra de negócio de detalhe técnico

Quando alguém começa a estudar arquitetura backend, é comum encontrar diagramas cheios de caixas, setas e nomes como `domain`, `application`, `infrastructure`, `adapter`, `gateway`, `repository` e `mapper`.

Isso pode criar uma impressão perigosa:

> boa arquitetura é ter muitas camadas.

Não é.

Arquitetura é, antes de tudo, a **capacidade de organizar mudanças**.

Um sistema bem arquitetado permite alterar banco de dados, framework HTTP, forma de persistência, biblioteca externa ou estratégia de integração sem espalhar mudanças por todo o código.

O objetivo deste artigo, dentro do ciclo **Base TS/Node**, é estudar arquitetura com TypeScript e Node.js de forma prática, sem transformar cada arquivo em uma abstração.

---

## O problema que arquitetura tenta resolver

Imagine um serviço simples de criação de usuário:

```ts
app.post("/users", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      name: req.body.name,
      email: req.body.email
    }
  });

  res.status(201).json(user);
});
```

Esse código pode funcionar perfeitamente em um projeto pequeno.

O problema aparece quando regras começam a crescer:

- e-mail precisa ser validado;
- usuário duplicado deve ser rejeitado;
- existe uma regra de negócio para ativação;
- precisamos registrar auditoria;
- banco pode mudar;
- a mesma operação será usada por HTTP e CLI;
- testes não deveriam depender do banco.

Quando tudo está dentro da rota, qualquer mudança técnica ou de negócio afeta o mesmo lugar.

Arquitetura começa quando fazemos uma pergunta simples:

> **o que é regra do negócio e o que é detalhe externo?**

---

# Domínio, aplicação, infraestrutura e interface

Uma organização útil para um backend TS/Node pode ser pensada assim:

```text
Interface HTTP / CLI
        ↓
Aplicação
        ↓
Domínio

Infraestrutura → implementa contratos necessários
```

<!-- VISUAL:
Diagrama em camadas:

┌──────────────────────────────┐
│ Interface HTTP / CLI         │
│ controllers, presenters      │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Aplicação                    │
│ casos de uso                 │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Domínio                      │
│ entidades, VOs, regras       │
└──────────────────────────────┘

Infraestrutura fica ao redor:
DB, filesystem, fila, APIs externas
-->

A regra principal não é "toda aplicação deve ter exatamente quatro pastas".

A regra importante é:

> dependências de negócio não deveriam precisar conhecer detalhes externos.

---

# Entidades e Value Objects

Uma entidade representa algo importante para o domínio e possui identidade.

Exemplo:

```ts
export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly email: Email
  ) {}
}
```

Já um **Value Object** representa um valor cujo significado está em seu conteúdo.

```ts
export class Email {
  private constructor(public readonly value: string) {}

  static create(value: string): Email {
    if (!value.includes("@")) {
      throw new Error("Invalid email");
    }

    return new Email(value);
  }
}
```

O benefício não é apenas "usar classe".

O benefício é evitar que uma regra importante fique repetida em controllers, services e repositories.

Se um e-mail válido possui regras próprias, essas regras devem estar perto do conceito `Email`.

---

# Serviços de domínio: use quando a regra não pertence claramente a uma entidade

Nem toda regra precisa virar um serviço.

Se uma regra pertence claramente a uma entidade, mantenha-a na entidade.

Um serviço de domínio faz sentido quando a regra envolve conceitos do domínio, mas não pertence naturalmente a um único objeto.

Exemplo conceitual:

```ts
class PricingService {
  calculatePrice(customer: Customer, plan: Plan): Money {
    // regra de domínio envolvendo mais de um conceito
  }
}
```

Criar `UserDomainService` apenas para mover métodos de uma entidade para outra classe não melhora arquitetura.

Abstração só vale a pena quando deixa responsabilidades mais claras.

---

# Casos de uso: descrevendo intenções da aplicação

A camada de aplicação organiza ações que o sistema oferece.

Por exemplo:

```ts
export type CreateUserInput = {
  name: string;
  email: string;
};

export class CreateUser {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = Email.create(input.email);

    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      throw new Error("User already exists");
    }

    const user = new User(
      crypto.randomUUID(),
      input.name,
      email
    );

    await this.userRepository.save(user);

    return user;
  }
}
```

Perceba algo importante: esse caso de uso não sabe se foi chamado por Express, Nest, CLI ou teste.

Ele conhece a intenção:

```text
criar usuário
```

Essa separação permite reutilizar a regra em interfaces diferentes.

---

# Dependency Inversion sem transformar tudo em interface

O caso de uso precisa salvar um usuário.

Mas ele não precisa saber se estamos usando PostgreSQL, MongoDB ou memória.

Podemos definir um contrato:

```ts
export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

A infraestrutura implementa esse contrato.

```ts
export class PostgresUserRepository implements UserRepository {
  async findByEmail(email: Email): Promise<User | null> {
    // consulta real
    return null;
  }

  async save(user: User): Promise<void> {
    // persistência real
  }
}
```

Isso é **dependency inversion**: a regra de aplicação depende de um contrato que representa sua necessidade, e o detalhe externo se adapta a esse contrato.

Mas existe um erro comum:

```text
IUserService
IUserController
IUserMapper
IUserValidator
IUserFactory
IUserAnything
```

Nem toda classe precisa de interface.

Pergunte:

> existe realmente mais de uma implementação relevante ou uma fronteira que precisa ser protegida?

Se a resposta for não, a interface pode apenas aumentar custo de manutenção.

---

# DTOs, mappers e validadores

Dados de entrada HTTP não são automaticamente objetos de domínio.

Imagine:

```json
{
  "name": "Ana",
  "email": "ana@example.com"
}
```

Esse JSON pertence à interface externa.

Podemos representar a entrada:

```ts
export type CreateUserRequestDto = {
  name: string;
  email: string;
};
```

Um validador garante formato básico antes de chamar o caso de uso.

Depois, o caso de uso transforma dados simples em objetos do domínio.

Na saída, um mapper pode evitar expor entidades diretamente:

```ts
export function toUserResponse(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email.value
  };
}
```

Isso mantém o contrato HTTP separado do modelo interno.

---

# Repository, Gateway e Adapter

Esses nomes podem parecer sofisticados, mas todos existem para representar fronteiras.

Um **Repository** normalmente abstrai persistência de objetos do domínio.

Um **Gateway** costuma representar acesso a um sistema externo.

Por exemplo:

```ts
interface PaymentGateway {
  charge(input: ChargeInput): Promise<ChargeResult>;
}
```

Um **Adapter** traduz uma interface externa para o contrato esperado pela aplicação.

```ts
class StripePaymentAdapter implements PaymentGateway {
  async charge(input: ChargeInput): Promise<ChargeResult> {
    // traduz entrada e saída do Stripe
  }
}
```

O objetivo não é usar todos os padrões em todo projeto.

O objetivo é tornar explícito onde o sistema conversa com algo externo.

---

# Estrutura de projeto possível

Uma estrutura simples:

```text
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── services/
│
├── application/
│   ├── use-cases/
│   └── ports/
│
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   └── gateways/
│
└── interfaces/
    ├── http/
    └── cli/
```

Isso não é uma lei.

Uma aplicação pequena pode usar menos pastas.

Arquitetura boa não é a que parece mais sofisticada.

É a que deixa claro:

```text
onde a regra mora
quem pode depender de quem
onde detalhes externos entram
como testar sem carregar o mundo inteiro
```

---

# Clean Architecture sem exagero

Uma abstração boa reduz custo de mudança.

Uma abstração ruim cria trabalho sem benefício real.

Considere:

```ts
interface Clock {
  now(): Date;
}
```

Essa abstração pode fazer sentido se regras dependem do tempo e precisamos testar datas diferentes.

Agora imagine criar:

```ts
interface UserNameFormatter {
  format(name: string): string;
}
```

para uma função trivial usada em um único lugar.

Talvez a abstração custe mais do que a mudança que pretende proteger.

> O número de interfaces não mede qualidade arquitetural.

---

# Testes ajudam a validar a arquitetura

Se o caso de uso depende apenas de um `UserRepository`, podemos usar uma implementação em memória:

```ts
class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find(
      user => user.email.value === email.value
    ) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }
}
```

Agora o teste não precisa de PostgreSQL:

```ts
it("should not create duplicated users", async () => {
  const repository = new InMemoryUserRepository();
  const useCase = new CreateUser(repository);

  await useCase.execute({
    name: "Ana",
    email: "ana@example.com"
  });

  await expect(
    useCase.execute({
      name: "Ana 2",
      email: "ana@example.com"
    })
  ).rejects.toThrow("User already exists");
});
```

Quando regras centrais podem ser testadas sem framework e sem infraestrutura pesada, isso costuma ser um bom sinal.

---

# Refatorar mantendo o contrato público estável

Imagine que sua API publica:

```http
POST /users
```

com resposta:

```json
{
  "id": "123",
  "name": "Ana",
  "email": "ana@example.com"
}
```

Você deveria conseguir trocar:

```text
Prisma → Drizzle
PostgreSQL → outro banco
Express → Fastify
```

sem obrigatoriamente quebrar esse contrato.

Essa é uma forma prática de avaliar arquitetura:

> uma mudança interna força mudança desnecessária para quem usa o sistema?

Quanto mais detalhes vazam para fora, maior o custo de mudança.

---

# ADR: documentando decisões

**ADR** significa *Architecture Decision Record*.

É um documento curto para registrar uma decisão importante.

Exemplo:

```md
# ADR-001 — Repository na camada de aplicação

## Contexto

Precisamos testar casos de uso sem banco real.

## Decisão

A aplicação dependerá de um contrato UserRepository.

## Alternativas consideradas

1. Usar Prisma diretamente no caso de uso.
2. Criar repository abstrato.
3. Usar uma função simples de persistência.

## Consequências

Positivas:
- testes independentes de banco;
- troca de implementação mais simples.

Negativas:
- mais arquivos e mapeamento;
- risco de abstração excessiva.
```

Um ADR bom não registra apenas a decisão.

Ele registra também:

```text
por que decidimos
o que rejeitamos
qual custo aceitamos
```

---

# Um laboratório para Base TS/Node

Crie um repositório pequeno:

```text
backend-architecture-lab/
├── src/
├── test/
├── docs/
│   └── adr/
├── package.json
├── tsconfig.json
└── README.md
```

Implemente um fluxo simples, como:

```text
criar usuário
consultar usuário
bloquear duplicidade
```

Depois faça duas versões:

```text
versão acoplada
versão separada por responsabilidades
```

Compare:

- quantidade de arquivos;
- facilidade de teste;
- impacto de trocar banco;
- impacto de trocar HTTP;
- clareza;
- custo de manutenção.

Não conclua automaticamente que a versão com mais camadas é melhor.

Escreva quando cada abordagem funciona e quando começa a falhar.

---

# Processo profissional também é parte do exercício

Use Node LTS, TypeScript, npm ou pnpm, terminal, VS Code e Git.

Para cada pequena mudança:

```text
issue
  ↓
branch
  ↓
commits atômicos
  ↓
testes
  ↓
pull request
  ↓
code review próprio
  ↓
merge
```

Mesmo sozinho.

O objetivo é transformar o repositório em evidência de processo de engenharia, não apenas em uma pasta de código.

Configure CI com:

```text
lint
typecheck
test
build
```

---

# Como comprovar que você aprendeu

Ao final, seu repositório deve permitir que outra pessoa responda:

```text
Qual problema arquitetural estava sendo estudado?
Qual regra ficou no domínio?
Qual responsabilidade ficou na aplicação?
O que foi considerado infraestrutura?
Onde dependency inversion trouxe benefício?
Onde você decidiu NÃO abstrair?
Quais alternativas foram registradas no ADR?
Quais testes protegem o contrato?
```

O README pode ser em português, com um resumo técnico em inglês.

Exemplo:

> This project explores backend architecture in TypeScript and Node.js by separating business rules from HTTP and persistence details. The goal is not to maximize abstractions, but to reduce the cost of change while keeping tests simple and public contracts stable.

Isso mostra muito mais maturidade do que apenas escrever "Clean Architecture" no nome do repositório.

---

# Perguntas que você deve conseguir responder

Depois do ciclo, tente explicar:

**Qual é a diferença entre domínio e aplicação?**

**Quando uma regra deve ficar em uma entidade?**

**Quando um Value Object vale a pena?**

**Quando um serviço de domínio é necessário?**

**Por que o caso de uso não deveria depender de Express?**

**Quando dependency inversion reduz custo de mudança?**

**Quando uma interface é apenas burocracia?**

**Qual é a diferença entre DTO e entidade?**

**O que um repository deve esconder?**

**Quando usar gateway ou adapter?**

**Como trocar infraestrutura sem quebrar contrato público?**

**Por que testes são uma ferramenta arquitetural?**

**O que um ADR deve registrar além da decisão final?**

Se você consegue responder com exemplos reais do seu próprio repositório, o estudo deixou de ser decorativo.

---

# O que levar deste artigo

Arquitetura backend não é um concurso de quantidade de pastas.

Também não é copiar um diagrama de Clean Architecture e criar interfaces para tudo.

Arquitetura é organizar dependências e responsabilidades para que mudanças importantes tenham impacto controlado.

No contexto Base TS/Node, um bom modelo mental é:

```text
Interface
   ↓
Aplicação
   ↓
Domínio

Infraestrutura
   ↓
adapta detalhes externos aos contratos necessários
```

O domínio protege regras.

A aplicação coordena casos de uso.

A infraestrutura conversa com banco, rede e serviços externos.

A interface traduz HTTP, CLI ou outros mecanismos para a aplicação.

E abstrações só devem existir quando protegem uma fronteira ou reduzem custo de mudança.

> A melhor arquitetura não é a que possui mais padrões.  
> É a que permite mudar o sistema com segurança, clareza e custo previsível.

---

# Próximas leituras sugeridas

- Clean Architecture sem exagero: o que abstrair e o que não abstrair
- ADR na prática: como documentar uma decisão técnica
- Entidades e Value Objects em TypeScript
- Dependency Inversion aplicada a Node.js
- Testes de caso de uso sem banco e sem framework
