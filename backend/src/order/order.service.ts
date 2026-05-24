import { ConflictException, Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderResultItemDto,
  TicketDto,
} from './dto/order.dto';
import { FilmRepository } from '../repository/film.repository';
import { LoggerFactory } from '../logger/logger.factory';

@Injectable()
export class OrderService {
  private orders = [];
  private readonly logger = LoggerFactory.createLogger(OrderService.name);

  constructor(private readonly filmRepository: FilmRepository) {}

  async createOrder(orderRequest: CreateOrderDto): Promise<OrderResponseDto> {
    this.logger.log('Starting order creation');
    this.logger.debug(`Total tickets: ${orderRequest.tickets.length}`);

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

    this.logger.debug(`Grouped into ${ticketsBySession.size} sessions`);

    // Бронируем для каждого сеанса
    for (const [key, sessionTickets] of ticketsBySession) {
      const [filmId, scheduleId] = key.split('|');

      this.logger.log(
        `Processing session: film=${filmId}, schedule=${scheduleId}`,
      );
      this.logger.debug(`Tickets in session: ${sessionTickets.length}`);

      // В формат row:seat
      const seats = sessionTickets.map((t) => `${t.row}:${t.seat}`);
      this.logger.debug(`Seats: ${seats.join(', ')}`);

      // Получаем информацию о сеансе
      const schedule = await this.filmRepository.getScheduleItem(
        filmId,
        scheduleId,
      );
      this.logger.debug(`Schedule price: ${schedule.price}`);

      // Соответствие цен
      for (const ticket of sessionTickets) {
        if (ticket.price !== schedule.price) {
          this.logger.warn(
            `Price mismatch for seat ${ticket.row}:${ticket.seat}. Expected ${schedule.price}, got ${ticket.price}`,
          );
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
        this.logger.warn(`Seats already taken: ${takenSeats.join(', ')}`);
        throw new ConflictException(
          `Seats ${takenSeats.join(', ')} are already taken`,
        );
      }

      // Бронируем места
      await this.filmRepository.bookSeats(filmId, scheduleId, seats);
      this.logger.log(
        `Successfully booked ${seats.length} seats for session ${key}`,
      );

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

    this.logger.log(`Order completed! Total tickets: ${results.length}`);

    return {
      total: results.length,
      items: results,
    };
  }
}
