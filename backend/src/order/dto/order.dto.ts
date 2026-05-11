// Один билет в заказе (входные данные)
export class TicketDto {
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
}

// Тело запроса на бронирование
export class CreateOrderDto {
  email: string;
  phone: string;
  tickets: TicketDto[];
}

// Результат бронирования (один билет в ответе)
export class OrderResultItemDto {
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
  id: string;
}

// Полный ответ API
export class OrderResponseDto {
  total: number;
  items: OrderResultItemDto[];
}
