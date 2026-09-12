import {type Sequelize, Transaction} from 'sequelize';
import type {IEditorialUnitOfWork} from '../../../../modules/publishing/domain/services/editorialRuntime.interface';
import type {IPersistenceContext} from '../context/persistenceContext.interface';

/** Runs public snapshot reads under a repeatable-read, read-only transaction. */
export class ReadSnapshotUnitOfWork implements IEditorialUnitOfWork {
    constructor(
        private readonly database: Sequelize,
        private readonly context: IPersistenceContext
    ) {
    }

    async execute<T>(work: () => Promise<T>): Promise<T> {
        if (this.context.getTransaction()) return await work();
        return await this.database.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ, readOnly: true}, async (transaction) => {
            // Sequelize's readOnly option selects the read pool; enforce it in PostgreSQL too.
            await this.database.query('SET TRANSACTION READ ONLY', {transaction});
            return await this.context.run(transaction, work);
        });
    }
}
