import type {Transaction} from 'sequelize';
export interface IPersistenceContext {
    getTransaction(): Transaction | undefined;
    requireTransaction(): Transaction;
    markRollbackOnly(): void;
    isRollbackOnly(): boolean;
    run<T>(transaction: Transaction, work: () => Promise<T>): Promise<T>;
}
