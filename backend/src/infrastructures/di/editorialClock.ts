import type {IEditorialClock} from '../../modules/publishing/domain/services/editorialRuntime.interface';

export class EditorialClock implements IEditorialClock { now(): Date { return new Date(); } }
