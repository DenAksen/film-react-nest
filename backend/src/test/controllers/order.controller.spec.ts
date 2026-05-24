import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../../order/order.controller';
import { OrderService } from '../../order/order.service';
import { CreateOrderDto } from '../../order/dto/order.dto';
import { HttpException } from '@nestjs/common';

/**
 * Тесты для OrderController
 * Проверяют корректность работы контроллера заказов:
 * - создание заказа
 * - валидацию цен и мест
 * - обработку конфликтов
 * - HTTP статусы ответов (201, 409, 500)
 */
describe('OrderController', () => {
  let controller: OrderController;

  // Мок для OrderService
  const mockOrderService = {
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    // Создаем тестовый модуль с замоканным сервисом
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    // Получаем экземпляр контроллера
    controller = module.get<OrderController>(OrderController);
  });

  afterEach(() => {
    // Очищаем все моки после каждого теста
    jest.clearAllMocks();
  });

  describe('create', () => {
    // Подготавливаем тестовые данные для заказа
    const createOrderDto: CreateOrderDto = {
      email: 'user@example.com',
      phone: '+1234567890',
      tickets: [
        {
          film: '1',
          session: 'session1',
          daytime: '2024-01-01T10:00:00Z',
          row: 1,
          seat: 1,
          price: 500,
        },
      ],
    };

    // Проверяет успешное создание заказа
    it('should create order successfully', async () => {
      const expectedResult = { total: 1, items: [] };
      mockOrderService.createOrder.mockResolvedValue(expectedResult);

      const result = await controller.create(createOrderDto);

      expect(result).toEqual(expectedResult);
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(createOrderDto);
    });

    // Проверяет возврат 409 ошибки при попытке забронировать уже занятые места
    it('should throw 409 on conflict (seats taken)', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new Error('Seats 1:1 are already taken'),
      );

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.create(createOrderDto)).rejects.toThrow(
        'Seats 1:1 are already taken',
      );
    });

    // Проверяет возврат 409 ошибки при несоответствии цены
    it('should throw 409 on price mismatch', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new Error('Price mismatch for seat 1:1'),
      );

      // Проверяем, что выбрасывается HttpException с правильным сообщением
      await expect(controller.create(createOrderDto)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.create(createOrderDto)).rejects.toThrow(
        'Price mismatch for seat 1:1',
      );
    });

    // Проверяет возврат 500 ошибки при неизвестных ошибках
    it('should throw 500 on other errors', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.create(createOrderDto)).rejects.toThrow(
        'Failed to create order',
      );
    });
  });
});
