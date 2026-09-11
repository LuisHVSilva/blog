# Use cases, serviços e persistência editorial

## Escopo implementado

O padrão abrange as consultas públicas e os fluxos editoriais de validação, importação, publicação, retirada, arquivamento, restauração e exportação. A leitura de revisão usada pelo seed local também passa por um use case. As CLIs mantêm os comandos e argumentos existentes.

```text
Controller / CLI
  → I...UseCase / ...UseCase.execute(payload)
    → I...Service / ...Service
      → I...Repository / ...Persistence
        → Model ORM ↔ Mapper ↔ Entidade imutável
```

## Responsabilidades

- **Use case:** recebe serviços pelo construtor e orquestra a operação; não importa repositórios, Sequelize, SQL ou detalhes HTTP.
- **Serviço:** valida o domínio e usa contratos para comunicação externa. PublicationService coordena a operação editorial; CatalogService coordena autores, taxonomias e relacionamentos; SnapshotService monta o documento público.
- **Repositório de escrita:** manipula um único model. Artigo, tradução, autor, tag, tradução de tag, série, tradução de série, relações, caminho, edição e revisão têm implementações separadas.
- **Repositório de consulta:** possui uma projeção pública principal. Joins servem para filtros e projeções de leitura, não para escrever vários modelos. Paginação e filtros permanecem no PostgreSQL.
- **Entidade:** protege seu estado com cópias defensivas e métodos. Article/ArticleTranslation mantêm as transições editoriais existentes. As entidades de catálogo e ledger não expõem models Sequelize.
- **Mapper:** converte model/entidade e extrai somente as propriedades persistidas. Identidades derivadas de chaves compostas não viram colunas artificiais.
- **Controller/CLI:** interpreta transporte, monta o payload, chama o use case e apresenta o resultado. O lifecycle da conexão fica na composição/adaptação, não no use case.

## Use cases

| Fluxo | Classe |
| --- | --- |
| Lista e detalhe de artigos | ListArticlesUseCase, GetArticleUseCase |
| Tags e séries | ListTagsUseCase, ListSeriesUseCase, GetSeriesUseCase |
| Validação de conteúdo | ValidateContentUseCase |
| Importação | ImportContentUseCase |
| Publicação e retirada | PublishArticleUseCase, UnpublishArticleUseCase |
| Arquivamento e restauração | ArchiveArticleUseCase, RestoreArticleUseCase |
| Exportação | ExportSnapshotUseCase |
| Revisão editorial atual | GetEditorialRevisionUseCase |

Cada implementação possui sua própria interface, derivada de `IUseCase<Input, Output>`, em `modules/publishing/application/useCases/`.

## Injeção e contratos

`PublishingQueriesComposition` monta as consultas públicas. `EditorialComposition` monta os serviços e use cases editoriais. A injeção é por construtor, sem container global. Serviços recebem interfaces; relógio, hash e unidade de trabalho também são substituíveis.

A referência Rolay forneceu o contrato genérico e a organização por interface/classe. Ao contrário dos acessos diretos de alguns use cases da referência a repositórios, aqui prevalece a regra solicitada: **use cases recebem serviços**. Os campos IAM de RequestedDefaultProperties não foram copiados: os comandos editoriais possuem operador, revisão e motivo explícitos.

Tipos e erros independentes de transporte ficam no domínio. Os antigos arquivos de DTO/erros de aplicação reexportam esses contratos para preservar os consumidores. As funções livres de aplicação para importar, exportar, validar, listar e consultar artigos foram substituídas por classes.

## Garantias preservadas

- Uma edição mantém dados, caminhos, ledger e revisão na mesma transação.
- O lock da revisão serializa escritores. Revisão esperada incorreta é rejeitada; repetição idempotente preserva o resultado.
- Dry-run não grava dados nem ledger. Operações de visibilidade exigem identificação e motivo.
- Aliases publicados são preservados; um caminho não transfere sua propriedade para outra tradução.
- AuthorProfile, Tag, SeriesDefinition e PublicationRevision usam EntityAuditBase nos timestamps existentes; entidades sem auditoria própria usam EntityBase. PublicationEdition é um registro imutável com appliedAt explícito.
- Exportação usa uma única transação REPEATABLE READ. Além da opção readOnly do ORM, executa SET TRANSACTION READ ONLY para impedir escrita no PostgreSQL.
- Não houve mudança de schema, migrations numeradas, endpoint, formato de snapshot ou argumentos das CLIs.

Os adapters monolíticos PublicationPersistence, CatalogPersistence e PublicArticlePersistence foram removidos, assim como seus contratos agregados antigos. Não ficaram como wrappers escondidos no fluxo novo.

## Testes

Os testes unitários verificam delegação por interface, validação antes da persistência, erros, auditoria imutável, propriedade de slugs e escopo de snapshot. A integração verifica o catálogo real, todas as rotas públicas, transições, alias, CAS concorrente, rollback após escrita parcial, manutenção da revisão durante leitura concorrente e rejeição de escrita no snapshot.

O lint impede infraestrutura nas camadas internas, repositórios/ports nos use cases e funções livres nas pastas novas de use cases, serviços e entidades. Para reproduzir: subir o PostgreSQL de teste, configurar TEST_DB_* e MIGRATOR_DB_* e executar `npm run ci` em backend.

### Validação final — 11/09/2026

`npm run ci` passou com **64/64 testes**, lint, typecheck e build, incluindo instalação limpa pelo lockfile. As migrations numeradas permaneceram sem alterações. Houve uma execução anterior com 63/64; a repetição completa passou sem alterar ou enfraquecer os testes existentes.
