import { JsonLogger } from '../../logger/json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    // Создаем экземпляр логгера
    logger = new JsonLogger('TestContext');

    // Перехватываем вывод в консоль для проверки
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    // Восстанавливаем оригинальные методы консоли после каждого теста
    jest.restoreAllMocks();
  });

  describe('log', () => {
    // Проверяет базовое форматирование JSON лога
    it('should log message in JSON format', () => {
      logger.log('Test message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logged).toMatchObject({
        level: 'log',
        message: 'Test message',
        context: 'TestContext',
      });
      expect(logged.timestamp).toBeDefined();
    });

    // Проверяет включение дополнительных параметров в JSON
    it('should include additional parameters', () => {
      logger.log('Test message', { userId: 123, action: 'test' });

      const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logged).toMatchObject({
        message: 'Test message',
        userId: 123,
        action: 'test',
      });
    });

    // Тесты для метода error
    describe('error', () => {
      // Уровень лога должен быть 'error'
      it('should log error to console.error', () => {
        logger.error('Error message');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const logged = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
        expect(logged.level).toBe('error');
        expect(logged.message).toBe('Error message');
      });
    });

    describe('warn', () => {
      // Уровень лога должен быть 'warn'
      it('should log warning to console.warn', () => {
        logger.warn('Warning message');

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        const logged = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
        expect(logged.level).toBe('warn');
        expect(logged.message).toBe('Warning message');
      });
    });

    describe('debug', () => {
      // Уровень лога должен быть 'debug'

      it('should log debug to console.debug', () => {
        logger.debug('Debug message');

        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        const logged = JSON.parse(consoleDebugSpy.mock.calls[0][0]);
        expect(logged.level).toBe('debug');
        expect(logged.message).toBe('Debug message');
      });
    });
  });
});
