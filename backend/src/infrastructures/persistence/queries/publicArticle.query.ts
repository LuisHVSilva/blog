/** Common article fields and its public author, tag, and series projections. */
export const columns = `
    a.id article_id,
    t.id translation_id,
    t.locale,
    t.slug,
    t.title,
    t.description,
    a.difficulty,
    t.published_at,
    t.updated_at,
    t.reading_minutes,
    jsonb_build_object(
        'id',au.id,
        'displayName',au.display_name,
        'profileSlug',au.profile_slug
    ) author,
    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id',g.id,
                    'key',g.key,
                    'name',gt.name,
                    'slug',gt.slug
                )
                ORDER BY gt.slug
            )
            FROM article_tags ag
            JOIN tags g ON g.id=ag.tag_id
            JOIN tag_translations gt ON gt.tag_id=g.id
            WHERE ag.article_id=a.id
                AND gt.locale=t.locale
                AND gt.status='published'
        ),
        '[]'
    ) tags,
    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id',s.id,
                    'title',st.title,
                    'slug',st.slug,
                    'position',sa.position
                )
                ORDER BY st.slug
            )
            FROM series_articles sa
            JOIN series s ON s.id=sa.series_id
            JOIN series_translations st ON st.series_id=s.id
            WHERE sa.article_id=a.id
                AND s.status='published'
                AND st.locale=t.locale
                AND st.status='published'
        ),
        '[]'
    ) series
` as const;

/** Base join shared by public article queries. */
export const joins = `
    FROM article_translations t
    JOIN articles a ON a.id=t.article_id
    JOIN author_profiles au ON au.id=a.author_id
` as const;

export {visible} from './publicVisibility.query';
