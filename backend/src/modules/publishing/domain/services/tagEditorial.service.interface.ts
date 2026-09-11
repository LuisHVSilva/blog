import type {EditorialCatalog} from '../editorial-catalog';
export interface ITagEditorialService {
    validate(values: EditorialCatalog['tags']): Promise<void>;
    write(values: EditorialCatalog['tags'], now: Date): Promise<void>;
}
