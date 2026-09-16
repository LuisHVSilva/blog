import {QueryTypes, type Sequelize, type Transaction} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import type {EditorialCatalog} from '../../../modules/publishing/domain/editorial-catalog';
import type {
    IProjectEditorialService,
    IPublicProjectRepository
} from '../../../modules/publishing/domain/services/project.service';
import type {Locale} from '../../../modules/publishing/domain/publishing.types';
import type {ProjectDetail, ProjectSummary, SlugQuery} from '../../../modules/publishing/domain/public-content.types';

type Row = {
    id: string;
    slug: string;
    title: string;
    description: string;
    repository_url: string | null;
    demo_url: string | null;
    technologies: unknown;
    published_at: Date;
    updated_at: Date
};

export class ProjectPersistence implements IPublicProjectRepository, IProjectEditorialService {
    constructor(private readonly database: Sequelize, private readonly siteOrigin: string, private readonly context?: IPersistenceContext | Transaction) {
    }

    async write(projects: EditorialCatalog['projects'], now: Date): Promise<void> {
        const transaction = this.context && 'requireTransaction' in this.context ? this.context.requireTransaction() : this.context;
        for (const project of projects) {
            await this.database.query(`INSERT INTO projects(id,key,status,created_at) VALUES(:id,:key,:status,:createdAt) ON CONFLICT(id) DO UPDATE SET key=EXCLUDED.key,status=EXCLUDED.status`, {
                replacements: {
                    ...project,
                    createdAt: new Date(project.createdAt)
                }, transaction
            });
            for (const translation of project.translations) await this.database.query(`INSERT INTO project_translations(project_id,locale,slug,title,description,repository_url,demo_url,technologies,status,updated_at,published_at) VALUES(:projectId,:locale,:slug,:title,:description,:repositoryUrl,:demoUrl,CAST(:technologies AS jsonb),:status,:updatedAt,:publishedAt) ON CONFLICT(project_id,locale) DO UPDATE SET slug=EXCLUDED.slug,title=EXCLUDED.title,description=EXCLUDED.description,repository_url=EXCLUDED.repository_url,demo_url=EXCLUDED.demo_url,technologies=EXCLUDED.technologies,status=EXCLUDED.status,updated_at=EXCLUDED.updated_at,published_at=EXCLUDED.published_at`, {
                replacements: {
                    projectId: project.id, ...translation,
                    repositoryUrl: translation.repositoryUrl ?? null,
                    demoUrl: translation.demoUrl ?? null,
                    technologies: JSON.stringify(translation.technologies),
                    updatedAt: now,
                    publishedAt: translation.status === 'published' ? now : null
                }, transaction
            });
        }
    }

    async list(locale: Locale): Promise<readonly ProjectSummary[]> {
        return (await this.rows(locale)).map((row) => this.summary(locale, row));
    }

    async getBySlug(input: SlugQuery): Promise<ProjectDetail | null> {
        const row = (await this.rows(input.locale, input.slug))[0];
        return row ? {...this.summary(input.locale, row), technologies: this.technologies(row)} : null;
    }

    private async rows(locale: Locale, slug?: string): Promise<Row[]> {
        const transaction = this.context && 'getTransaction' in this.context ? this.context.getTransaction() : this.context;
        return await this.database.query<Row>(`SELECT p.id,t.slug,t.title,t.description,t.repository_url,t.demo_url,t.technologies,t.published_at,t.updated_at FROM projects p JOIN project_translations t ON t.project_id=p.id AND t.locale=:locale WHERE p.status='published' AND t.status='published' ${slug ? 'AND t.slug=:slug' : ''} ORDER BY t.published_at DESC,p.id`, {
            replacements: {
                locale,
                slug
            }, type: QueryTypes.SELECT, transaction
        });
    }

    private technologies(row: Row): readonly string[] {
        return Array.isArray(row.technologies) ? row.technologies.filter((value): value is string => typeof value === 'string') : [];
    }

    private summary(locale: Locale, row: Row): ProjectSummary {
        return {
            id: row.id,
            locale,
            slug: row.slug,
            title: row.title,
            description: row.description, ...(row.repository_url ? {repositoryUrl: row.repository_url} : {}), ...(row.demo_url ? {demoUrl: row.demo_url} : {}),
            publishedAt: row.published_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
            canonical: `${this.siteOrigin}/${locale}/projects/${row.slug}`
        };
    }
}
