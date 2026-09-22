---
translationId: 2e181818-1818-4818-8818-181818181818
articleId: e0181818-1818-4818-8818-181818181818
locale: pt-BR
slug: texto-aula-qualidade-refatoracao
title: "Texto-aula para qualidade e refatoração: transformar estudo em conhecimento ensinável"
description: "Um guia prático para transformar estudo técnico em artigo, aula escrita e roteiro de vlog com exemplos reproduzíveis, testes, fontes, trade-offs e evidências públicas de aprendizado."
status: published
---

# Texto-aula para qualidade e refatoração: transformar estudo em conhecimento ensinável

Estudar um assunto e conseguir explicá-lo são capacidades diferentes.

É possível terminar uma documentação, assistir a uma aula, implementar um exemplo e ainda não conseguir responder com clareza:

- qual problema esse conceito resolve?
- onde ele falha?
- quando eu não deveria usá-lo?
- como provo que a melhoria realmente aconteceu?
- quais partes eu entendi por experiência e quais estou repetindo de uma fonte?
- como outra pessoa consegue reproduzir meu exemplo?
- como eu explicaria a mesma decisão em uma entrevista técnica?

O objetivo deste ciclo é transformar conhecimento consumido em conhecimento organizado.

O contexto continua sendo **qualidade e refatoração**. Por isso, o conteúdo não deve ser apenas uma explicação abstrata sobre boas práticas.

Você deve escolher um problema real encontrado nos ciclos anteriores, reproduzi-lo, mostrar uma versão ruim, melhorar em pequenas etapas, testar o comportamento e transformar esse processo em material didático.

Neste ciclo, você desenvolverá quatro capacidades:

1. estruturar conhecimento técnico;
2. ensinar por meio de exemplos reproduzíveis;
3. comunicar incertezas e trade-offs com precisão;
4. transformar estudo em evidência pública de evolução.

> Ensinar não prova que você sabe tudo. Prova que consegue organizar o que já sabe, separar fato de opinião, reproduzir comportamento e explicar limites.

<!-- VISUAL:
Fluxo:
Problema real -> hipótese -> exemplo ruim -> teste que expõe o problema -> refatoração -> nova evidência -> artigo -> vlog.
Ao lado:
fontes primárias, GitHub, CI, trade-offs, limitações.
-->

## O problema que guia o laboratório

Neste ciclo, você não precisa inventar um sistema novo.

Use um problema real encontrado durante os ciclos de TypeScript, Node.js, arquitetura ou persistência.

Um bom exemplo para o laboratório:

> uma função de criação de pedido mistura validação, regra de negócio, persistência e envio de e-mail.

Código inicial:

```ts
export async function createOrder(
  input: any,
): Promise<any> {
  if (!input.customerId) {
    throw new Error("customer required");
  }

  const customer = await db.customer.findUnique({
    where: {
      id: input.customerId,
    },
  });

  let total = 0;

  for (const item of input.items) {
    const product = await db.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    total += product.price * item.quantity;
  }

  const order = await db.order.create({
    data: {
      customerId: input.customerId,
      total,
    },
  });

  await sendEmail(
    customer.email,
    `Order ${order.id} created`,
  );

  return order;
}
```

Você pode estudar muitos conceitos a partir daqui:

- `any`;
- acoplamento;
- dependência escondida;
- função longa;
- dificuldade de teste;
- duplicação potencial;
- mistura entre domínio e infraestrutura;
- query dentro de loop;
- contrato público pouco claro;
- side effect acoplado à persistência.

Mas o texto-aula não deve tentar ensinar tudo ao mesmo tempo.

Escolha uma pergunta.

Exemplo:

> Como separar regra de negócio de dependências externas sem transformar o projeto em uma coleção de interfaces?

Essa pergunta será a linha narrativa.

## Uma aula precisa de uma pergunta central

Um artigo ruim frequentemente começa pelo tópico:

> Hoje vamos falar sobre Clean Architecture.

Isso é amplo demais.

Um artigo melhor começa por um problema:

> Eu queria testar a regra de criação de pedidos sem subir banco nem servidor de e-mail, mas a função dependia diretamente dos dois.

A diferença é importante.

O leitor sabe:

- qual dor será resolvida;
- por que deveria continuar lendo;
- qual evidência esperar no final.

Antes de escrever, complete:

```text
Problema:
______________________________________

Quem sente esse problema:
______________________________________

Por que ele importa:
______________________________________

O que vou provar:
______________________________________

O que NÃO vou tentar provar:
______________________________________
```

## Escolha um problema real

O problema deve vir de:

- código do laboratório;
- bug que você provocou;
- dificuldade de teste;
- refatoração executada;
- query que degradou;
- erro de tipagem;
- uso incorreto do runtime;
- design que ficou difícil de mudar.

Evite começar por:

> "Preciso publicar um artigo sobre generics."

Comece por:

> "Eu tinha três funções duplicadas porque havia perdido a relação entre tipo de entrada e retorno. Quero verificar se um generic realmente reduz essa duplicação sem piorar a leitura."

Isso produz uma aula orientada a decisão.

## Da anotação para a aula

Durante o estudo, suas anotações podem ser:

```text
unknown = exige validação
any = desliga checagem
never = exhaustive checking
union = vários estados
```

Isso ainda não é uma aula.

Uma aula precisa conectar conceitos:

```text
Entrada externa não é confiável.
Se eu digitar a entrada como `any`, o compilador deixa de me proteger.
Ao usar `unknown`, sou obrigado a validar antes de acessar os dados.
Depois da validação, uma discriminated union pode representar apenas
os estados permitidos.
Se a aplicação precisar tratar todos esses estados, `never`
permite detectar casos esquecidos durante uma refatoração.
```

O conhecimento passa de lista para raciocínio.

## Defina o nível do leitor

Escreva para alguém específico.

Exemplo:

> Desenvolvedor júnior/pleno que já usa TypeScript e Node.js, mas ainda mistura regra de negócio, infraestrutura e HTTP.

Isso define:

- quais termos precisam ser explicados;
- quais podem ser assumidos;
- quanto código mostrar;
- quanto contexto fornecer.

Não tente escrever para:

> "qualquer pessoa."

Uma aula para todo mundo costuma não ser boa para ninguém.

## Explique sem esconder precisão

Evitar jargão não significa eliminar vocabulário técnico.

Ruim:

> Dependency inversion desacopla as dependências através da inversão de controle.

A frase usa termos para explicar os próprios termos.

Melhor:

> O caso de uso precisa salvar um pedido, mas não precisa saber que a implementação usa PostgreSQL. Ele depende de um contrato de persistência, enquanto a composição da aplicação escolhe a implementação concreta.

Depois você pode dar o nome:

> Essa direção de dependência é uma aplicação de dependency inversion.

A ordem pedagógica importa:

1. comportamento;
2. problema;
3. solução;
4. nome.

## Teoria mínima suficiente

Uma aula prática precisa de teoria.

Mas apenas a teoria necessária para entender o experimento.

Se o artigo é sobre refatorar um handler acoplado, talvez você precise explicar:

- responsabilidade;
- acoplamento;
- dependency inversion;
- boundary;
- teste unitário.

Você provavelmente não precisa explicar:

- toda história da Clean Architecture;
- todos os princípios SOLID;
- DDD completo;
- CQRS;
- event sourcing.

Profundidade não significa largura infinita.

## O exemplo mínimo reproduzível

O exemplo precisa ser pequeno o suficiente para ser compreendido e completo o suficiente para funcionar.

Estrutura:

```text
examples/
  order-refactoring/
    src/
    tests/
    package.json
    tsconfig.json
    README.md
```

O leitor deve conseguir:

```bash
npm install
npm test
npm run typecheck
```

e observar o comportamento descrito.

## Um exemplo não deve depender de contexto invisível

Ruim:

```ts
const result = await service.execute(input);
```

sem explicar:

- o que é `service`;
- o que é `input`;
- como executar;
- qual resultado esperar.

Melhor:

```ts
type CreateOrderInput = {
  customerId: string;
  totalCents: number;
};

class InMemoryOrderRepository {
  readonly saved: CreateOrderInput[] = [];

  async save(
    order: CreateOrderInput,
  ): Promise<void> {
    this.saved.push(order);
  }
}
```

Mesmo que o exemplo seja simplificado, ele deve formar uma unidade compreensível.

## Mostre primeiro a versão ruim

O leitor aprende melhor quando entende o problema.

Exemplo:

```ts
export async function calculateAndSave(
  input: any,
): Promise<void> {
  const price = Number(input.price);
  const quantity = Number(input.quantity);

  await database.query(
    "INSERT INTO items(price, quantity) VALUES ($1, $2)",
    [price, quantity],
  );

  console.log(price * quantity);
}
```

Pergunte:

- quem valida?
- o que acontece com `NaN`?
- por que cálculo e persistência estão juntos?
- como testar cálculo sem banco?
- qual é o contrato de entrada?

Não chame o código de "horrível".

Explique concretamente o custo.

## Explique por que a versão falha

Não escreva apenas:

> Esse código viola SOLID.

Isso não ensina.

Escreva:

> Para testar o cálculo, o teste precisa atravessar uma dependência de banco que não participa da regra. Uma mudança no cliente SQL pode quebrar um teste de cálculo. Isso indica que duas razões diferentes de mudança estão no mesmo módulo.

Agora o leitor entende o sintoma.

## Crie uma hipótese de melhoria

Exemplo:

> Se eu separar cálculo e persistência, devo conseguir testar a regra sem banco e trocar a implementação de persistência sem alterar a função de cálculo.

Essa hipótese pode ser testada.

## Refatore em pequenas etapas

### Etapa 1 — caracterização

```ts
test("calculates total before saving", async () => {
  // registra comportamento atual
});
```

### Etapa 2 — extrair regra

```ts
export function calculateTotal(
  priceCents: number,
  quantity: number,
): number {
  if (quantity <= 0) {
    throw new Error("quantity must be positive");
  }

  return priceCents * quantity;
}
```

### Etapa 3 — introduzir contrato de persistência

```ts
export interface ItemRepository {
  save(item: Item): Promise<void>;
}
```

### Etapa 4 — caso de uso

```ts
export class CreateItem {
  constructor(
    private readonly repository: ItemRepository,
  ) {}

  async execute(
    input: CreateItemInput,
  ): Promise<void> {
    const total = calculateTotal(
      input.priceCents,
      input.quantity,
    );

    await this.repository.save({
      ...input,
      totalCents: total,
    });
  }
}
```

O texto deve explicar a intenção de cada etapa.

## Não esconda o custo da melhoria

A nova versão adicionou:

- mais tipos;
- mais arquivos;
- uma interface;
- composição.

Isso é custo.

A pergunta é:

> o custo se paga?

Se o projeto possui:

- múltiplas implementações;
- testes que precisam isolar banco;
- regras que crescem;
- necessidade de reutilização;

pode valer.

Se é um script de 30 linhas executado uma vez, talvez não.

Esse é o tipo de trade-off que transforma tutorial em engenharia.

## Código antes e depois precisa ser comparável

Evite mostrar:

### Antes

```ts
function x() {
  // 5 linhas
}
```

### Depois

```ts
// arquitetura completa com 14 arquivos
```

sem conexão.

Prefira pequenas transformações.

Mostre diff conceitual:

```text
Antes:
handler -> database + email + rule

Depois:
handler -> use case -> repository port
                    -> notifier port
```

Depois mostre o código correspondente.

## Teste como ferramenta didática

Teste não é apenas qualidade do repository.

É evidência dentro da aula.

Antes:

```ts
test("requires real database", async () => {
  // setup pesado
});
```

Depois:

```ts
test("rejects zero quantity", async () => {
  const repository =
    new InMemoryItemRepository();

  const useCase =
    new CreateItem(repository);

  await assert.rejects(
    useCase.execute({
      priceCents: 1000,
      quantity: 0,
    }),
    /quantity must be positive/,
  );
});
```

O leitor consegue ver o benefício.

## Testes unitários

Explique o papel:

> Um teste unitário verifica uma unidade pequena de comportamento com dependências controladas.

Bom para:

- value objects;
- funções puras;
- regras;
- casos de uso com fakes.

Não use "unitário" apenas como sinônimo de "teste rápido".

## Testes de integração

Explique:

> Um teste de integração verifica se componentes reais trabalham corretamente juntos.

Exemplos:

- repository + PostgreSQL;
- pipeline + filesystem;
- HTTP client + mock server;
- parser + arquivo real.

Não substitua integração por mock quando o objetivo é provar integração.

## Testes de contrato

Explique:

> Um teste de contrato protege a forma como duas partes se comunicam.

Exemplos:

- JSON HTTP;
- evento;
- schema;
- interface de gateway;
- API externa simulada por contrato.

Ele é particularmente importante durante refatoração.

## E2E

Explique:

> Um teste end-to-end verifica um fluxo montado do ponto de vista externo.

Exemplo:

```text
HTTP -> aplicação -> banco -> resposta
```

É útil para provar wiring.

É caro para explicar a causa de uma falha.

## O artigo deve ensinar o papel de cada teste

Não escreva apenas:

> Adicione testes unitários, integração e e2e.

Mostre:

```text
Unitário:
prova regra isolada.

Integração:
prova adapter real.

Contrato:
protege consumidor.

E2E:
prova que o sistema foi montado corretamente.
```

## Coverage no texto

Se você mencionar coverage, explique o que ele responde.

Exemplo:

> Antes da refatoração, o branch de erro da função não era executado por nenhum teste. O relatório de branch coverage apontou a lacuna. Depois, adicionei um teste específico para o caso.

Evite:

> "Cheguei a 95% e por isso o código está bom."

Coverage mede execução, não qualidade das asserções.

## Mutation testing como argumento didático

Exemplo:

```ts
if (quantity <= 0) {
  throw new InvalidQuantityError();
}
```

Uma ferramenta de mutation pode alterar:

```ts
quantity <= 0
```

para:

```ts
quantity < 0
```

Se os testes continuam passando, o caso zero não está protegido.

Isso é um exemplo excelente para ensinar:

- diferença entre coverage e qualidade;
- importância de limites;
- força de assertions.

## Complexidade como evidência

Você pode registrar:

```text
função antes:
- 85 linhas
- 7 branches
- banco + validação + cálculo + e-mail

depois:
- regra: 12 linhas
- caso de uso: 28 linhas
- adapter: 18 linhas
```

Não conclua automaticamente:

> menos linhas = melhor.

Explique o que ficou:

- mais coeso;
- mais isolado;
- mais fácil de testar;
- mais explícito.

## Lint como evidência complementar

Lint pode capturar:

- Promise esquecida;
- `any`;
- import não usado;
- branch desnecessário;
- erro mecânico.

Mas lint não prova arquitetura.

Explique seu papel com precisão.

## Identificando acoplamento

Um exemplo visual:

```ts
import { db } from "../db";
import { sendEmail } from "../email";
import { env } from "../config";
import { logger } from "../logger";
```

em uma função de domínio.

Pergunte ao leitor:

> Quantas dessas dependências participam da regra?

Use perguntas para ensinar raciocínio.

## Identificando duplicação

Mostre duas funções:

```ts
function createUser(...) {
  if (!email.includes("@")) {
    // ...
  }
}
```

```ts
function updateUser(...) {
  if (!email.includes("@")) {
    // ...
  }
}
```

Não diga imediatamente:

> extraia uma função.

Pergunte:

> Essa validação representa a mesma regra nos dois contextos?

Duplicação visual e duplicação de conceito não são iguais.

## Nomes ruins

Ruim:

```ts
function process(
  data: any,
): any {}
```

Melhor:

```ts
function calculateInvoiceTotal(
  invoice: Invoice,
): Money {}
```

Explique por que o nome melhora entendimento antes do código.

## Funções longas

Não use limite mágico:

> toda função com mais de 20 linhas é ruim.

Mostre mudança de nível de abstração.

Exemplo:

```ts
validateInput();
calculate();
save();
sendEmail();
formatResponse();
```

Cada etapa possui motivo de mudança diferente.

## Dependências escondidas

Exemplo:

```ts
function calculateExpiration(): Date {
  return new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );
}
```

Um teste depende do relógio real.

Refatoração:

```ts
interface Clock {
  now(): Date;
}
```

Agora a aula pode mostrar por que dependency injection melhora determinismo.

## Responda uma pergunta real

Uma boa aula nasce de uma dúvida concreta.

Exemplos:

- "Por que eu criaria uma interface se só tenho uma implementação?"
- "Coverage alto significa testes bons?"
- "Por que não colocar tudo em service?"
- "Quando `unknown` é melhor que `any`?"
- "Por que minha rota async ainda bloqueia?"
- "Por que um índice não foi usado?"
- "Por que separar DTO e entidade?"

Escolha uma e faça o artigo respondê-la.

## Estrutura obrigatória do texto-aula

Use:

```text
1. Contexto
2. Problema
3. Teoria necessária
4. Versão inicial
5. Por que ela falha
6. Hipótese de melhoria
7. Refatoração
8. Testes
9. Evidência
10. Trade-offs
11. Limitações
12. Exercícios
13. Conclusão
14. Referências
15. GitHub
```

Essa estrutura cria continuidade.

## Contexto

Explique onde o problema surgiu.

Exemplo:

> Durante o laboratório de arquitetura backend, eu queria testar a regra de criação de pedidos sem PostgreSQL. A função dependia diretamente do cliente do banco, o que transformava uma regra simples em um teste de integração.

Isso é melhor que começar por definição.

## Problema

Mostre código e sintoma.

Não descreva apenas.

## Teoria necessária

Explique apenas conceitos usados na solução.

## Implementação

Mostre passos.

Não pule do problema direto para a solução final.

## Testes

Use testes como prova.

## Trade-offs

Escreva o custo da decisão.

## Conclusão

Volte à pergunta inicial.

Não termine com:

> "Espero que tenham gostado."

Termine com o que foi demonstrado.

## Checklist para o leitor

Todo texto-aula deve ter exercícios.

Exemplo:

```text
□ Encontre uma função que mistura regra e I/O.
□ Escreva um teste de caracterização.
□ Extraia a regra sem mudar comportamento.
□ Substitua uma dependência externa por um contrato.
□ Execute testes antes e depois.
□ Registre um custo da nova abstração.
□ Explique em três frases quando você não usaria essa solução.
```

Isso transforma leitura em prática.

## Exercício com resposta parcial

Você pode fornecer:

```ts
export async function generateReport() {
  const data =
    await database.query("...");
  const now = new Date();

  // ...
}
```

Perguntas:

1. quais dependências estão escondidas?
2. o que é regra?
3. qual teste pode ser escrito primeiro?
4. qual parte deve continuar sendo integração?

Não entregue tudo imediatamente.

## Referências: use fonte primária

Se o artigo é sobre TypeScript:

- documentação oficial do TypeScript.

Node:

- documentação oficial do Node.js.

PostgreSQL:

- documentação oficial do PostgreSQL.

Arquitetura:

- artigo original do autor quando possível;
- livros e referências reconhecidas.

Posts secundários podem ajudar a entender.

Mas a afirmação técnica principal deve ser conferida em fonte primária quando possível.

## Separe fonte de observação

Exemplo:

> A documentação do Node descreve o comportamento de `process.nextTick`. No meu experimento com a versão X do Node, observei a sequência abaixo.

Isso distingue:

- regra documentada;
- comportamento observado.

Não transforme um teste local em verdade universal.

## Como validar o que você escreveu

Antes de publicar:

### Código

Execute:

```bash
npm test
npm run typecheck
npm run lint
```

### Links

Abra as fontes.

### Comandos

Copie do artigo e execute em ambiente limpo quando possível.

### Resultados

Confirme que:

- saída;
- erro;
- coverage;
- benchmark;

correspondem ao texto.

### Afirmações

Pergunte:

> Isso veio de fonte, experimento ou interpretação?

Essa distinção aumenta credibilidade.

## Não esconda incerteza

Você pode escrever:

> Neste laboratório, a versão com stream usou menos memória. Isso não prova que será mais rápida em qualquer workload.

Isso é mais técnico do que:

> Streams são sempre melhores.

Autoridade não é certeza artificial.

## Como corrigir um artigo

Crie uma política simples.

No repository:

```text
CHANGELOG.md
```

ou no artigo:

```text
## Atualizações

2026-09-21:
Corrigida a explicação sobre ...
```

Se descobrir erro:

1. valide;
2. corrija;
3. registre;
4. explique a mudança quando for relevante.

Não apague silenciosamente um erro técnico importante se a correção ajuda o leitor.

## Autoridade técnica sem fingir perfeição

Autoridade pública pode vir de:

- experimentos reproduzíveis;
- fontes;
- clareza;
- consistência;
- histórico de correções;
- GitHub;
- testes;
- transparência sobre limites.

Não precisa vir de:

- falar como se nunca tivesse dúvida;
- usar palavras difíceis;
- esconder que está estudando;
- exagerar benchmark;
- criar uma persona de especialista em tudo.

## O repository do texto-aula

Crie:

```text
quality-refactoring-teaching-lab/
  examples/
    coupled-order/
    refactored-order/
  tests/
    unit/
    integration/
    contract/
    e2e/
  articles/
    pt-BR/
      quality-refactoring-lesson.md
    en/
      summary.md
  vlog/
    pt-BR/
      script.md
  docs/
    sources.md
    experiments.md
    trade-offs.md
    corrections.md
  README.md
```

O repository deve permitir avaliar:

- código;
- ensino;
- processo;
- evidência.

## README do laboratório

Estruture:

```text
Objetivo
Problema estudado
Como executar
Estrutura
Versão antes
Versão depois
Testes
Métricas
Artigo
Vlog
Fontes
Limitações
```

Resumo em inglês:

```md
## English summary

This repository turns a quality and refactoring study cycle
into a reproducible technical lesson.
It includes the original problem, a failing or weak implementation,
incremental refactoring, automated tests, trade-off analysis,
a Portuguese article, and a short English technical summary.
```

## O artigo e o repository precisam concordar

Se o texto diz:

> O teste falha antes da refatoração.

O repository deve permitir reproduzir.

Uma estratégia:

```text
git tag before-refactor
git tag after-refactor
```

Ou branches didáticas:

```text
lesson/01-before
lesson/02-characterization-tests
lesson/03-refactor
lesson/04-final
```

Tags tendem a preservar melhor uma sequência concluída.

## Commits didáticos

Exemplo:

```text
test: characterize current order creation behavior
refactor: extract order total calculation
refactor: introduce order repository boundary
test: add integration coverage for postgres adapter
docs: explain dependency inversion trade-off
```

O histórico passa a contar a mesma história do artigo.

## Issues

Crie issue:

```text
docs: explain why CreateOrder is hard to test
```

Outra:

```text
refactor: isolate email notification from order rule
```

Outra:

```text
test: protect public order response contract
```

Mesmo sozinho, isso mostra processo.

## Pull request didático

Título:

```text
refactor: separate order rule from infrastructure
```

Descrição:

```text
Problem
Before
Change
Tests
Trade-offs
What remains coupled
Follow-up
```

Linke o artigo quando pronto.

## CI

CI deve executar pelo menos:

```text
typecheck
lint
unit tests
integration tests necessários
```

Se houver contrato/e2e leve, inclua.

Badge no README mostra que o exemplo continua executável.

## Medição de qualidade

Neste ciclo, você não precisa inventar uma nova métrica.

Use o que é relevante ao problema.

Exemplos:

### Acoplamento

Antes:

```text
CreateOrder imports:
database
email
config
logger
```

Depois:

```text
CreateOrder imports:
Order
OrderRepository
OrderNotifier
```

### Testabilidade

Antes:

```text
regra exige banco real
```

Depois:

```text
regra roda em teste unitário
adapter continua com teste de integração
```

### Coverage

Branch importante passou a ser exercitado.

### Mutation

Teste passou a matar mutação que antes sobrevivia.

### Complexidade

Função monolítica foi dividida por responsabilidade.

Não combine tudo em uma nota artificial.

## Compare pelo menos duas abordagens

Todo texto deve ter pelo menos uma comparação real.

Exemplo:

```text
Opção A:
usar repository.

Opção B:
usar ORM diretamente no caso de uso.
```

Compare:

- simplicidade;
- testabilidade;
- acoplamento;
- custo;
- contexto.

Não termine:

> Repository é sempre melhor.

Termine:

> Neste laboratório, repository valeu o custo porque o caso de uso precisava ser testado sem banco e reutilizado fora do HTTP. Em um CRUD simples com pouca regra, eu avaliaria manter o ORM mais próximo da aplicação.

Isso ensina decisão.

## Outras comparações úteis

- `any` vs. `unknown`;
- union vs. campos opcionais;
- `readFile` vs. stream;
- worker vs. main thread;
- ORM vs. SQL;
- OFFSET vs. cursor;
- handler direto vs. use case;
- interface vs. função;
- unitário vs. integração;
- coverage vs. mutation testing.

## Escreva quando cada abordagem falha

Estrutura:

```text
A abordagem A falha quando...
A abordagem B falha quando...
```

Exemplo:

> Teste unitário com repository fake falha em provar que SQL, mapping e constraints funcionam. Teste de integração com PostgreSQL falha em oferecer o mesmo isolamento e velocidade para cada regra de domínio.

Isso demonstra maturidade.

## Inglês técnico simples

Todo ciclo deve ter um resumo em inglês.

Não tente usar vocabulário sofisticado.

Exemplo:

> I refactored the order creation flow because business rules were directly coupled to the database and email client. I first added characterization tests, then extracted the calculation and introduced small boundaries for external dependencies. The main trade-off was additional structure, but the business rule became easier to test and reuse.

Perguntas para revisar:

- consigo dizer isso em voz alta?
- uma pessoa de outro país entende?
- usei termos concretos?
- expliquei trade-off?
- evitei exagero?

## Resumo técnico em inglês

Inclua no artigo:

```md
## English summary

The original implementation mixed business rules,
database access, and notification logic in one function.

I first added tests to protect the current behavior.
Then I extracted the business rule and isolated external
dependencies behind small contracts.

The refactor added some structural code, but reduced coupling
and allowed the main rule to be tested without real infrastructure.
```

## Transformando artigo em vlog

Um texto e um vídeo não possuem a mesma estrutura.

No artigo, o leitor pode voltar.

No vídeo, o fluxo precisa ser mais direto.

Roteiro base:

```text
1. Hook
2. Contexto
3. Problema
4. Demo do erro
5. Explicação
6. Refatoração
7. Teste
8. Trade-off
9. Resultado
10. GitHub
```

## Abertura do vlog

Evite:

> Fala pessoal, no vídeo de hoje vamos falar sobre qualidade de código.

Prefira um problema:

> Esta função funciona, mas para testar uma regra de cálculo eu preciso subir um banco. Neste vídeo eu vou mostrar por que isso acontece, refatorar em pequenas etapas e provar que o comportamento continua igual.

O espectador sabe o que vai ganhar.

## Demo primeiro

Mostre o problema cedo.

Exemplo:

```bash
npm test
```

Resultado:

```text
connection refused: PostgreSQL
```

Explique:

> O teste que deveria validar uma regra simples depende de infraestrutura.

Agora a motivação é visual.

## Erro comum

Inclua uma seção:

```text
Erro comum:
criar uma interface para toda classe.
```

Explique por que isso não resolve o problema automaticamente.

## Código no vlog

Não leia código linha por linha.

Mostre:

- trecho importante;
- diff;
- teste;
- execução.

Use zoom ou destaque quando editar.

## Teste ao vivo

Execute:

```bash
npm test
```

Mostre a falha antes.

Depois a correção.

Uma demonstração curta vale mais que afirmar:

> "agora está melhor."

## Fechamento do vlog

Estrutura:

> O problema não era apenas o tamanho da função. Era o fato de a regra depender de detalhes que mudam por motivos diferentes. Depois da refatoração, a regra pode ser testada isoladamente e o PostgreSQL continua coberto por integração. O custo foi adicionar uma fronteira e mais código de composição. O repository completo está no GitHub com os testes e o histórico da refatoração.

Depois:

> Se você quiser praticar, tente trocar o notificador de e-mail por um fake sem alterar o caso de uso.

Isso deixa exercício.

## Roteiro detalhado

Arquivo:

```text
vlog/pt-BR/script.md
```

Modelo:

```md
# Título

## 00:00 — Hook

Texto falado:
...

Tela:
...

## 00:30 — Problema

Texto falado:
...

Tela:
...

## 01:30 — Versão inicial

Código:
...

## 03:00 — Teste

Comando:
...

## 04:00 — Refatoração

...

## 07:00 — Trade-off

...

## 08:00 — Conclusão

...
```

Isso treina comunicação oral com intenção.

## Não escreva o vlog como artigo lido

Frases de vídeo podem ser menores.

Artigo:

> Dependency inversion permite que políticas de alto nível dependam de abstrações que representam capacidades, em vez de detalhes concretos.

Vídeo:

> O caso de uso precisa salvar o pedido. Ele não precisa saber que o banco é PostgreSQL. Essa diferença é o ponto importante aqui.

Depois o termo técnico.

## Use uma demo curta

Vlog não precisa mostrar o repository inteiro.

Mostre:

```text
antes
teste
refactor
depois
```

Linke o restante.

## Um laboratório que prova conhecimento

O E018 deve terminar com quatro entregas conectadas:

### 1. Código

Exemplo reproduzível.

### 2. Testes

Evidência de comportamento.

### 3. Artigo

Explicação escrita.

### 4. Roteiro de vlog

Explicação oral planejada.

Essas quatro peças devem contar a mesma história.

## Experimento 1 — explicar sem jargão

Escolha um parágrafo técnico.

Versão A:

> Aplicamos DIP para desacoplar a camada de aplicação da infraestrutura através de abstrações.

Versão B:

> O caso de uso precisa salvar dados, mas não precisa conhecer o cliente PostgreSQL. Criamos um contrato pequeno para essa necessidade e deixamos a implementação do banco na borda.

Peça para alguém ler ou releia depois de um dia.

Qual versão exige menos contexto?

## Experimento 2 — exemplo ruim versus bom

Crie dois snippets.

O primeiro deve realmente falhar ou custar algo.

O segundo deve resolver a hipótese.

Evite versões caricatas.

Não faça o "antes" propositalmente absurdo só para a solução parecer inteligente.

## Experimento 3 — reprodutibilidade

Clone o repository em outra pasta.

Execute apenas o README.

Registre qualquer passo escondido.

Corrija.

Isso testa a qualidade da documentação.

## Experimento 4 — artigo sem contexto oral

Entregue o texto para alguém ou releia como se não conhecesse o projeto.

Pergunte:

- o problema aparece antes da solução?
- todos os nomes importantes foram definidos?
- o exemplo executa?
- a conclusão responde à pergunta inicial?

## Experimento 5 — fonte primária

Escolha três afirmações técnicas.

Para cada uma, registre:

```text
Afirmação:
Fonte:
Trecho ou seção:
Como foi aplicada:
```

Isso reduz repetição incorreta de conteúdo secundário.

## Experimento 6 — inglês

Grave 60–90 segundos explicando:

- problema;
- solução;
- trade-off.

Não busque sotaque perfeito.

Busque clareza técnica.

## Experimento 7 — correção

Propositalmente revise uma afirmação depois.

Se descobrir que estava incompleta:

- atualize artigo;
- registre correção;
- ajuste vlog futuro.

Aprender a corrigir faz parte do ciclo.

## Compare abordagens e registre onde falham

| Comparação | O que observar | Onde cada opção falha |
| --- | --- | --- |
| tópico amplo vs. problema específico | clareza e profundidade | tópico amplo vira resumo superficial; problema estreito pode precisar de contexto |
| teoria primeiro vs. problema primeiro | motivação e compreensão | teoria sem dor parece abstrata; problema sem teoria pode parecer receita |
| snippet isolado vs. exemplo reproduzível | velocidade e confiança | snippet é rápido, mas pode esconder setup; exemplo completo exige manutenção |
| mostrar solução final vs. refatorar em etapas | concisão e aprendizado | solução pronta esconde raciocínio; etapas demais podem alongar o texto |
| artigo vs. vlog | profundidade e ritmo | artigo pode ficar denso; vlog pode simplificar demais |
| português vs. resumo em inglês | profundidade e treino internacional | tradução literal fica artificial; resumo curto não substitui conteúdo completo |
| coverage vs. mutation testing | execução e força do teste | coverage não mede assertion; mutation custa tempo |
| fonte secundária vs. primária | acessibilidade e precisão | secundária pode distorcer; primária pode ser mais difícil |
| certeza absoluta vs. limitações explícitas | autoridade percebida e precisão | certeza artificial produz erro; excesso de ressalvas pode esconder conclusão |
| tutorial perfeito vs. falha real | clareza e autenticidade | exemplo perfeito esconde diagnóstico; falha real pode exigir simplificação |

## Crie exemplos que quebrem

Inclua pelo menos alguns:

1. teste que depende de banco quando não deveria;
2. `any` que permite erro;
3. Promise esquecida;
4. mutation que sobrevive;
5. contract test quebrado após refactor;
6. query que piora com volume;
7. stream sem tratamento de erro;
8. interface sem necessidade;
9. função com dependência de relógio;
10. README que falha em ambiente limpo.

O erro precisa ter função pedagógica.

## Checklist de revisão técnica

Antes de publicar:

```text
□ O código compila.
□ Os testes passam.
□ O exemplo ruim realmente demonstra o problema.
□ A melhoria resolve a hipótese descrita.
□ Os comandos foram executados.
□ Os números possuem contexto.
□ As fontes principais foram abertas.
□ Trade-offs foram escritos.
□ Limitações foram escritas.
□ O GitHub está linkado.
□ O README permite reprodução.
```

## Checklist de revisão didática

```text
□ O problema aparece nos primeiros parágrafos.
□ O leitor-alvo está claro.
□ Jargões foram explicados por comportamento.
□ Não tentei ensinar cinco assuntos em um artigo.
□ O código possui contexto.
□ Antes e depois são comparáveis.
□ Os testes participam da explicação.
□ Há pelo menos um exercício.
□ A conclusão responde à pergunta inicial.
□ O texto não afirma mais do que o experimento prova.
```

## Checklist de revisão editorial

```text
□ Título descreve o problema.
□ Subtítulos permitem escanear.
□ Parágrafos não são excessivamente longos.
□ Código aparece próximo da explicação.
□ Nomes são consistentes.
□ Siglas são explicadas na primeira ocorrência.
□ Links funcionam.
□ Referências estão no fim.
□ Não há frases de autoridade vazia.
```

## Três artigos práticos derivados do ciclo

### 1. Aula escrita: explicando qualidade e refatoração para quem está um passo atrás de mim

Título sugerido:

**Aula escrita: explicando qualidade e refatoração para quem está um passo atrás de mim**

Escolha um problema real.

Estrutura:

```text
Contexto
Problema
Teoria mínima
Código antes
Teste
Refatoração
Código depois
Trade-offs
Exercícios
Conclusão
```

O leitor deve terminar conseguindo repetir o experimento.

## Artigo prático 2 — autoridade técnica

Título sugerido:

**Como transformar estudo em autoridade técnica sem fingir saber tudo**

Explique seu processo:

1. como escolheu o assunto;
2. o que você não sabia;
3. quais fontes consultou;
4. qual hipótese criou;
5. qual código escreveu;
6. como validou;
7. onde encontrou contradição;
8. quais limitações registrou;
9. como corrigiria um erro;
10. o que publicaria no GitHub.

O ponto central:

> autoridade técnica vem de rastreabilidade e clareza, não de parecer infalível.

## Artigo prático 3 — roteiro de vlog

Título sugerido:

**Roteiro de vlog: do zero ao repositório publicado**

Transforme um ciclo inteiro em vídeo.

### Abertura

Qual problema será resolvido?

### Contexto

Onde surgiu?

### Demo

Mostre o comportamento ruim.

### Código

Mostre apenas o essencial.

### Teste

Prove.

### Refatoração

Faça etapas pequenas.

### Trade-off

Explique o custo.

### Conclusão

Responda à pergunta.

### GitHub

Mostre onde está o código completo.

## Formato recomendado dos artigos

Cada artigo pode conter 800 a 1.500 palavras.

Estrutura:

1. introdução;
2. problema;
3. código;
4. teoria;
5. testes;
6. refatoração;
7. trade-offs;
8. limitações;
9. conclusão;
10. GitHub.

O tamanho não é meta absoluta.

Se 900 palavras explicam melhor que 1.500, pare em 900.

## Como explicar o ciclo em entrevista internacional

Use inglês técnico simples.

> I use technical writing as part of my study process. I start with a real problem from the repository, create a reproducible example, write tests, and then explain the refactoring step by step. I also document trade-offs and limitations so the article does not present one solution as universally correct.

Outro exemplo:

> I separate what the documentation says from what I observed in my own experiment. If the result is only valid for my dataset or environment, I state that explicitly.

Outro:

> Before publishing an article, I run the code from a clean setup, execute the tests, verify the primary references, and check that the README is enough to reproduce the example.

Outro:

> If I discover an error after publication, I prefer to correct it transparently and keep a small record of the change. I see technical writing as a versioned engineering artifact, not a static proof that I know everything.

## Portfólio

Na seção de portfólio, não escreva apenas:

> Publiquei artigo sobre refatoração.

Escreva:

> Transformei uma refatoração real em um laboratório reproduzível com código antes/depois, testes unitários e de integração, CI e artigo técnico. O conteúdo explica por que a implementação original era difícil de testar, quais fronteiras foram introduzidas e qual custo estrutural a solução adicionou.

Outro:

> O artigo possui resumo técnico em inglês e roteiro de vlog derivado do mesmo exemplo, demonstrando comunicação escrita e oral sobre uma decisão de engenharia.

## Métricas de impacto possíveis

Não invente métricas.

Você pode registrar:

- visualizações;
- tempo médio de leitura;
- issues abertas por leitores;
- stars;
- clones;
- comentários técnicos;
- perguntas recebidas;
- correções feitas;
- número de pessoas que reproduziram;
- convites para discutir o tema.

Mas não use popularidade como prova de correção técnica.

## Uma pergunta respondida vale mais que dez tópicos citados

Compare:

Artigo A:

> TypeScript, Node, SQL, Clean Architecture, Docker e testes.

Artigo B:

> Por que minha função `async` ainda bloqueava o servidor Node?

O segundo pode mostrar mais profundidade.

Especialização pública nasce de perguntas bem respondidas.

## Processo editorial por ciclo

Use um fluxo:

```text
1. capturar problema
2. criar issue
3. pesquisar fonte primária
4. montar exemplo
5. provocar falha
6. escrever teste
7. refatorar
8. medir
9. escrever artigo
10. revisar tecnicamente
11. escrever resumo em inglês
12. criar roteiro de vlog
13. publicar
14. registrar feedback
15. corrigir quando necessário
```

Isso transforma conteúdo em processo de engenharia.

## Board do ciclo

Você pode manter:

```text
Backlog
Research
Code
Evidence
Draft
Technical review
English summary
Vlog script
Published
Corrections
```

Não precisa de ferramenta específica.

Pode ser GitHub Projects, issues, Markdown ou outro sistema.

## Issue template para artigo

```md
# Problem

What real problem will this article explain?

# Reader

Who is one step behind me?

# Evidence

What code/test/measurement will prove the point?

# Primary sources

- ...

# Before

What is wrong with the initial version?

# After

What changes?

# Trade-offs

What does the solution cost?

# Limitations

What does this example not prove?
```

## Definition of Done

O texto só termina quando:

```text
□ artigo está escrito;
□ código executa;
□ testes passam;
□ CI está verde;
□ README reproduz;
□ fontes foram verificadas;
□ trade-offs aparecem;
□ limitações aparecem;
□ resumo em inglês existe;
□ roteiro de vlog existe;
□ GitHub está linkado.
```

## O que você deve levar deste ciclo

Escrever e ensinar não são atividades separadas da engenharia.

Quando bem feitas, elas obrigam você a:

- definir problema;
- eliminar ambiguidade;
- produzir exemplo mínimo;
- testar comportamento;
- comparar alternativas;
- verificar fonte;
- registrar trade-offs;
- explicar limites.

Isso expõe lacunas que podem passar despercebidas durante estudo passivo.

No contexto de qualidade e refatoração, o texto-aula deve contar a história da mudança.

Não apenas:

> "Aqui está a solução."

Mas:

> "Este era o comportamento. Este era o problema. Este teste o torna visível. Esta pequena mudança melhora uma responsabilidade. Este teste prova que o comportamento foi preservado. Esta abordagem possui este custo. Neste outro contexto eu escolheria diferente."

Você terá concluído o E018 quando conseguir transformar um problema real de engenharia em uma aula que outra pessoa consegue ler, executar, testar, questionar e reproduzir.

O resultado final deve ser avaliável sem conversa privada: repository público, código antes/depois, testes, CI, README, artigo em português, resumo técnico em inglês, roteiro de vlog, fontes e um registro honesto das limitações.

## Referências primárias e recomendadas

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [GitHub Docs — About READMEs](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub Docs — About Issues](https://docs.github.com/issues/tracking-your-work-with-issues/about-issues)
- [GitHub Docs — About Pull Requests](https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [Google Technical Writing Courses](https://developers.google.com/tech-writing)
- [Diátaxis — A systematic approach to technical documentation](https://diataxis.fr/)
