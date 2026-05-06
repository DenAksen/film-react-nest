import { Injectable } from '@nestjs/common';
import { FilmRepository } from '../repository/film.repository';

@Injectable()
export class FilmsService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async getAllFilms() {
    return await this.filmRepository.findAll();
  }

  async getFilmById(id: string) {
    return await this.filmRepository.findFilmById(id);
  }

  async getFilmSchedules(id: string) {
    return await this.filmRepository.findSchedulesByFilmId(id);
  }
}
