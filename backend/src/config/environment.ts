import dotenv from 'dotenv';
import {existsSync} from 'node:fs';
import path from 'node:path';

/**
 * Walks upward from a directory until it finds the backend package root.
 *
 * @param startDirectory - Directory from which to start the upward search.
 * @throws {Error} When no containing package root exists.
 */
export function findProjectRoot(startDirectory: string): string {
    let directory: string = startDirectory;

    while (!existsSync(path.join(directory, 'package.json'))) {
        const parent: string = path.dirname(directory);

        if (parent === directory) {
            throw new Error('Could not locate the project root.');
        }

        directory = parent;
    }

    return directory;
}

/**
 * Returns environment values augmented by the local development or test file.
 *
 * Explicit values win over file values, and production intentionally never reads a dotenv file.
 *
 * @param env - Initial environment values, allowing callers and tests to inject settings.
 * @param directory - Optional directory used to locate the project root.
 */
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
