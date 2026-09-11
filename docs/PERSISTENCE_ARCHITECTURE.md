# Persistência editorial: models, interfaces, repositórios e mappers

## Responsabilidades

Os fluxos públicos e editoriais estão separados em use cases, serviços e repositórios por modelo. Consulte [arquitetura de use cases](./USE_CASE_ARCHITECTURE.md). Os três adapters monolíticos antigos foram removidos; exportação e comandos editoriais usam a composição nova.

A organização foi adaptada da persistência do Rolay, mantendo as regras do blog e suas entidades imutáveis. Um model representa uma tabela; não é a entidade de domínio nem o DTO de uma resposta HTTP.

```text
modules/publishing/
  domain/
    article.ts                          entidades e regras
    repositories/                       contratos específicos por model
    entities/                           entidades de catálogo, relações e ledger
    services/                           regras e coordenação editorial
  application/useCases/                 interfaces e classes de casos de uso

infrastructures/persistence/
  ORM/
    base/                               BaseModel, BaseCreatedModel, BaseAuditModel
    decorators/dbColumn.ts              @DbColumn: tipo explícito e campo snake_case
    models/                             12 classes @Table
    modelRegistry.ts                    registro explícito por conexão
    context/                            contexto transacional isolado
    unitOfWork/                         início, commit, rollback e composição
    migrations/migrationService.ts      integração com o executor de migrations
  adapters/                             implementações dos contratos
  mappers/                              conversões explícitas, sem I/O
```

`src/infrastructures/database.ts` continua responsável pelo ciclo de vida da conexão. Agora usa `Sequelize` de `sequelize-typescript`, registra `editorialModels` e habilita `repositoryMode`. Não há segundo singleton de conexão. Dois ambientes/conexões recebem repositórios de models distintos, sem sobrescrever a conexão de classes estáticas compartilhadas.

## Como ler o fluxo

1. A CLI recebe os use cases montados por EditorialComposition; as rotas recebem os de PublishingQueriesComposition.
2. O use case chama uma interface de serviço. PublicationService coordena validações, serviços de entidade, CAS, ledger e unidade de trabalho.
3. Cada repositório de escrita usa sequelize.getRepository para um único model. Interfaces de domínio não contêm tipos do ORM.
4. Mappers convertem models em entidades imutáveis e extraem somente as colunas reais para a gravação.
5. Todos os repositórios de uma operação compartilham o PersistenceContext injetado. Escritas sem unidade de trabalho são recusadas.
6. CatalogService coordena serviços de autor, tag, série e edição dos relacionamentos. Não executa SQL nem instancia models.
7. SnapshotService combina os serviços de consulta pública, caminhos e revisão dentro de ReadSnapshotUnitOfWork. O documento exportado não contém models ou instâncias de entidade.

Consultas públicas mantêm SQL parametrizado nas persistências de leitura. Locks, upserts e gerenciamento transacional ficam na infraestrutura; conflitos e decisões editoriais ficam nos serviços/entidades.

## Models e auditoria

Models usam `@Table`, `@DbColumn`, `@ForeignKey` e `@BelongsTo`, com tipos explícitos e `declare`, evitando campos JavaScript que ocultariam os accessors do Sequelize. UUIDs continuam strings; tabelas associativas têm suas PKs compostas, sem `id` numérico artificial.

`BaseModel` não adiciona colunas. `BaseCreatedModel` declara somente `createdAt`; `BaseAuditModel` acrescenta `updatedAt` para tabelas que possuem ambas. Traduções declaram explicitamente seu `updatedAt`, porque não possuem `createdAt` no schema. Nenhuma tabela recebe FKs para usuários inexistentes. Ator/motivo da edição continuam em `publication_editions`.

Todos os models usam `timestamps: false`: os horários editoriais vêm da operação e do schema, não de hooks automáticos do ORM. Não adicionar `updatedAt`, `createdBy` ou `updatedBy` a uma base sem antes avaliar as entidades e escrever a migration correspondente.

## Transações

`PersistenceContext` usa `AsyncLocalStorage` por instância de composição, sem estado global de usuário ou container DI. Consultas de entidade participam da transação corrente; leituras nela usam lock quando necessário. `UnitOfWork.execute` aninhado reutiliza a transação. Falha aninhada marca rollback obrigatório, mesmo se o chamador capturar o erro. Ao encerrar a execução, o contexto não vaza para outra requisição.

ReadSnapshotUnitOfWork mantém REPEATABLE READ e executa SET TRANSACTION READ ONLY no PostgreSQL, além da opção readOnly do ORM. O teste de integração comprova que uma revisão permanece estável mesmo após outro escritor fazer commit e que uma escrita no snapshot é recusada.

A abertura da unidade de trabalho é explícita no serviço coordenador, em vez de copiar o decorator `Transactional` do Rolay que resolve dependências de um container global. O decorator de model `DbColumn` está implementado e efetivamente utilizado. Nenhum decorator de infraestrutura é importado pelo domínio.

## Migrations: única autoridade de DDL

As migrations numeradas em `backend/migrations/` foram preservadas, incluindo versões e conteúdo. Uma refatoração de classes não exige alteração de tabelas nem reescrita de migration aplicada. `MigrationService` integra o executor existente ao diretório da persistência; o comando `migrate` continua usando credenciais de migrador, lock, checksum e ledger.

O registro de models não chama `sync`, `alter` ou `force`. Constraints diferidas, índices parciais, grants e triggers permanecem nas migrations: não devem ser simplificados para caber nos decorators. A API continua sem DDL. Mudanças futuras de schema exigem uma nova migration incremental, atualização do model/mapper e teste de compatibilidade.

## Testes e reprodução

Validação da separação editorial em 11/09/2026: `npm run ci` aprovado com 64/64 testes, lint, typecheck e build. O fluxo cobre comandos por use cases, repositórios por model, CAS concorrente, rollback parcial e snapshot efetivamente somente leitura.

Em backend, subir `docker compose -f docker-compose-test.yml up -d --wait postgres`, configurar as variáveis `TEST_DB_*`/`MIGRATOR_DB_*` locais e executar `npm run ci`. O ambiente PostgreSQL de teste usa porta 15432 e banco `blog_test_migrations`, sem alterar o banco editorial local.

`e05-persistence-architecture.test.ts` verifica decorators, chaves compostas, isolamento dos models por conexão, mappers, propriedades imutáveis e contexto concorrente. `e07-publication-flow.test.ts` mantém os testes de publicação/CAS/retirada e acrescenta comparação dos 12 models com colunas, tipos, nulabilidade e PKs das migrations, round-trip real, associações, rollback e importação do catálogo real pelos models.

O fluxo Compose completo e o smoke API/HTML continuam usando a mesma revisão editorial. Os arquivos antigos de adapters/model registration em `modules/publishing/adapters/postgres` foram substituídos pelos adapters e models acima; não há duas implementações de persistência ativas.

Evidência histórica anterior à separação dos serviços, em 10/09/2026: `npm run ci` passou com 53/53 testes, lint, typecheck e build. A instalação limpa pelo lockfile também passou. Compose reconstruído com Node 22.23.2 e smoke API/HTML aprovados para as oito traduções da revisão `local-f4c91cc17c72f8194ab292139c120f68a175a6548937deec2562e1658fae2f8d`.

Observação de dependências: `sequelize-typescript` e `reflect-metadata` estão no lockfile. O audit aponta a cadeia já vulnerável Sequelize/uuid (agora também refletida no wrapper); não foi aplicado downgrade incompatível com `audit fix --force`. Esse risco continua registrado para tratamento antes de produção.
