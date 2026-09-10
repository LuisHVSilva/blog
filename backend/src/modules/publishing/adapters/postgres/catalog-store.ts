import {QueryTypes, type Sequelize, type Transaction} from 'sequelize';
import type {EditorialCatalog} from '../../application/editorial-catalog';
import {PublishingConflictError, PublishingValidationError} from '../../application/publishing.errors';

export async function validateCatalogState(database: Sequelize, transaction: Transaction, catalog: EditorialCatalog) {
    for (const author of catalog.authors) {
        const owners = await database.query<{id: string}>('SELECT id FROM author_profiles WHERE profile_slug=:slug AND id<>:id', {transaction, replacements: {slug: author.profileSlug, id: author.id}, type: QueryTypes.SELECT});
        if (owners.length) throw new PublishingConflictError('Author profile slug is already reserved.');
    }
    for (const [table, foreignKey, entries] of [['tag_translations', 'tag_id', catalog.tags], ['series_translations', 'series_id', catalog.series]] as const) {
        for (const entry of entries) {
            const entityTable = table === 'tag_translations' ? 'tags' : 'series';
            const keys = await database.query<{id: string}>(`SELECT id FROM ${entityTable} WHERE key=:key AND id<>:id`, {transaction, replacements: {key: entry.key, id: entry.id}, type: QueryTypes.SELECT});
            if (keys.length) throw new PublishingConflictError('Taxonomy key is already reserved.');
            for (const translation of entry.translations) {
                const rows = await database.query<{id: string; slug: string; published_once: boolean}>(`SELECT ${foreignKey} id,slug,published_once FROM ${table} WHERE locale=:locale AND (${foreignKey}=:id OR slug=:slug)`, {transaction, replacements: {id: entry.id, locale: translation.locale, slug: translation.slug}, type: QueryTypes.SELECT});
                if (rows.some((row) => row.id !== entry.id)) throw new PublishingConflictError('Taxonomy slug is already reserved.');
                if (rows.some((row) => row.published_once && row.slug !== translation.slug)) throw new PublishingConflictError('TAXONOMY_SLUG_IMMUTABLE');
            }
        }
    }
}

export async function writeCatalog(database: Sequelize, transaction: Transaction, catalog: EditorialCatalog, now: Date) {
    for (const author of catalog.authors) await database.query(`INSERT INTO author_profiles(id,display_name,profile_slug,bio,links) VALUES (:id,:displayName,:profileSlug,:bio,:links::jsonb)
        ON CONFLICT(id) DO UPDATE SET display_name=EXCLUDED.display_name,profile_slug=EXCLUDED.profile_slug,bio=EXCLUDED.bio,links=EXCLUDED.links`, {transaction, replacements: {...author, links: JSON.stringify(author.links)}});
    for (const tag of catalog.tags) {
        await database.query('INSERT INTO tags(id,key) VALUES (:id,:key) ON CONFLICT(id) DO UPDATE SET key=EXCLUDED.key', {transaction, replacements: {id: tag.id, key: tag.key}});
        for (const translation of tag.translations) {
            const previous = await database.query<{slug: string; published_once: boolean}>('SELECT slug,published_once FROM tag_translations WHERE tag_id=:id AND locale=:locale', {transaction, replacements: {id: tag.id, locale: translation.locale}, type: QueryTypes.SELECT});
            if (previous[0]?.published_once && previous[0].slug !== translation.slug) throw new PublishingConflictError('TAXONOMY_SLUG_IMMUTABLE');
            await database.query(`INSERT INTO tag_translations(tag_id,locale,name,slug,description,status,published_once) VALUES (:id,:locale,:name,:slug,:description,:status,:published)
                ON CONFLICT(tag_id,locale) DO UPDATE SET name=EXCLUDED.name,slug=EXCLUDED.slug,description=EXCLUDED.description,status=EXCLUDED.status,published_once=tag_translations.published_once OR EXCLUDED.published_once`, {transaction, replacements: {...translation, id: tag.id, description: translation.description ?? null, published: translation.status === 'published'}});
        }
    }
    for (const series of catalog.series) {
        await database.query(`INSERT INTO series(id,key,difficulty,status,updated_at) VALUES (:id,:key,:difficulty,:status,:now) ON CONFLICT(id) DO UPDATE SET key=EXCLUDED.key,difficulty=EXCLUDED.difficulty,status=EXCLUDED.status,updated_at=EXCLUDED.updated_at`, {transaction, replacements: {id: series.id, key: series.key, difficulty: series.difficulty ?? null, status: series.status, now}});
        for (const translation of series.translations) {
            const previous = await database.query<{slug: string; published_once: boolean}>('SELECT slug,published_once FROM series_translations WHERE series_id=:id AND locale=:locale', {transaction, replacements: {id: series.id, locale: translation.locale}, type: QueryTypes.SELECT});
            if (previous[0]?.published_once && previous[0].slug !== translation.slug) throw new PublishingConflictError('TAXONOMY_SLUG_IMMUTABLE');
            await database.query(`INSERT INTO series_translations(series_id,locale,title,slug,description,status,published_once) VALUES (:id,:locale,:title,:slug,:description,:status,:published)
                ON CONFLICT(series_id,locale) DO UPDATE SET title=EXCLUDED.title,slug=EXCLUDED.slug,description=EXCLUDED.description,status=EXCLUDED.status,published_once=series_translations.published_once OR EXCLUDED.published_once`, {transaction, replacements: {...translation, id: series.id, published: translation.status === 'published'}});
        }
    }
}
export async function writeCatalogRelations(database: Sequelize, transaction: Transaction, catalog: EditorialCatalog, now: Date) {
    for (const article of catalog.articles) {
        await database.query('UPDATE articles SET author_id=:authorId,source_locale=:sourceLocale,difficulty=:difficulty WHERE id=:id', {transaction, replacements: {...article}});
        await database.query('DELETE FROM article_tags WHERE article_id=:id', {transaction, replacements: {id: article.id}});
        for (const tagId of article.tagIds) await database.query('INSERT INTO article_tags(article_id,tag_id) VALUES (:id,:tagId)', {transaction, replacements: {id: article.id, tagId}});
    }
    for (const series of catalog.series) {
        await database.query('DELETE FROM series_articles WHERE series_id=:id', {transaction, replacements: {id: series.id}});
        for (const member of series.members) await database.query('INSERT INTO series_articles(series_id,article_id,position) VALUES (:id,:articleId,:position)', {transaction, replacements: {id: series.id, ...member}});
    }
    for (const operation of catalog.operations) {
        if (!operation.reason.trim()) throw new PublishingValidationError('Visibility operations require a reason.');
        if (operation.kind === 'archive' || operation.kind === 'restore') {
            await database.query('UPDATE articles SET archived_at=:at WHERE id=:id', {transaction, replacements: {id: operation.articleId, at: operation.kind === 'archive' ? now : null}});
        } else {
            if (!operation.locale) throw new PublishingValidationError('Translation operations require a locale.');
            const current = await database.query<{status: string}>('SELECT status FROM article_translations WHERE article_id=:id AND locale=:locale', {transaction, replacements: {id: operation.articleId, locale: operation.locale}, type: QueryTypes.SELECT});
            if (!current[0] || (operation.kind === 'restoreTranslation' && current[0].status !== 'archived')) throw new PublishingValidationError('Invalid translation operation.');
            await database.query('UPDATE article_translations SET status=:status,updated_at=:now WHERE article_id=:id AND locale=:locale', {transaction, replacements: {id: operation.articleId, locale: operation.locale, now, status: operation.kind === 'archiveTranslation' ? 'archived' : 'draft'}});
        }
    }
}
