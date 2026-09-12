export interface Readiness {
    isStopping(): boolean;

    check(): Promise<boolean>;
}

export function createReadiness(probe: () => Promise<unknown>, isStopping: () => boolean, timeoutMs = 1000): Readiness {
    let pending: Promise<boolean> | undefined;
    let expired: boolean = false;

    return {
        isStopping,
        async check(): Promise<boolean> {
            if (isStopping()) {
                return false;
            }

            if (!pending) {
                expired = false;
                let timer: ReturnType<typeof setTimeout>;
                const operation: Promise<boolean> = Promise.resolve().then(probe).then((): boolean => true, () => false);

                const deadline = new Promise<boolean>((done): void => {
                    timer = setTimeout(() => {
                        expired = true;
                        done(false);
                    }, timeoutMs);
                });

                pending = Promise.race([operation, deadline]);

                void operation.finally((): void => {
                    clearTimeout(timer);
                    pending = undefined;
                });
            }

            if (expired) {
                return false;
            }

            return await pending && !isStopping();
        },
    };
}
