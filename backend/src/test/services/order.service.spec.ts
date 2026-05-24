import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { OrderService } from '../../order/order.service';
import { FilmRepository } from '../../repository/film.repository';
import { CreateOrderDto } from '../../order/dto/order.dto';

/**
 * Тесты для OrderService
 * Проверяют основную логику бронирования билетов:
 * - проверку цен
 * - проверку доступности мест
 * - бронирование мест
 * - обработку ошибок
 */
describe('OrderService', () => {
  let service: OrderService;

  // Мок для FilmRepository
  const mockFilmRepository = {
    getScheduleItem: jest.fn(),
    checkSeatsAvailability: jest.fn(),
    bookSeats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: FilmRepository,
          useValue: mockFilmRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Тесты для успешного создания заказа
  describe('createOrder - success', () => {
    // Проверяет успешное бронирование одного билета
    it('should book a single ticket successfully', async () => {
      // Подготавливаем тестовые данные
      const createOrderDto: CreateOrderDto = {
        email: 'user@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film1',
            session: 'session1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 1,
            price: 500,
          },
        ],
      };

      // Мокаем методы репозитория
      mockFilmRepository.getScheduleItem.mockResolvedValue({ price: 500 });
      mockFilmRepository.checkSeatsAvailability.mockResolvedValue({
        available: true,
        takenSeats: [],
      });
      mockFilmRepository.bookSeats.mockResolvedValue(undefined);

      // Вызываем метод сервиса
      const result = await service.createOrder(createOrderDto);

      // Проверяем результат
      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        film: 'film1',
        session: 'session1',
        row: 1,
        seat: 1,
        price: 500,
      });
      expect(result.items[0].id).toBeDefined();

      // Проверяем вызовы репозитория
      expect(mockFilmRepository.getScheduleItem).toHaveBeenCalledWith(
        'film1',
        'session1',
      );
      expect(mockFilmRepository.checkSeatsAvailability).toHaveBeenCalledWith(
        'film1',
        'session1',
        ['1:1'],
      );
      expect(mockFilmRepository.bookSeats).toHaveBeenCalledWith(
        'film1',
        'session1',
        ['1:1'],
      );
    });

    // Проверяет успешное бронирование нескольких билетов на один сеанс
    it('should book multiple tickets for the same session', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'user@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film1',
            session: 'session1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 1,
            price: 500,
          },
          {
            film: 'film1',
            session: 'session1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 2,
            price: 500,
          },
        ],
      };

      mockFilmRepository.getScheduleItem.mockResolvedValue({ price: 500 });
      mockFilmRepository.checkSeatsAvailability.mockResolvedValue({
        available: true,
        takenSeats: [],
      });
      mockFilmRepository.bookSeats.mockResolvedValue(undefined);

      const result = await service.createOrder(createOrderDto);

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(mockFilmRepository.bookSeats).toHaveBeenCalledWith(
        'film1',
        'session1',
        ['1:1', '1:2'],
      );
    });
  });

  // Тесты для обработки ошибок
  describe('createOrder - errors', () => {
    // Проверяет ошибку при несоответствии цены
    it('should throw ConflictException when price mismatch', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'user@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film1',
            session: 'session1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 1,
            price: 300,
          },
        ],
      };

      mockFilmRepository.getScheduleItem.mockResolvedValue({ price: 500 });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        'Price mismatch for seat 1:1. Expected 500, got 300',
      );

      // Проверяем, что бронирование не вызывалось
      expect(mockFilmRepository.bookSeats).not.toHaveBeenCalled();
    });

    // Проверяет ошибку при попытке забронировать уже занятые места
    it('should throw ConflictException when seats are already taken', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'user@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film1',
            session: 'session1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 1,
            price: 500,
          },
        ],
      };

      mockFilmRepository.getScheduleItem.mockResolvedValue({ price: 500 });
      mockFilmRepository.checkSeatsAvailability.mockResolvedValue({
        available: false,
        takenSeats: ['1:1'],
      });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        'Seats 1:1 are already taken',
      );

      // Проверяем, что бронирование не вызывалось
      expect(mockFilmRepository.bookSeats).not.toHaveBeenCalled();
    });

    // Проверяет ошибку при частично занятых местах
    it('should throw ConflictException when some seats are taken', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'user@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film1',
            session: 'session1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 1,
            price: 500,
          },
          {
            film: 'film1',
            session: 'session1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 2,
            price: 500,
          },
        ],
      };

      mockFilmRepository.getScheduleItem.mockResolvedValue({ price: 500 });
      mockFilmRepository.checkSeatsAvailability.mockResolvedValue({
        available: false,
        takenSeats: ['1:2'], // Второе место занято
      });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createOrder(createOrderDto)).rejects.toThrow(
        'Seats 1:2 are already taken',
      );
      // Проверяем, что бронирование не вызывалось
      expect(mockFilmRepository.bookSeats).not.toHaveBeenCalled();
    });

    // Проверяет, что при ошибке не происходит бронирования
    it('should not book seats when validation fails', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'user@example.com',
        phone: '+1234567890',
        tickets: [
          {
            film: 'film1',
            session: 'session1',
            daytime: '2024-01-01T10:00:00Z',
            row: 1,
            seat: 1,
            price: 300, // Неправильная цена
          },
        ],
      };

      mockFilmRepository.getScheduleItem.mockResolvedValue({ price: 500 });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow();

      // Проверяем, что checkSeatsAvailability и bookSeats не вызывались
      expect(mockFilmRepository.checkSeatsAvailability).not.toHaveBeenCalled();
      expect(mockFilmRepository.bookSeats).not.toHaveBeenCalled();
    });
  });
});
