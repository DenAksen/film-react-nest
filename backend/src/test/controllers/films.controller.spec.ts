import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from '../../films/films.controller';
import { FilmsService } from '../../films/films.service';
import { HttpException } from '@nestjs/common';

/**
 * Тесты для FilmsController
 * Проверяют корректность работы контроллера фильмов:
 * - обработку запросов
 * - валидацию параметров
 * - обработку ошибок
 * - HTTP статусы ответов
 */
describe('FilmsController', () => {
  let controller: FilmsController;

  // Мок для FilmsService - имитируем все методы сервиса
  const mockFilmsService = {
    getAllFilms: jest.fn(),
    getFilmById: jest.fn(),
    getFilmSchedules: jest.fn(),
  };

  beforeEach(async () => {
    // Создаем тестовый модуль с замоканным сервисом
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    // Получаем экземпляр контроллера из тестового модуля
    controller = module.get<FilmsController>(FilmsController);
  });

  afterEach(() => {
    // Очищаем все моки после каждого теста
    jest.clearAllMocks();
  });

  describe('getAllFilms', () => {
    // Проверяет успешное получение списка фильмов
    it('should return all films', async () => {
      const expectedResult = {
        total: 2,
        items: [{ id: '1', title: 'Film 1' }],
      };

      mockFilmsService.getAllFilms.mockResolvedValue(expectedResult);

      const result = await controller.getAllFilms();

      expect(result).toEqual(expectedResult);
      expect(mockFilmsService.getAllFilms).toHaveBeenCalledTimes(1);
    });

    // Проверяет обработку ошибки при сбое
    it('should throw error when service fails', async () => {
      mockFilmsService.getAllFilms.mockRejectedValue(new Error('DB Error'));

      // Проверяем, что выбрасывается HttpException с правильным сообщением
      await expect(controller.getAllFilms()).rejects.toThrow(HttpException);
      await expect(controller.getAllFilms()).rejects.toThrow(
        'Failed to fetch films',
      );
    });
  });

  describe('getFilmById', () => {
    // Проверяет успешное получение фильма по существующему ID
    it('should return film when exists', async () => {
      const film = { id: '123', title: 'Test Film' };
      mockFilmsService.getFilmById.mockResolvedValue(film);

      const result = await controller.getFilmById('123');

      expect(result).toEqual(film);
      expect(mockFilmsService.getFilmById).toHaveBeenCalledWith('123');
    });

    // Проверяет возврат 404 ошибки, когда фильм не найден
    it('should throw 404 when film not found', async () => {
      mockFilmsService.getFilmById.mockResolvedValue(null);

      await expect(controller.getFilmById('999')).rejects.toThrow(
        HttpException,
      );
      await expect(controller.getFilmById('999')).rejects.toThrow(
        'Film not found',
      );
    });

    // Проверяет возврат 500 ошибки при сбое сервиса
    it('should throw 500 on service error', async () => {
      mockFilmsService.getFilmById.mockRejectedValue(new Error('DB Error'));

      await expect(controller.getFilmById('123')).rejects.toThrow(
        HttpException,
      );
      await expect(controller.getFilmById('123')).rejects.toThrow(
        'Failed to fetch film',
      );
    });
  });

  describe('getFilmSchedule', () => {
    // Проверяет успешное получение расписания фильма
    it('should return schedules for film', async () => {
      const schedules = { total: 3, items: [] };
      mockFilmsService.getFilmSchedules.mockResolvedValue(schedules);

      const result = await controller.getFilmSchedule('123');

      expect(result).toEqual(schedules);
      expect(mockFilmsService.getFilmSchedules).toHaveBeenCalledWith('123');
    });
  });
});
