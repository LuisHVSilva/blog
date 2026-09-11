import {AsyncLocalStorage} from 'node:async_hooks';
import type {Transaction} from 'sequelize';
import type {IPersistenceContext} from './persistenceContext.interface';

/** An instance belongs to one persistence composition, not to a global container. */
export class PersistenceContext implements IPersistenceContext {
    private readonly storage = new AsyncLocalStorage<{transaction: Transaction; rollbackOnly: boolean}>();
    getTransaction(): Transaction | undefined { return this.storage.getStore()?.transaction; }
    requireTransaction(): Transaction {
        const transaction = this.getTransaction();
        if (!transaction) throw new Error('Editorial writes require a unit of work.');
        return transaction;
    }
    run<T>(transaction: Transaction, work: () => Promise<T>): Promise<T> {
        return this.storage.run({transaction, rollbackOnly: false}, work);
    }
    markRollbackOnly(): void {
        const state = this.storage.getStore();
        if (!state) throw new Error('Editorial writes require a unit of work.');
        state.rollbackOnly = true;
    }
    isRollbackOnly(): boolean { return this.storage.getStore()?.rollbackOnly ?? false; }
}
