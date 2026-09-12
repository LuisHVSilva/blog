import type {ContentValidation, ParsedContent} from '../content-validation.types';

export interface IContentValidationService { validate(items: readonly ParsedContent[]): ContentValidation; }
