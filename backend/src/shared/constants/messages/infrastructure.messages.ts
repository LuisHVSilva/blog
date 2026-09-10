export const infrastructureMessages = {
  success: {
    logDirectoryReady: 'Log directory is ready.',
  },
  error: {
    logDirectoryCreationFailed: 'Failed to create the log directory.',
    logWriteFailed: 'Failed to save the log file.',
    executionStarted: 'Execution started.',
    executionCompleted: (duration: number) => `Execution completed in ${duration}ms.`,
    unexpectedErrorWithMessage: (message: string) => `Unexpected error: ${message}`,
    corsBlockedOrigin: (origin: string) => `CORS blocked for origin: ${origin}.`,
    dataProtectionKeysNotConfigured: 'DATA_ENCRYPTION_KEY and DATA_LOOKUP_KEY must be configured.',
    invalidDataEncryptionKey: 'DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.',
    invalidEncryptedValue: 'Invalid encrypted value.',
  },
  info: {
  },
} as const;
