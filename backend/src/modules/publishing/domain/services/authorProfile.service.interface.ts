import type {EditorialCatalog} from '../editorial-catalog';
export interface IAuthorProfileService {
    validate(values: EditorialCatalog['authors']): Promise<void>;
    write(values: EditorialCatalog['authors'], now: Date): Promise<void>;
    ensureDefault(now: Date): Promise<void>;
}
