import { LoggerService } from '@nestjs/common';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

export type LogFormat = 'dev' | 'json' | 'tskv';

export class LoggerFactory {
  static createLogger(context?: string): LoggerService {
    const format = (process.env.LOG_FORMAT || 'dev') as LogFormat;

    switch (format) {
      case 'json':
        return new JsonLogger(context);
      case 'tskv':
        return new TskvLogger(context);
      case 'dev':
      default:
        return new DevLogger(context);
    }
  }
}
