---
translationId: 21111111-1111-4111-8111-111111111111
locale: pt-BR
slug: javascript-typescript-sem-misterio
title: "JavaScript e TypeScript sem mistério: o que são, por que existem e qual
  é a diferença?"
description: Um guia introdutório para entender JavaScript, TypeScript, a
  história das duas linguagens, onde são usadas, como se relacionam e quando
  escolher cada uma.
articleId: 11111111-1111-4111-8111-111111111111
sourceRevision: d4e48dc18d9e27f9132d276d46e0ab7250afb94c71d7a5804727a277e68a79e5
---

# JavaScript e TypeScript sem mistério: o que são, por que existem e qual é a diferença?

Se você está começando a programar, é muito provável que encontre os nomes **JavaScript** e **TypeScript** logo nas primeiras pesquisas.

Talvez você veja um curso de React dizendo que usa TypeScript. Depois encontre um tutorial de Node.js escrito em JavaScript. Em outro lugar, alguém diga que TypeScript "é JavaScript com tipos".

Nesse momento, é natural surgir uma série de perguntas:

> JavaScript e TypeScript são linguagens diferentes?  
> Preciso aprender JavaScript antes de TypeScript?  
> TypeScript substitui JavaScript?  
> Onde cada um é usado?  
> Por que TypeScript existe se JavaScript já funciona?  
> Qual deles devo usar?

Este artigo foi escrito para responder essas perguntas **sem assumir que você já conhece programação**.

A ideia não é ensinar toda a sintaxe de JavaScript ou todo o sistema de tipos do TypeScript. O objetivo é construir uma visão clara do cenário.

Quando terminar a leitura, você deverá entender:

- o que é JavaScript;
- por que JavaScript foi criado;
- onde ele pode ser utilizado;
- o que é TypeScript;
- por que TypeScript foi criado;
- como TypeScript se relaciona com JavaScript;
- o que significa tipagem dinâmica e análise estática;
- onde cada tecnologia é aplicada;
- os principais pontos positivos e negativos de cada uma;
- e qual caminho de estudo faz mais sentido a partir daqui.



## Antes de tudo: o que é uma linguagem de programação?

Antes de falar sobre JavaScript ou TypeScript, precisamos entender o que significa dizer que algo é uma **linguagem de programação**.

Um computador não entende diretamente frases como:

> "Quando a pessoa clicar neste botão, abra o menu."

Nós precisamos representar essa intenção através de instruções que possam ser interpretadas por algum software.

Uma linguagem de programação fornece uma forma organizada de escrever essas instruções.

Por exemplo:

```js
const nome = "Ana";

console.log(`Olá, ${nome}!`);
```

Mesmo que você nunca tenha programado antes, é possível imaginar o que esse pequeno código está tentando fazer.

Ele guarda o texto `"Ana"` em uma variável chamada `nome` e depois exibe:

```text
Olá, Ana!
```

O objetivo de uma linguagem de programação é justamente permitir que nós, humanos, descrevamos comportamentos de uma maneira suficientemente precisa para que um computador consiga processá-los.

<!-- VISUAL:
Ilustração simples com três etapas:

Pessoa
  ↓ escreve instruções
Código
  ↓ executado por um ambiente
Computador

Legenda: "Uma linguagem de programação é uma ponte entre uma intenção humana e uma instrução que a máquina pode processar."
-->



# Parte 1 — O que é JavaScript?

## JavaScript é uma linguagem de programação

**JavaScript**, frequentemente abreviado como **JS**, é uma linguagem de programação.

Ela ficou especialmente conhecida por permitir que páginas da internet deixassem de ser apenas documentos estáticos e passassem a responder às ações das pessoas.

Imagine uma página com um botão:

```text
[ Abrir menu ]
```

Sem comportamento programado, esse botão pode simplesmente não fazer nada.

Com JavaScript, podemos descrever o que deve acontecer quando ele for clicado:

```js
const botao = document.querySelector("#abrir-menu");

botao.addEventListener("click", () => {
  console.log("O menu deve ser aberto.");
});
```

Não se preocupe em entender cada símbolo desse código agora.

A ideia principal é:

> JavaScript permite escrever comportamentos.

Ele pode reagir a um clique, processar informações, fazer cálculos, buscar dados em uma API, alterar elementos de uma página, executar código em um servidor e muito mais.



## HTML, CSS e JavaScript: qual é o papel de cada um?

Em uma aplicação web tradicional, três tecnologias aparecem com muita frequência.

**HTML** descreve a estrutura.

**CSS** descreve a aparência.

**JavaScript** descreve grande parte do comportamento.

Uma comparação simples seria imaginar uma casa.

O HTML seria a estrutura: paredes, portas, cômodos.

O CSS seria a aparência: cores, tamanhos, decoração.

O JavaScript seria parte dos comportamentos: acender uma luz ao apertar um interruptor, abrir uma porta automática ou controlar um sistema eletrônico.

Essa comparação não representa todos os detalhes técnicos, mas ajuda a criar um primeiro modelo mental.

<!-- VISUAL:
Card dividido em três colunas:

HTML
"estrutura"
Ex.: título, botão, formulário

CSS
"aparência"
Ex.: cores, espaçamento, layout

JavaScript
"comportamento"
Ex.: clique, validação, requisições, atualização da interface
-->



## Uma breve história do JavaScript

JavaScript surgiu em **1995**, dentro da Netscape, uma das empresas responsáveis por navegadores importantes no início da web.

A linguagem foi criada por **Brendan Eich**.

O objetivo inicial era permitir que páginas web executassem pequenos comportamentos dentro do navegador.

Durante seu desenvolvimento, a linguagem passou por nomes como **Mocha** e **LiveScript** antes de receber o nome JavaScript.

Em 1997, a linguagem passou por um processo de padronização. Dessa padronização surgiu o nome **ECMAScript**, que você ainda encontrará ao estudar JavaScript.

Por isso, quando alguém fala em:

```text
ES2015
ES2020
ES2022
ESNext
```

o `ES` vem de **ECMAScript**.

JavaScript é o nome da linguagem que usamos no dia a dia. ECMAScript é o padrão que descreve grande parte de como essa linguagem funciona.

<!-- VISUAL:
Linha do tempo simplificada:

1995
JavaScript é criado na Netscape
        ↓
1997
Primeira padronização ECMAScript
        ↓
Anos seguintes
A linguagem evolui com novas versões
        ↓
2009
Node.js populariza JavaScript fora do navegador
        ↓
Hoje
Web, servidores, aplicações, ferramentas e vários outros ambientes
-->

### Leitura relacionada

O que é ECMAScript e por que existem ES2015, ES2020 e ESNext?



## JavaScript só funciona em sites?

Não.

Essa é uma das ideias mais importantes para quem está começando.

JavaScript ficou famoso dentro dos navegadores, mas hoje é usado em muitos outros lugares.

Para entender isso, precisamos conhecer um termo: **runtime**.



## O que é runtime?

Um arquivo JavaScript contém código.

Por exemplo:

```js
const mensagem = "Olá, mundo!";

console.log(mensagem);
```

Mas o arquivo sozinho não "roda".

Ele precisa de um ambiente capaz de entender e executar aquelas instruções.

Esse ambiente é chamado de **runtime**, ou ambiente de execução.

No navegador, existe um mecanismo capaz de executar JavaScript.

Também existe o **Node.js**, que permite executar JavaScript fora de uma página web.

Podemos imaginar assim:

```text
                 JavaScript
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
      Navegador               Node.js
          ↓                     ↓
   Aplicação web       servidor, script,
                       ferramenta, API...
```

Essa separação é importante porque **JavaScript é a linguagem**, enquanto navegador e Node.js são ambientes onde essa linguagem pode ser executada.

### Leitura relacionada

Runtime, compilador e build: o que significam esses termos?

---

## JavaScript no navegador

Dentro de um navegador, JavaScript pode interagir com recursos disponibilizados por aquele ambiente.

Um exemplo é o `document`.

```js
const titulo = document.querySelector("h1");

titulo.textContent = "Novo título";
```

Nesse caso, JavaScript está sendo utilizado para encontrar um elemento da página e alterar seu conteúdo.

O navegador também fornece recursos como:

```text
document
window
localStorage
fetch
setTimeout
```

Um detalhe importante é que **esses recursos não são todos parte da linguagem JavaScript em si**.

Muitos deles são APIs oferecidas pelo navegador.

Isso significa que a linguagem e o ambiente de execução trabalham juntos.

<!-- VISUAL:
Diagrama em camadas:

Aplicação Web
      ↑
APIs do navegador
document | window | fetch | localStorage
      ↑
JavaScript
      ↑
Motor JavaScript do navegador
-->

---

## JavaScript no servidor com Node.js

Durante muitos anos, JavaScript esteve fortemente associado ao navegador.

Isso mudou bastante com o crescimento do **Node.js**, lançado em 2009.

Node.js tornou muito comum executar JavaScript em servidores, scripts e ferramentas de desenvolvimento.

Por exemplo, podemos criar um arquivo:

```js
// index.js
console.log("Executando JavaScript com Node.js");
```

E executá-lo:

```bash
node index.js
```

Agora o JavaScript não está controlando uma página aberta no navegador.

Ele está sendo executado pelo Node.js.

Esse avanço ajudou JavaScript a ocupar muito mais espaço no desenvolvimento de software.

Hoje ele pode aparecer em:

- interfaces web;
- backends;
- APIs;
- automações;
- ferramentas de linha de comando;
- aplicações mobile;
- aplicações desktop;
- funções serverless;
- testes;
- ferramentas utilizadas por outros desenvolvedores.

Não significa que JavaScript seja sempre a melhor tecnologia para todos esses cenários. Significa apenas que seu ecossistema permite utilizá-lo em muitos ambientes diferentes.

---

# Como JavaScript trabalha com valores?

Observe este código:

```js
let idade = 20;
```

Criamos uma variável chamada `idade` e colocamos nela o número `20`.

Mais tarde, JavaScript permite escrever:

```js
idade = "vinte";
```

Agora a mesma variável possui um texto.

Isso nos apresenta a um conceito importante.

---

## JavaScript possui tipagem dinâmica

Valores possuem tipos.

Por exemplo:

```js
const nome = "Ana";      // string
const idade = 20;        // number
const ativo = true;      // boolean
```

`"Ana"` é um texto.

`20` é um número.

`true` é um valor lógico.

JavaScript entende esses tipos durante a execução do programa, mas normalmente não exige que você declare antecipadamente:

> "Esta variável só poderá receber números."

Isso está relacionado ao fato de JavaScript possuir **tipagem dinâmica**.

Veja:

```js
let valor = 10;

valor = "agora sou um texto";
```

JavaScript permite essa alteração.

Essa flexibilidade pode ser muito útil.

Por outro lado, ela também significa que determinados erros só ficam evidentes quando uma parte do programa é executada.

---

## Um exemplo do problema que pode aparecer

Considere:

```js
function somar(a, b) {
  return a + b;
}
```

Podemos usar:

```js
somar(10, 20);
```

O resultado será:

```text
30
```

Mas também podemos usar:

```js
somar("10", "20");
```

E teremos:

```text
1020
```

Isso acontece porque o operador `+` também pode concatenar textos.

O JavaScript não sabe que nossa intenção era aceitar apenas números.

Essa ideia é fundamental:

> O código pode ser válido para JavaScript e, ainda assim, não representar aquilo que o programador queria.

Foi justamente esse tipo de problema — especialmente em sistemas grandes — que ajudou a motivar o uso de ferramentas de análise mais fortes.

É aqui que TypeScript entra na história.

---

# Parte 2 — O que é TypeScript?

## TypeScript foi criado sobre JavaScript

**TypeScript**, frequentemente abreviado como **TS**, é uma linguagem criada sobre JavaScript.

Uma maneira simples de começar a entendê-lo é pensar:

```text
JavaScript
    +
sistema de tipos
    +
análise antes da execução
    =
TypeScript
```

Essa representação é simplificada, mas captura uma ideia essencial.

Quando você programa em TypeScript, continua usando grande parte do que existe em JavaScript:

```text
variáveis
funções
objetos
arrays
classes
promises
if
for
map
filter
import
export
...
```

TypeScript acrescenta recursos que ajudam a **descrever e verificar melhor as intenções do código**.

---

## Uma breve história do TypeScript

À medida que JavaScript passou a ser usado em aplicações maiores, equipes começaram a enfrentar um problema natural: projetos grandes possuem muitas funções, objetos, módulos e relações entre dados.

Quanto maior o sistema, mais difícil pode ser lembrar ou descobrir o formato esperado por cada parte do código.

A Microsoft começou a desenvolver TypeScript para ajudar a lidar com esse cenário.

TypeScript foi anunciado publicamente em **2012** e teve **Anders Hejlsberg**, conhecido também por seu trabalho em linguagens como C#, como uma das principais figuras de seu desenvolvimento.

A proposta não era eliminar JavaScript.

Era permitir que desenvolvedores continuassem utilizando JavaScript e seu ecossistema, mas com ferramentas adicionais para análise e manutenção de projetos.

<!-- VISUAL:
Linha do tempo:

1995
JavaScript
   ↓
Aplicações web crescem em tamanho e complexidade
   ↓
2012
TypeScript é apresentado pela Microsoft
   ↓
TypeScript evolui junto com JavaScript
   ↓
Hoje
Muito utilizado em projetos frontend, backend, bibliotecas e grandes bases de código
-->

---

# TypeScript não substitui JavaScript

Essa é provavelmente a frase mais importante deste artigo:

> **TypeScript não existe para substituir JavaScript. Ele existe sobre JavaScript.**

Veja uma função JavaScript:

```js
function apresentar(nome) {
  return `Olá, ${nome}`;
}
```

Em TypeScript podemos escrever:

```ts
function apresentar(nome: string): string {
  return `Olá, ${nome}`;
}
```

A lógica continua sendo a mesma.

A diferença está nestas partes:

```ts
nome: string
```

e:

```ts
): string
```

Estamos fornecendo informações adicionais sobre nossa intenção.

A primeira diz:

> `nome` deve ser uma string.

A segunda diz:

> esta função deve retornar uma string.

Essas informações podem ser analisadas pelo TypeScript antes da execução do programa.

---

# Mas o que é um tipo?

Um **tipo** descreve características de um valor.

Por exemplo:

```ts
const nome: string = "Ana";
const idade: number = 20;
const ativo: boolean = true;
```

Temos três tipos diferentes:

```text
string  → texto
number  → número
boolean → verdadeiro ou falso
```

Isso ajuda ferramentas a entenderem quais operações fazem sentido.

Por exemplo:

```ts
const idade: number = 20;

idade.toUpperCase();
```

`toUpperCase()` é uma operação usada em strings.

Um número não possui esse comportamento.

TypeScript consegue identificar essa incompatibilidade durante a análise do código.

<!-- IMAGE:
Screenshot sugerido do VS Code mostrando:

const idade: number = 20;
idade.toUpperCase();

Com `toUpperCase()` sublinhado em vermelho e o tooltip do TypeScript informando que a propriedade não existe em `number`.
-->

---

# Voltando ao exemplo da soma

Em JavaScript tínhamos:

```js
function somar(a, b) {
  return a + b;
}

somar("10", 20);
```

Se nossa intenção é trabalhar apenas com números, TypeScript permite escrever:

```ts
function somar(a: number, b: number): number {
  return a + b;
}

somar("10", 20);
```

Agora o TypeScript consegue alertar:

```text
"10" é uma string.
A função esperava um number.
```

Perceba que o TypeScript não precisou esperar a aplicação ser executada para encontrar esse problema.

Isso nos leva a outro conceito.

---

# O que é análise estática?

**Análise estática** significa analisar características do programa sem depender de executar todas as possíveis situações daquele código.

No nosso exemplo:

```ts
function dobrar(valor: number): number {
  return valor * 2;
}

dobrar("dez");
```

O TypeScript já conhece o contrato da função:

```text
entrada: number
saída: number
```

Por isso, `"dez"` pode ser identificado como incompatível antes da execução.

Podemos visualizar:

```text
Código TypeScript
       ↓
Análise de tipos
       ↓
Problemas encontrados
       ↓
Transformação / build
       ↓
JavaScript
       ↓
Runtime
```

Essa análise não torna o programa perfeito.

Ela apenas permite encontrar **uma categoria importante de problemas mais cedo**.

---

# TypeScript impede todos os bugs?

Não.

Esse é um erro comum de quem está conhecendo TypeScript.

Considere:

```ts
function dividir(a: number, b: number): number {
  return a / b;
}

dividir(10, 0);
```

Os tipos estão corretos.

`10` é um número.

`0` é um número.

Mesmo assim, talvez dividir por zero não faça sentido para a regra da sua aplicação.

Outro exemplo:

```ts
function calcularDesconto(preco: number): number {
  return preco * 10;
}
```

Talvez a intenção fosse calcular 10%, mas a fórmula está errada.

TypeScript não consegue saber todas as regras do seu negócio.

Por isso:

```text
verificação de tipos
        ≠
ausência de bugs
```

Ainda precisamos de:

- testes;
- validações;
- tratamento de erros;
- regras de negócio;
- segurança;
- revisão de código;
- monitoramento.

> TypeScript aumenta a quantidade de informações que podemos verificar antes da execução, mas não substitui engenharia de software.

---

# O que acontece com os tipos quando o programa é executado?

Considere:

```ts
const usuario: string = "Ana";
```

Em um processo tradicional de transformação para JavaScript, o resultado será semelhante a:

```js
const usuario = "Ana";
```

A informação:

```ts
: string
```

é utilizada pelo TypeScript durante sua análise, mas não permanece como uma validação automática no JavaScript final.

Outro exemplo:

```ts
interface Usuario {
  nome: string;
  idade: number;
}
```

Uma `interface` ajuda TypeScript a entender o formato esperado de um objeto.

Porém, ela não vira automaticamente uma função de validação executada em produção.

Isso é muito importante em APIs.

Imagine que esperamos:

```ts
interface Usuario {
  idade: number;
}
```

Mas um servidor recebe:

```json
{
  "idade": "vinte"
}
```

O fato de termos uma interface TypeScript não transforma `"vinte"` em um número e não rejeita automaticamente esse dado.

Dados externos continuam precisando ser validados durante a execução.

### Leitura relacionada

TypeScript em runtime: por que os tipos não validam uma API sozinhos?

---

# Quem transforma TypeScript?

O compilador oficial do TypeScript é chamado de:

```text
tsc
```

Podemos instalar TypeScript em um projeto e executar:

```bash
npx tsc
```

O compilador pode:

- analisar tipos;
- encontrar incompatibilidades;
- entender a configuração do projeto;
- e, dependendo da configuração, gerar JavaScript.

É aqui que aparece outro arquivo muito importante:

```text
tsconfig.json
```

O `tsconfig.json` diz ao TypeScript como ele deve compreender o projeto.

Ele pode responder perguntas como:

```text
Quais arquivos fazem parte do projeto?
Qual versão de JavaScript é o destino?
Como os módulos devem ser tratados?
Quão rigorosa deve ser a verificação?
O TypeScript deve gerar arquivos?
```

### Próxima leitura recomendada

[TSConfig sem mistério: entendendo a configuração de um projeto TypeScript](/pt-BR/articles/tsconfig-sem-misterio)

---

# Parte 3 — JavaScript vs TypeScript

Agora que conhecemos os dois, podemos comparar sem simplificar demais.

---

## A principal relação

Muitas pessoas imaginam:

```text
JavaScript  OU  TypeScript
```

Mas um modelo mental melhor é:

```text
┌──────────────────────────────────────┐
│              TypeScript              │
│                                      │
│   tipos + análise + ferramentas      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │          JavaScript            │  │
│  │ lógica, sintaxe e ecossistema  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

Ao aprender TypeScript, você continua precisando entender JavaScript.

TypeScript acrescenta uma camada de informações e verificações.

---

# A diferença em um exemplo real

## JavaScript

```js
function calcularTotal(preco, quantidade) {
  return preco * quantidade;
}

calcularTotal("dez", 2);
```

O código pode chegar à execução antes de descobrirmos que `"dez"` não representa o valor que esperávamos.

## TypeScript

```ts
function calcularTotal(
  preco: number,
  quantidade: number
): number {
  return preco * quantidade;
}

calcularTotal("dez", 2);
```

Agora o editor e o compilador podem identificar a incompatibilidade antes da execução.

A lógica da função continua praticamente igual.

O que mudou foi a quantidade de informação disponível sobre a intenção do código.

---

# JavaScript é dinâmico; TypeScript adiciona verificação estática

Veja JavaScript:

```js
let valor = 10;

valor = "dez";
```

Isso é permitido.

Agora TypeScript:

```ts
let valor: number = 10;

valor = "dez";
```

TypeScript percebe que declaramos `valor` como `number` e sinaliza que `"dez"` é uma `string`.

A diferença não é simplesmente:

```text
JavaScript não tem tipos.
TypeScript tem tipos.
```

JavaScript também possui tipos de valores.

A diferença está principalmente em **como e quando essas informações são usadas para verificar o programa**.

JavaScript possui tipagem dinâmica.

TypeScript acrescenta um sistema de tipos analisado estaticamente durante o desenvolvimento.

---

# TypeScript não exige escrever tipo em todo lugar

Um iniciante pode abrir um projeto TypeScript e imaginar que precisará escrever:

```ts
const nome: string = "Ana";
const idade: number = 20;
const ativo: boolean = true;
```

o tempo inteiro.

Não é verdade.

TypeScript possui **inferência de tipos**.

Isso significa que ele frequentemente consegue deduzir o tipo:

```ts
const nome = "Ana";
const idade = 20;
const ativo = true;
```

Mesmo sem escrevermos explicitamente:

```text
string
number
boolean
```

TypeScript consegue entender muita coisa a partir dos valores e do contexto.

Esse recurso permite que código TypeScript continue bastante próximo de JavaScript.

### Leitura relacionada

Inferência de tipos no TypeScript: quando você não precisa escrever o tipo

---

# Uma comparação rápida

| Tema | JavaScript | TypeScript |
|---|---|---|
| O que é? | Linguagem de programação | Linguagem construída sobre JavaScript |
| Tipagem | Dinâmica | Adiciona sistema de tipos com análise estática |
| Executado diretamente por navegadores | Sim | Normalmente é transformado/processado antes |
| Executado pelo Node.js | JavaScript é a linguagem natural do runtime | Depende da ferramenta/fluxo utilizado |
| Verifica incompatibilidades de tipos antes da execução | Não como recurso nativo da linguagem | Sim |
| Tipos permanecem protegendo o código em runtime | Não se aplica dessa forma | Não |
| Pode usar código JavaScript existente | É o próprio JavaScript | Sim, possui alta compatibilidade com JavaScript |
| Configuração adicional | Geralmente menor | Pode exigir configuração e ferramentas |
| Curva inicial de aprendizado | Menor | Maior por incluir conceitos de tipos |

Essa tabela é apenas um resumo.

A diferença mais importante não está no número de recursos.

Ela está no momento em que determinados problemas podem ser descobertos.

<!-- VISUAL:
Comparação de fluxo:

JAVASCRIPT

Código
  ↓
Runtime
  ↓
Execução
  ↓
Alguns problemas aparecem aqui


TYPESCRIPT

Código
  ↓
Análise de tipos
  ↓
Alguns problemas aparecem aqui
  ↓
JavaScript / build
  ↓
Runtime
  ↓
Execução
-->

---

# Onde JavaScript é utilizado?

JavaScript possui um ecossistema enorme.

Algumas aplicações comuns são:

## Frontend web

Interfaces executadas no navegador.

Exemplos de tecnologias do ecossistema:

```text
React
Vue
Angular
Svelte
```

Essas ferramentas podem ser utilizadas com JavaScript e, em muitos casos, também com TypeScript.

---

## Backend

Com Node.js, JavaScript pode ser usado para construir:

- APIs;
- servidores;
- sistemas web;
- serviços;
- workers;
- integrações;
- processamento assíncrono.

Frameworks e bibliotecas conhecidos incluem:

```text
Express
Fastify
NestJS
```

---

## Automação e ferramentas

JavaScript também pode ser usado para scripts e ferramentas executadas pelo Node.js.

Por exemplo:

```text
gerar arquivos
automatizar tarefas
processar dados
criar CLIs
executar scripts de build
```

---

## Mobile e desktop

Tecnologias do ecossistema JavaScript também permitem criar aplicações para outros ambientes.

Exemplos:

```text
React Native
Electron
```

Isso não significa que JavaScript seja sempre a única ou melhor escolha, mas mostra como o ecossistema se expandiu.

---

# Onde TypeScript é utilizado?

TypeScript aparece nos mesmos tipos de projetos porque ele está diretamente ligado ao ecossistema JavaScript.

É especialmente comum em:

- aplicações React;
- aplicações Angular;
- backends Node.js;
- projetos NestJS;
- bibliotecas npm;
- monorepos;
- sistemas mantidos por várias pessoas;
- projetos grandes ou de longa duração;
- bases de código com muitos modelos e contratos.

Mas TypeScript não precisa estar restrito a projetos enormes.

Até pequenos projetos podem se beneficiar de autocomplete, documentação de tipos e detecção antecipada de incompatibilidades.

---

# Quando JavaScript pode fazer mais sentido?

JavaScript pode ser uma ótima escolha quando:

- você está aprendendo os fundamentos da linguagem;
- o projeto é pequeno;
- está fazendo uma automação muito simples;
- quer experimentar rapidamente uma ideia;
- a configuração adicional de TypeScript não trará benefício suficiente;
- o ambiente ou projeto existente já é JavaScript e não há necessidade de migração.

Um dos maiores pontos positivos de JavaScript é sua **simplicidade de entrada**.

Você pode criar:

```js
console.log("Olá");
```

e executá-lo imediatamente em um navegador ou com Node.js.

Essa baixa barreira de entrada é extremamente útil para aprendizado, protótipos e pequenos scripts.

---

# Pontos positivos do JavaScript

## Ecossistema enorme

JavaScript está presente em praticamente todo o desenvolvimento web moderno.

Existe uma enorme quantidade de:

- bibliotecas;
- frameworks;
- documentação;
- cursos;
- comunidades;
- ferramentas.

## Execução direta nos navegadores

É a linguagem de programação padrão da web para comportamento no navegador.

## Flexibilidade

JavaScript permite construir rapidamente desde pequenos scripts até grandes aplicações.

## Curva inicial menor

Para começar, você não precisa aprender um sistema de tipos adicional.

---

# Pontos negativos ou desafios do JavaScript

## Alguns erros aparecem tarde

Sem uma camada adicional de análise, determinadas incompatibilidades podem aparecer apenas quando o código é executado.

## Projetos grandes podem ficar difíceis de compreender

Em uma base extensa, nem sempre é óbvio qual formato uma função espera receber ou retornar.

## Refatorações podem exigir mais cuidado

Se uma estrutura muda, pode ser difícil descobrir todos os lugares impactados sem testes e boas ferramentas.

## Flexibilidade pode permitir inconsistências

A mesma liberdade que torna JavaScript rápido para começar também pode permitir combinações inesperadas de valores.

Isso não torna JavaScript uma linguagem ruim.

Significa apenas que flexibilidade possui benefícios e custos.

---

# Quando TypeScript pode fazer mais sentido?

TypeScript costuma ser muito valioso quando:

- o projeto possui muitas partes;
- várias pessoas trabalham no mesmo código;
- o sistema continuará sendo mantido por anos;
- existem muitos formatos de dados;
- APIs e módulos precisam de contratos claros;
- refatorações são frequentes;
- queremos autocomplete e navegação mais precisos;
- queremos detectar incompatibilidades durante o desenvolvimento.

---

# Pontos positivos do TypeScript

## Detecta muitos problemas antes da execução

Erros relacionados a tipos podem aparecer ainda no editor ou durante o build.

## Melhora o autocomplete

Quando uma ferramenta conhece o formato de um objeto, ela pode oferecer sugestões mais precisas.

<!-- IMAGE:
Screenshot sugerido:

usuario.

Autocomplete:
nome
email
idade
ativo

Legenda:
"Tipos também funcionam como informação para o editor."
-->

## Ajuda na documentação do código

Veja:

```ts
function criarUsuario(nome: string, idade: number): Usuario
```

Mesmo sem abrir a implementação, já sabemos bastante sobre o contrato dessa função.

## Refatorações ficam mais seguras

Uma alteração em um tipo pode ajudar o compilador a mostrar vários pontos que precisam ser atualizados.

## Pode facilitar manutenção em equipes

Tipos criam uma linguagem adicional para descrever contratos entre diferentes partes de um sistema.

---

# Pontos negativos ou desafios do TypeScript

## Existe uma curva de aprendizado adicional

Além de JavaScript, você precisará aprender conceitos como:

```text
types
interfaces
unions
generics
narrowing
inference
```

Não precisa aprender tudo no primeiro dia, mas esses conceitos fazem parte da jornada.

## Pode exigir configuração

Projetos TypeScript normalmente possuem ferramentas e arquivos adicionais, como:

```text
tsconfig.json
```

Dependendo do ambiente, também existem configurações de build, módulos e integração com frameworks.

## Mensagens de erro podem parecer complexas

Em tipos avançados, erros do TypeScript podem ser longos e difíceis de interpretar.

## Nem todo problema é resolvido por tipos

Um projeto TypeScript ruim continua sendo um projeto ruim.

Tipos não substituem arquitetura, testes, segurança ou boas regras de negócio.

---

# Então TypeScript é melhor que JavaScript?

Não existe uma resposta universal.

A pergunta mais útil é:

> **Qual problema meu projeto possui e qual custo estou disposto a assumir?**

TypeScript oferece mais informações e análise durante o desenvolvimento.

Em troca, adiciona conceitos e ferramentas que precisam ser compreendidos.

JavaScript oferece uma entrada mais direta e flexível.

Em troca, determinadas garantias precisam ser obtidas através de testes, disciplina, documentação e outras ferramentas.

Não precisamos transformar a comparação em uma competição.

Os dois fazem parte do mesmo ecossistema.

---

# Preciso aprender JavaScript antes de TypeScript?

Você não precisa dominar JavaScript inteiro antes de escrever sua primeira linha de TypeScript.

Mas precisa entender uma coisa:

> **Aprender TypeScript sem aprender JavaScript cria uma base frágil.**

TypeScript utiliza:

- funções JavaScript;
- arrays JavaScript;
- objetos JavaScript;
- promises JavaScript;
- módulos JavaScript;
- classes JavaScript;
- operadores JavaScript;
- comportamento de runtime JavaScript.

Por isso, uma boa estratégia é estudar os dois de maneira progressiva.

Por exemplo:

```text
JavaScript básico
       ↓
variáveis, funções, objetos e arrays
       ↓
TypeScript básico
       ↓
tipos, inferência e funções tipadas
       ↓
JavaScript assíncrono
       ↓
Promises e async/await
       ↓
TypeScript aplicado a esses conceitos
       ↓
TSConfig e módulos
```

---

# Um pequeno exemplo completo

Vamos imaginar um sistema que apresenta uma pessoa.

## JavaScript

```js
function apresentarPessoa(pessoa) {
  return `${pessoa.nome} tem ${pessoa.idade} anos.`;
}

const pessoa = {
  nome: "Ana",
  idade: 20
};

console.log(apresentarPessoa(pessoa));
```

Funciona.

Mas nada na assinatura:

```js
function apresentarPessoa(pessoa)
```

nos diz exatamente qual deve ser o formato de `pessoa`.

Outra pessoa pode chamar:

```js
apresentarPessoa({
  name: "Ana",
  age: 20
});
```

JavaScript só descobrirá o problema quando aquele código for utilizado.

Em TypeScript podemos tornar o contrato explícito:

```ts
interface Pessoa {
  nome: string;
  idade: number;
}

function apresentarPessoa(pessoa: Pessoa): string {
  return `${pessoa.nome} tem ${pessoa.idade} anos.`;
}
```

Agora uma chamada incompatível pode ser detectada:

```ts
apresentarPessoa({
  name: "Ana",
  age: 20
});
```

O benefício não é apenas "impedir erros".

O código também passou a comunicar melhor sua intenção.

---

# Um ponto importante: TypeScript continua precisando do runtime

Mesmo com TypeScript, no fim precisamos executar o programa em algum ambiente.

Em um fluxo tradicional:

```text
Código TypeScript
       ↓
TypeScript / ferramenta de build
       ↓
JavaScript
       ↓
Navegador ou Node.js
```

Por isso é importante separar:

```text
linguagem
ferramenta de análise
processo de build
runtime
```

São coisas relacionadas, mas não são a mesma coisa.

Essa separação será essencial ao estudar `tsconfig.json`, `target`, `module` e `moduleResolution`.

---

# Perguntas frequentes

## JavaScript e Java são a mesma coisa?

Não.

Apesar dos nomes parecidos, JavaScript e Java são linguagens diferentes, com histórias, ecossistemas e características diferentes.

O nome JavaScript costuma causar essa confusão, especialmente entre iniciantes.

---

## TypeScript é outra linguagem?

Sim, TypeScript é uma linguagem.

Mas ela foi projetada para ser fortemente compatível com JavaScript e acrescentar recursos sobre ele.

Por isso dizemos frequentemente que TypeScript é um **superset** — ou superconjunto — de JavaScript.

Para um iniciante, a ideia mais importante é:

> TypeScript parte do mundo JavaScript e adiciona principalmente um sistema de tipos e ferramentas de análise.

---

## Um navegador executa TypeScript diretamente?

Em desenvolvimento web tradicional, navegadores executam JavaScript.

Código TypeScript normalmente passa por alguma ferramenta que remove ou transforma recursos exclusivos de TypeScript antes que o resultado seja entregue ao navegador.

---

## Node.js executa TypeScript?

JavaScript é a linguagem natural do runtime Node.js.

Projetos TypeScript utilizam diferentes estratégias: podem compilar antes da execução ou usar ferramentas que processam TypeScript durante o desenvolvimento.

Para começar, mantenha este modelo mental:

```text
TypeScript
   ↓
processamento
   ↓
JavaScript
   ↓
Node.js
```

---

## TypeScript deixa a aplicação mais rápida?

Não necessariamente.

O principal objetivo do TypeScript é melhorar a experiência de desenvolvimento e a análise do código.

Ele não deve ser adotado esperando automaticamente melhorar a velocidade da aplicação em produção.

---

## TypeScript deixa a aplicação segura?

Ele ajuda a encontrar incompatibilidades de tipos.

Mas segurança envolve muito mais:

- validação de entradas;
- autenticação;
- autorização;
- tratamento de dados;
- atualização de dependências;
- infraestrutura;
- práticas de segurança.

TypeScript não substitui essas medidas.

---

## TypeScript elimina a necessidade de testes?

Não.

Tipos e testes verificam coisas diferentes.

TypeScript pode verificar:

```text
"Esta função esperava number, mas recebeu string."
```

Um teste pode verificar:

```text
"Quando o usuário possui 10% de desconto, o valor final deve ser R$ 90."
```

As duas ferramentas podem trabalhar juntas.

---

## Posso misturar JavaScript e TypeScript?

Sim.

Existem projetos que migram gradualmente de `.js` para `.ts`.

O próprio TypeScript possui opções para trabalhar com arquivos JavaScript durante uma migração.

Esse é um dos motivos pelos quais a adoção pode ser feita de forma progressiva.

---

## Qual devo aprender primeiro?

Comece pelos fundamentos de JavaScript.

Depois introduza TypeScript cedo, sem esperar dominar cada detalhe de JavaScript.

O ideal é que os dois estudos se apoiem.

---

# Um resumo da história

Se precisarmos condensar toda a história em poucos pontos:

```text
1995
JavaScript nasce para adicionar comportamento às páginas web.

1997
A linguagem começa a ser padronizada através do ECMAScript.

2009
Node.js ajuda JavaScript a crescer fora do navegador.

Com o tempo
Aplicações JavaScript ficam maiores e mais complexas.

2012
Microsoft apresenta TypeScript.

TypeScript
mantém o ecossistema e a base do JavaScript,
mas adiciona tipos e análise estática.

Hoje
JavaScript e TypeScript convivem no mesmo ecossistema
e aparecem em frontend, backend, ferramentas,
bibliotecas e vários tipos de aplicação.
```

---

# O que você deve levar deste artigo

Se você esquecer todos os detalhes, lembre-se destas ideias.

**JavaScript** é uma linguagem de programação.

Ela nasceu associada à web, cresceu muito além do navegador e hoje pode ser utilizada em interfaces, servidores, ferramentas, automações e diversos outros ambientes.

JavaScript possui tipagem dinâmica, o que oferece bastante flexibilidade, mas significa que alguns problemas só ficam evidentes durante a execução.

**TypeScript** foi criado sobre JavaScript.

Ele mantém os fundamentos e o ecossistema da linguagem, mas acrescenta um sistema de tipos e ferramentas capazes de analisar muitas incompatibilidades antes da execução.

TypeScript não elimina JavaScript.

Na prática, aprender TypeScript também significa continuar aprendendo JavaScript.

A diferença principal pode ser resumida assim:

> JavaScript descreve o comportamento que será executado.  
> TypeScript permite descrever esse mesmo comportamento com informações adicionais que podem ser verificadas antes da execução.

Nenhum dos dois elimina a necessidade de testes, boas regras de negócio, segurança e conhecimento sobre como a aplicação realmente funciona.

---

# Para onde ir agora?

Se este foi seu primeiro contato com JavaScript e TypeScript, uma boa sequência é:

1. Variáveis e tipos de valores em JavaScript
2. Funções em JavaScript
3. Objetos e arrays em JavaScript
4. O que é TypeScript? Tipos e inferência na prática
5. JavaScript assíncrono: Promises e async/await
6. Módulos JavaScript: import, export, ESM e CommonJS
7. [TSConfig sem mistério](/pt-BR/articles/tsconfig-sem-misterio)

A partir daqui, quando você encontrar um arquivo `.js`, `.ts` ou `tsconfig.json`, ele deixará de parecer apenas mais uma extensão ou configuração desconhecida.

Você começará a entender **qual papel cada peça possui dentro da aplicação**.
