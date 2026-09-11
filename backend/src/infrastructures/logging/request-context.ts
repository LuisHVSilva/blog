import {AsyncLocalStorage} from 'async_hooks';

export interface RequestLogContext {
    requestId: string;
    traceId: string;
    method: string;
    path: string;
}

const storage = new AsyncLocalStorage<RequestLogContext>();

export const RequestContext = {
    run<T>(context: RequestLogContext, callback: () => T): T {
        return storage.run(context, callback);
    },

    get(): RequestLogContext | undefined {
        return storage.getStore();
    },
};
