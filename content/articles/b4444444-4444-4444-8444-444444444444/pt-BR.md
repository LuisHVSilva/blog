---
translationId: 25555555-5555-4555-8555-555555555555
articleId: b4444444-4444-4444-8444-444444444444
locale: pt-BR
slug: persistencia-sql-base-ts-node
title: "Persistência e SQL em Base TS/Node: do schema ao comportamento real"
description: "Um guia prático para modelar dados, preservar integridade, trabalhar com transações e diagnosticar consultas em um backend TypeScript e Node.js."
status: draft
---

# Persistência e SQL em Base TS/Node: do schema ao comportamento real

Quando um backend grava um pedido, o trabalho não termina quando o ORM responde `success`. O sistema precisa impedir pedidos sem cliente, valores negativos, itens duplicados e atualizações pela metade. Também precisa encontrar os dados com velocidade aceitável quando milhares ou milhões de linhas substituírem os cinco registros do tutorial.

Persistência segura nasce da combinação de quatro capacidades:

1. modelar o significado dos dados;
2. proteger invariantes no banco;
3. controlar operações concorrentes;
4. medir como o banco realmente executa cada consulta.

Neste ciclo, usaremos TypeScript, Node.js e PostgreSQL para construir um pequeno serviço de pedidos. PostgreSQL será a referência prática, mas o raciocínio — modelagem, transações, índices e medição — continua útil em outros bancos relacionais.

> O ORM pode facilitar o acesso ao banco. Ele não elimina a necessidade de entender o SQL que será executado.

<!-- VISUAL:
Fluxo em quatro blocos: requisição HTTP -> caso de uso TypeScript -> SQL/transação -> PostgreSQL.
Embaixo do PostgreSQL, destacar: integridade, concorrência e plano de execução.
-->

## O problema que guia o laboratório

Nosso sistema deve registrar clientes, produtos, pedidos e itens. As regras iniciais são simples:

- um pedido pertence a um cliente existente;
- um item pertence a um pedido e a um produto existentes;
- quantidade e preços precisam ser positivos;
- o mesmo produto não pode aparecer duas vezes no mesmo pedido;
- um pedido confirmado deve possuir ao menos um item;
- o preço pago precisa permanecer no histórico, mesmo que o produto mude de preço.

O TypeScript expressará essas intenções no código. O banco protegerá as regras que não podem depender de todos os caminhos da aplicação se comportarem corretamente.

## Schema não é apenas uma coleção de colunas

Comece pelos tipos e pelas restrições, não pelo nome do ORM:

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
  CONSTRAINT products_price_positive CHECK (price > 0),
  CONSTRAINT products_stock_nonnegative CHECK (stock >= 0)
);

CREATE TABLE orders (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_valid
    CHECK (status IN ('draft', 'confirmed', 'cancelled'))
);

CREATE TABLE order_items (
  order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12, 2) NOT NULL CHECK (unit_price > 0),
  PRIMARY KEY (order_id, product_id)
);
```

Cada escolha comunica e protege algo:

- a chave primária identifica uma linha sem depender de nome ou e-mail;
- a chave estrangeira impede referências inexistentes;
- `NOT NULL` diferencia dado obrigatório de ausência legítima;
- `UNIQUE` protege unicidade, inclusive quando outra rotina escreve no banco;
- `CHECK` rejeita estados que não fazem sentido;
- `numeric(12, 2)` evita usar ponto flutuante binário para valores monetários;
- `timestamptz` representa um instante no tempo e reduz ambiguidades entre fusos;
- as ações `ON DELETE` tornam explícito o que acontece com os dependentes.

Uma chave estrangeira não cria automaticamente um índice na coluna que referencia a tabela pai no PostgreSQL. Por isso, os caminhos de consulta e exclusão ainda precisam ser analisados.

Nem toda regra atravessa tabelas de forma simples. A condição “um pedido confirmado possui ao menos um item” não cabe em um `CHECK` comum do PostgreSQL, pois esse tipo de constraint não deve consultar outras linhas ou tabelas. Ela precisa ser preservada pelo fluxo transacional ou por um mecanismo de banco projetado para isso, como um trigger cuidadosamente testado. A escolha e o motivo devem ser documentados.

## Normalização e desnormalização controlada

Guardar nome, e-mail e endereço do cliente em toda linha de pedido pareceria conveniente. Porém, repetição sem necessidade cria versões conflitantes do mesmo fato. A normalização mantém cada conceito em seu lugar e relaciona as tabelas por chaves.

Mas `order_items.unit_price` repete o preço de `products`. Isso é intencional: o preço do catálogo é o preço atual; o preço do item é um fato histórico da compra. Não é um cache acidental, e sim uma decisão de domínio.

Antes de desnormalizar, responda:

- qual consulta ou regra justifica a duplicação?
- qual valor é a fonte da verdade?
- como os dados serão sincronizados?
- o ganho foi medido?
- o que acontece quando a atualização falha?

> Modele primeiro pela verdade do domínio e pelos acessos reais. Desnormalize quando houver uma razão explícita e verificável.

## SQL que o backend precisa dominar

### SELECT e JOIN

Para carregar um pedido com seus itens:

```sql
SELECT
  o.id,
  o.status,
  o.created_at,
  c.name AS customer_name,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  oi.quantity * oi.unit_price AS line_total
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id
JOIN order_items AS oi ON oi.order_id = o.id
JOIN products AS p ON p.id = oi.product_id
WHERE o.id = $1;
```

O placeholder `$1` não é apenas estética. Valores externos devem ser enviados separadamente do texto SQL para reduzir o risco de injeção.

### GROUP BY, CTE e subquery

Uma CTE pode tornar explícitas etapas de uma consulta complexa:

```sql
WITH order_totals AS (
  SELECT
    order_id,
    SUM(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT o.id, o.created_at, ot.total
FROM orders AS o
JOIN order_totals AS ot ON ot.order_id = o.id
WHERE o.customer_id = $1
  AND ot.total > (
    SELECT AVG(total) FROM order_totals
  )
ORDER BY o.created_at DESC, o.id DESC;
```

CTEs e subqueries não são automaticamente rápidas ou lentas. Elas expressam uma consulta; o plano real precisa ser observado.

### INSERT, UPDATE e DELETE seguros

Uma modificação perigosa não delimita o alvo. Prefira condições baseadas em identificadores e, quando for útil, verifique o resultado retornado:

```sql
UPDATE products
SET price = $2
WHERE id = $1
  AND active = true
RETURNING id, price;
```

```sql
DELETE FROM orders
WHERE id = $1
  AND status = 'draft'
RETURNING id;
```

No código, trate `rowCount === 0` como um resultado de negócio possível. Nunca monte valores do usuário por concatenação. Identificadores dinâmicos, como nomes de colunas, exigem whitelist ou uma ferramenta própria para composição segura; parâmetros comuns representam valores, não identificadores SQL.

## Transação: tudo acontece ou nada acontece

Criar um pedido exige várias instruções. Se o estoque for reduzido, mas a inserção dos itens falhar, o banco não pode guardar metade da operação.

ACID resume quatro propriedades:

- **atomicidade:** a unidade inteira confirma ou desfaz;
- **consistência:** as regras válidas continuam válidas;
- **isolamento:** operações concorrentes não devem observar combinações proibidas;
- **durabilidade:** depois do commit, o resultado deve sobreviver às falhas cobertas pelo banco.

Com `node-postgres`, todas as instruções de uma transação precisam usar o mesmo `client`, porque a transação pertence a uma conexão:

```ts
import type { PoolClient } from "pg";
import { pool } from "./database.js";

type OrderItemInput = {
  productId: number;
  quantity: number;
};

export async function createOrder(
  customerId: number,
  items: OrderItemInput[],
): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const orderId = await insertOrder(client, customerId);

    for (const item of items) {
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
        throw new Error(`Product ${item.productId} is unavailable`);
      }

      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.productId, item.quantity, product.rows[0].price],
      );
    }

    await client.query(
      "UPDATE orders SET status = 'confirmed' WHERE id = $1",
      [orderId],
    );
    await client.query("COMMIT");
    return orderId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function insertOrder(
  client: PoolClient,
  customerId: number,
): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO orders (customer_id, status)
     VALUES ($1, 'draft')
     RETURNING id`,
    [customerId],
  );

  return result.rows[0].id;
}
```

O `UPDATE ... WHERE stock >= $2` faz a validação e a redução em uma única instrução. Duas requisições não podem ler o mesmo saldo antigo e ambas descontá-lo sem que a condição seja reavaliada pelo banco.

## Isolation levels, locks e deadlocks

Transação não significa ausência de concorrência. O nível padrão do PostgreSQL é `READ COMMITTED`: cada comando enxerga um snapshot válido para o início daquele comando. `REPEATABLE READ` mantém uma visão estável durante a transação e pode abortar operações que não possam ser serializadas naquele contexto. `SERIALIZABLE` oferece a garantia mais forte, mas a aplicação precisa estar pronta para repetir transações abortadas por conflito.

Locks coordenam acessos incompatíveis. Eles são necessários, mas esperar por um lock aumenta latência. Um deadlock acontece quando duas transações esperam uma pela outra em ciclo. PostgreSQL detecta a situação e aborta uma delas; a aplicação deve tratar a falha.

Reduza o risco:

- mantenha transações curtas;
- acesse recursos compartilhados sempre na mesma ordem;
- não faça chamadas HTTP enquanto segura locks;
- indexe buscas usadas para localizar linhas que serão alteradas;
- implemente retry limitado apenas para erros transitórios conhecidos;
- registre tentativas, duração e causa para não esconder contenção permanente.

Não escolha `SERIALIZABLE` por reflexo nem permaneça em `READ COMMITTED` por hábito. Escreva a anomalia que precisa impedir, reproduza-a com duas conexões e escolha a garantia mínima suficiente.

## Migrations são código de produção

Uma migration deve ser versionada, revisada e testada:

```sql
-- 004_add_order_search_index.up.sql
CREATE INDEX CONCURRENTLY idx_orders_customer_created
  ON orders (customer_id, created_at DESC, id DESC);
```

```sql
-- 004_add_order_search_index.down.sql
DROP INDEX CONCURRENTLY IF EXISTS idx_orders_customer_created;
```

No PostgreSQL, `CREATE INDEX CONCURRENTLY` não pode rodar dentro de um bloco de transação. Se a ferramenta de migrations envolve cada arquivo em uma transação automaticamente, esta migration precisa de configuração especial. Esse detalhe deve ser testado antes da implantação.

Reversível “quando possível” é uma restrição importante. Apagar uma coluna e recriá-la não recupera os dados. Mudanças grandes podem exigir expansão e contração:

1. adicionar a nova estrutura de forma compatível;
2. publicar código que trabalhe com os dois formatos;
3. migrar e validar os dados;
4. trocar as leituras;
5. remover a estrutura antiga em outra implantação.

Teste uma base vazia, uma base atualizada desde a versão anterior e, quando houver `down`, o caminho de volta. Avalie também duração, locks e compatibilidade com a aplicação que ainda está rodando.

## Índices: estruturas úteis, não decoração

B-tree é o índice padrão do PostgreSQL e atende comparações de igualdade, intervalos e ordenações comuns. Para listar pedidos de um cliente do mais recente para o mais antigo:

```sql
CREATE INDEX idx_orders_customer_created
  ON orders (customer_id, created_at DESC, id DESC);
```

A ordem importa. Em um B-tree composto, condições nas colunas iniciais normalmente determinam quanto do índice pode ser usado para limitar a busca. O índice acima foi desenhado para `customer_id` seguido da ordenação por data e id; ele não é automaticamente a melhor resposta para pesquisar apenas `created_at` em todos os clientes.

Um índice parcial guarda apenas linhas que satisfazem um predicado:

```sql
CREATE INDEX idx_orders_open_created
  ON orders (created_at DESC, id DESC)
  WHERE status IN ('draft', 'confirmed');
```

Ele pode ser menor e mais barato que indexar todo o histórico, mas só ajuda quando o PostgreSQL consegue provar que a condição da consulta implica o predicado do índice.

Todo índice cobra um preço: espaço em disco, cache e trabalho adicional em `INSERT`, `UPDATE` e `DELETE`. “Indexar todas as colunas” troca uma forma de lentidão por outra.

## EXPLAIN e EXPLAIN ANALYZE: medir antes de otimizar

`EXPLAIN` mostra o plano estimado. `EXPLAIN ANALYZE` executa a instrução e acrescenta tempos e contagens reais:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, status, created_at
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Ao ler o resultado, procure:

- tipo de acesso, como `Seq Scan` ou `Index Scan`;
- custo estimado e tempo real;
- linhas estimadas versus linhas reais;
- loops internos;
- filtros que descartam muitas linhas;
- leituras de buffers;
- ordenações e uso de memória ou disco.

Um `Seq Scan` não é automaticamente ruim: em uma tabela pequena ou quando quase todas as linhas serão retornadas, ele pode ser a escolha correta. Um `Index Scan` também não é prova de velocidade. Compare latência, buffers e estabilidade com volume representativo.

`EXPLAIN ANALYZE` realmente executa a instrução. Para experimentar uma modificação sem persistir o efeito:

```sql
BEGIN;
EXPLAIN ANALYZE
UPDATE products SET price = price * 1.05 WHERE active = true;
ROLLBACK;
```

Ainda assim, locks, triggers e outros efeitos externos exigem cautela. Faça testes de carga em um ambiente controlado.

## Paginação: OFFSET versus cursor

Esta consulta é simples:

```sql
SELECT id, created_at
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 100000;
```

Mas o banco ainda precisa localizar e descartar as linhas anteriores. Para navegação sequencial, paginação por cursor costuma escalar melhor:

```sql
SELECT id, created_at
FROM orders
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

`OFFSET` é conveniente para poucas páginas e acesso direto a uma página numerada. Cursor reduz trabalho em páginas profundas e costuma produzir navegação mais estável durante novas inserções, mas exige uma ordenação determinística e muda o contrato da API. Meça as duas abordagens com a distribuição real de dados.

## SQL direto e ORM sem fanatismo

Um ORM pode acelerar CRUD, padronizar migrations e melhorar a composição de operações comuns. SQL direto oferece controle transparente para consultas complexas, recursos específicos do banco e investigação de performance.

O erro não é usar ORM. É não saber:

- qual SQL ele gerou;
- quantas consultas uma operação disparou;
- onde a transação começa e termina;
- se há N+1 queries;
- se o filtro usa o índice esperado;
- como escapar da abstração quando ela aumenta o custo.

Uma solução madura pode usar ORM para operações simples e SQL explícito nos pontos em que clareza ou desempenho justificam. Registre a decisão e seus limites.

## Testes desde o primeiro repositório

Teste integração contra PostgreSQL real, não apenas mocks do repositório. Um teste valioso prova que o banco rejeita um estado inválido:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { pool } from "../src/database.js";

test("rejects an order item with zero quantity", async () => {
  await assert.rejects(
    pool.query(
      `INSERT INTO order_items
         (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, 0, 10.00)`,
      [1, 1],
    ),
    /order_items_quantity_check/,
  );
});
```

O laboratório deve incluir testes para:

- migrations em banco vazio;
- chaves, `UNIQUE`, `CHECK` e ações de exclusão;
- commit e rollback;
- duas conexões concorrentes disputando o mesmo estoque;
- query principal com volume maior que o tutorial;
- paginação sem duplicar ou pular resultados no cenário definido.

Não transforme o tempo exato de uma consulta em teste frágil de CI. Guarde planos e medições como evidência de engenharia, estabeleça orçamentos apenas em ambiente controlado e explique hardware, volume, distribuição, cache e número de repetições.

## Um laboratório que prova conhecimento

Crie o repositório `ts-node-persistence-lab` com esta base:

```text
src/
  application/create-order.ts
  database/pool.ts
  repositories/postgres-order-repository.ts
migrations/
tests/integration/
benchmarks/
docs/
  adr/
  query-plans/
```

Prepare Node LTS, TypeScript, `pnpm` ou `npm`, PostgreSQL isolado para desenvolvimento e scripts previsíveis como `db:migrate`, `db:seed`, `test`, `test:integration` e `benchmark`. Use terminal e VS Code como ferramentas de trabalho, não como dependências ocultas: outra pessoa deve executar o projeto apenas com o README.

Pratique o processo diariamente:

1. abra uma issue pequena;
2. crie uma branch;
3. faça commits atômicos;
4. execute testes e examine o diff;
5. faça rebase simples quando necessário;
6. abra um pull request;
7. realize seu próprio code review antes do merge.

O README profissional deve explicar o problema, arquitetura, pré-requisitos, variáveis de ambiente, migrations, seed, testes e medições. Escreva o texto principal em português e acrescente um resumo técnico em inglês. Configure CI, inclua o badge e mantenha segredos fora do repositório.

## Compare abordagens e registre onde falham

Seu estudo se aprofunda quando uma hipótese pode ser refutada. Faça ao menos estes experimentos:

| Comparação | O que medir | Onde cada opção falha |
| --- | --- | --- |
| Normalizado vs. desnormalizado | complexidade de escrita, JOINs e consistência | normalização pode encarecer certas leituras; duplicação pode divergir |
| Sem índice vs. B-tree composto | tempo, buffers, linhas visitadas e custo de escrita | sem índice degrada buscas seletivas; índice excessivo encarece mutações |
| `OFFSET` vs. cursor | páginas iniciais/profundas e estabilidade | `OFFSET` degrada em profundidade; cursor não oferece página numerada simples |
| `READ COMMITTED` vs. `SERIALIZABLE` | anomalias, conflitos e retries | garantia menor permite certas anomalias; maior isolamento pode abortar mais |
| ORM vs. SQL direto | clareza, produtividade e plano produzido | abstração pode esconder custo; SQL manual pode espalhar repetição |

Crie exemplos pequenos que quebrem: remova uma constraint, force duas transações a adquirir locks em ordens opostas, use um índice com colunas invertidas e compare um banco com 100 linhas a outro com 100 mil. Explique o resultado com base no plano e nas limitações do teste, não em preferência pessoal.

## Evidências para GitHub e portfólio

A comprovação não deve ser “estudei SQL”, mas um conjunto de artefatos que outra pessoa consegue avaliar:

- repositório público com README profissional em português e resumo em inglês;
- issues e pull requests que mostrem decisões, commits atômicos e revisão própria;
- migrations, seed reproduzível e testes automatizados em CI com badge visível;
- planos de execução anteriores e posteriores à mudança, acompanhados do método de medição;
- artigo ou vlog que apresente problema, solução, trade-offs e limitações;
- seção de portfólio que traduza o trabalho em impacto: menos linhas visitadas, integridade protegida, menor risco de injeção, custo adicional dos índices e produtividade obtida com scripts reproduzíveis.

Evite percentuais sem experimento. Se a melhoria foi observada apenas no laboratório, diga isso. Honestidade sobre o limite da evidência também demonstra maturidade técnica.

## Três artigos práticos derivados do laboratório

### 1. Modelagem de dados para Base TS/Node: do schema ao comportamento real

Apresente tabelas, relacionamentos, tipos, constraints e índices. Mostre uma inconsistência que o banco rejeita e explique por que `unit_price` é uma desnormalização histórica intencional.

### 2. SQL que todo backend deveria dominar antes de culpar o ORM

Parta de uma consulta real do repositório. Mostre `JOIN`, agregação, transação, migration e plano de execução. Compare a implementação do ORM com SQL explícito sem declarar um vencedor universal.

### 3. Como provei performance ou integridade no banco de dados

Escolha uma hipótese: “este índice reduz o trabalho da consulta” ou “esta transação impede estoque negativo”. Registre dados, método, teste, plano anterior, plano posterior, resultado e limites. Não esconda uma medição inconclusiva.

Cada artigo pode ter entre 800 e 1.500 palavras com esta sequência: introdução, problema, código, testes, trade-offs, conclusão e link para o GitHub. Um vlog pode repetir a história mostrando o terminal, o plano e o teste falhando antes da correção.

## Como explicar os trade-offs em uma entrevista internacional

Use inglês técnico simples e afirmações verificáveis:

> We kept the order model normalized, but copied the unit price into each order item because it represents a historical fact. We added a composite B-tree index after measuring the main access path with `EXPLAIN ANALYZE`. The index improved selective reads, but it also increased storage and write cost.

Essa explicação apresenta decisão, evidência e custo. É mais forte que listar ferramentas.

## O que você deve levar deste ciclo

Persistência não é a última camada do backend. Ela participa do comportamento do sistema. Chaves, tipos e constraints protegem a verdade; transações e níveis de isolamento coordenam mudanças concorrentes; índices e planos de execução revelam o custo dos acessos.

Você terá concluído o E004 quando conseguir modelar um caso pequeno, provocar inconsistências e conflitos, explicar por que o banco os aceita ou rejeita e demonstrar uma melhoria com dados. O resultado final deve ser avaliável sem conversa privada: repositório público, migrations reproduzíveis, testes em CI, planos registrados, README bilíngue e um artigo ou vlog que reconheça os limites do experimento.

## Referências primárias

- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL — Explicit Locking and Deadlocks](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL — Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL — Multicolumn Indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html)
- [PostgreSQL — Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [PostgreSQL — CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)
- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [node-postgres — Queries](https://node-postgres.com/features/queries)
- [node-postgres — Transactions](https://node-postgres.com/features/transactions)
