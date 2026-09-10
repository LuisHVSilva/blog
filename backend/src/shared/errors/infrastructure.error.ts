export class InfrastructureError extends Error {
    readonly code: string = 'INFRA_ERROR';

    constructor(
        message: string,
        public readonly cause?: unknown,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class RepositoryError extends InfrastructureError {
    override readonly code = 'REPO_ERROR';
}
