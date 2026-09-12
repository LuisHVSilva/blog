/** Fixed messages authored by HTTP adapters; never construct these from raw input. */
export class HttpBoundaryError extends Error {
    constructor(
        public readonly code: string,
        public readonly status: number,
        message: string
    ) {
        super(message);
    }
}
