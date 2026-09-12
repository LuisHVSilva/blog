import type {CorsOptions} from 'cors';
import type {Config} from '../config/env';
import {HttpBoundaryError} from './http-error';

/**
 * Creates the strict CORS policy used by browser-facing API endpoints.
 *
 * Requests without an origin remain valid for non-browser clients; other origins must be allow-listed.
 */
export function createCorsOptions(config: Pick<Config, 'corsOrigins'>): CorsOptions {
    return {
        origin: (origin, callback) => {
            if (!origin || config.corsOrigins.includes(origin)) callback(null, true);
            else callback(new HttpBoundaryError('ORIGIN_NOT_ALLOWED', 403, 'Origin is not allowed.'));
        },
        credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        exposedHeaders: ['X-Request-Id'],
    };
}
