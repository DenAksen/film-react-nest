import { TskvLogger } from '../../logger/tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let stdoutWriteSpy: jest.SpyInstance;
  let stderrWriteSpy: jest.SpyInstance;

  beforeEach(() => {
    // Создаем экземпляр логгера
    logger = new TskvLogger('TestContext');

    // Перехватываем запись в stdout и stderr
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    stderrWriteSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
  });

  afterEach(() => {
    // Восстанавливаем оригинальные методы
    jest.restoreAllMocks();
  });

  describe('log', () => {
    // Проверяет базовое форматирование TSKV лога
    it('should log message in TSKV format', () => {
      logger.log('Test message');

      expect(stdoutWriteSpy).toHaveBeenCalledTimes(1);
      const output = stdoutWriteSpy.mock.calls[0][0];

      // Проверяем наличие обязательных полей
      expect(output).toContain('timestamp=');
      expect(output).toContain('level=info');
      expect(output).toContain('message=Test message');
      expect(output).toContain('context=TestContext');

      // Проверяем, что строка заканчивается переносом
      expect(output[output.length - 1]).toBe('\n');
    });

    // Проверяет использование табуляции как разделителя
    it('should use tab separators', () => {
      logger.log('Test message');
      const output = stdoutWriteSpy.mock.calls[0][0];

      // Должна быть хотя бы одна табуляция
      expect(output).toContain('\t');

      // Разбиваем по табам - должно быть несколько частей
      const parts = output.split('\t');
      expect(parts.length).toBeGreaterThan(1);
    });

    // Проверяет экранирование специальных символов
    it('should escape special characters', () => {
      logger.log('Message with\nnew line\tand tab');
      const output = stdoutWriteSpy.mock.calls[0][0];

      // Проверяем, что исходные спецсимволы заменены на пробелы
      expect(output).toContain('message=Message with new line and tab');

      // Убираем последний символ \n для проверки
      const withoutLastNewline = output.slice(0, -1);
      expect(withoutLastNewline).not.toContain('\n');
      expect(withoutLastNewline).not.toContain('\r');

      // Также проверяем, что нет табуляций внутри значения message
      const messagePart = output
        .split('\t')
        .find((p) => p.startsWith('message='));
      expect(messagePart).not.toContain('\n');
      expect(messagePart).not.toContain('\r');
      expect(messagePart).not.toContain('\t');
    });

    // Проверяет включение метаданных как дополнительных полей
    it('should include metadata as additional fields', () => {
      logger.log('Test message', { userId: 123, action: 'test' });
      const output = stdoutWriteSpy.mock.calls[0][0];

      // Дополнительные поля должны быть добавлены через табуляцию
      expect(output).toContain('userId=123');
      expect(output).toContain('action=test');
    });
  });

  describe('error', () => {
    // Проверяет, что ошибки пишутся в stderr
    it('should write to stderr', () => {
      logger.error('Error message');

      expect(stderrWriteSpy).toHaveBeenCalledTimes(1);
      const output = stderrWriteSpy.mock.calls[0][0];

      // Уровень лога должен быть error
      expect(output).toContain('level=error');
    });
  });
});
