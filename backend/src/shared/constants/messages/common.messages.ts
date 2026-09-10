export const commonMessages = {
  success: {},
  error: {
    unknown: 'Unknown error.',
    unexpectedRequest: 'Unexpected error.',
    notFound: 'Resource not found.',
    inactiveEntity: 'Entity is inactive.',
    serverError: 'Server start error.',
  },
  info: {
    serverRunning: (port: number) => `Server running on http://localhost:${port}.`,
    databaseConnected: 'Database connected.',
    databaseConnectionError: 'Database connection error.',
  },
} as const;
