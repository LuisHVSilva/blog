import type {ArticleSummary} from '../../../../content/article-projections';
import type {PublishedLocale} from '../../../../routing/public-routes';

export function difficultyLabel(difficulty: ArticleSummary['difficulty'], locale: PublishedLocale) {
    const labels = locale === 'pt-BR'
        ? {foundational: 'Fundamentos', intermediate: 'Intermediario', advanced: 'Avancado'}
        : {foundational: 'Foundational', intermediate: 'Intermediate', advanced: 'Advanced'};
    return labels[difficulty];
}
