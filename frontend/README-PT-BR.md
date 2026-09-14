# Frontend do Blog

[Read in English](./README.md)

O Frontend do Blog é o site público e localizado de leitura de uma biblioteca aberta de programação. Ele valida um snapshot de conteúdo publicado durante o build e pré-renderiza HTML estático e indexável para pt-BR e en.

Este diretório contém exclusivamente a aplicação frontend. Ela consome generated/published-content.json; não consulta API no navegador nem inclui dados editoriais ou privados no site publicado.

## O que entrega

- Páginas estáticas de artigos, tags, séries, arquivo e páginas institucionais em português e inglês.
- URLs canônicas, links de idiomas alternativos, metadados Open Graph, JSON-LD, sitemap.xml, robots.txt e 404.html estático real.
- Redirects permanentes (308) de raiz e aliases de artigos, gerados como include do Nginx.
- Índices de catálogo localizados e validados para busca e filtros no cliente, sem Markdown de artigos.
- Renderização segura de Markdown GFM, sumário gerado, sem HTML cru e com bloqueio de protocolos executáveis em links.
- Navegação responsiva e acessível, suporte a teclado e tema claro/escuro/sistema que continua útil sem JavaScript.
- Artefatos imutáveis de release com manifesto, hashes de arquivos, digest do snapshot e promoção/rollback atômicos protegidos.

## Escopo

Este é um frontend público e somente leitura. Não há contas, login, comentários, reações, envio de contato, newsletter, analytics ou interface administrativa. A preferência de tema pode ser guardada somente no navegador, na chave blog.theme.

O frontend não importa Markdown editorial diretamente, não publica conteúdo, não mantém banco de dados e não expõe API. Sua entrada é o snapshot já publicado, montado ou gravado em generated/published-content.json.

## Arquitetura

~~~text
published-content.json
          |
          +--> validação Zod --> build Vite do cliente + build SSR React
                                                 |
                                                 +--> HTML pré-renderizado, metadados, sitemap,
                                                      índices de busca, redirects, manifesto
                                                      e registro de integridade
                                                                    |
                                                                    +--> artefato imutável de release
                                                                         --> current --> Nginx
~~~

O React renderiza páginas durante o build. A pequena entrada do navegador aprimora as páginas já renderizadas com tema, navegação, busca e filtros; ela não monta a aplicação nem transfere o snapshot completo ao cliente.

## Requisitos

- Node.js **22.23.2**.
- npm, distribuído com o Node.js.
- Um snapshot válido em generated/published-content.json para npm run build ou npm run release:build.
- Chromium para testes de navegador (npx playwright install chromium).
- Docker Desktop/Compose somente para o teste de hospedagem Nginx do release ou a stack local integrada do workspace.

## Início rápido

Dentro de frontend/:

~~~bash
npm ci
npm run build
npm run preview
~~~

Antes do build, disponibilize um snapshot público válido em generated/published-content.json. npm run build verifica TypeScript, cria os bundles Vite do cliente e SSR e pré-renderiza o site em dist/; npm run preview serve essa saída localmente. npm run dev é útil para trabalhar em componentes, mas não executa a pré-renderização de produção.

Para o workspace local completo, execute o Compose na raiz. Ele fornece o snapshot, promove o artefato de release e serve o site via Nginx:

~~~bash
docker compose up --build
~~~

O site local fica disponível em http://localhost:8080.

## Entrada de build e configuração

O snapshot é analisado pelo schema Zod do frontend. Ele deve usar a versão 1 do schema e conter revisão, origem do site, artigos/tags/séries públicos localizados, catálogo de URLs canônicas e redirects válidos. Entrada inválida ou inconsistente faz o build falhar, em vez de gerar um site parcial.

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| FRONTEND_SNAPSHOT_PATH | Não | Caminho do snapshot; padrão generated/published-content.json. |
| FRONTEND_BUILD_OUT_DIR | Não | Diretório de saída cliente/estática; padrão dist/. |
| FRONTEND_SSR_OUT_DIR | Não | Diretório temporário do bundle SSR; padrão .ssr/. |
| FRONTEND_RELEASE_ROOT | Em operações de release | Diretório com releases/ e o ativo current; padrão /release. |
| FRONTEND_RELEASE_APPROVED_REVISION | Ao reconstruir release anterior | Revisão exata explicitamente autorizada para promoção. |

Para um build isolado:

~~~bash
FRONTEND_SNAPSHOT_PATH=/caminho/para/published-content.json npm run build
~~~

## Comportamento publicado

- Rotas usam /{locale}/..., com suporte a pt-BR e en.
- Arquivos paginam 12 artigos por idioma. Tags, séries e about, privacy, contact e security são geradas nos dois idiomas.
- Aliases de artigos e rotas de raiz por idioma fazem redirect permanente. Nginx lê redirects.conf gerado e preserva query strings.
- Toda página indexável recebe links canônico e alternates, metadados localizados, campos Open Graph, JSON-LD e entrada no sitemap.
- Índices de catálogo localizados compartilham a revisão de publicação do HTML e não contêm corpos de artigos.
- Markdown usa remark-gfm; HTML cru não é renderizado e protocolos inseguros são rejeitados.
- O tema inicializa antes da primeira pintura e recorre à preferência do sistema quando storage ou JavaScript não estão disponíveis.

## Comandos

| Comando | Descrição |
| --- | --- |
| npm run dev | Inicia o Vite; não pré-renderiza o site completo. |
| npm run build | Verifica tipos, gera bundles cliente/SSR, valida snapshot e pré-renderiza dist/. |
| npm run preview | Serve localmente o build estático. |
| npm run release:build | Gera, valida, sela e promove atomicamente um artefato de release. |
| npm run release:promote | Valida e promove explicitamente um artefato autorizado existente. |
| npm run lint / npm run typecheck | Executa ESLint ou verificações dos projetos TypeScript. |
| npm test | Executa sequencialmente as suítes unitária, integração e navegador. |
| npm run test:unit / test:integration / test:browser | Executa a suíte escolhida. |
| npm run test:host | Verifica a hospedagem de release com Nginx e Docker. |

## Artefatos de release e rollback

npm run release:build grava um artefato versionado em FRONTEND_RELEASE_ROOT/releases/. Ele inclui páginas pré-renderizadas, publication.json, sitemap.xml, robots.txt, redirects.conf, índices de catálogo localizados e integrity.json. O registro de integridade vincula hashes de arquivos e o digest do snapshot à revisão de publicação.

Somente após validar todos os arquivos, a operação aponta current ao artefato; uma falha preserva o release ativo anterior. Uma correção somente de frontend pode gerar outro artefato para a mesma revisão editorial.

Para promover ou restaurar explicitamente um artefato existente, informe a revisão solicitada e a aprovada. Se houver vários artefatos para uma revisão, inclua o diretório exato exibido pelo build:

~~~bash
FRONTEND_RELEASE_ROOT=/release npm run release:promote -- \
  --revision <revisao> \
  --approved-revision <mesma-revisao> \
  --artifact <diretorio-do-artefato>
~~~

Após alterar current em um Nginx em execução, verifique e recarregue-o para ler os novos redirects:

~~~bash
docker compose exec -T web nginx -t
docker compose exec -T web nginx -s reload
~~~

Não promova um artefato sem que a revisão de snapshot esteja aprovada para exposição pública.

## Verificação

~~~bash
npx playwright install chromium
npm run typecheck
npm run lint
npm test
~~~

Os testes usam snapshots sintéticos versionados e cópias temporárias isoladas do frontend, preservando o snapshot de trabalho e dist/. A cobertura inclui validação de snapshot, rotas, metadados, política de Markdown, projeções de artigos, busca, navegação de arquivo/série, builds estáticos, integridade/promoção de release e comportamento no navegador em ambos idiomas, temas, tamanhos de viewport, navegação por teclado, storage negado e JavaScript desligado.

Com Docker disponível:

~~~bash
npm run test:host
~~~

Ele verifica a hospedagem Nginx do release, incluindo ativação atômica, aliases, caminhos removidos e rollback explicitamente autorizado.

## Estrutura do repositório

~~~text
frontend/
├── src/                 páginas React, renderização, rotas, validação de conteúdo, SEO e UI
├── public/              ativos estáticos, incluindo inicialização antecipada de tema
├── scripts/             build, pré-renderização, selo de release, promoção e executor de testes
├── tests/               testes unitários, integração, navegador, host e fixtures de snapshot
├── generated/           diretório ignorado de entrada para published-content.json
├── dist/                saída estática ignorada do build
├── Dockerfile.local     imagem local do gerador de release
└── vite.config.ts       configuração Vite e caminho do snapshot
~~~

## Licença e contribuições

A licença e a política de contribuição na raiz do repositório regem este frontend. Alterações em páginas públicas devem atualizar os testes pertinentes e manter URLs geradas, metadados, redirects, catálogos localizados e validação de release consistentes.
