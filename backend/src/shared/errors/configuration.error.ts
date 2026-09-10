export class ConfigurationError extends Error {
    constructor(public readonly fields: readonly string[]) {
        super(`Invalid configuration: ${fields.join(', ')}.`);
        this.name = 'ConfigurationError';
    }
}
