import type {EditorialCatalog} from '../editorial-catalog';
export interface ISeriesEditorialService {
    validate(values: EditorialCatalog['series']): Promise<void>;
    write(values: EditorialCatalog['series'], now: Date): Promise<void>;
    writeMembers(values: EditorialCatalog['series']): Promise<void>;
}
