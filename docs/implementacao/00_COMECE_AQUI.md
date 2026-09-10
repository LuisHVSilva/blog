# Comece aqui: como seguir o plano do backend

Os seis documentos descrevem **um único plano de implementação**, visto por ângulos diferentes. A unidade de trabalho é uma **etapa**, como E01 ou E07. Escolha a próxima etapa, consulte os detalhes relacionados a ela, implemente e valide antes de avançar.

**Para começar agora:** abra a [etapa E01 na ordem de implementação](./BACKEND_IMPLEMENTATION_ORDER.md#01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) e siga o [roteiro da primeira etapa](#5-primeira-etapa-na-pr%C3%A1tica) deste guia. Concentre-se primeiro na fase **Para publicar**.

## Índice

- [1. Para que serve cada documento](#1-para-que-serve-cada-documento)
- [2. Ordem de leitura inicial](#2-ordem-de-leitura-inicial)
- [3. Como interpretar os códigos e as marcações](#3-como-interpretar-os-c%C3%B3digos-e-as-marca%C3%A7%C3%B5es)
- [4. Como executar uma etapa](#4-como-executar-uma-etapa)
- [5. Primeira etapa na prática](#5-primeira-etapa-na-pr%C3%A1tica)
- [6. Fase Para publicar — P0](#6-fase-para-publicar--p0)
- [7. Fase Após publicação — P1](#7-fase-ap%C3%B3s-publica%C3%A7%C3%A3o--p1)
- [8. Fase Evolução futura — P2](#8-fase-evolu%C3%A7%C3%A3o-futura--p2)
- [9. Como acompanhar o progresso e retomar](#9-como-acompanhar-o-progresso-e-retomar)

## 1. Para que serve cada documento

Use a pergunta que está tentando responder para escolher o arquivo.

| Documento | Pergunta que responde | Quando consultar |
| --- | --- | --- |
| [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | **Por que o sistema foi desenhado assim?** Explica produto, módulos, tecnologias, responsabilidades e decisões. | Na orientação inicial e quando precisar entender uma decisão arquitetural. |
| [BACKEND_IMPLEMENTATION_ORDER.md](./BACKEND_IMPLEMENTATION_ORDER.md) | **Qual é o próximo trabalho?** Apresenta a sequência E01–E26 e as dependências. | É o ponto de entrada de cada sessão de desenvolvimento. |
| [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md) | **O que exatamente devo implementar nesta etapa?** Detalha estado atual, objetivo, contratos, fluxos, arquivos e aceite. | Leia a seção da etapa escolhida; consulte os contratos comuns quando ela os utilizar. |
| [BACKEND_BUSINESS_RULES.md](./BACKEND_BUSINESS_RULES.md) | **Como a funcionalidade deve se comportar?** Explica permissões, validações, estados, exceções e erros. | Leia somente as regras R indicadas na etapa em execução. |
| [BACKEND_IMPLEMENTATION_STRUCTURE.md](./BACKEND_IMPLEMENTATION_STRUCTURE.md) | **Onde fica cada responsabilidade?** Mostra arquivos, camadas, dependências permitidas e evolução. | Ao criar, mover ou alterar os arquivos daquela etapa. |
| [BACKEND_TEST_PLAN.md](./BACKEND_TEST_PLAN.md) | **Como provar que a implementação está correta?** Define cenários, entradas, resultados e infraestrutura de testes. | Antes de codificar e durante a implementação da etapa. |

O **ORDER conduz o trabalho**. O **PLAN detalha a entrega**. RULES, STRUCTURE e TEST_PLAN são consultas direcionadas. ARCHITECTURE explica as decisões que sustentam o conjunto.

Este guia serve como orientação resumida. Contratos e critérios completos permanecem nos documentos vinculados.

## 2. Ordem de leitura inicial

Faça a primeira leitura em quatro movimentos:

1. **Entenda o produto e seus limites.** Na [arquitetura](./BACKEND_ARCHITECTURE.md), leia as seções 1, “Produto, recorte e decisões principais”, e 3, “Arquitetura Hexagonal”. O projeto começa como biblioteca editorial pública; a comunidade vem depois.
2. **Entenda o ponto de partida.** No [estado atual do plano](./BACKEND_IMPLEMENTATION_PLAN.md#estado-atual-verificado), veja o que já existe, o que está parcial e o que falta. Essa auditoria tem data: antes de alterar código, confira se ele evoluiu desde o registro.
3. **Conheça a fase atual.** Leia o resumo de [Para publicar](#6-fase-para-publicar--p0) abaixo e visualize as etapas 01–12 no [ORDER](./BACKEND_IMPLEMENTATION_ORDER.md).
4. **Abra a primeira etapa pendente.** Comece em [E01](./BACKEND_IMPLEMENTATION_ORDER.md#01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente), salvo se sua conclusão já estiver comprovada no código e nos testes. A partir daí, consulte apenas o material daquela etapa.

Reserve a leitura detalhada de autenticação, comentários e escala para as fases correspondentes. A árvore completa inclui o futuro: crie pastas e arquivos à medida que as etapas forem executadas.

## 3. Como interpretar os códigos e as marcações

| Marcação | Significado prático |
| --- | --- |
| **P0, P1, P2** | As três grandes fases: primeira publicação, comunidade após publicação e evolução futura. |
| **E01, E02… E26** | Etapas de implementação. E07 no ORDER, PLAN e TEST_PLAN se refere ao mesmo trabalho. |
| **R01… R40** | Regras ou decisões identificadas no BUSINESS_RULES. Uma etapa pode aplicar várias regras. |
| **E07-U01** | Primeiro cenário unitário da etapa E07. |
| **E07-I01** | Primeiro cenário de integração da etapa E07; pode envolver banco, CLI ou operação. |
| **E07-A01**, quando existir | Primeiro cenário de API da etapa. Nem toda etapa cria uma API. |
| **M0, M1a, M1, M2…** | Marcos de entrega: grupos de etapas concluídas com uma evidência útil. Não são tarefas adicionais. |
| **[EXISTENTE]** | Reutilizar o componente indicado. Conferir o estado atual antes de alterá-lo. |
| **[CRIAR] / [ALTERAR]** | Construir algo ausente ou evoluir o que já existe, na fase indicada. |
| **Mover/reutilizar** | Levar a implementação existente ao destino definido, atualizando os consumidores. É a evolução do mesmo componente. |
| **[REGRA EXPLÍCITA]** | Comportamento definido na arquitetura. |
| **[REGRA INFERIDA]** | Complemento necessário para tornar o comportamento executável; o documento explica o motivo. |
| **[DECISÃO TÉCNICA]** | Escolha de mecanismo ou parâmetro, como timeout, formato de erro ou estratégia de persistência. |
| **[PONTO DE ATENÇÃO ARQUITETURAL]** | Inconsistência ou limitação que exige observar a recomendação documentada. |

**Dependência** significa que um resultado precisa estar pronto antes de outro. **Critério de aceite**, **definição de pronto** e **gate** indicam as condições para concluir uma etapa ou liberar uma fase.

Os caminhos de arquivos são relativos à raiz `D:\Projetos\blog`. Por exemplo, `backend/src/main.ts` fica dentro de `backend`; `content/` e `frontend/` ficam na raiz do projeto. A pasta destes documentos, `docs/implementacao`, não é a raiz usada nos caminhos de implementação.

## 4. Como executar uma etapa

Repita este ciclo para cada E:

1. **Escolha pelo ORDER.** Abra a primeira etapa pendente e confira suas dependências. Avance quando os resultados necessários estiverem comprovados.
2. **Delimite a entrega pelo PLAN.** Leia objetivo, estado atual, implementação esperada e critério de aceite da mesma etapa. Identifique o que será criado, alterado e reutilizado.
3. **Confira comportamento e localização.** Abra as regras R referenciadas e localize os arquivos na STRUCTURE. Consulte contratos comuns do PLAN quando a etapa mencionar DTOs, estados, schema ou ports.
4. **Leia os testes antes de codificar.** Entenda os resultados esperados e prepare as fixtures necessárias. Isso ajuda a implementar os erros e casos limites junto do caminho de sucesso.
5. **Implemente com os testes correspondentes.** Dentro da etapa, avance por regras/contratos, persistência e bordas HTTP/CLI, conforme aplicável. Se um comportamento já estiver correto, preserve-o e complete apenas a evolução necessária.
6. **Valide e registre a conclusão.** Execute os cenários da etapa e os checks afetados. Compare a entrega com o aceite; registre as evidências e siga para a próxima etapa no ORDER.

Uma etapa pode exigir vários commits. “Arquivo criado” ou “build passou” é evidência parcial: quando a etapa exige rollback, autorização ou concorrência, esses comportamentos também precisam passar nos testes.

Se uma informação parecer diferente entre documentos, use a arquitetura para a intenção, o estado auditado mais recente para o ponto de partida e os contratos da etapa para a execução. Confira o código atual e registre a divergência antes de alterar uma decisão. Este guia não substitui essas definições.

## 5. Primeira etapa na prática

Seu primeiro objetivo é **concluir E01: tornar executáveis os comandos e preservar a base existente**.

Abra estas consultas:

- [E01 no ORDER: escopo e próximo passo](./BACKEND_IMPLEMENTATION_ORDER.md#01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente).
- [E01 no PLAN: trabalho detalhado](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente).
- [R01: instalação, credenciais e artefato reproduzível](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel).
- [E01 no TEST_PLAN: como verificar](./BACKEND_TEST_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente--para-publicar).
- [STRUCTURE: localização e reuso dos componentes](./BACKEND_IMPLEMENTATION_STRUCTURE.md).

Na prática, confira os comandos e o código atuais. A auditoria registrada encontrou **typecheck e build funcionando**, mas o teste configurado apontava para um arquivo ausente e o JavaScript compilado falhava ao resolver aliases. E01 descreve como completar esse ciclo, preservar as proteções existentes e comprovar a execução.

Implemente os ajustes dessa etapa e seus testes. Considere E01 pronta quando os scripts e verificações descritos funcionarem, os testes realmente executarem e os imports do JavaScript deixarem de falhar por aliases. O próximo trabalho é [E02: configuração, HTTP e ciclo de vida](./BACKEND_IMPLEMENTATION_ORDER.md#02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

Os comandos apresentados como **“esperados ao fim de P0”** são contratos futuros. Alguns só passam a existir nas etapas seguintes; por exemplo, migrations entram em E03 e o seed local em E07. Use os scripts disponíveis no momento e implemente os restantes na ordem indicada.

## 6. Fase Para publicar — P0

**Para que serve:** colocar a biblioteca editorial no ar, com conteúdo real, leitura pública e operação segura.

**Resultado para o visitante:** abrir artigos publicados em português e inglês, consultar tags e séries e navegar pelo conteúdo. A publicação editorial é feita pelo mantenedor por um fluxo protegido de importação dos arquivos Markdown.

Execute **E01–E12**, nesta sequência de blocos:

| Bloco | Etapas | Como implementar | O que estará pronto |
| --- | --- | --- | --- |
| Base executável | [E01](./BACKEND_IMPLEMENTATION_ORDER.md#01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) a [E03](./BACKEND_IMPLEMENTATION_ORDER.md#03-conex%C3%A3o-postgresql-e-executor-de-migrations) | Completar comandos/testes, separar inicialização de HTTP, validar configuração e preparar conexão/migrations. | Aplicação que inicia, falha e encerra corretamente; banco com evolução controlada. |
| Publicação editorial | [E04](./BACKEND_IMPLEMENTATION_ORDER.md#04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) a [E07](./BACKEND_IMPLEMENTATION_ORDER.md#07-importar-publicar-despublicar-e-arquivar-atomicamente) | Definir regras/contratos, criar schema, normalizar o acervo e implementar importação/publicação/retirada atômicas. | Quatro artigos com seus pares de tradução, duas séries e IDs preservados entre imports. |
| Leitura e integração | [E08](./BACKEND_IMPLEMENTATION_ORDER.md#08-consultar-artigos-tags-e-s%C3%A9ries-publicados) a [E10](./BACKEND_IMPLEMENTATION_ORDER.md#10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) | Consultar somente conteúdo público, expor API documentada e exportar um snapshot consistente para renderizar o site. | API, páginas e catálogo derivados da mesma revisão, com URLs por idioma. |
| Preparação de produção | [E11](./BACKEND_IMPLEMENTATION_ORDER.md#11-entregar-imagens-e-compose-reproduz%C3%ADveis) a [E12](./BACKEND_IMPLEMENTATION_ORDER.md#12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) | Completar imagens/Compose, validação automática, deploy, HTTPS, alertas, backup e ensaio de restauração. | Primeiro release verificável e recuperável. |

O **snapshot** é uma cópia consistente do conteúdo publicado usada para construir o site. Por isso, E10 inclui integração com o frontend: a arquitetura exige que o texto esteja no HTML entregue ao visitante.

**Quando a fase termina:** todas as etapas e seus testes passam; o conteúdo real está acessível; imagem, API e site passam pelas verificações; backup foi restaurado em teste; domínio, hospedagem, contatos, licenças e responsabilidades operacionais estão definidos. Consulte o aceite completo de [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

Contas públicas, curtidas, comentários e views próprias entram em P1. Esses recursos não precisam estar implementados para concluir o primeiro release editorial.

## 7. Fase Após publicação — P1

**Para que serve:** permitir participação da comunidade com identidade, controle de abuso e tratamento dos dados dos usuários.

**Resultado para o visitante:** entrar com GitHub, curtir artigos, enviar comentários moderados e consultar estatísticas reais. O usuário também terá um processo de exclusão de conta e solicitação de seus dados.

Execute **E13–E20** sobre o backend editorial já publicado:

| Bloco | Etapas | Como implementar | O que estará pronto |
| --- | --- | --- | --- |
| Identidade e proteção | [E13](./BACKEND_IMPLEMENTATION_ORDER.md#13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es) a [E15](./BACKEND_IMPLEMENTATION_ORDER.md#15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) | Adicionar contas/sessões, login/logout, proteção das ações autenticadas, permissões, bloqueio e limites de abuso. | Identidade confiável e autorização por ação. |
| Interações reais | [E16](./BACKEND_IMPLEMENTATION_ORDER.md#16-entregar-curtidas-idempotentes-e-estado-privado) a [E18](./BACKEND_IMPLEMENTATION_ORDER.md#18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) | Implementar curtidas idempotentes, comentários com moderação e views deduplicadas, junto dos testes de concorrência e privacidade. | As três métricas com definições claras e dados reais. |
| Direitos e operação | [E19](./BACKEND_IMPLEMENTATION_ORDER.md#19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) a [E20](./BACKEND_IMPLEMENTATION_ORDER.md#20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) | Completar exclusão/exportação/retenção, ampliar observabilidade e exercitar o fluxo comunitário completo. | Comunidade pronta para ser habilitada e mantida. |

Os componentes editoriais continuam sendo usados. Por exemplo, likes se vinculam ao ID do artigo que já existe; comentários se vinculam ao ID da tradução. Reimportar conteúdo precisa preservar essas interações.

**Quando a fase termina:** o fluxo completo passa nos testes, exclusão e retenção funcionam, as métricas são reais e existe responsável pela moderação. Habilite a comunidade somente após cumprir [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas); as etapas anteriores podem ser desenvolvidas com os recursos desativados para o público.

## 8. Fase Evolução futura — P2

**Para que serve:** evoluir o produto conforme necessidades observadas depois das primeiras entregas.

As etapas **E21–E26 são opções condicionais**. Percorra a lista e selecione as que tiverem motivo real para existir. Uma opção adiada não impede outra cujas dependências já estejam prontas.

| Opção | Quando faz sentido | Como executar a evolução |
| --- | --- | --- |
| [E21 — Conta local](./BACKEND_IMPLEMENTATION_ORDER.md#21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) | Há necessidade de acesso sem GitHub. | Acrescentar email/senha com confirmação, recuperação e envio confiável; reutilizar as sessões existentes. |
| [E22 — Respostas e aprendizagem](./BACKEND_IMPLEMENTATION_ORDER.md#22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) | Discussões e trilhas precisam dessas capacidades. | Evoluir comentários para respostas limitadas e adicionar progresso explícito; implementar subcapacidades opcionais apenas quando necessárias. |
| [E23 — Busca e relacionados](./BACKEND_IMPLEMENTATION_ORDER.md#23-busca-por-idioma-e-relacionados-editoriais) | O catálogo cresceu e a busca simples deixou de atender. | Evoluir a consulta por idioma e as sugestões editoriais, preservando visibilidade e filtros. |
| [E24 — Operação editorial](./BACKEND_IMPLEMENTATION_ORDER.md#24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) | PR/importação ou a diferença temporária entre versões de API/site gera dificuldade concreta. | Implementar a subcapacidade necessária de proposta editorial ou ativação de releases, preservando a fonte única de conteúdo. |
| [E25 — Privacidade automatizada](./BACKEND_IMPLEMENTATION_ORDER.md#25-automatizar-atendimento-de-privacidade-quando-houver-demanda) | Atender solicitações manualmente passou a consumir trabalho relevante. | Automatizar o processo já existente, com entrega privada, expiração e controle de acesso. |
| [E26 — Escala](./BACKEND_IMPLEMENTATION_ORDER.md#26-escalar-apenas-o-gargalo-medido) | Medições demonstram um gargalo de desempenho ou operação. | Medir, corrigir o gargalo e validar o ganho; introduzir cache, workers ou réplicas somente quando justificados. |

**Quando uma evolução termina:** a capacidade escolhida atende ao aceite da etapa, seus testes passam e as funcionalidades anteriores continuam corretas. Registre opções sem necessidade atual como **adiadas, com motivo**. Concluir P0 e P1 não exige implementar todas as opções de P2.

## 9. Como acompanhar o progresso e retomar

Mantenha um registro pequeno na issue, PR ou ferramenta que já utiliza. Uma linha por etapa é suficiente para retomar o trabalho:

| Etapa | Estado | Evidência ou pendência |
| --- | --- | --- |
| E01 | Não iniciada / em andamento / concluída / bloqueada | Commit/PR, verificações executadas e o que falta. |
| E21–E26, quando aplicável | Adiada | Motivo pelo qual a opção ainda não é necessária. |

Ao concluir uma etapa, registre **o que mudou, quais testes passaram e qual é a próxima etapa**. Ao retomar, abra o ORDER nessa etapa e releia seu aceite antes de editar código.

Algumas decisões pertencem ao mantenedor: domínio, hospedagem, licença, contatos e políticas operacionais. O plano identifica o momento em que cada uma é necessária. Registre a decisão real antes do respectivo release; desenvolvimento local pode avançar com os parâmetros seguros já definidos.

**Próxima ação recomendada:** [abrir E01 no ORDER](./BACKEND_IMPLEMENTATION_ORDER.md#01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente), conferir seu estado no código atual e trabalhar somente na primeira etapa ainda pendente.
