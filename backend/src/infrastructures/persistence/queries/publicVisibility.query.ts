/** SQL predicate shared by every public-content projection. */
export const visible = `
    t.status='published'
    AND a.archived_at IS NULL
` as const;
