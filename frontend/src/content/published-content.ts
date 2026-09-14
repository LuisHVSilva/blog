import source from '../../generated/published-content.json';
import {snapshotSchema} from './published-schema';

export const publishedContent = snapshotSchema.parse(source);
