export class PersistenceNumbers {
    static count(value: string): number {
        const result = Number(value);
        if (!Number.isSafeInteger(result) || result < 0) {
            throw new Error('Public count exceeds the supported integer range.');
        }
        return result;
    }
}
