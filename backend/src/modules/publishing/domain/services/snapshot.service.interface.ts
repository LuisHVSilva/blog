import type {PublicSnapshot} from '../public-content.types';
export interface ISnapshotService { export(): Promise<PublicSnapshot>; }
