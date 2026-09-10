# Auditoria do frontend

Data: 8 de setembro de 2026. Escopo: arquivos presentes no workspace, não uma versão presumida do repositório remoto. Nenhum código da aplicação foi alterado nesta etapa.

Documentos relacionados: [backend](BACKEND_ARCHITECTURE.md), [SEO e crescimento](GROWTH_SEO_STRATEGY.md) e [ordem de execução](ROADMAP.md).

## 1. Conclusão e definição do produto

O produto proposto é uma biblioteca educacional aberta de programação, com artigos traduzidos, trilhas de leitura e, em uma segunda entrega, participação da comunidade. O portfólio será uma consequência de conteúdo útil, decisões documentadas e software confiável. Não é necessário construir uma rede social, um LMS completo ou um CMS comercial para demonstrar essas capacidades.

O frontend atual é uma base editorial aproveitável, mas ainda não está pronto para um lançamento focado em descoberta orgânica. Há quatro artigos reais, em português e inglês, misturados a dados demonstrativos. O problema principal não é React: são a renderização exclusivamente no navegador, as rotas manuais, a ausência de URLs efetivas por idioma e as inconsistências do conteúdo.

**Recorte recomendado:** MVP editorial público com leitura, arquivo, tags e séries reais, páginas institucionais, publicação confiável e SEO. Contas, curtidas, comentários e views públicas compõem a primeira evolução da comunidade. Essa é uma proposta de faseamento para publicar rapidamente, não uma conclusão de que as interações são dispensáveis no produto final. Se todas as interações forem exigidas no primeiro lançamento, as tarefas da Fase 3 do roadmap passam a bloquear esse lançamento, incluindo moderação e privacidade.

## 2. Método e evidências

Foram lidos o roteamento, os providers, todas as páginas, os componentes do catálogo e de leitura, layout, busca, configuração, estilos relevantes e a estrutura dos oito arquivos Markdown. Os conteúdos foram inspecionados quanto a metadados, headings, links e relação com o renderizador; isto não é uma revisão técnica integral da correção de cada artigo.

Verificações executadas:

| Verificação | Resultado | O que demonstra |
| --- | --- | --- |
| `npm run build`, em `frontend` | Passou | O projeto compila e gera assets |
| `npm run lint`, em `frontend` | Passou | As regras ESLint atuais passam |
| Inspeção de `frontend/dist/index.html` gerado | Apenas shell, scripts e metadados genéricos; `#root` vazio | O build atual não gera HTML de cada artigo |
| Bundle principal no build | JS 421,08 kB / 132,89 kB gzip; CSS 41,11 kB / 6,76 kB gzip | Baseline local; não é medição de tempo de carregamento |
| Inspeção de Git | Reorganização extensa já em andamento | As mudanças existentes pertencem ao usuário e foram preservadas |

Não foram executados testes visuais em navegador, leitor de tela, Lighthouse, axe ou medições de Core Web Vitals em produção. Responsividade e acessibilidade abaixo são avaliações do código; contraste, sobreposição e comportamento em dispositivos precisam de validação real. Nenhuma nota de performance ou conformidade WCAG é presumida. Saídas iniciais do PowerShell exibiram acentos incorretos; a leitura UTF-8 confirmou os textos. Isso não foi tratado como defeito de encoding do produto.

## 3. Estrutura e decisões já existentes

```text
frontend/
  artigo/                         oito fontes Markdown, quatro pares PT/EN
  src/
    App.tsx                       switch manual sobre pathname
    main.tsx                      createRoot, renderização no cliente
    content/articles.ts           importação raw, parsing, catálogo e metadados
    content/demo-content.ts       dados demonstrativos antigos
    features/articles/            home, arquivo e detalhe
    features/site-demo/           categorias, séries, projetos e busca
    components/layout/            header, footer, container
    components/ui/                Button e Icon
    components/style/             Sass global, tokens e estilos de páginas
    i18n/                         Context e seleção PT-BR/EN
    theme/                        Context e tema persistido
```

Stack declarada: React 19, TypeScript, Vite, Sass e ESLint. Não há router de biblioteca, cliente HTTP, biblioteca Markdown, framework de testes ou integração de autenticação declarados no frontend. Context API administra somente preferências; isso é adequado e não justifica Redux.

### Páginas e fluxos verificados

| URL atual | Implementação | Situação |
| --- | --- | --- |
| `/` | `ArticlesPage` | Home com destaques reais, categorias, série, projeto fictício e newsletter simulada |
| `/artigos` | `ArticlesArchivePage` | Busca local, categoria e dificuldade funcionam; paginação é decorativa |
| `/article/backend-architecture-ts-node-foundation` | `ArticleDetailPage` | Rota existe, mas o slug retornado pelo conteúdo não corresponde aos links gerados |
| `/article/nodejs-por-baixo-do-framework` | `ArticleDetailPage` | Artigo em ambos os idiomas na mesma URL |
| `/article/ts-config-explanation` | `ArticleDetailPage` | Artigo em ambos os idiomas na mesma URL |
| `/article/js-ts-demystified` | `ArticleDetailPage` | Artigo em ambos os idiomas na mesma URL |
| `/categories` | `CategoriesPage` | Agrupamento de catálogo, inclui placeholders |
| `/series` | `SeriesPage` | Agrupamento por string, sem ordem pedagógica própria nem página individual |
| `/projects` | `ProjectsPage` | Estado vazio honesto; não há projetos publicados |
| Qualquer outra URL | `default` de `App.tsx` | Exibe a home; não há página 404 |

Navegação usa links HTML e recarregamento de documento, não History API com router. Isso não é, isoladamente, um defeito. Header abre busca com Ctrl/Cmd+K, permite tema/idioma e menu móvel. Busca usa lista fixa de destinos em português. No arquivo, tecnologias preenchem a busca textual; não são um filtro exato por tag.

Entidades inferíveis: artigo localizado, categoria textual, tag textual, série textual, dificuldade e preferência de tema/idioma. Autores, usuários, comentários, likes, views, progresso, requisitos e um cadastro de projetos **não estão implementados** nesses fluxos. Não deduzir banco ou endpoints a partir de botões decorativos.

## 4. O que manter

| Elemento | Justificativa |
| --- | --- |
| Organização de artigos por feature | Boa separação inicial entre página e componentes específicos |
| `Container`, `SiteHeader`, `SiteFooter`, `Button`, `Icon` | Reutilização suficiente para o tamanho atual |
| Tokens Sass, CSS custom properties e temas | Preservam consistência visual e facilitam ajustes |
| Conteúdo em Markdown versionado | Excelente para correções, traduções e revisão por pull request |
| Índice do artigo e estimativa de leitura | Ajudam a estudar textos longos; corrigir sua derivação |
| Links reais com `href` | Favorecem navegação padrão, abrir em nova aba e descoberta |
| Semântica `main`, `article`, `nav`, `fieldset` e estados ARIA existentes | Base útil; não equivale a acessibilidade concluída |
| ESLint e build TypeScript | Manter no CI, complementando com verificações comportamentais |
| Estado vazio em projetos | Melhor base para ausência real de conteúdo; ocultar do menu até ter utilidade |

## 5. Problemas com caminho, impacto e recomendação

P0 bloqueia o lançamento editorial recomendado; P1 pertence à primeira evolução; P2 depende de uso real. Os caminhos da tabela são relativos à raiz do repositório.

| ID / prioridade | Arquivo e evidência | Problema e impacto | Recomendação / classificação |
| --- | --- | --- | --- |
| F01 / P0 | `frontend/src/App.tsx`, `resolvePage` | Rotas literais para cada artigo; URL desconhecida renderiza home. Novo artigo exige mudar código e erros podem virar soft 404 no host | **Melhorar:** rota parametrizada e 404 real na hospedagem |
| F02 / P0 | `frontend/artigo/backend-architecture-ts-node-foundation/*.md`, campo `slug`; `frontend/src/content/articles.ts` | PT usa `arquitetura-backend-base-ts-node` e EN usa `backend-architecture-ts-node-foundation`, ambos sem `/article/`. Cards usam isso diretamente em `href`. Na home o PT leva a `/arquitetura-backend-base-ts-node`, que cai na home; o EN também não coincide com a rota registrada | **Melhorar:** separar identificador, slug localizado e URL gerada centralmente; validar todo link |
| F03 / P0 | `frontend/src/i18n/i18n.data.ts`, `I18nContext.tsx`, `frontend/src/App.tsx` | Resolver reconhece prefixo de idioma, mas router não o consome. `/en/article/js-ts-demystified` vira home. Troca de idioma altera estado, não URL | **Melhorar:** locale da URL como autoridade e links para traduções efetivas |
| F04 / P0 | `frontend/index.html`, `frontend/src/main.tsx`, `frontend/vite.config.ts` | HTML inicial sem artigo, title `blog`, descrição única, idioma inicial `en`, sem canonical, alternates, OG ou JSON-LD | **Adicionar:** HTML por URL e metadata derivada do conteúdo |
| F05 / P0 | `frontend/src/features/articles/components/article-detail/MarkdownArticle.tsx`, `parseBlocks` | Todo heading `# ` é descartado, não apenas um título duplicado. Há 20 headings desse nível no arquivo de arquitetura PT e 32 no JS/TS PT, contando inclusive exemplos em fences; vários são seções reais | **Melhorar:** parser mantido e normalização editorial da hierarquia; preservar seções |
| F06 / P0 | Mesmo renderizador, `Block` e `Inline` | Não suporta tabelas GFM, imagens, listas aninhadas e vários inline cases. Tabela real de JS/TS vira texto. Regex de itálico exige espaço e não há renderização semântica de itálico | **Melhorar:** parser Markdown/GFM com HTML cru desabilitado e política de URLs |
| F07 / P0 | Mesmo renderizador e `frontend/src/content/articles.ts`, `getArticleHeadings` | TOC e HTML têm slugifiers separados; TOC não limpa inline markup como o renderer nem ignora fences. Headings iguais podem gerar IDs duplicados | **Melhorar:** derivar texto, headings e âncoras da mesma AST, com sufixos únicos |
| F08 / P0 | Mesmo renderizador, `omittedHeadings` e filtro de blockquotes | Remove leituras sugeridas/relacionadas por texto; perde ligações educacionais e editoriais | **Remover:** ocultação implícita; revisar links quebrados no conteúdo em vez de apagar seções durante renderização |
| F09 / P0 | `frontend/src/features/articles/pages/ArticlesPage.tsx`, `onSubmit` | `setSubscribed(true)` exibe sucesso sem enviar nem salvar email | **Remover:** formulário na publicação inicial. Newsletter real somente com entrega, confirmação e descadastro |
| F10 / P0 | `frontend/src/features/articles/pages/ArticlesArchivePage.tsx`, `archive-pagination` | Páginas 2, 3, 12 e avançar não possuem comportamento | **Remover:** controles até haver paginação; posteriormente links reais e estado na URL |
| F11 / P0 | `frontend/src/features/articles/pages/ArticlesPage.tsx`, card de série | Anuncia Fundamentos de TypeScript, aponta `published[1]` (Node.js) e conta todos os quatro publicados | **Melhorar:** consultar série por ID, contar membros publicados e apontar primeiro item ordenado |
| F12 / P0 | `frontend/src/content/articles.ts`, placeholders; `frontend/src/features/site-demo/pages/SitePages.tsx` | Arquivo/categorias/séries incluem exemplos. O catálogo aparenta mais conteúdo do que existe | **Remover:** placeholders da publicação; manter somente em fixtures locais se úteis |
| F13 / P0 | `frontend/src/features/articles/pages/ArticlesArchivePage.tsx`, estado `category` | Estado inicial guarda texto traduzido `Todos os artigos`; ao mudar para EN, comparação espera `All articles`, podendo zerar resultados | **Melhorar:** `categoryId: null` para todos; IDs independentes do idioma |
| F14 / P0 | `frontend/src/features/site-demo/components/SearchModal.tsx` | Lista fixa em PT, descrições antigas de conteúdo fictício, sem catálogo completo sincronizado, sem mensagem vazia | **Melhorar:** mesmo catálogo localizado do arquivo; busca simples basta inicialmente |
| F15 / P0 | Mesmo modal e `frontend/src/components/style/SearchModal.scss` | Dialog sem nome acessível, input sem label explícito, sem confinamento/restauração de foco ou fundo inerte; input remove outline | **Melhorar:** dialog acessível, título, label, Escape, ciclo de Tab e retorno ao disparador |
| F16 / P0 | `frontend/src/components/layout/SiteFooter.tsx` | Privacidade, segurança e open source apontam `#top`; GitHub aponta raiz do serviço | **Melhorar:** destinos reais; ocultar status e terminal sem propósito |
| F17 / P0 | `frontend/src/features/articles/pages/ArticleDetailPage.tsx` e `frontend/src/content/articles.ts` | Sem autor público, datas no detalhe, contexto da série, próxima leitura confiável; datas do catálogo são strings já formatadas | **Adicionar:** metadata editorial consistente, datas ISO na fonte, `time dateTime`, autoria e trilha |
| F18 / P0 | `frontend/src/content/articles.ts`, `parseArticle` | Parser regex tolera frontmatter inválido com título/slug padrão; tags suportam formatos limitados | **Melhorar:** YAML/frontmatter validado; falha editorial explícita no build/importação |
| F19 / P0 | `frontend/src/features/articles/pages/ArticlesPage.tsx`, `toEditorial` | Acesso direto a índices 0 e 1 pressupõe pelo menos dois artigos; API vazia ou falha causará erro | **Melhorar:** composição por dados presentes, estado vazio/erro e destaque opcional |
| F20 / P0 | `frontend/src/features/articles/components/articles-index/EditorialArticleCard.tsx`; imagens em `ArticlesPage.tsx` | Duas imagens remotas fixas, sem `width`/`height`, `srcset` ou política de loading; disponibilidade e direitos não verificados | **Melhorar:** assets com origem/licença conhecidas e tamanhos adequados. `alt=""` pode estar correto se a imagem for decorativa |
| F21 / P0 | `frontend/tsconfig.app.json` | Não habilita `strict`; o config raiz apenas referencia projetos | **Melhorar:** habilitar e resolver os problemas reais, sem suprimir com casts |
| F22 / P1 | `frontend/src/features/articles/components/articles-archive/ArchiveArticleCard.tsx`; `SitePages.tsx` | Dificuldade exibe enum inglês em PT; links `Ler artigo` e placeholders permanecem em PT em EN; grupos e cards repetem h2 | **Melhorar:** dicionário de UI e hierarquia h2/h3 por contexto; strings visíveis do MVP são P0 |
| F23 / P1 | `frontend/src/features/articles/pages/ArticlesArchivePage.tsx` | Busca/filtros só em memória; recarregar ou compartilhar perde estado. `useMemo` recebe catálogo recriado | **Melhorar:** parâmetros de URL; simplificar memo antes de otimizar |
| F24 / P1 | `frontend/src/theme/ThemeContext.tsx`, `frontend/src/i18n/I18nContext.tsx` | Leitura de localStorage pode falhar; defaults do servidor divergem dos do navegador em SSG/SSR | **Melhorar:** tolerância a storage indisponível; primeiro render determinístico, locale por rota e estratégia de tema sem mismatch |
| F25 / P2 | `frontend/src/features/site-demo/components/DemoComponents.tsx`, `frontend/src/content/demo-content.ts` | Exports de demonstração não têm consumidores de produção encontrados | **Remover:** após confirmar imports no momento da edição; não confundir com `SitePages.tsx`, que tem páginas reais |
| F26 / P1 | `frontend/README.md`, `frontend/LICENSE`, `frontend/.gitignore` | README não lista os quatro detalhes atuais; licença está só em frontend; ignora `/docs` apenas dentro do frontend | **Melhorar:** documentação na raiz, escopo de licença explícito e comandos com diretório correto |

Não foi demonstrada uma exploração XSS no renderer atual. Ele produz elementos React e não usa `dangerouslySetInnerHTML`, o que evita a injeção direta de HTML em texto. Ainda assim, validar protocolos de links e adotar uma política segura é necessário antes de aceitar conteúdo externo ou comentários; não tratar escape de texto como sanitização universal.

## 6. Organização recomendada, sem reconstruir o layout

Manter components de layout/UI, feature de artigos, Sass e providers. Quando implementar o roadmap, mover páginas reais de `site-demo` para `features/series`, `features/tags` e uma página institucional se necessária. Consolidar shell no layout do router. Colocar os estilos específicos próximos das features gradualmente; não transformar movimentação de arquivos em pré-requisito de lançamento.

Separar três responsabilidades hoje reunidas em `content/articles.ts`:

1. Fonte editorial e validação, executadas no importador/build, fora do bundle do navegador.
2. Contrato de leitura (`ArticleSummary`, `ArticleDetail`, `SeriesDetail`) vindo da API.
3. Apresentação: formatos de data, labels, cards e seleção de idioma.

Usar IDs estáveis para tags/séries; slugs e nomes são localizados. Não importar models Sequelize no frontend. OpenAPI deve descrever o contrato público; tipos podem ser gerados quando isso reduzir divergência. Não criar um pacote compartilhado de domínio, um design system independente ou microfrontends agora.

O parser deve renderizar Markdown comum/GFM. MDX de contribuições executa código e amplia a confiança necessária: não recomendá-lo para artigos de terceiros no MVP. Escolher biblioteca mantida durante a implementação; não preservar o parser caseiro apenas para mostrar autoria.

## 7. UX educacional e organização de conteúdo

Tags respondem “sobre quais assuntos?”, séries respondem “em que ordem estudar?”. As categorias atuais repetem tecnologias já presentes nas tags; com quatro artigos, três taxonomias criam mais navegação que orientação. Recomendação: tags + séries no MVP e nenhuma tabela Category. Se a edição precisar de poucos macrotemas estáveis, adicionar categorias depois, com critérios explícitos.

Criar uma página por série com objetivo, público, pré-requisitos em texto, dificuldade, lista ordenada, quantidade publicada e indicação de que a trilha está em andamento. Ordem deve ser editorial, não data de publicação. Exemplo inicial verificável: JS/TS antes de TSConfig; Node.js antes do artigo de arquitetura na outra série. Confirmar pedagogicamente essas duas ordens na revisão editorial.

No artigo, apresentar “o que você aprenderá”, conhecimento prévio, exemplo executável, exercício pequeno e próximos passos. Textos longos não precisam ser automaticamente divididos para aumentar pageviews. O artigo JS/TS PT tem aproximadamente 5,5 mil palavras pela contagem simples de segmentos separados por espaço no arquivo bruto; a estimativa atual inclui Markdown e código. Recalcular leitura a partir do texto renderizável, identificando-a como estimativa, não promessa.

O footer fala em “arquitetos de software”, enquanto a visão atende diferentes níveis. Editar para refletir público iniciante e intermediário também. Adicionar página Sobre com autor, propósito, repertório e contato profissional. O próprio blog pode ser o primeiro estudo de caso da área de portfólio, sem cadastro de projetos no backend.

As três métricas públicas são sinais de atividade, não prova de importância ou correção técnica. Não criar ranking padrão que esconda conteúdos novos. Quando ativas, permitir leitura completa sem login; solicitar autenticação no momento de curtir/comentar, preservando o contexto e o rascunho.

Progresso persistido, favoritos, recomendação personalizada, certificados e gamificação ficam para depois. Anterior/próximo da série e exercícios entregam mais valor educacional imediato.

## 8. Acessibilidade e responsividade

Manter os breakpoints de 48/64/80 rem, grids adaptáveis, limite de largura de leitura, overflow horizontal no código e preferência por movimento reduzido já presentes. `globals.scss` contém `:focus-visible` e `.sr-only`; não afirmar que faltam globalmente.

Antes de lançar, verificar manualmente:

- Teclado: navegação completa, foco visível, menu móvel, busca, seletor de idioma, TOC e retorno ao fechar modal.
- Leitor de tela: nomes de busca/dialog, landmarks, hierarquia, estado de filtros e texto das ações.
- Skip link para `main`; nome acessível explícito no input do arquivo, atualmente só placeholder/ícone.
- Mensagem de resultados vazios e anúncio discreto de mudanças (`aria-live` onde fizer sentido).
- 320, 375, 768, 1024 e 1440 px; zoom/reflow, textos em inglês, títulos longos, tabelas e blocos de código.
- Contraste de texto, links, foco e controles nos dois temas; os valores Sass não substituem medir combinações renderizadas.
- Alvos de toque confortáveis; botão de fechar do modal tem padding pequeno e precisa ser verificado.
- `body { overflow-x: hidden }` não deve esconder conteúdo que ultrapasse a viewport.
- Imagens informativas com alt contextual; decorativas com alt vazio e link nomeado, como já ocorre no card.

Adotar WCAG 2.2 AA como objetivo de implementação, com testes manuais além de automação. Referência para comportamento de modal: [WAI-ARIA Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## 9. Internacionalização

O cadastro de idiomas deve crescer por configuração, sem ternários PT/EN distribuídos. Proposta de URLs: `/pt-BR/articles/javascript-typescript-sem-misterio` e `/en/articles/javascript-typescript-demystified`. Manter o segmento estrutural `articles` em todos os idiomas reduz trabalho inicial; traduzir esse segmento é opcional, não requisito de SEO.

Locale válido na rota define conteúdo e UI inicial. Preferência salva e idioma do navegador ajudam somente na entrada sem locale; não devem sobrescrever uma URL explícita. O seletor navega para a tradução do mesmo `articleId`, usando slug correspondente. Se ela não existe, mostrar idiomas disponíveis e link claro, sem publicar o texto PT numa URL EN com resposta 200.

Distinguir fallback de interface (string ausente pode recorrer ao idioma padrão com monitoramento) de fallback editorial (tradução ausente não vira página duplicada). As páginas localizadas têm canonical para si; relacionam-se por alternates recíprocos. Não usar uma canonical PT para todas as traduções. O contrato e as regras completas estão no [backend](BACKEND_ARCHITECTURE.md#6-internacionalização-e-identidade-editorial).

## 10. React SPA, SSG, SSR e Next.js

Google consegue executar JavaScript, mas isso adiciona uma etapa à descoberta do conteúdo; outros robôs podem não renderizá-lo. HTML pronto torna a entrega do artigo previsível. Essa conclusão não significa que todo React SPA é impossível de indexar. [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

| Caminho | Ganho | Custo neste repositório | Decisão |
| --- | --- | --- | --- |
| Manter CSR puro | Nenhuma migração de infraestrutura frontend | Resolver URLs e metadata ainda seria necessário; artigo continua dependente de JS | Aceitável como preview, não como alvo editorial |
| Pré-renderizar com solução mantida sobre React/Vite | HTML por artigo, reutilização de layout, deploy estático | Substituir switch, separar browser APIs e dados de build; manter lista de URLs | **Preferência inicial**, com React Router em framework mode como candidato |
| Next.js com geração estática | Convenções para rotas, metadata e geração de páginas; preserva componentes React | Nova ferramenta de build, fronteira servidor/cliente, adaptação dos imports raw e providers | Alternativa válida se reduzir manutenção na prova técnica |
| SSR em todas as visitas | Conteúdo atualizado por requisição | Serviço de renderização, cache e operação adicionais | Não necessário para poucas publicações versionadas |
| SSR artesanal no Express | Controle total | Acopla renderização à API e cria infraestrutura didática demais para o objetivo | Evitar no MVP |

React Router em framework mode oferece estratégias de renderização; apenas instalar o router em uma SPA não gera SSG. Next.js com export estático tem limitações, incluindo recursos dependentes de servidor e ISR. Não prometer revalidação incremental de uma exportação puramente estática. [React Router](https://reactrouter.com/start/framework/rendering), [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports).

Antes da implementação maior, fazer uma prova limitada a um artigo nos dois idiomas, preservando CSS e layout. Aceite: HTML sem JS contém título e texto, URL profunda abre direto, 404 tem status correto, canonical/alternates batem com o idioma, tema e locale não provocam hydration mismatch. Limite sugerido: um dia de investigação, não prazo garantido de migração. Registrar escolha em ADR e seguir somente uma alternativa.

Metadata deve ser produzida no build/render: title e description localizados, canonical, `html lang`, OG, Twitter Cards e JSON-LD coerente com conteúdo visível. Sitemap e robots devem existir na hospedagem. `meta keywords` pode ser removida; não é estratégia de ranking. O plano detalhado e os critérios de validação estão em [SEO e crescimento](GROWTH_SEO_STRATEGY.md).

## 11. Integração futura com a API

No MVP SSG, o build consome conteúdo editorial publicado da API/snapshot validado; o navegador não deve baixar os oito corpos Markdown para mostrar a home. Conteúdo público fica em HTML; interações futuras podem ser carregadas no cliente separadamente.

| Necessidade de UI | Contrato proposto | Comportamento |
| --- | --- | --- |
| Home/arquivo | Resumos paginados, sem body | Datas ISO, IDs, slug, tags, dificuldade, leitura e autor |
| Detalhe | Tradução publicada + alternates + referências de séries | Sem campos internos ou dados privados do autor |
| Série | Metadata localizada + itens ordenados publicados | Anterior/próximo calculados no contexto da série |
| Busca | Filtro simples no catálogo pequeno; endpoint quando necessário | Debounce e cancelamento ao usar rede; paginação e limite |
| Interações P1 | Stats públicas e estado do usuário em requests distintos | Não personalizar HTML cacheado para todos |
| Falhas | Código estável, mensagem e requestId | Estados vazio/erro/retry, sem stack trace ao visitante |

Um cliente `fetch` pequeno é suficiente inicialmente. Biblioteca de cache de estado remoto só se múltiplas telas e mutações justificarem. Não colocar todas as consultas em Context. Curtida otimista deve desfazer a mudança quando falhar e reconciliar o total; “sucesso” só após confirmação real. Tipos TypeScript não validam resposta em runtime; validar contrato em fronteiras apropriadas.

## 12. O que remover e o que adiar

Remover da experiência pública: inscrições simuladas, páginas de paginação sem ação, conteúdos fictícios, links genéricos, filtro de categorias se adotada a simplificação, seções que só repetem “em breve”. Remover o comportamento de descartar seções Markdown. Não remover tema, inglês, séries ou layout editorial.

Adiar: dashboard de autor, editor WYSIWYG, notificações, CMS próprio, progresso sincronizado, múltiplos formatos de reação, ranking, recomendação por IA, uma vitrine de projetos vazia e ferramentas de estado global sem demanda. Busca textual local útil pode continuar; um mecanismo externo não é necessário com quatro artigos.

### Frontend MVP Checklist

- [ ] Corrigir todos os slugs/links reais e adotar URLs localizadas estáveis.
- [ ] Implementar rotas parametrizadas, abertura direta e 404 com status HTTP correto.
- [ ] Definir SSG/pré-renderização pela prova técnica e entregar texto/metadados no HTML inicial.
- [ ] Substituir parsing frágil; preservar seções, tabelas, código, links e âncoras.
- [ ] Normalizar frontmatter e validar quatro pares PT/EN; publicar só traduções revisadas.
- [ ] Remover newsletter simulada, placeholders, paginação decorativa e destinos fictícios.
- [ ] Corrigir série destacada, ordenação, contagem e anterior/próximo.
- [ ] Usar IDs nos filtros; corrigir troca de idioma e strings visíveis ainda não traduzidas.
- [ ] Adicionar autoria, datas, Sobre, Privacidade, contato e link do repositório real.
- [ ] Corrigir acessibilidade do modal e labels; validar teclado, leitura e viewport móvel.
- [ ] Configurar assets com licença/origem conhecidas e dimensões; verificar tema sem mismatch.
- [ ] Integrar resumos/detalhes ao contrato editorial sem enviar todo o acervo no JS inicial.
- [ ] Habilitar TypeScript strict e manter build/lint no CI.
- [ ] Validar HTML, canonical, hreflang, sitemap, robots e compartilhamento.
- [ ] Se ainda não há interações reais, não exibir contadores ou sucesso fictícios.

As tarefas de execução, dependências e critérios de conclusão estão no [roadmap](ROADMAP.md).
