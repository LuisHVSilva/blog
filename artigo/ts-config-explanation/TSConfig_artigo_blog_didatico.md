---
title: "TSConfig sem mistério"
description: "Entendendo como o TypeScript enxerga, analisa e constrói um projeto."
slug: "/article/ts-config-explanation"
lang: "pt-BR"
tags: ["typescript", "tsconfig", "javascript", "iniciantes"]
---

# TSConfig sem mistério

> Entendendo como o TypeScript enxerga, analisa e constrói um projeto.

<!-- VISUAL: Imagem de abertura do artigo. Sugestão: editor de código com um tsconfig.json aberto, com poucas linhas destacadas e fundo limpo. Evitar imagem genérica de “programador olhando para telas”. -->

> **Para quem é este artigo?**
>
> Para quem está entrando no ecossistema TypeScript e já encontrou um tsconfig.json, mas ainda não entende por que esse arquivo existe. O objetivo não é memorizar dezenas de flags: é construir um modelo mental que permita abrir qualquer configuração e começar a interpretá-la.

Ao terminar a leitura, você deve conseguir olhar para um TSConfig e responder três perguntas: quais arquivos fazem parte do projeto, como o TypeScript deve analisá-los e o que acontece com esse código antes de ele chegar ao ambiente de execução. Esse é o alicerce. Configurações mais avançadas podem vir depois.

## 1. Antes do TSConfig: o que estamos tentando configurar?

Se você acabou de conhecer TypeScript, começar pelo arquivo de configuração é como tentar entender o painel de um carro antes de saber para que servem o motor, o combustível e a estrada. Por isso, o primeiro passo é separar três coisas que costumam aparecer misturadas no começo: JavaScript, TypeScript e o compilador.

JavaScript é a linguagem que navegadores e ambientes como o Node.js executam. TypeScript nasce sobre esse universo: você continua escrevendo lógica JavaScript, mas ganha uma camada de análise capaz de descrever tipos, contratos e relações entre valores antes de executar a aplicação.

_Em JavaScript, a função aceita os valores e o comportamento só será conhecido durante a execução:_

```js
function somar(a, b) {
  return a + b;
}

somar(10, 20);
somar("10", 20);
```

Nesse exemplo, JavaScript não exige que a função receba dois números. A expressão pode somar números ou concatenar texto, dependendo dos valores recebidos. Para um programa pequeno isso pode parecer inofensivo. Em aplicações maiores, porém, descobrir incompatibilidades somente quando o código já está rodando torna o problema mais difícil de localizar.

Com TypeScript, informamos ao sistema de tipos o contrato esperado:

```ts
function somar(a: number, b: number): number {
  return a + b;
}

somar("10", 20); // o TypeScript aponta o problema
```

A anotação `: number` não é uma validação que continuará existindo para sempre na aplicação. Ela é uma informação usada pelo TypeScript e pelas ferramentas de desenvolvimento para analisar o programa. Na forma tradicional de build, essas anotações são removidas quando o código é transformado em JavaScript.

### Diagrama: o caminho mental mais importante deste artigo

1. **Código `.ts`**: você escreve JavaScript + informações de tipos →
2. **TypeScript / `tsc`**: analisa o programa e aplica a configuração →
3. **JavaScript**: pode ser gerado sem as anotações de tipo →
4. **Runtime**: Node.js ou navegador executa o JavaScript

> Esse fluxo é uma simplificação didática. Em projetos modernos, bundlers e frameworks podem assumir parte da transformação.

> **Leitura relacionada:** [O que é JavaScript?](/blog/o-que-e-javascript)
>
> Antes de estudar tipos, vale entender a linguagem que realmente será executada.

> **Leitura relacionada:** [O que é TypeScript?](/blog/o-que-e-typescript)
>
> Uma introdução à ideia de tipagem estática, inferência e relação com JavaScript.

> **Leitura relacionada:** [JavaScript x TypeScript](/blog/javascript-vs-typescript)
>
> Entenda o que muda — e, principalmente, o que não muda — quando TypeScript entra no projeto.

## 2. Então, o que significa “compilar” TypeScript?

A palavra “compilar” assusta muita gente no primeiro contato porque costuma ser associada a um processo muito distante do desenvolvimento web. No TypeScript, é útil dividir a compilação em duas ideias: verificar o programa e, quando necessário, produzir arquivos de saída.

A primeira parte é a **checagem de tipos**, ou _type checking_. O compilador percorre o programa, acompanha os tipos conhecidos e produz diagnósticos quando encontra algo incompatível. Essa etapa pode acontecer sem gerar arquivo algum. É exatamente o que fazemos com `tsc --noEmit`.

_Verificar os tipos sem gerar JavaScript:_

```bash
npx tsc --noEmit
```

A segunda parte é a **emissão**, ou _emit_. Quando a configuração permite, o TypeScript pode produzir JavaScript, source maps e, em bibliotecas, arquivos de declaração de tipos. É importante separar essas ideias porque muitos projetos React usam TypeScript para analisar tipos enquanto uma ferramenta como Vite cuida da transformação e do bundle.

> **Termo técnico, sem complicar**
>
> **Build** é o processo que prepara um projeto para execução ou distribuição. Ele pode envolver checagem de tipos, transformação, bundle, otimização e cópia de arquivos. O TypeScript pode participar do build, mas não precisa fazer todas essas etapas sozinho.

## 3. Por que o tsconfig.json existe?

Agora podemos chegar ao problema que o TSConfig resolve. Imagine um único arquivo `index.ts`. Seria possível chamar o compilador e passar as opções diretamente no terminal. Para um experimento, isso é suficiente.

_Um arquivo isolado poderia ser compilado assim:_

```bash
npx tsc index.ts --target ES2022 --module NodeNext --strict
```

Mas um projeto real deixa de ser “um arquivo” muito rápido. Aparecem pastas de código-fonte, testes, bibliotecas externas, importações entre módulos, diferentes ambientes e regras de compilação. Se essas decisões existissem apenas em comandos de terminal ou na memória de cada pessoa do time, duas máquinas poderiam analisar o mesmo repositório de maneiras diferentes.

O `tsconfig.json` coloca essas decisões dentro do próprio projeto. Por isso, uma forma muito útil de entendê-lo é tratá-lo como um **contrato técnico**: ele descreve ao ecossistema TypeScript qual é a fronteira do projeto e quais regras devem ser consideradas ao analisá-lo.

### Diagrama: o TSConfig no centro do projeto

1. **Projeto**: arquivos `.ts`/`.tsx`, testes e dependências →
2. **`tsconfig.json`**: descreve a configuração do projeto →
3. **TypeScript**: descobre arquivos, resolve imports e verifica tipos →
4. **Resultado**: diagnósticos e/ou arquivos gerados

> O arquivo não contém regra de negócio e não “roda” junto da aplicação. Seu papel é orientar análise e build.

> **Uma diferença que evita muita confusão**
>
> package.json e tsconfig.json convivem no mesmo projeto, mas não fazem a mesma coisa. O package.json descreve pacote, scripts e dependências; o TSConfig descreve como o TypeScript deve compreender e analisar o projeto.

## 4. O que exatamente existe dentro de um tsconfig.json?

Ao abrir um TSConfig, não tente ler cada linha como uma configuração independente. Primeiro procure grupos de responsabilidade. Isso reduz bastante a sensação de estar diante de uma lista de palavras aleatórias.

_Uma configuração pequena para estudo pode se parecer com isto:_

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Você não precisa saber de memória o significado de todas essas propriedades. Neste momento, observe a estrutura. `compilerOptions` reúne regras sobre o comportamento do TypeScript. Já `include` e `exclude` ajudam a definir quais arquivos fazem parte da descoberta inicial do projeto.

### Diagrama: leia o arquivo por perguntas, não por flags

1. **Arquivos**: quais arquivos pertencem ao projeto? →
2. **Tipos**: quão rigorosa será a análise? →
3. **Ambiente**: qual JavaScript e quais APIs existem? →
4. **Módulos**: como imports serão interpretados? →
5. **Saída**: o que deve ser gerado e onde?

> Se uma nova opção aparecer, primeiro descubra qual dessas perguntas ela responde.

## 5. compilerOptions: o bloco que descreve o comportamento

A maior parte das propriedades que chamam atenção em um TSConfig vive dentro de `compilerOptions`. O nome é literal: são opções do compilador. Elas podem afetar a análise de tipos, o ambiente considerado, a resolução de módulos ou a saída gerada.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true
  }
}
```

Para quem está começando, vale conhecer apenas algumas opções como pontos de orientação. Não porque elas sejam as únicas importantes, mas porque ajudam a enxergar as categorias do arquivo.

### strict: pedir mais rigor à análise

`strict` ativa uma família de verificações rigorosas. Em vez de pensar nele como “uma flag que deixa o TypeScript difícil”, pense como uma decisão do projeto: queremos que o compilador seja mais exigente ao identificar situações que podem esconder erros de tipos.

Você ainda estudará individualmente verificações como `noImplicitAny` e `strictNullChecks`. Neste artigo, o suficiente é saber que `strict` pertence ao grupo de regras que definem quão cuidadosa será a análise estática.

> **Leitura relacionada:** [O que strict realmente ativa?](/blog/typescript-strict)
>
> Um artigo dedicado pode mostrar, com pequenos erros reais, o que muda quando o modo rigoroso entra no projeto.

### target: para qual JavaScript estamos mirando?

`target` está ligado à versão de JavaScript considerada como destino. Um ambiente moderno pode entender sintaxes que ambientes antigos não reconhecem. Essa opção ajuda o TypeScript a decidir que nível de JavaScript deve ser considerado na transformação.

```json
{
  "compilerOptions": {
    "target": "ES2022"
  }
}
```

Não existe um valor universalmente “melhor”. A escolha depende do ambiente real: versão do Node.js, navegadores suportados, ferramenta de build e forma de distribuição. O ponto conceitual é não confundir `target` com módulos: `target` fala do nível da linguagem JavaScript; `module` trata do sistema de módulos.

### module e moduleResolution: nomes parecidos, problemas diferentes

Aqui aparece uma das confusões mais comuns. Quando você escreve `import`, existem duas perguntas diferentes. A primeira é como o sistema de módulos deve ser interpretado ou emitido. A segunda é como o compilador encontra o arquivo ou pacote ao qual aquela importação se refere.

_Uma linha aparentemente simples cria várias perguntas para o compilador:_

```ts
import { criarUsuario } from "./usuarios";
```

Qual arquivo corresponde a `./usuarios`? Que extensões devem ser consideradas? Existe um `package.json` com regras de exportação? Estamos em CommonJS, ESM ou em um projeto processado por bundler? `moduleResolution` está ligado à busca e resolução; `module` está ligado ao sistema de módulos.

> **Não tente aprofundar tudo aqui**
>
> Módulos são um assunto grande o suficiente para um artigo próprio. Neste ponto, o objetivo é apenas reconhecer que `module` e `moduleResolution` não são sinônimos.

> **Leitura relacionada:** [CommonJS, ESM, import e export](/blog/modulos-javascript)
>
> Uma introdução ao sistema de módulos do ecossistema JavaScript e Node.js.

## 6. rootDir e outDir: de onde o código vem e para onde ele pode ir

Essas duas propriedades são especialmente didáticas porque ajudam a visualizar o build. `rootDir` ajuda a indicar a estrutura esperada do código-fonte. `outDir` indica em qual diretório os arquivos emitidos devem ser gravados.

### Diagrama: antes e depois de uma compilação simples

1. **`src/`**: código TypeScript — `index.ts`, `services/`, `controllers/` →
2. **`tsc + tsconfig`**: analisa e, se permitido, emite arquivos →
3. **`dist/`**: JavaScript gerado preservando a estrutura relevante

> Em um backend simples, é comum enxergar uma relação `src → dist`. Em outros projetos, outra ferramenta pode cuidar dessa saída.

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

Isso não significa que `rootDir` sozinho escolhe todos os arquivos que pertencem ao projeto. A seleção continua relacionada a `files`, `include`, `exclude` e também ao grafo de importações. Essa distinção é importante: uma propriedade descreve estrutura; outras participam da descoberta do programa.

## 7. include e exclude: desenhando a fronteira do projeto

Quando o TypeScript analisa um projeto, ele precisa descobrir quais arquivos formam aquela unidade. `include` usa padrões para dizer onde procurar arquivos iniciais. `exclude` remove caminhos dessa descoberta. É por isso que o TSConfig também funciona como uma espécie de fronteira do projeto.

```json
{
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

O padrão `src/**/*.ts` pode ser lido de maneira simples como “considere arquivos TypeScript dentro de `src`, inclusive em subpastas”. Já `node_modules` e `dist` são retirados da descoberta inicial porque normalmente representam dependências instaladas e saída de build.

Há um detalhe que costuma surpreender iniciantes: `exclude` não é uma muralha absoluta. Se um arquivo for necessário porque outro arquivo do projeto o importou, ele ainda pode entrar no programa. A forma correta de pensar em `exclude` é como um ajuste na descoberta inicial, não como uma regra de segurança para impedir imports.

<!-- VISUAL: Ilustração da fronteira do projeto. Sugestão: árvore de pastas mostrando src/ em uma área destacada, dist/ e node_modules/ fora da área, e uma seta de import demonstrando que dependências podem ampliar o grafo analisado. -->

## 8. Como o TypeScript encontra seu tsconfig.json?

Quando você executa `npx tsc` sem informar arquivos específicos, o compilador procura uma configuração de projeto. Ele parte do diretório atual e pode subir pela árvore de pastas até encontrar um `tsconfig.json`. A partir dali, a configuração encontrada define os arquivos e opções usados na compilação.

_Mesmo dentro de `src`, o compilador pode encontrar a configuração acima:_

```text
meu-projeto/
├── tsconfig.json
├── package.json
└── src/
    └── index.ts

$ cd meu-projeto/src
$ npx tsc
```

Essa ideia explica um erro clássico: executar `npx tsc arquivo.ts` e concluir que o TSConfig foi ignorado. Quando você fornece arquivos diretamente pela linha de comando, a execução muda de contexto e não representa o uso normal do projeto configurado. Para testar a configuração do projeto, prefira `npx tsc` ou indique explicitamente o projeto com `-p`.

_Selecionar explicitamente um projeto:_

```bash
npx tsc -p tsconfig.json
```

> **Ferramenta de diagnóstico que vale guardar**
>
> `npx tsc --showConfig` mostra a configuração efetiva. É uma das primeiras coisas a executar quando você acredita que o TypeScript está usando opções diferentes das que imaginava.

## 9. Criando seu primeiro projeto TypeScript com consciência

Agora que as peças principais fazem sentido, criar um projeto do zero deixa de ser uma sequência de comandos copiados. Cada comando passa a ter uma função clara.

_Começamos criando o pacote, instalando TypeScript localmente e gerando a configuração:_

```bash
mkdir tsconfig-lab
cd tsconfig-lab
npm init -y
npm install --save-dev typescript
npx tsc --init
mkdir src
```

A instalação local do TypeScript é importante porque registra uma versão no próprio projeto. Assim, sua máquina, o computador de outra pessoa e o pipeline de integração contínua podem trabalhar com a versão declarada pelo repositório, em vez de depender de uma instalação global diferente em cada ambiente.

_Nosso primeiro arquivo pode ser mínimo:_

```ts
// src/index.ts
const mensagem: string = "Olá, TypeScript";
console.log(mensagem);
```

Ao executar `npx tsc`, o compilador encontra o TSConfig, monta o programa, resolve os arquivos necessários, verifica sintaxe e tipos e, se a emissão estiver habilitada, produz a saída. Depois, em um backend simples, você pode executar o JavaScript gerado com Node.js.

```bash
npx tsc
node dist/index.js
```

## 10. O que acontece quando você executa npx tsc?

Vale abrir a caixa-preta por alguns minutos. Você não precisa conhecer a implementação interna do compilador para usar TypeScript, mas enxergar as etapas ajuda a interpretar erros e configurações.

> **1. Localizar a configuração**
>
> O compilador encontra o TSConfig escolhido e calcula a configuração efetiva.

> **2. Descobrir arquivos**
>
> `include`, `files` e imports ajudam a formar o conjunto de arquivos do programa.

> **3. Resolver módulos e tipos**
>
> Cada import precisa ser associado a um arquivo ou pacote; bibliotecas e declarações de tipos também são carregadas.

> **4. Analisar sintaxe e tipos**
>
> O TypeScript relaciona nomes, declarações e tipos e verifica se as operações são compatíveis.

> **5. Produzir diagnósticos**
>
> Problemas de configuração, sintaxe, resolução e tipos aparecem como mensagens do compilador.

> **6. Emitir, quando permitido**
>
> Se a configuração permitir, o compilador pode gerar JavaScript e outros artefatos.

Essa sequência também mostra por que “TypeScript compilou” não significa “a aplicação está segura em produção”. Os tipos são uma ferramenta de análise estática. Dados de uma requisição HTTP, permissões, banco de dados, regras de negócio e segurança continuam exigindo validação em runtime.

## 11. Node.js e React podem usar o mesmo TypeScript de maneiras diferentes

Uma das razões pelas quais copiar TSConfig de outro projeto costuma gerar confusão é que o papel do compilador muda conforme o ambiente. Em um backend Node.js simples, `tsc` pode verificar os tipos e também gerar JavaScript em `dist`. Em uma aplicação React moderna, o TypeScript pode ser usado principalmente como analisador de tipos, enquanto Vite ou outra ferramenta transforma e empacota o código.

### Diagrama: dois fluxos comuns

1. **Node.js**: `src/*.ts → tsc + TSConfig → dist/*.js → Node.js`
2. **React + Vite**: `src/*.tsx → TypeScript para tipos + Vite/esbuild para transformação e bundle`

> O mesmo arquivo de configuração participa de contextos diferentes; por isso não existe um TSConfig universal.

É nesse segundo cenário que aparece com frequência `"noEmit": true`: o TypeScript continua analisando o projeto, mas não gera JavaScript naquela execução porque outra ferramenta já assumiu a responsabilidade de transformar e empacotar o código.

```json
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

> **Leitura relacionada:** [Runtime, compilador e bundler](/blog/runtime-compilador-bundler)
>
> Uma explicação dedicada ajuda a diferenciar quem analisa, quem transforma e quem realmente executa o código.

## 12. Os comandos que realmente ajudam no dia a dia

Em vez de decorar uma lista de opções, é mais útil guardar alguns comandos que permitem observar o projeto. Eles transformam o TSConfig de um arquivo “mágico” em algo que você consegue investigar.

```bash
npx tsc
# usa o projeto configurado e compila conforme o TSConfig

npx tsc --noEmit
# verifica os tipos sem gerar arquivos

npx tsc -p tsconfig.json
# escolhe explicitamente uma configuração

npx tsc --showConfig
# mostra a configuração efetiva

npx tsc --listFiles
npx tsc --explainFiles
# ajuda a entender quais arquivos entraram no projeto
```

Esses comandos são especialmente úteis porque respondem dúvidas reais: “qual configuração está valendo?”, “por que este arquivo está sendo analisado?”, “posso verificar os tipos sem gerar build?”. Eles ensinam mais sobre o projeto do que simplesmente copiar flags adicionais.

## 13. Confusões que você pode evitar desde o começo

Alguns erros aparecem repetidamente porque diferentes ferramentas atuam no mesmo projeto. Conhecê-los agora evita que você atribua ao TSConfig responsabilidades que ele não possui.

> **“O Node.js lê meu TSConfig”**
>
> Normalmente, não. Node.js executa JavaScript e possui suas próprias regras de módulos e resolução. O TSConfig é lido pelo TypeScript e por ferramentas integradas ao ecossistema.

> **“Se paths funciona no editor, funcionará em runtime”**
>
> Não necessariamente. Uma ferramenta pode entender um alias para análise de tipos, mas o runtime ou bundler também precisa saber como resolver aquele caminho.

> **“target e module são a mesma coisa”**
>
> `target` está ligado à versão de JavaScript considerada como destino; `module` está ligado ao sistema de módulos.

> **“Se TypeScript não mostrou erro, a entrada da API é segura”**
>
> Tipos desaparecem no JavaScript gerado. Dados externos continuam precisando de validação em runtime.

> **“Existe um TSConfig pronto que serve para qualquer projeto”**
>
> Uma configuração adequada para uma biblioteca pode ser inadequada para uma API Node.js ou uma aplicação criada com Vite. Configuração deve acompanhar ambiente e ferramentas.

## 14. Um pequeno laboratório para transformar teoria em entendimento

A melhor maneira de consolidar este artigo é observar o TSConfig mudando o comportamento de um projeto mínimo. Não precisa ser um exercício grande. O objetivo é provocar uma situação, executar o compilador e entender por que o resultado mudou.

### 1. Prepare um projeto pequeno

```bash
mkdir tsconfig-fundamentos
cd tsconfig-fundamentos
npm init -y
npm install -D typescript
npx tsc --init
mkdir src
```

### 2. Use uma configuração enxuta para enxergar as responsabilidades

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Crie dois arquivos que se importam

```ts
// src/saudacao.ts
export function saudar(nome: string) {
  return `Olá, ${nome}`;
}

// src/index.ts
import { saudar } from "./saudacao.js";
console.log(saudar("TypeScript"));
```

Agora execute `npx tsc --showConfig` para observar a configuração efetiva e `npx tsc --explainFiles` para investigar por que cada arquivo foi incluído. Depois, rode `npx tsc --noEmit` e finalmente `npx tsc`. Você verá a diferença entre apenas verificar e realmente permitir emissão.

### 4. Por fim, provoque um erro proposital

```ts
console.log(saudar(123));
```

Ao executar `npx tsc --noEmit`, o problema aparece antes de você executar a aplicação. Essa experiência resume boa parte do valor do TypeScript: transformar algumas classes de erro em diagnósticos durante o desenvolvimento, em vez de descobertas tardias em runtime.

## 15. O modelo mental que vale levar para os próximos artigos

Depois deste primeiro contato, o TSConfig não deveria parecer uma lista de comandos secretos. Ele é uma descrição de como o TypeScript deve enxergar seu projeto. Algumas propriedades definem a fronteira dos arquivos; outras definem quão rigorosa é a análise; outras descrevem ambiente, módulos ou saída.

Quando encontrar uma opção nova, evite a pergunta “devo colocar isso no meu TSConfig?”. Comece por perguntas melhores: qual problema essa opção resolve? Ela altera análise, resolução de módulos ou emissão? Quem realmente lê essa opção? Ela faz sentido para o ambiente em que meu código será executado?

> **O objetivo não é decorar flags**
>
> Você vai se tornar mais confortável com TSConfig quando aprender a investigar configurações conforme a necessidade. Um projeto moderno pode ter mais de um TSConfig e frameworks podem gerar opções próprias. O conhecimento durável é saber interpretar responsabilidades e diagnosticar o comportamento do projeto.

## Próximas leituras sugeridas

> **Leitura relacionada:** [JavaScript: o que realmente é executado?](/blog/o-que-e-javascript)
>
> Base para entender por que TypeScript não substitui o runtime.

> **Leitura relacionada:** [TypeScript: tipos, inferência e análise estática](/blog/o-que-e-typescript)
>
> O que o TypeScript adiciona ao desenvolvimento JavaScript.

> **Leitura relacionada:** [strict sem medo](/blog/typescript-strict)
>
> Como o modo rigoroso muda a análise do código.

> **Leitura relacionada:** [target e versões do JavaScript](/blog/typescript-target)
>
> Como relacionar o TSConfig ao ambiente de destino.

> **Leitura relacionada:** [Módulos: CommonJS, ESM e NodeNext](/blog/modulos-typescript)
>
> O contexto necessário para entender `module` e `moduleResolution`.

> **Leitura relacionada:** [include, exclude e o grafo do projeto](/blog/typescript-include-exclude)
>
> Como o TypeScript decide quais arquivos fazem parte do programa.

## Glossário rápido para não se perder nos próximos textos

**Build** — Processo que prepara o projeto para execução ou distribuição. Pode envolver checagem, transformação, bundle, otimização e cópia de arquivos.

**Compilador** — Programa que analisa e/ou transforma código. No TypeScript, o compilador oficial é o `tsc`.

**Diagnóstico** — Mensagem produzida pelo compilador sobre configuração, sintaxe, resolução ou tipos.

**Emit / emissão** — Geração de arquivos de saída pelo TypeScript.

**Fronteira do projeto** — Conjunto de arquivos considerados parte da mesma unidade TypeScript.

**Module resolution** — Processo de descobrir a qual arquivo ou pacote um `import` se refere.

**Runtime** — Ambiente em que o JavaScript realmente é executado, como Node.js ou navegador.

**Type checking** — Verificação estática das relações de tipos antes da execução.

**tsc** — Executável oficial do compilador TypeScript.

**tsconfig.json** — Arquivo que define os arquivos e opções de um projeto TypeScript.

## Referências técnicas usadas nos materiais-base

Os dois PDFs fornecidos foram construídos a partir da documentação oficial do TypeScript. Para a versão publicada do artigo, estes links podem ficar em uma seção curta de referências ao final:

- [O que é um tsconfig.json?](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [Referência completa do TSConfig](https://www.typescriptlang.org/tsconfig/)
- [Opções do compilador tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [Download do TypeScript](https://www.typescriptlang.org/download/)
- [TypeScript 5.9 — mudanças no tsc --init](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)

<!-- NOTA EDITORIAL: Este Markdown foi adaptado da simulação visual em PDF. Comentários marcados como VISUAL indicam pontos em que uma ilustração, captura ou diagrama pode reforçar a compreensão sem interromper a narrativa. -->
