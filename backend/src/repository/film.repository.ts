import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from '../entities/film.entity';
import { Schedule } from '../entities/schedule.entity';
import { FilmDto, FilmWithScheduleDto } from 'src/films/dto/films.dto';
import { ScheduleItem } from '../films/dto/films.dto';

export interface ApiListResponse<T> {
  total: number;
  items: T[];
}

@Injectable()
export class FilmRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  // Получить все фильмы (без расписания)
  async findAll(): Promise<ApiListResponse<FilmDto>> {
    const films = await this.filmRepository.find();
    const items = films.map((film) => {
      let tags: string[] = [];

      // Является ли tags JSON массивом
      if (film.tags) {
        try {
          const parsed = JSON.parse(film.tags);
          tags = Array.isArray(parsed) ? parsed : [film.tags];
        } catch {
          // Если не JSON, то используем как обычную строку
          tags = [film.tags];
        }
      }

      return {
        id: film.id,
        rating: film.rating,
        director: film.director,
        tags: tags,
        image: film.image,
        cover: film.cover,
        title: film.title,
        about: film.about,
        description: film.description,
      };
    });

    return {
      total: items.length,
      items,
    };
  }

  // Получить фильм по ID с расписанием
  async findFilmById(id: string): Promise<FilmWithScheduleDto> {
    const film = await this.filmRepository.findOne({
      where: { id },
    });

    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    const schedules = await this.scheduleRepository.find({
      where: { filmId: id },
    });

    // Парсим tags
    let tags: string[] = [];
    if (film.tags) {
      try {
        const parsed = JSON.parse(film.tags);
        tags = Array.isArray(parsed) ? parsed : [film.tags];
      } catch {
        tags = [film.tags];
      }
    }

    const schedule = schedules.map((s) => ({
      id: s.id,
      daytime: s.daytime,
      hall: s.hall,
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken ? JSON.parse(s.taken) : [],
    }));

    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: tags,
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
      schedule,
    };
  }

  // Получить все сеансы фильма
  async findSchedulesByFilmId(
    id: string,
  ): Promise<ApiListResponse<ScheduleItem>> {
    const film = await this.filmRepository.findOne({
      where: { id },
    });

    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    const schedules = await this.scheduleRepository.find({
      where: { filmId: id },
    });

    const items = schedules.map((schedule) => ({
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken ? JSON.parse(schedule.taken) : [],
    }));

    return {
      total: items.length,
      items,
    };
  }

  // Получить конкретный сеанс по ID фильма и ID сеанса
  async getScheduleItem(
    filmId: string,
    scheduleId: string,
  ): Promise<ScheduleItem> {
    // Существует ли фильм
    const film = await this.filmRepository.findOne({
      where: { id: filmId },
    });

    if (!film) {
      throw new NotFoundException(`Film with id ${filmId} not found`);
    }

    // Найдем сеанс
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, filmId },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
    }

    return {
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken ? JSON.parse(schedule.taken) : [],
    };
  }

  // Проверить доступность мест
  async checkSeatsAvailability(
    filmId: string,
    scheduleId: string,
    seats: string[],
  ): Promise<{ available: boolean; takenSeats: string[] }> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, filmId },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
    }

    // Парсим строку в массив
    let currentTaken: string[] = [];
    if (schedule.taken) {
      try {
        currentTaken = JSON.parse(schedule.taken);
      } catch {
        currentTaken = [];
      }
    }

    const takenSeats = seats.filter((seat) => currentTaken.includes(seat));

    return {
      available: takenSeats.length === 0,
      takenSeats,
    };
  }

  // Забронировать места
  async bookSeats(
    filmId: string,
    scheduleId: string,
    seats: string[],
  ): Promise<void> {
    const uniqueSeats = [...new Set(seats)];

    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, filmId },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
    }

    const currentTaken = JSON.parse(schedule.taken || '[]');
    const conflicting = uniqueSeats.filter((seat) =>
      currentTaken.includes(seat),
    );

    if (conflicting.length > 0) {
      throw new ConflictException(
        `Seats ${conflicting.join(', ')} are already taken`,
      );
    }
    // Бронируем
    const newTaken = [...currentTaken, ...uniqueSeats];
    await this.scheduleRepository.update(scheduleId, {
      taken: JSON.stringify(newTaken),
    });
  }
}
