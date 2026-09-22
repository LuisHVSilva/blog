---
translationId: 2e161616-1616-4616-8616-161616161616
articleId: e0161616-1616-4616-8616-161616161616
locale: pt-BR
slug: persistencia-sql-qualidade-refatoracao
title: "Persistência e SQL para qualidade e refatoração: do schema ao comportamento real"
description: "Um guia prático para modelagem relacional, transações, índices, migrations, planos de execução e refatoração segura de persistência em backends TypeScript e Node.js."
status: published
---

# Persistência e SQL para qualidade e refatoração: do schema ao comportamento real

Banco de dados não é apenas um lugar onde a aplicação "salva objetos".

Em um backend real, persistência participa diretamente da confiabilidade do sistema. Um schema mal modelado permite estados inconsistentes. Uma transação mal definida grava metade de uma operação. Um índice inadequado aumenta latência e custo. Uma migration mal planejada pode bloquear produção. Uma query aparentemente simples pode se tornar o principal gargalo da aplicação quando os dados deixam de caber em um exemplo de tutorial.

Neste ciclo, o contexto é **qualidade e refatoração**.

O objetivo é aprender a melhorar persistência sem depender de opinião ou superstição. Cada mudança deve responder a perguntas verificáveis:

- que inconsistência esta constraint impede?
- que anomalia esta transação evita?
- que consulta este índice acelera?
- qual custo de escrita esse índice adiciona?
- qual evidência mostra que a query melhorou?
- o contrato público permaneceu estável?
- a refatoração alterou apenas estrutura ou também comportamento?
- a migration é segura para uma base existente?

A meta não é dominar apenas SQL syntax. É conseguir observar comportamento real do banco e tomar decisões com evidência.

> Persistência segura combina modelagem, integridade, concorrência e medição. Um ORM pode ajudar na produtividade, mas não substitui nenhuma dessas quatro responsabilidades.

<!-- VISUAL:
Fluxo em quatro blocos:
HTTP/Use Case -> Repository -> SQL/Transaction -> PostgreSQL
Abaixo do PostgreSQL: integridade, concorrência, índices e plano de execução.
Ao lado: testes, migrations e medições como evidências.
-->

## O problema que guia o laboratório

Crie um pequeno serviço de pedidos com:

- clientes;
- produtos;
- pedidos;
- itens do pedido.

A primeira versão propositalmente frágil pode ter tabelas como:

```sql
CREATE TABLE orders (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id integer,
  status text,
  total numeric
);

CREATE TABLE order_items (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id integer,
  product_id integer,
  quantity integer,
  unit_price numeric
);
```

Essa estrutura permite situações problemáticas:

- pedido sem cliente;
- status arbitrário;
- item apontando para pedido inexistente;
- quantidade zero ou negativa;
- preço negativo;
- mesmo produto repetido no pedido;
- total incompatível com os itens;
- exclusões que deixam registros órfãos.

O laboratório começa aceitando que o banco ainda não protege corretamente o domínio.

A refatoração será feita em pequenas etapas:

1. caracterizar o comportamento atual;
2. adicionar constraints;
3. ajustar modelagem;
4. criar migrations versionadas;
5. adicionar transações;
6. medir queries;
7. introduzir índices;
8. comparar paginação;
9. registrar planos antes/depois;
10. manter testes de integração e contrato.

## Schema não é apenas estrutura física

O schema comunica quais estados o sistema considera válidos.

Uma versão mais segura:

```sql
CREATE TABLE customers (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  price numeric(12, 2) NOT NULL,
  stock integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT products_price_positive
    CHECK (price > 0),
  CONSTRAINT products_stock_nonnegative
    CHECK (stock >= 0)
);

CREATE TABLE orders (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id integer NOT NULL
    REFERENCES customers(id)
    ON DELETE RESTRICT,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_valid
    CHECK (
      status IN ('draft', 'confirmed', 'cancelled')
    )
);

CREATE TABLE order_items (
  order_id integer NOT NULL
    REFERENCES orders(id)
    ON DELETE CASCADE,
  product_id integer NOT NULL
    REFERENCES products(id)
    ON DELETE RESTRICT,
  quantity integer NOT NULL,
  unit_price numeric(12, 2) NOT NULL,
  CONSTRAINT order_items_quantity_positive
    CHECK (quantity > 0),
  CONSTRAINT order_items_price_positive
    CHECK (unit_price > 0),
  PRIMARY KEY (order_id, product_id)
);
```

Cada elemento protege uma intenção.

## Chave primária

```sql
id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

A chave primária fornece identidade estável à linha.

Evite depender de atributos que podem mudar, como nome ou e-mail, para representar identidade interna.

## Chave estrangeira

```sql
customer_id integer NOT NULL
  REFERENCES customers(id)
```

A foreign key impede que um pedido referencie um cliente inexistente.

Sem ela, toda aplicação que escreve no banco precisa lembrar de proteger essa regra.

Uma importação, script ou serviço secundário pode ignorar a validação.

A constraint centraliza a integridade.

## `NOT NULL`

Ausência legítima e dado esquecido não são a mesma coisa.

```sql
name text NOT NULL
```

faz o banco rejeitar uma linha incompleta.

Não use `NULL` como valor genérico para:

- desconhecido;
- não se aplica;
- ainda não calculado;
- vazio;
- não informado;

sem definir a semântica.

## `UNIQUE`

```sql
email text NOT NULL UNIQUE
```

protege unicidade mesmo quando duas requisições concorrentes tentam gravar o mesmo valor.

Fazer:

```ts
if (!(await emailExists(email))) {
  await createUser(email);
}
```

não elimina race conditions.

A regra final deve estar no banco quando a integridade depende dela.

## `CHECK`

```sql
CHECK (quantity > 0)
```

rejeita dados sem sentido.

Também pode restringir estados:

```sql
CHECK (
  status IN ('draft', 'confirmed', 'cancelled')
)
```

Mas não transforme `CHECK` em substituto para toda regra de negócio.

Constraints simples e locais funcionam muito bem.

Regras que dependem de múltiplas linhas, tabelas ou processos podem exigir outra estratégia.

## Tipos corretos importam

Para dinheiro:

```sql
numeric(12, 2)
```

é geralmente mais apropriado do que ponto flutuante binário.

Para timestamps:

```sql
timestamptz
```

representa instantes com semântica de fuso mais explícita no PostgreSQL.

Para boolean:

```sql
active boolean NOT NULL DEFAULT true
```

é melhor do que strings como:

```text
"Y"
"N"
"YES"
"NO"
```

quando o domínio realmente é binário.

O tipo do banco faz parte do contrato.

## Modelar total: armazenar ou calcular?

Uma questão interessante:

```sql
orders.total
```

deve existir?

Se o total sempre é:

```text
SUM(quantity * unit_price)
```

armazenar `total` duplica informação.

Isso cria risco:

```text
order.total != SUM(order_items)
```

Por outro lado, armazenar o total pode ser útil quando:

- representa um valor histórico fechado;
- inclui regras que não podem ser recalculadas no futuro;
- precisa ser lido com muita frequência;
- o custo de agregação foi medido.

Não existe resposta automática.

Registre:

- fonte da verdade;
- motivo da duplicação;
- mecanismo de consistência;
- impacto medido.

## Normalização

Normalização busca manter cada fato em um lugar apropriado.

Ruim:

```text
orders
- customer_name
- customer_email
- customer_phone
- product_1_name
- product_1_price
- product_2_name
- product_2_price
...
```

Mudanças de cliente ou produto geram versões conflitantes.

Melhor:

```text
customers
products
orders
order_items
```

com relacionamentos explícitos.

Normalização reduz anomalias de:

- inserção;
- atualização;
- exclusão.

## Desnormalização controlada

Nem toda duplicação é erro.

`order_items.unit_price` pode repetir `products.price` intencionalmente.

Por quê?

`products.price` representa o preço atual.

`order_items.unit_price` representa o preço praticado no momento da compra.

São fatos diferentes.

Antes de desnormalizar, responda:

1. qual problema real estamos resolvendo?
2. a duplicação representa fato histórico ou cache?
3. qual é a fonte da verdade?
4. como sincronizar?
5. como detectar divergência?
6. qual ganho foi medido?

## Modelagem por acesso

O modelo relacional não deve ser desenhado apenas por entidades conceituais.

Pergunte quais consultas são críticas.

Exemplo:

> listar os últimos 20 pedidos de um cliente.

Query:

```sql
SELECT
  id,
  status,
  created_at
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Esse acesso sugere um índice específico.

Outra query:

> buscar todos os pedidos confirmados de todos os clientes por data.

Pode exigir outro caminho.

Modelagem por acesso não significa abandonar normalização.

Significa considerar como os dados serão lidos e escritos de verdade.

## SELECT

Um backend deve dominar seleção explícita.

Evite:

```sql
SELECT *
FROM orders;
```

quando o contrato precisa de poucas colunas.

Prefira:

```sql
SELECT
  id,
  customer_id,
  status,
  created_at
FROM orders
WHERE id = $1;
```

Benefícios:

- contrato mais claro;
- menos transferência;
- menos dependência de colunas futuras;
- plano mais fácil de analisar.

## JOIN

Para carregar pedidos com cliente:

```sql
SELECT
  o.id,
  o.status,
  o.created_at,
  c.id AS customer_id,
  c.name AS customer_name
FROM orders AS o
JOIN customers AS c
  ON c.id = o.customer_id
WHERE o.id = $1;
```

JOIN não é "ruim".

Um banco relacional existe justamente para relacionar dados.

O problema é executar JOIN sem entender:

- cardinalidade;
- filtros;
- índices;
- volume;
- colunas retornadas.

## JOIN com itens

```sql
SELECT
  o.id,
  o.status,
  p.id AS product_id,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  oi.quantity * oi.unit_price AS line_total
FROM orders AS o
JOIN order_items AS oi
  ON oi.order_id = o.id
JOIN products AS p
  ON p.id = oi.product_id
WHERE o.id = $1;
```

Se o pedido possui muitos itens, haverá várias linhas para o mesmo pedido.

A aplicação deve entender essa cardinalidade.

## GROUP BY

Total por pedido:

```sql
SELECT
  order_id,
  SUM(quantity * unit_price) AS total
FROM order_items
GROUP BY order_id;
```

Total por cliente:

```sql
SELECT
  o.customer_id,
  SUM(oi.quantity * oi.unit_price) AS total
FROM orders AS o
JOIN order_items AS oi
  ON oi.order_id = o.id
GROUP BY o.customer_id;
```

Agregações podem exigir leitura de muitas linhas.

Meça com volume representativo.

## CTE

Uma CTE pode tornar etapas claras:

```sql
WITH order_totals AS (
  SELECT
    order_id,
    SUM(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT
  o.id,
  o.created_at,
  ot.total
FROM orders AS o
JOIN order_totals AS ot
  ON ot.order_id = o.id
WHERE o.customer_id = $1
ORDER BY o.created_at DESC;
```

CTE é ferramenta de expressão.

Não conclua que é automaticamente:

- mais rápido;
- mais lento;
- mais legível.

Observe o plano.

## Subqueries

Exemplo:

```sql
SELECT
  id,
  name,
  price
FROM products
WHERE price > (
  SELECT AVG(price)
  FROM products
);
```

Subqueries também não são automaticamente problema.

Pergunte:

- é correlacionada?
- quantas vezes executa?
- o planner reescreveu?
- qual volume?
- existe índice adequado?

## INSERT seguro

Use parâmetros.

```sql
INSERT INTO customers (
  email,
  name
)
VALUES ($1, $2)
RETURNING id, email, name;
```

Nunca concatene entrada do usuário:

```ts
const sql =
  "SELECT * FROM users WHERE email = '" +
  email +
  "'";
```

Isso aumenta risco de SQL injection.

Parâmetros representam valores.

Identificadores dinâmicos, como nomes de coluna, exigem outra estratégia, como allowlist.

## UPDATE seguro

Uma atualização deve delimitar alvo.

```sql
UPDATE products
SET price = $2
WHERE id = $1
RETURNING id, price;
```

Adicionar condições pode proteger estado:

```sql
UPDATE orders
SET status = 'cancelled'
WHERE id = $1
  AND status = 'draft'
RETURNING id;
```

Se nenhuma linha voltar, isso pode ser um resultado de negócio.

Não trate sempre como erro técnico.

## DELETE seguro

```sql
DELETE FROM orders
WHERE id = $1
  AND status = 'draft'
RETURNING id;
```

Para entidades importantes, exclusão lógica pode fazer sentido.

Mas soft delete possui custos:

- filtros obrigatórios;
- índices maiores;
- uniqueness mais complexa;
- dados "mortos" em queries;
- dificuldade de cleanup.

Não adote soft delete automaticamente.

## Migrations são código de produção

Schema precisa evoluir de forma versionada.

Estrutura:

```text
migrations/
  001_create_customers.up.sql
  001_create_customers.down.sql
  002_create_products.up.sql
  002_create_products.down.sql
```

Uma migration deve ser:

- versionada;
- revisada;
- testada;
- observável;
- compatível com deploy quando necessário.

## Migration simples

```sql
ALTER TABLE products
ADD COLUMN description text;
```

Pode parecer inofensiva.

Mas pergunte:

- tabela tem 100 linhas ou 500 milhões?
- haverá rewrite?
- haverá lock?
- versão antiga da aplicação aceita a nova estrutura?
- é reversível?

## Expand and contract

Mudança grande pode exigir etapas.

Exemplo: trocar `customer_name` por `customer_id`.

### Etapa 1

Adicionar `customer_id` nullable.

### Etapa 2

Publicar aplicação que escreve os dois campos.

### Etapa 3

Backfill.

### Etapa 4

Validar dados.

### Etapa 5

Adicionar constraint.

### Etapa 6

Trocar leituras.

### Etapa 7

Parar de escrever campo antigo.

### Etapa 8

Remover campo antigo em deploy posterior.

Isso reduz incompatibilidade entre versões durante rollout.

## Migration reversível tem limites

Um `down`:

```sql
DROP COLUMN important_data;
```

não recupera o conteúdo removido.

"Reversível" pode significar estrutura reversível, não dados recuperáveis.

Para mudanças destrutivas, backup, expansão/contração e plano operacional importam mais que possuir um arquivo `.down.sql`.

## Teste de migration

Teste:

1. banco vazio;
2. banco na versão anterior;
3. migration forward;
4. aplicação nova;
5. rollback quando suportado;
6. repetibilidade;
7. locks relevantes.

CI pode criar banco temporário e aplicar todas as migrations.

## Transação: unidade de consistência

Criar um pedido envolve múltiplos passos:

1. criar pedido;
2. validar estoque;
3. reduzir estoque;
4. inserir itens;
5. confirmar pedido.

Se o passo 4 falhar, os anteriores não podem ficar parcialmente persistidos.

```sql
BEGIN;

-- operações

COMMIT;
```

Em erro:

```sql
ROLLBACK;
```

## ACID

### Atomicidade

Tudo ou nada.

### Consistência

As invariantes protegidas continuam válidas.

### Isolamento

Transações concorrentes não devem produzir combinações proibidas.

### Durabilidade

Depois do commit, os dados sobrevivem às falhas cobertas pelo mecanismo do banco.

Essas propriedades não significam que todo bug desaparece.

Elas definem garantias da transação.

## Transação em Node.js

Com `node-postgres`, todas as queries precisam usar a mesma conexão.

```ts
import type { PoolClient } from "pg";

export async function createOrder(
  client: PoolClient,
  input: CreateOrderInput,
): Promise<number> {
  await client.query("BEGIN");

  try {
    const order = await client.query<{ id: number }>(
      `INSERT INTO orders (
         customer_id,
         status
       )
       VALUES ($1, 'draft')
       RETURNING id`,
      [input.customerId],
    );

    const orderId = order.rows[0].id;

    for (const item of input.items) {
      const product = await client.query<{
        price: string;
      }>(
        `UPDATE products
         SET stock = stock - $2
         WHERE id = $1
           AND active = true
           AND stock >= $2
         RETURNING price`,
        [item.productId, item.quantity],
      );

      if (product.rowCount !== 1) {
        throw new Error(
          `Product ${item.productId} unavailable`,
        );
      }

      await client.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           quantity,
           unit_price
         )
         VALUES ($1, $2, $3, $4)`,
        [
          orderId,
          item.productId,
          item.quantity,
          product.rows[0].price,
        ],
      );
    }

    await client.query(
      `UPDATE orders
       SET status = 'confirmed'
       WHERE id = $1`,
      [orderId],
    );

    await client.query("COMMIT");

    return orderId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
```

A transação pertence à conexão.

Usar `pool.query()` no meio do fluxo pode enviar a operação para outra conexão.

## Evitando check-then-update frágil

Frágil:

```sql
SELECT stock
FROM products
WHERE id = $1;
```

Depois:

```ts
if (stock >= quantity) {
  // ...
}
```

Depois:

```sql
UPDATE products
SET stock = stock - $2
WHERE id = $1;
```

Duas transações podem ler o mesmo estoque antes de atualizar.

Uma operação condicional:

```sql
UPDATE products
SET stock = stock - $2
WHERE id = $1
  AND stock >= $2
RETURNING stock;
```

faz validação e mudança no banco como uma única instrução.

## Isolation levels

PostgreSQL oferece níveis como:

- Read Committed;
- Repeatable Read;
- Serializable.

Não escolha pelo nome mais forte.

Pergunte qual anomalia precisa impedir.

## Read Committed

É o padrão do PostgreSQL.

Cada comando vê um snapshot apropriado para o início daquele comando.

Dois SELECTs dentro da mesma transação podem enxergar resultados diferentes se outra transação confirmar mudanças entre eles.

Isso pode ser aceitável.

## Repeatable Read

Mantém visão estável ao longo da transação.

Evita algumas mudanças visíveis entre leituras.

Pode gerar aborts em cenários de conflito.

A aplicação precisa estar preparada.

## Serializable

Busca comportamento equivalente a uma execução serial.

Pode abortar transações quando o PostgreSQL detecta dependências incompatíveis.

A aplicação deve implementar retry para erros transitórios apropriados.

`SERIALIZABLE` não significa "sem erros de concorrência".

Pode significar mais aborts para preservar garantia maior.

## Locks

Locks coordenam acessos incompatíveis.

Exemplo:

```sql
SELECT
  id,
  stock
FROM products
WHERE id = $1
FOR UPDATE;
```

A linha fica bloqueada para mudanças incompatíveis até a transação terminar.

Locks são necessários.

Esperar por locks aumenta latência.

Por isso:

- mantenha transações curtas;
- evite chamadas HTTP dentro de transação;
- acesse recursos em ordem consistente;
- indexe buscas usadas para localizar linhas.

## Deadlock

Considere:

Transação A:

1. trava produto 1;
2. tenta produto 2.

Transação B:

1. trava produto 2;
2. tenta produto 1.

Cada uma espera pela outra.

PostgreSQL detecta deadlock e aborta uma transação.

A aplicação deve tratar essa falha.

## Como reduzir deadlocks

- ordenar recursos antes de travar;
- manter transações pequenas;
- evitar trabalho externo durante lock;
- criar índices adequados;
- repetir apenas falhas transitórias conhecidas;
- registrar causa e duração.

Não esconda contenção com retry infinito.

## Índices: aceleração com custo

Índice não é decoração.

Um B-tree:

```sql
CREATE INDEX idx_orders_customer_created
ON orders (
  customer_id,
  created_at DESC,
  id DESC
);
```

pode atender:

```sql
SELECT
  id,
  status,
  created_at
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

O índice foi desenhado para um acesso específico.

## Ordem de colunas em índice composto

Índice:

```sql
(customer_id, created_at DESC, id DESC)
```

é diferente de:

```sql
(created_at DESC, customer_id, id DESC)
```

A ordem influencia quais condições restringem melhor o scan.

Não crie composto apenas juntando as colunas que aparecem no `WHERE`.

Observe:

- igualdade;
- range;
- ordenação;
- seletividade;
- consultas reais.

## Índice parcial

```sql
CREATE INDEX idx_orders_open_created
ON orders (
  created_at DESC,
  id DESC
)
WHERE status IN ('draft', 'confirmed');
```

Pode ser menor que indexar todo histórico.

Ajuda quando a query é compatível com o predicado.

Não é automaticamente usado para qualquer busca em `orders`.

## Índice também custa

Todo índice adiciona:

- disco;
- cache;
- trabalho em INSERT;
- trabalho em UPDATE;
- trabalho em DELETE;
- manutenção.

"Indexar tudo" apenas move o gargalo.

## Foreign key e índice

No PostgreSQL, criar foreign key não cria automaticamente índice na coluna que referencia a tabela pai.

Exemplo:

```sql
customer_id integer REFERENCES customers(id)
```

pode exigir índice se consultas e operações dependem desse acesso.

Meça e analise.

## EXPLAIN

```sql
EXPLAIN
SELECT
  id,
  status
FROM orders
WHERE customer_id = 42;
```

Mostra plano estimado.

Você pode observar:

- Seq Scan;
- Index Scan;
- Bitmap Scan;
- Join types;
- Sort;
- Aggregate;
- estimated rows;
- cost.

Cost não é milissegundo.

É uma unidade interna usada pelo planner.

## EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT
  id,
  status,
  created_at
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Executa a consulta e adiciona dados reais.

Observe:

- actual time;
- actual rows;
- loops;
- buffers;
- filtros;
- sorts;
- estimativa versus realidade.

## Seq Scan não é automaticamente ruim

Em tabela pequena:

```text
Seq Scan
```

pode ser mais barato que usar índice.

Se a query retorna 80% das linhas, o índice também pode não ajudar.

A pergunta não é:

> tem index scan?

A pergunta é:

> o plano está adequado ao volume e ao acesso?

## Index Scan não prova performance

Um Index Scan pode ainda:

- visitar muitas linhas;
- fazer heap fetches caros;
- executar milhares de loops;
- ordenar depois;
- competir por cache.

Leia o plano inteiro.

## Estimativa versus realidade

Se o planner espera:

```text
rows=10
```

e encontra:

```text
actual rows=100000
```

há forte divergência.

Isso pode afetar decisões de join e acesso.

Investigue:

- estatísticas;
- distribuição;
- correlação;
- filtros;
- parâmetros;
- modelagem.

## BUFFERS

Com:

```sql
EXPLAIN (ANALYZE, BUFFERS)
```

você observa páginas encontradas em cache ou lidas.

Isso ajuda a separar:

- CPU;
- leitura;
- cache;
- volume de dados tocado.

Use em ambiente controlado.

## EXPLAIN ANALYZE executa a instrução

Isto:

```sql
EXPLAIN ANALYZE
DELETE FROM orders;
```

executa o DELETE.

Para testar mudanças:

```sql
BEGIN;

EXPLAIN ANALYZE
UPDATE products
SET price = price * 1.05
WHERE active = true;

ROLLBACK;
```

Ainda assim, a operação pode:

- adquirir locks;
- executar triggers;
- consumir recursos;
- causar efeitos externos via extensões.

Teste com cautela.

## Paginação com OFFSET

```sql
SELECT
  id,
  created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20
OFFSET 100000;
```

O banco precisa localizar e descartar muitas linhas anteriores.

Com páginas profundas, o custo tende a aumentar.

## Paginação por cursor

```sql
SELECT
  id,
  created_at
FROM orders
WHERE (
  created_at,
  id
) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Com índice compatível, evita parte do trabalho de páginas profundas.

Mas muda o contrato da API.

## OFFSET versus cursor

OFFSET ajuda quando:

- poucas páginas;
- acesso direto a número de página;
- simplicidade vale mais.

Cursor ajuda quando:

- navegação sequencial;
- muitas linhas;
- páginas profundas;
- estabilidade durante inserts importa.

Compare em dados reais.

Não escolha por moda.

## SQL direto versus ORM

ORM pode ajudar em:

- CRUD;
- mapping;
- migrations;
- produtividade;
- composição de queries comuns.

SQL direto pode ajudar em:

- consultas complexas;
- features específicas do banco;
- planos delicados;
- debugging;
- performance.

O problema não é usar ORM.

É não saber:

- qual SQL foi gerado;
- quantas queries executou;
- onde começa a transação;
- se há N+1;
- qual índice é usado;
- como sair da abstração quando necessário.

## N+1

Código aparentemente simples:

```ts
const orders = await orm.order.findMany();

for (const order of orders) {
  order.items =
    await orm.orderItem.findMany({
      where: {
        orderId: order.id,
      },
    });
}
```

Se existem 100 pedidos:

```text
1 query de orders
+ 100 queries de items
```

Isso pode degradar fortemente com latência de rede e volume.

Compare:

- eager loading;
- JOIN;
- batching;
- query específica.

Meça.

## Repository não deve esconder SQL de você

Uma abstração pode ser útil:

```ts
orderRepository.findRecentByCustomer(...)
```

Mas o desenvolvedor ainda deve saber:

- query executada;
- índice necessário;
- cardinalidade;
- custo.

Abstração não elimina física.

## Testes unitários

Teste regras que não precisam de banco real.

Exemplo: construção de filtro ou regra de domínio.

Mas não use mock para "provar" que uma constraint existe.

Um mock pode aceitar qualquer estado.

## Testes de integração

Integração deve usar banco real quando você quer provar:

- constraint;
- transaction;
- isolation;
- SQL;
- mapping;
- migration;
- index-related behavior.

Exemplo:

```ts
test(
  "database rejects zero quantity",
  async () => {
    await assert.rejects(
      pool.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           quantity,
           unit_price
         )
         VALUES ($1, $2, 0, 10.00)`,
        [1, 1],
      ),
      /order_items_quantity_positive/,
    );
  },
);
```

Isso prova comportamento real do banco.

## Teste de transação

```ts
test(
  "rolls back order when item insertion fails",
  async () => {
    await assert.rejects(
      createOrder(invalidInput),
    );

    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM orders`,
    );

    assert.equal(
      result.rows[0].count,
      0,
    );
  },
);
```

Não teste apenas que houve exception.

Teste o estado persistido depois da falha.

## Teste de concorrência

Use duas conexões.

Cenário:

```text
stock = 1
```

Duas transações tentam comprar 1 unidade.

O resultado esperado pode ser:

- uma confirma;
- uma falha.

Esse teste é muito mais valioso que um mock para entender integridade concorrente.

## Teste de contrato

Se API expõe:

```json
{
  "id": 10,
  "status": "confirmed"
}
```

uma refatoração de persistência não deve alterar formato por acidente.

Contract tests protegem consumidor enquanto você muda schema, ORM ou query internamente.

## E2E

Um e2e pode validar:

```text
HTTP
 -> use case
 -> repository
 -> SQL
 -> PostgreSQL
```

Use poucos caminhos críticos.

Não coloque toda regra no e2e.

## Refatoração segura de persistência

Refatorar banco exige duas dimensões:

1. código;
2. dados existentes.

Sequência segura:

1. characterize comportamento;
2. introduza nova estrutura compatível;
3. escreva dados nos dois formatos se necessário;
4. migre dados;
5. valide;
6. altere leitura;
7. remova caminho antigo;
8. remova coluna/estrutura antiga.

Evite "big bang migration".

## Exemplo: trocar status textual por tabela

Antes:

```sql
status text
```

Você pode pensar em:

```text
order_statuses
orders.status_id
```

Mas pergunte:

- existe necessidade real?
- status é configurável?
- há atributos no status?
- isso melhora integridade?
- aumenta JOINs sem benefício?

Nem toda normalização adicional melhora o modelo.

## Cheiros de persistência

### Query duplicada

A mesma query aparece em vários serviços com pequenas diferenças.

Pode ser sinal de necessidade de centralizar intenção.

### `SELECT *`

Cria dependência de colunas que o código talvez nem use.

### Repository genérico demais

Expose filtros de ORM para camada inteira.

### Transação escondida

Ninguém sabe quais passos são atômicos.

### Query dentro de loop

Possível N+1.

### Índice criado sem hipótese

Aumenta custo de escrita sem ganho comprovado.

### Migration manual fora do versionamento

O ambiente deixa de ser reproduzível.

### Dependência escondida de timezone

Datas interpretadas de forma diferente entre app e banco.

## Lint e qualidade

Lint não mede SQL.

Mas pode detectar:

- Promises não aguardadas;
- concatenação de query;
- `any` em mapping;
- imports inconsistentes.

Use como proteção mecânica.

## Coverage

Coverage pode mostrar que:

- rollback nunca foi exercitado;
- erro de constraint não foi testado;
- mapper de null não foi executado;
- branch de paginação está descoberto.

Não use cobertura para afirmar que persistência está correta.

## Mutation testing

Mutation testing é mais útil em regras de aplicação ao redor da persistência.

Exemplo:

```ts
if (result.rowCount !== 1) {
  throw new NotFoundError();
}
```

Se mutation altera para:

```ts
if (result.rowCount === 1) {
```

os testes devem falhar.

No SQL em si, integração e constraints reais costumam ser evidência mais direta.

## Complexidade

Uma função que:

- abre transaction;
- valida DTO;
- consulta cliente;
- busca produtos;
- calcula;
- atualiza estoque;
- persiste;
- publica evento;
- gera response;

está misturando responsabilidades.

A refatoração deve separar regras sem esconder limites transacionais.

## Um laboratório que prova conhecimento

Crie:

```text
persistence-sql-quality-lab/
  src/
    application/
      create-order.ts
      list-orders.ts
    domain/
      order.ts
      money.ts
    repositories/
      order-repository.ts
    infrastructure/
      database/
        pool.ts
        postgres-order-repository.ts
  migrations/
  tests/
    unit/
    integration/
    contract/
    e2e/
    concurrency/
  benchmarks/
    pagination/
    indexes/
  docs/
    adr/
    query-plans/
      before/
      after/
    measurements/
    migrations/
```

Use PostgreSQL como referência prática.

O raciocínio continua útil em outros bancos relacionais, mas detalhes de:

- índices;
- locks;
- isolamento;
- syntax;
- planner;

são específicos do banco.

## Scripts reproduzíveis

Exemplo:

```json
{
  "scripts": {
    "db:migrate": "node dist/scripts/migrate.js",
    "db:seed": "node dist/scripts/seed.js",
    "db:reset": "node dist/scripts/reset.js",
    "test": "node --test",
    "test:integration": "node --test tests/integration",
    "test:concurrency": "node --test tests/concurrency",
    "benchmark:indexes": "node dist/benchmarks/indexes.js",
    "benchmark:pagination": "node dist/benchmarks/pagination.js"
  }
}
```

Outra pessoa deve conseguir reproduzir o ambiente.

## Dataset maior que tutorial

Gere volume.

Exemplo:

```text
customers: 10.000
products: 20.000
orders: 500.000
order_items: 2.000.000
```

Os números exatos dependem da sua máquina.

O importante é sair do cenário:

```text
5 customers
10 orders
```

Alguns planos só se tornam interessantes com volume.

## Dados representativos

Não gere distribuição totalmente uniforme se produção não é uniforme.

Exemplo:

- poucos clientes com muitos pedidos;
- muitos clientes com poucos pedidos;
- produtos muito populares;
- status com distribuições diferentes;
- datas concentradas.

Distribuição afeta seletividade e planner.

## Experimento 1 — constraints

Versão A:

schema permissivo.

Insira:

- quantidade zero;
- preço negativo;
- order sem customer;
- item duplicado.

Registre o que o banco aceita.

Versão B:

adicione constraints.

Repita.

Salve:

- migration;
- erro;
- teste;
- explicação.

## Experimento 2 — transação

Versão A:

crie pedido sem transação.

Force falha no segundo item.

Observe estado parcial.

Versão B:

use transação.

Repita.

Mostre:

```text
antes: pedido parcial persistido
depois: rollback completo
```

Isso é evidência de confiabilidade.

## Experimento 3 — concorrência

Crie estoque:

```text
product.stock = 1
```

Execute duas compras concorrentes.

Compare:

- check-then-update;
- UPDATE condicional;
- lock explícito quando necessário.

Explique o comportamento.

## Experimento 4 — índice

Query alvo:

```sql
SELECT
  id,
  status,
  created_at
FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Capture:

```text
EXPLAIN (ANALYZE, BUFFERS)
```

antes.

Depois crie:

```sql
CREATE INDEX idx_orders_customer_created
ON orders (
  customer_id,
  created_at DESC,
  id DESC
);
```

Capture depois.

Compare:

- tempo;
- buffers;
- linhas visitadas;
- plano;
- custo de INSERT em benchmark separado.

## Experimento 5 — índice inútil

Crie um índice que parece razoável, mas não ajuda:

```sql
CREATE INDEX idx_orders_created_customer
ON orders (
  created_at DESC,
  customer_id
);
```

Compare com o índice alinhado ao filtro.

Documente por que ordem de colunas importa.

## Experimento 6 — índice parcial

Query:

```sql
SELECT
  id,
  created_at
FROM orders
WHERE status = 'confirmed'
ORDER BY created_at DESC
LIMIT 50;
```

Compare:

- sem índice;
- índice completo;
- índice parcial para estados ativos/relevantes.

Observe tamanho e manutenção.

## Experimento 7 — OFFSET versus cursor

Gere centenas de milhares de pedidos.

Meça:

```text
OFFSET 0
OFFSET 1.000
OFFSET 10.000
OFFSET 100.000
```

Depois cursor.

Registre:

- latência;
- buffers;
- plano;
- contrato da API;
- estabilidade durante inserts.

## Experimento 8 — ORM versus SQL direto

Implemente mesma consulta:

1. ORM;
2. SQL explícito.

Compare:

- legibilidade;
- número de queries;
- SQL produzido;
- plano;
- facilidade de manutenção.

Não declare vencedor universal.

## Experimento 9 — migration

Crie migration de índice em tabela grande.

Compare:

```sql
CREATE INDEX ...
```

versus:

```sql
CREATE INDEX CONCURRENTLY ...
```

Estude:

- locks;
- duração;
- restrições da ferramenta;
- transaction block.

No PostgreSQL, `CREATE INDEX CONCURRENTLY` possui regras específicas e não pode ser executado dentro de transaction block comum.

## Experimento 10 — plano ruim por estimativa

Crie distribuição desigual.

Observe estimativa versus linhas reais.

Atualize estatísticas.

Compare plano.

A meta é entender que planner depende de informação sobre dados.

## Compare abordagens e registre onde falham

| Comparação | O que medir | Onde cada opção falha |
| --- | --- | --- |
| constraint na aplicação vs. banco | integridade e concorrência | aplicação pode ser ignorada; banco não substitui regra complexa |
| normalizado vs. desnormalizado | consistência, leitura e escrita | normalização pode aumentar JOIN; duplicação pode divergir |
| check-then-update vs. update condicional | race conditions | check separado pode ficar obsoleto; update condicional pode não cobrir regra complexa |
| Read Committed vs. Serializable | anomalias, aborts, retries | isolamento menor permite anomalias; maior isolamento aumenta conflitos |
| sem índice vs. B-tree composto | buffers, tempo, write cost | sem índice degrada busca; índice aumenta custo de mutação |
| índice completo vs. parcial | tamanho, write cost, queries atendidas | completo custa mais; parcial só serve ao predicado compatível |
| OFFSET vs. cursor | páginas profundas, estabilidade | OFFSET degrada; cursor não oferece página numerada simples |
| ORM vs. SQL direto | produtividade, clareza, plano | ORM esconde custo; SQL manual aumenta repetição |
| migration destrutiva vs. expand/contract | risco de deploy | destrutiva quebra compatibilidade; expand/contract é mais lenta e complexa |
| fake repository vs. banco real | velocidade e fidelidade | fake não prova SQL; banco real custa setup |

## Crie exemplos pequenos que quebrem

Faça pelo menos:

1. inserir FK inexistente;
2. inserir quantidade zero;
3. inserir item duplicado;
4. executar operação sem transação e forçar falha;
5. criar deadlock controlado;
6. usar índice com ordem inadequada;
7. executar OFFSET profundo;
8. gerar N+1;
9. fazer migration incompatível;
10. concatenar entrada em SQL em ambiente isolado e mostrar por que é inseguro;
11. comparar tabela pequena e grande;
12. comparar distribuição uniforme e desigual.

Falha é evidência.

Documente:

- hipótese;
- setup;
- comando;
- resultado;
- explicação;
- limite.

## Plano de execução como artefato

Guarde:

```text
docs/query-plans/
  list-orders-before.txt
  list-orders-after.txt
```

Inclua no README:

```text
Query: list recent orders by customer
Dataset: 500k orders
Node: ...
PostgreSQL: ...
Machine: ...
Runs: ...
```

Não publique apenas:

```text
"ficou 3x mais rápido"
```

sem contexto.

## Medição responsável

Registre:

- hardware;
- versão PostgreSQL;
- versão Node;
- dataset;
- distribuição;
- cache;
- concorrência;
- repetições;
- média/mediana quando relevante;
- p95/p99 quando fizer sentido;
- plano.

Uma diferença pequena pode ser ruído.

Repita.

## Refatoração guiada por query

Imagine repository:

```ts
findAll(filters: any): Promise<Order[]>
```

Começa simples.

Depois recebe:

```ts
{
  customerId,
  status,
  from,
  to,
  page,
  sort,
  include,
  search,
}
```

Isso pode virar um pseudo-ORM.

Refatore para casos de acesso claros:

```ts
findRecentByCustomer(
  customerId: string,
  cursor?: OrderCursor,
): Promise<Order[]>;
```

e:

```ts
findOpenForProcessing(
  limit: number,
): Promise<Order[]>;
```

A query passa a representar intenção.

## Refatoração e contrato estável

Antes:

```text
GET /orders?page=5000
```

Se migrar para cursor, o contrato público muda.

Pode exigir versão:

```text
GET /v2/orders?after=...
```

Ou manter OFFSET externamente e otimizar de outra forma.

Arquitetura e persistência precisam considerar consumidores.

## Repository e transação

Cuidado para não criar repositories tão isolados que uma transação entre eles fique impossível.

Exemplo:

```ts
await customerRepository.save(...);
await orderRepository.save(...);
await eventRepository.save(...);
```

Se precisam ser atômicos, a infraestrutura deve compartilhar transaction context.

Documente a estratégia.

## Unit of Work

Uma abordagem:

```ts
interface UnitOfWork {
  run<T>(
    work: (
      repositories: TransactionRepositories,
    ) => Promise<T>,
  ): Promise<T>;
}
```

Pode ser útil.

Mas adiciona abstração.

Compare com passar `PoolClient` internamente na infraestrutura.

Escolha pelo custo de mudança.

## Testes desde o primeiro commit

O laboratório deve incluir:

- migration test;
- constraint test;
- transaction rollback;
- commit;
- concurrency;
- repository mapping;
- query critical path;
- contract test;
- e2e.

CI deve executar testes reproduzíveis.

## CI

Pipeline:

```text
install
 -> start PostgreSQL service
 -> migrate
 -> seed minimal
 -> unit tests
 -> integration tests
 -> contract tests
 -> build
```

Benchmarks grandes podem ficar fora de todo PR se forem caros.

Execute em pipeline separado ou manual reproduzível.

## Lint, coverage e mutation

Relatórios possíveis:

```text
lint
coverage/
mutation/
query-plans/
```

A meta não é colecionar badges.

É possuir evidências complementares:

- lint: defeitos mecânicos;
- coverage: caminhos executados;
- mutation: força de testes;
- integration: comportamento do banco;
- EXPLAIN: custo de query.

## Issues

Exemplo:

```text
perf: recent orders query performs sequential scan at 500k rows
```

Inclua:

- query;
- dataset;
- plano;
- hipótese;
- critério de aceite.

Outro:

```text
bug: concurrent checkout can oversell product
```

Inclua reprodução com duas conexões.

## PRs

Exemplo:

```text
perf: add composite index for customer order history
```

Descrição:

- problema;
- plano before;
- índice;
- plano after;
- custo;
- migration;
- risco;
- rollback.

Outro:

```text
refactor: make order creation atomic
```

Inclua teste que falhava antes.

## ADRs

Crie ADR para decisões importantes.

Exemplo:

```md
# ADR-002 — Cursor pagination for order history

## Context

OFFSET became increasingly expensive on deep pages
with 500k+ orders.

## Options

1. keep OFFSET;
2. use cursor pagination;
3. materialize pages/cache.

## Decision

Use cursor pagination for sequential order history.

## Positive consequences

- less work on deep navigation;
- stable ordering with compound cursor.

## Negative consequences

- no direct numbered-page access;
- API contract becomes more complex.

## Risks

Incorrect cursor ordering can duplicate or skip rows.
```

## README profissional

Estruture:

1. objetivo;
2. problema;
3. modelo relacional;
4. diagrama;
5. invariantes;
6. migrations;
7. setup;
8. seed;
9. testes;
10. transações;
11. concorrência;
12. índices;
13. query plans;
14. benchmarks;
15. ADRs;
16. limitações;
17. próximos passos.

Resumo em inglês:

```md
## English summary

This repository studies relational persistence as an engineering concern.
It focuses on schema integrity, transactions, isolation, indexes,
execution plans, migrations, pagination, and safe refactoring.
Every optimization is accompanied by tests or measurements,
and the project records both benefits and trade-offs.
```

## Evidências para GitHub e portfólio

Produza:

- repository público;
- README profissional;
- resumo em inglês;
- diagrama ER;
- migrations;
- seed reproduzível;
- testes automatizados;
- CI;
- badge;
- planos de execução;
- benchmark documentado;
- ADRs;
- issues;
- PRs;
- artigo ou vlog.

Impacto forte:

> A consulta de histórico de pedidos fazia sequential scan sobre centenas de milhares de linhas. Após criar um índice composto alinhado ao filtro e à ordenação, o plano passou a reduzir a quantidade de dados visitados no cenário testado. O repositório inclui os planos antes/depois, volume, ambiente e custo adicional do índice nas operações de escrita.

Outro:

> A criação de pedidos persistia registros parciais quando a inserção de um item falhava. A refatoração passou a executar pedido, estoque e itens dentro da mesma transação, com teste de integração que comprova rollback completo.

Evite:

> "O banco ficou muito mais performático."

Performance precisa de cenário.

## Artigo prático 1 — Modelagem de dados para qualidade e refatoração

### Título sugerido

**Modelagem de dados para qualidade e refatoração: do schema ao comportamento real**

Estruture:

1. problema;
2. modelo inicial;
3. inconsistências possíveis;
4. novo schema;
5. PK/FK;
6. constraints;
7. tipos;
8. normalização;
9. desnormalização intencional;
10. índices;
11. testes;
12. trade-offs.

Mostre pelo menos uma inconsistência rejeitada pelo banco.

Exemplo:

```sql
INSERT INTO order_items (
  order_id,
  product_id,
  quantity,
  unit_price
)
VALUES (
  1,
  1,
  0,
  100
);
```

Explique por que o banco rejeitou.

## Artigo prático 2 — SQL que todo backend deveria dominar antes de culpar o ORM

### Título sugerido

**SQL que todo backend deveria dominar antes de culpar o ORM**

Use uma query do laboratório.

Mostre:

- SELECT;
- JOIN;
- GROUP BY;
- transaction;
- index;
- EXPLAIN;
- migration.

Depois compare:

```text
ORM
```

e:

```text
SQL explícito
```

sem declarar vencedor universal.

Pergunte:

- o SQL ficou legível?
- o ORM gerou N+1?
- a query usa o índice?
- o plano mudou?
- qual opção é mais sustentável?

## Artigo prático 3 — Como provei performance ou integridade

### Título sugerido

**Como provei performance ou integridade no banco de dados**

Escolha uma hipótese.

Exemplo:

> O índice composto reduz o trabalho necessário para buscar os últimos pedidos de um cliente.

Ou:

> A transação impede que um pedido fique parcialmente persistido.

Estruture:

1. hipótese;
2. ambiente;
3. dataset;
4. cenário;
5. código;
6. teste;
7. plano before;
8. alteração;
9. plano after;
10. resultado;
11. limitações.

Inclua seção:

**O que este experimento não prova**

Exemplo:

- não representa hardware de produção;
- não mede concorrência real;
- cache pode influenciar;
- dataset é sintético;
- melhoria observada não vale para toda query.

## Formato recomendado para os artigos

Cada artigo pode conter entre 800 e 1.500 palavras.

Estrutura:

1. introdução;
2. problema;
3. hipótese;
4. código/SQL;
5. testes;
6. medição;
7. trade-offs;
8. limitações;
9. conclusão;
10. GitHub.

Um vlog pode mostrar:

- migration;
- psql;
- query;
- EXPLAIN;
- teste;
- lock;
- rollback;
- benchmark;
- diff;
- PR.

## Como explicar trade-offs em entrevista internacional

Use inglês técnico simples.

> We kept the order model normalized, but stored the unit price on each order item because it is a historical fact. The current product price can change, while the price paid for an existing order must remain stable.

Outro:

> We added a composite B-tree index only after measuring the main query with `EXPLAIN ANALYZE`. The index reduced the amount of data scanned for that access path, but it also increased storage and write cost.

Outro:

> We used a transaction for order creation because inventory updates and item inserts must succeed or fail as one unit. We also tested concurrent requests to verify that stock cannot become negative.

Outro:

> We moved from OFFSET to cursor pagination for sequential history because deep pages required increasingly more work. The trade-off is that the API no longer provides simple numbered-page access.

Outro:

> We still use an ORM for simple operations, but we inspect the generated SQL and use explicit SQL when the abstraction makes a critical query harder to understand or optimize.

## Checklist técnico de conclusão

Você terá concluído o E016 quando conseguir:

- criar schema com PK, FK, `NOT NULL`, `UNIQUE` e `CHECK`;
- escolher tipos SQL conscientemente;
- explicar integridade referencial;
- modelar relacionamentos;
- explicar normalização;
- justificar uma desnormalização;
- usar SELECT com colunas explícitas;
- escrever JOINs;
- usar GROUP BY;
- escrever CTE;
- explicar subquery;
- fazer INSERT parametrizado;
- fazer UPDATE seguro;
- fazer DELETE seguro;
- criar migrations versionadas;
- explicar por que `down` não garante recuperação de dados;
- aplicar expand/contract;
- explicar ACID;
- abrir e finalizar transação corretamente;
- diferenciar Read Committed, Repeatable Read e Serializable;
- explicar locks;
- reproduzir deadlock em ambiente controlado;
- implementar retry apenas para falhas transitórias apropriadas;
- criar B-tree;
- criar índice composto;
- explicar ordem de colunas;
- criar índice parcial;
- explicar custo de índice;
- usar `EXPLAIN`;
- usar `EXPLAIN ANALYZE`;
- interpretar rows, loops, scans e buffers;
- explicar por que Seq Scan não é automaticamente ruim;
- comparar OFFSET e cursor;
- detectar N+1;
- comparar ORM e SQL direto;
- testar constraint em banco real;
- testar rollback;
- testar concorrência com duas conexões;
- manter contrato público estável durante refatoração;
- executar dataset maior que tutorial;
- medir antes/depois;
- registrar limitações;
- usar lint, coverage e mutation testing como evidências complementares;
- escrever ADR;
- explicar trade-off em inglês técnico simples;
- produzir evidência pública reproduzível.

## O que você deve levar deste ciclo

Persistência não é uma camada passiva no final da aplicação.

Ela define parte do comportamento do sistema.

O schema protege estados válidos.

Constraints impedem inconsistências.

Transações definem unidades de mudança.

Isolation levels e locks determinam o que acontece sob concorrência.

Índices alteram o custo dos caminhos de acesso.

Migrations transformam o modelo sem apagar o passado operacional.

Planos de execução mostram o que o banco realmente fez.

No contexto de qualidade e refatoração, a diferença mais importante é abandonar decisões baseadas em suposição.

Em vez de:

> "acho que precisa de índice",

você mede.

Em vez de:

> "o ORM está lento",

você inspeciona o SQL e o plano.

Em vez de:

> "a transação deve resolver",

você reproduz concorrência.

Em vez de:

> "a migration é simples",

você testa em base existente.

Você terá concluído o E016 quando conseguir pegar uma persistência frágil, provocar seus problemas, proteger invariantes, medir gargalos, refatorar em etapas pequenas e demonstrar o resultado com evidência reproduzível.

O resultado final deve ser avaliável sem conversa privada: repository público, migrations, testes, CI, query plans, medições, ADRs, issues, PRs, README bilíngue e artigos que expliquem tanto a solução quanto seus limites.

## Referências primárias

- [PostgreSQL — Data Definition](https://www.postgresql.org/docs/current/ddl.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL — Queries](https://www.postgresql.org/docs/current/queries.html)
- [PostgreSQL — Table Expressions](https://www.postgresql.org/docs/current/queries-table-expressions.html)
- [PostgreSQL — WITH Queries](https://www.postgresql.org/docs/current/queries-with.html)
- [PostgreSQL — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL — Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL — Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL — Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL — Multicolumn Indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html)
- [PostgreSQL — Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [PostgreSQL — CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [node-postgres — Queries](https://node-postgres.com/features/queries)
- [node-postgres — Transactions](https://node-postgres.com/features/transactions)
