/** Conteúdo temporário: substitua todos os itens antes da publicação. */
export interface DemoItem {
    readonly title: string;
    readonly description: string;
    readonly meta: string;
    readonly tags: readonly string[];
    readonly isPlaceholder: true;
}

const item = (title: string, description: string, meta: string, tags: readonly string[]): DemoItem => ({
    title,
    description,
    meta,
    tags,
    isPlaceholder: true
});
export const demoHome = {
    eyebrow: "CONTEÚDO FICTÍCIO",
    title: "Ideias, estudos e projetos em construção.",
    description: "Esta página inicial é uma estrutura editorial pronta para receber os artigos e projetos reais do blog.",
    featured: [item("Como desenhar uma experiência de leitura", "Exemplo de artigo em destaque para definir a hierarquia visual da página.", "Artigo fictício · 8 min", ["Editorial", "UX"]), item("Notas sobre sistemas que duram", "Um segundo espaço de destaque para conteúdo futuro.", "Artigo fictício · 6 min", ["Arquitetura"]), item("Pequenas ferramentas, grandes ganhos", "Exemplo de conteúdo curto para a grade lateral.", "Artigo fictício · 4 min", ["Produtividade"])],
    domains: ["Tecnologia", "Produto", "Carreira", "Aprendizado"]
};
export const demoCategories = [item("Tecnologia", "Arquitetura, desenvolvimento e ferramentas.", "12 artigos fictícios", ["Código", "Sistemas"]), item("Produto", "Decisões, experimentos e experiência de uso.", "8 artigos fictícios", ["Estratégia"]), item("Carreira", "Aprendizado contínuo e prática profissional.", "6 artigos fictícios", ["Trabalho"]), item("Notas", "Ensaios breves e referências para explorar.", "15 notas fictícias", ["Leituras"])];
export const demoProjects = [item("Painel de observabilidade", "Exemplo de projeto com indicadores e alertas para equipes de produto.", "Em produção · Conteúdo fictício", ["TypeScript", "Dados"]), item("Biblioteca de componentes", "Exemplo de sistema de interface acessível e documentado.", "Em evolução · Conteúdo fictício", ["React", "Design system"]), item("Mapa de decisões", "Exemplo de ferramenta para registrar contexto técnico.", "Experimental · Conteúdo fictício", ["Produto", "Documentação"])];
export const demoSeries = [item("Fundamentos de arquitetura", "Uma trilha exemplo para organizar artigos progressivos sobre sistemas.", "4 de 8 artigos · Conteúdo fictício", ["Intermediário", "Em andamento"]), item("Escrever para aprender", "Uma série exemplo sobre pesquisa, síntese e publicação.", "2 de 6 artigos · Conteúdo fictício", ["Iniciante", "Em andamento"]), item("Produto com intenção", "Uma série exemplo sobre descobrir problemas e medir impacto.", "0 de 5 artigos · Conteúdo fictício", ["Avançado", "Planejada"])];
