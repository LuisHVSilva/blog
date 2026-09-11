import type {EditorialCatalog} from '../editorial-catalog';
export interface ICatalogService {
    validate(catalog: EditorialCatalog): Promise<void>;
    write(catalog: EditorialCatalog, now: Date): Promise<void>;
    writeRelations(catalog: EditorialCatalog, now: Date): Promise<void>;
}
