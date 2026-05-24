import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private escapeValue(value: string): string {
    // Заменяем переносы строк и табуляции на пробелы, но убираем лишние пробелы
    return value
      .replace(/[\n\r]/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\\/g, '\\\\');
  }

  private escapeKey(key: string): string {
    return key.replace(/[\t\s]/g, '_');
  }

  private formatMessage(
    level: string,
    message: any,
    ...optionalParams: any[]
  ): string {
    const parts: string[] = [];

    parts.push(`timestamp=${this.escapeValue(new Date().toISOString())}`);
    parts.push(`level=${this.escapeValue(level)}`);

    let messageStr: string;
    if (message instanceof Error) {
      messageStr = `${message.message} ${message.stack || ''}`;
    } else if (typeof message === 'object') {
      messageStr = JSON.stringify(message);
    } else {
      messageStr = String(message);
    }

    // Экранируем сообщение
    parts.push(`message=${this.escapeValue(messageStr)}`);

    if (this.context) {
      parts.push(`context=${this.escapeValue(this.context)}`);
    }

    // Обработка дополнительных параметров
    if (optionalParams && optionalParams.length > 0) {
      for (let i = 0; i < optionalParams.length; i++) {
        const param = optionalParams[i];
        if (typeof param === 'object' && param !== null) {
          for (const [key, value] of Object.entries(param)) {
            if (
              key !== 'timestamp' &&
              key !== 'level' &&
              key !== 'message' &&
              key !== 'context'
            ) {
              const valueStr =
                typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value);
              parts.push(
                `${this.escapeKey(key)}=${this.escapeValue(valueStr)}`,
              );
            }
          }
        } else if (typeof param === 'string' && !this.context) {
          parts.push(`context=${this.escapeValue(param)}`);
        } else if (param !== undefined && param !== null) {
          parts.push(`param${i}=${this.escapeValue(String(param))}`);
        }
      }
    }

    return parts.join('\t') + '\n';
  }

  log(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('info', message, ...optionalParams),
    );
  }

  error(message: any, ...optionalParams: any[]) {
    process.stderr.write(
      this.formatMessage('error', message, ...optionalParams),
    );
  }

  warn(message: any, ...optionalParams: any[]) {
    process.stdout.write(
      this.formatMessage('warn', message, ...optionalParams),
    );
  }

  debug(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(
        this.formatMessage('debug', message, ...optionalParams),
      );
    }
  }

  verbose(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(
        this.formatMessage('verbose', message, ...optionalParams),
      );
    }
  }
}
