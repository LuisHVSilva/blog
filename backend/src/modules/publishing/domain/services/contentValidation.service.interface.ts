import type {ParsedContent, ContentValidation} from './contentValidation.service';
export interface IContentValidationService { validate(items: readonly ParsedContent[]): ContentValidation; }
