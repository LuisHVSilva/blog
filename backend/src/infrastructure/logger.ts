import {ILogger} from './logging/logger.interface';
import {LogFormatter} from './logging/formatter';
import {LoggerContext} from './logging/logger.context';
import {ERROR_DESCRIPTION, INFO_DESCRIPTION, WARN_DESCRIPTION} from '../shared/constants/logger.constants';

interface LoggerConfig {
    service?: string;
}

class Logger implements ILogger {
    private readonly formatter = new LogFormatter();

    constructor(private readonly config: LoggerConfig = {}) {
    }

    private async write(logMessage: string): Promise<void> {
        process.stdout.write(logMessage);
    }

    async logError(
        context: LoggerContext,
        message: string,
        stack?: string,
        info?: unknown,
        httpStatus?: number,
    ): Promise<void> {
        await this.write(this.formatter.format(
            ERROR_DESCRIPTION,
            context.className,
            context.method,
            message,
            httpStatus,
            {...(info as Record<string, unknown> | undefined), ...(stack ? {stack} : {})},
            this.getService(),
        ));
    }

    async logException(
        context: LoggerContext,
        error: Error,
        info?: unknown,
        httpStatus?: number,
    ): Promise<void> {
        await this.logError(context, error.message, error.stack, info, httpStatus);
    }

    async logWarn(
        context: LoggerContext,
        message: string,
        httpStatus?: number,
        info?: unknown,
    ): Promise<void> {
        await this.write(this.formatter.format(
            WARN_DESCRIPTION, context.className, context.method, message, httpStatus, info, this.getService(),
        ));
    }

    async logInfo(
        context: LoggerContext,
        message: string,
        httpStatus?: number,
        info?: unknown,
    ): Promise<void> {
        await this.write(this.formatter.format(
            INFO_DESCRIPTION, context.className, context.method, message, httpStatus, info, this.getService(),
        ));
    }

    private getService(): string {
        return this.config.service ?? 'blog-api';
    }
}

export {Logger};
