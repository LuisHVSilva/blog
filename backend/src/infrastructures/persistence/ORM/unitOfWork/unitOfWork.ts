import type {Sequelize} from 'sequelize';
import type {IUnitOfWork} from '../../../../modules/publishing/application/ports/unitOfWork.interface';
import type {IPersistenceContext} from '../context/persistenceContext.interface';

/** Executes editorial writes atomically and propagates nested-operation rollback requests. */
export class UnitOfWork implements IUnitOfWork {
    constructor(
        private readonly sequelize: Sequelize,
        private readonly context: IPersistenceContext
    ) {
    }

    /** Reuses an ambient transaction or creates a new transaction for the supplied work. */
    async execute<T>(work: () => Promise<T>): Promise<T> {
        if (this.context.getTransaction()) {
            try { return await work(); }
            catch (error) { this.context.markRollbackOnly(); throw error; }
        }

        return await this.sequelize.transaction((transaction) => this.context.run(transaction, async () => {
            const result = await work();
            if (this.context.isRollbackOnly()) throw new Error('Transaction marked for rollback by a nested operation.');
            return result;
        }));
    }
}
