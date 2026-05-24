import { LoggerFactory } from '../../logger/logger.factory';
import { DevLogger } from '../../logger/dev.logger';
import { JsonLogger } from '../../logger/json.logger';
import { TskvLogger } from '../../logger/tskv.logger';

describe('LoggerFactory', () => {
  // Сохраняем оригинальное окружение
  const originalEnv = process.env;

  beforeEach(() => {
    // Сбрасываем модули перед каждым тестом
    jest.resetModules();
    // Копируем оригинальное окружение
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Восстанавливаем оригинальное окружение после каждого теста
    process.env = originalEnv;
  });

  // Тесты для создания логгера по умолчанию
  describe('default logger', () => {
    // Проверяет, что по умолчанию создается DevLogger
    it('should create DevLogger by default', () => {
      // Удаляем переменную окружения
      delete process.env.LOG_FORMAT;

      // Создаем логгер
      const logger = LoggerFactory.createLogger('Test');

      // Должен быть экземпляром DevLogger
      expect(logger).toBeInstanceOf(DevLogger);
    });
  });

  // Тесты для создания DevLogger
  describe('DevLogger creation', () => {
    // Проверяет создание DevLogger при явном указании dev
    it('should create DevLogger when LOG_FORMAT=dev', () => {
      // Устанавливаем формат dev
      process.env.LOG_FORMAT = 'dev';

      const logger = LoggerFactory.createLogger('Test');

      expect(logger).toBeInstanceOf(DevLogger);
    });
  });

  // Тесты для создания JsonLogger
  describe('JsonLogger creation', () => {
    // Проверяет создание JsonLogger при указании json
    it('should create JsonLogger when LOG_FORMAT=json', () => {
      // Устанавливаем формат json
      process.env.LOG_FORMAT = 'json';

      const logger = LoggerFactory.createLogger('Test');

      expect(logger).toBeInstanceOf(JsonLogger);
    });
  });

  // Тесты для создания TskvLogger
  describe('TskvLogger creation', () => {
    // Проверяет создание TskvLogger при указании tskv
    it('should create TskvLogger when LOG_FORMAT=tskv', () => {
      // Устанавливаем формат tskv
      process.env.LOG_FORMAT = 'tskv';

      const logger = LoggerFactory.createLogger('Test');

      expect(logger).toBeInstanceOf(TskvLogger);
    });
  });
});
