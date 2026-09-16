import type {Locale} from '../publishing.types';
import type {ProjectDetail, ProjectSummary, SlugQuery} from '../public-content.types';
import type {EditorialCatalog} from '../editorial-catalog';

export interface IPublicProjectRepository {
    list(locale: Locale): Promise<readonly ProjectSummary[]>;

    getBySlug(input: SlugQuery): Promise<ProjectDetail | null>;
}

export interface IProjectEditorialService {
    write(projects: EditorialCatalog['projects'], now: Date): Promise<void>;
}

export class ProjectService {
    constructor(private readonly repository: IPublicProjectRepository) {
    }

    async list(locale: Locale): Promise<readonly ProjectSummary[]> {
        return await this.repository.list(locale);
    }

    async getBySlug(input: SlugQuery): Promise<ProjectDetail | null> {
        return await this.repository.getBySlug(input);
    }
}
