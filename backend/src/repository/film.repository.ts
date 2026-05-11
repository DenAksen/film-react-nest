import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilmDocument, ScheduleItem } from './film.schema';
import { FilmDto } from 'src/films/dto/films.dto';

export interface ApiListResponse<T> {
  total: number;
  items: T[];
}

@Injectable()
export class FilmRepository {
  constructor(
    @InjectModel(FilmDocument.name) private filmModel: Model<FilmDocument>,
  ) {}

  async findAll(): Promise<ApiListResponse<FilmDto>> {
    const films = await this.filmModel.find();
    const items = films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
    }));

    return {
      total: items.length,
      items,
    };
  }

  async findFilmById(id: string) {
    const film = await this.filmModel.findOne({ id }).exec();

    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    // Формируем ответ с сеансами
    const schedule = film.schedule.map((s) => ({
      id: s.id,
      daytime: s.daytime,
      hall: s.hall,
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken || [],
    }));

    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
      schedule, // ← добавляем расписание
    };
  }

  async findSchedulesByFilmId(
    id: string,
  ): Promise<ApiListResponse<ScheduleItem>> {
    const film = await this.filmModel.findOne({ id }).exec();

    if (!film) {
      throw new NotFoundException(`Film with id ${id} not found`);
    }

    const items = film.schedule.map((schedule) => ({
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken || [],
    }));

    return {
      total: items.length,
      items,
    };
  }

  async getScheduleItem(filmId: string, scheduleId: string): Promise<any> {
    const film = await this.filmModel.findOne({ id: filmId }).exec();

    if (!film) {
      throw new NotFoundException(`Film with id ${filmId} not found`);
    }

    const schedule = film.schedule.find((s) => s.id === scheduleId);

    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
    }

    return schedule;
  }

  async checkSeatsAvailability(
    filmId: string,
    scheduleId: string,
    seats: string[],
  ): Promise<{ available: boolean; takenSeats: string[] }> {
    const schedule = await this.getScheduleItem(filmId, scheduleId);
    const currentTaken = schedule.taken || [];
    const takenSeats = seats.filter((seat) => currentTaken.includes(seat));

    return {
      available: takenSeats.length === 0,
      takenSeats,
    };
  }

  async bookSeats(
    filmId: string,
    scheduleId: string,
    seats: string[],
  ): Promise<void> {
    const uniqueSeats = [...new Set(seats)];

    // Находим фильм
    const film = await this.filmModel.findOne({ id: filmId }).exec();
    if (!film) {
      throw new NotFoundException(`Film with id ${filmId} not found`);
    }

    // Находим сеанс
    const scheduleIndex = film.schedule.findIndex((s) => s.id === scheduleId);
    if (scheduleIndex === -1) {
      throw new NotFoundException(`Schedule with id ${scheduleId} not found`);
    }

    // Проверяем конфликты
    const currentTaken = film.schedule[scheduleIndex].taken || [];
    const conflicting = uniqueSeats.filter((seat) =>
      currentTaken.includes(seat),
    );

    if (conflicting.length > 0) {
      throw new ConflictException(
        `Seats ${conflicting.join(', ')} are already taken`,
      );
    }

    // Бронируем
    await this.filmModel.updateOne(
      { id: filmId, 'schedule.id': scheduleId },
      { $addToSet: { 'schedule.$.taken': { $each: uniqueSeats } } },
    );
  }
}
