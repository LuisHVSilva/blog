import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import {homeContent} from '../../src/modules/publishing/domain/home-content';
import type {ArticleDetail} from '../../src/modules/publishing/domain/public-content.types';

test('home selection is localized, bounded and deterministic; missing modules stay preparing', () => {
    const articles = Array.from({length: 5}, (_, index) => ({articleId: String(index), translationId: `translation-${index}`, locale: index === 4 ? 'en' : 'pt-BR', publishedAt: `2026-09-${10 + index}T00:00:00.000Z`})) as ArticleDetail[];
    const result = homeContent(articles, [], []);
    assert.deepEqual(result[0].featuredTranslationIds, ['translation-3', 'translation-2', 'translation-1']);
    assert.deepEqual(result[1].featuredTranslationIds, ['translation-4']);
    assert.equal(result[0].newsletterStatus, 'preparing');
    assert.deepEqual(homeContent([], [], [])[0].featuredTranslationIds, []);
});
