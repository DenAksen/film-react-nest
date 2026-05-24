import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from '../../films/films.service';
import { FilmRepository } from '../../repository/film.repository';

/**
 * Тесты для FilmsService
 * Проверяют логику работы с фильмами:
 * - получение списка фильмов
 * - получение фильма по ID
 * - получение расписания
 * - обработку ошибок
 */
describe('FilmsService', () => {
  let service: FilmsService;

  // Мок для FilmRepository
  const mockFilmRepository = {
    findAll: jest.fn(),
    findFilmById: jest.fn(),
    findSchedulesByFilmId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: FilmRepository,
          useValue: mockFilmRepository,
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFilms', () => {
    // Проверяет успешное получение списка фильмов
    it('should return all films', async () => {
      const expectedResult = {
        total: 2,
        items: [
          { id: '1', title: 'Film 1' },
          { id: '2', title: 'Film 2' },
        ],
      };
      mockFilmRepository.findAll.mockResolvedValue(expectedResult);

      const result = await service.getAllFilms();

      expect(result).toEqual(expectedResult);
      expect(mockFilmRepository.findAll).toHaveBeenCalledTimes(1);
    });

    // Проверяет обработку ошибки при сбое репозитория
    it('should throw error when repository fails', async () => {
      const error = new Error('Database connection failed');
      mockFilmRepository.findAll.mockRejectedValue(error);

      // Проверяем, что ошибка пробрасывается дальше
      await expect(service.getAllFilms()).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockFilmRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFilmById', () => {
    // Проверяет успешное получение фильма по существующему ID
    it('should return film when exists', async () => {
      const expectedFilm = {
        id: '123',
        title: 'Test Film',
        description: 'Test Description',
      };
      mockFilmRepository.findFilmById.mockResolvedValue(expectedFilm);

      const result = await service.getFilmById('123');

      expect(result).toEqual(expectedFilm);
      expect(mockFilmRepository.findFilmById).toHaveBeenCalledWith('123');
      expect(mockFilmRepository.findFilmById).toHaveBeenCalledTimes(1);
    });

    // Проверяет возврат null, когда фильм не найден
    it('should return null when film not found', async () => {
      mockFilmRepository.findFilmById.mockResolvedValue(null);

      const result = await service.getFilmById('999');

      expect(result).toBeNull();
      expect(mockFilmRepository.findFilmById).toHaveBeenCalledWith('999');
    });

    // Проверяет обработку ошибки при сбое репозитория
    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockFilmRepository.findFilmById.mockRejectedValue(error);

      // Проверяем, что ошибка пробрасывается дальше
      await expect(service.getFilmById('123')).rejects.toThrow(
        'Database error',
      );
      expect(mockFilmRepository.findFilmById).toHaveBeenCalledWith('123');
    });
  });

  describe('getFilmSchedules', () => {
    // Проверяет успешное получение расписания для фильма
    it('should return schedules for film', async () => {
      const expectedSchedules = {
        total: 3,
        items: [
          { id: 's1', time: '10:00', price: 500 },
          { id: 's2', time: '14:00', price: 600 },
          { id: 's3', time: '18:00', price: 700 },
        ],
      };
      mockFilmRepository.findSchedulesByFilmId.mockResolvedValue(
        expectedSchedules,
      );

      const result = await service.getFilmSchedules('123');

      expect(result).toEqual(expectedSchedules);
      expect(mockFilmRepository.findSchedulesByFilmId).toHaveBeenCalledWith(
        '123',
      );
      expect(mockFilmRepository.findSchedulesByFilmId).toHaveBeenCalledTimes(1);
    });

    // Проверяет обработку ошибки при сбое репозитория
    it('should throw error when repository fails', async () => {
      const error = new Error('Failed to fetch schedules');
      mockFilmRepository.findSchedulesByFilmId.mockRejectedValue(error);
      // Проверяем, что ошибка пробрасывается дальше
      await expect(service.getFilmSchedules('123')).rejects.toThrow(
        'Failed to fetch schedules',
      );
      expect(mockFilmRepository.findSchedulesByFilmId).toHaveBeenCalledWith(
        '123',
      );
    });
  });
});
