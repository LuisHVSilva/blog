import dotenv from 'dotenv';
import {existsSync} from 'node:fs';
import {isIP} from 'node:net';
import path from 'node:path';
import {z, ZodString} from 'zod';
import {ConfigurationError} from "../shared/errors/configuration.error";

const integer = (fallback = '') =>
    z.string()
        .trim()
        .regex(/^\d+$/)
        .default(fallback)
        .transform(Number)
        .pipe(z.number().int().min(1).max(65535));

const nonempty: ZodString = z.string().trim().min(1);

const schema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'), PORT: integer(),
    DB_HOST: nonempty, DB_NAME: nonempty, DB_USERNAME: nonempty, DB_PASSWORD: z.string().min(1),
    DB_PORT: integer('5432'), DB_DIALECT: z.literal('postgres').default('postgres'),
    DB_POOL_MAX: integer('5'), DB_ACQUIRE_MS: integer('5000'), DB_STATEMENT_TIMEOUT_MS: integer('3000'),
    PUBLIC_SITE_URL: z.url(), CORS_ORIGINS: z.string().default(''), TRUST_PROXY: z.string().default(''),
    LOG_SERVICE: z.string().regex(/^[A-Za-z0-9._-]{1,64}$/).default('blog-api'),
    SYNC: z.enum(['false', '']).default('false'),
});


function httpUrl(value: string): URL {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash || url.search) {
        throw new Error('Invalid URL');
    }
    return url;
}

export function loadConfig(env: NodeJS.ProcessEnv) {
    const parsed = schema.safeParse(env);

    if (!parsed.success) {
        throw new ConfigurationError([...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))]);
    }

    const value = parsed.data;
    let site: URL;

    try {
        site = httpUrl(value.PUBLIC_SITE_URL);
        if (site.pathname !== '/' || (value.NODE_ENV === 'production' && site.protocol !== 'https:')) throw new Error();
    } catch {
        throw new ConfigurationError(['PUBLIC_SITE_URL']);
    }

    let origins: string[];

    try {
        origins = [...new Set(value.CORS_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean).map((item) => {
            const url = httpUrl(item);
            if (url.pathname !== '/') throw new Error();
            return url.origin;
        }))];
    } catch {
        throw new ConfigurationError(['CORS_ORIGINS']);
    }

    const proxy: string = value.TRUST_PROXY.trim();
    const networks: string[] = proxy && proxy !== 'false' ? proxy.split(',').map((item) => item.trim()) : [];

    for (const network of networks) {
        const parts: string[] = network.split('/');
        const family: number = isIP(parts[0]!);
        const mask: string = parts[1];
        if (!family || parts.length > 2 || (mask !== undefined && (!/^\d+$/.test(mask) || Number(mask) < 1 || Number(mask) > (family === 4 ? 32 : 128)))) {
            throw new ConfigurationError(['TRUST_PROXY']);
        }
    }

    return Object.freeze({
        nodeEnv: value.NODE_ENV, port: value.PORT, publicSiteUrl: site.href,
        corsOrigins: Object.freeze(origins), trustProxy: Object.freeze(networks), service: value.LOG_SERVICE,
        database: Object.freeze({
            host: value.DB_HOST, name: value.DB_NAME, username: value.DB_USERNAME, password: value.DB_PASSWORD,
            port: value.DB_PORT, dialect: value.DB_DIALECT, poolMax: value.DB_POOL_MAX,
            acquireMs: value.DB_ACQUIRE_MS, statementTimeoutMs: value.DB_STATEMENT_TIMEOUT_MS,
        }),
    });
}

export type Config = ReturnType<typeof loadConfig>;

export function findProjectRoot(startDirectory: string): string {
    let directory: string = startDirectory;

    while (!existsSync(path.join(directory, 'package.json'))) {
        const parent: string = path.dirname(directory);
        if (parent === directory) throw new Error('Could not locate the project root.');
        directory = parent;
    }

    return directory;
}

export function loadEnvironment(env: NodeJS.ProcessEnv = process.env, directory?: string): NodeJS.ProcessEnv {
    const result = {...env};
    const mode: string = result.NODE_ENV ?? 'dev';

    if (mode === 'dev' || mode === 'test') {
        dotenv.config({
            path: path.join(directory ?? findProjectRoot(__dirname), `.env.${mode}`),
            processEnv: result,
            quiet: true
        });
    }

    return result;
}
