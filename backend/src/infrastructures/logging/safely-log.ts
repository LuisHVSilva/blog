export function safelyLog(write: () => Promise<void>): void {
    try {
        void write().catch(() => undefined);
    } catch { /* Logging must not break a response or shutdown. */
    }
}
