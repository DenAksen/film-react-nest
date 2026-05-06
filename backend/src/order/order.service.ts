import { ConflictException, Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderResultItemDto,
  TicketDto,
} from './dto/order.dto';
import { FilmRepository } from 'src/repository/film.repository';

@Injectable()
export class OrderService {
  private orders = [];
  constructor(private readonly filmRepository: FilmRepository) {}

  async createOrder(orderRequest: CreateOrderDto): Promise<OrderResponseDto> {
    const results: OrderResultItemDto[] = [];

    // Группируем билеты по сеансам
    const ticketsBySession = new Map<string, TicketDto[]>();

    for (const ticket of orderRequest.tickets) {
      const key = `${ticket.film}|${ticket.session}`;
      if (!ticketsBySession.has(key)) {
        ticketsBySession.set(key, []);
      }
      ticketsBySession.get(key)!.push(ticket);
    }

    // Бронируем для каждого сеанса
    for (const [key, sessionTickets] of ticketsBySession) {
      const [filmId, scheduleId] = key.split('|');

      // В формат row:seat
      const seats = sessionTickets.map((t) => `${t.row}:${t.seat}`);

      // Получаем информацию о сеансе
      const schedule = await this.filmRepository.getScheduleItem(
        filmId,
        scheduleId,
      );

      // Соответствие цен
      for (const ticket of sessionTickets) {
        if (ticket.price !== schedule.price) {
          throw new ConflictException(
            `Price mismatch for seat ${ticket.row}:${ticket.seat}. Expected ${schedule.price}, got ${ticket.price}`,
          );
        }
      }

      // Доступность мест
      const { available, takenSeats } =
        await this.filmRepository.checkSeatsAvailability(
          filmId,
          scheduleId,
          seats,
        );

      if (!available) {
        throw new ConflictException(
          `Seats ${takenSeats.join(', ')} are already taken`,
        );
      }

      // Бронируем места
      await this.filmRepository.bookSeats(filmId, scheduleId, seats);

      // Формируем результат
      for (const ticket of sessionTickets) {
        results.push({
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price,
          id: crypto.randomUUID(),
        });
      }
    }

    return {
      total: results.length,
      items: results,
    };
  }
}
