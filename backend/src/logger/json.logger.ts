import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(
    level: string,
    message: any,
    ...optionalParams: any[]
  ): string {
    const logEntry: any = {
      level,
      timestamp: new Date().toISOString(),
    };

    if (this.context) {
      logEntry.context = this.context;
    }

    // Обработка message
    if (message instanceof Error) {
      logEntry.message = message.message;
      logEntry.stack = message.stack;
    } else if (typeof message === 'object') {
      logEntry.message = message;
    } else {
      logEntry.message = message;
    }

    // Обработка дополнительных параметров
    if (optionalParams && optionalParams.length > 0) {
      for (const param of optionalParams) {
        if (typeof param === 'object' && param !== null) {
          Object.assign(logEntry, param);
        } else if (typeof param === 'string' && !this.context) {
          logEntry.context = param;
        } else if (param !== undefined && param !== null) {
          logEntry.extra = param;
        }
      }
    }

    return JSON.stringify(logEntry);
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('debug', message, ...optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('verbose', message, ...optionalParams));
  }
}
