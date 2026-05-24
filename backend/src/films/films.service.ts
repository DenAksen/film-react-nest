import { Injectable } from '@nestjs/common';
import { FilmRepository } from '../repository/film.repository';
import { LoggerFactory } from '../logger/logger.factory';
import { getErrorStack } from '../utils/error.utils';

@Injectable()
export class FilmsService {
  private readonly logger = LoggerFactory.createLogger(FilmsService.name);

  constructor(private readonly filmRepository: FilmRepository) {}

  async getAllFilms() {
    this.logger.log('Fetching all films');

    try {
      const films = await this.filmRepository.findAll();
      this.logger.log(`Found ${films.total} films`);
      return films;
    } catch (error) {
      this.logger.error('Failed to fetch films', getErrorStack(error));
      throw error;
    }
  }

  async getFilmById(id: string) {
    this.logger.log(`Fetching film by ID: ${id}`);

    try {
      const film = await this.filmRepository.findFilmById(id);

      if (!film) {
        this.logger.warn(`Film not found with ID: ${id}`);
        return null;
      }

      this.logger.log(`Film retrieved: ${film.title}`);
      return film;
    } catch (error) {
      this.logger.error(`Failed to fetch film ${id}`, getErrorStack(error));
      throw error;
    }
  }

  async getFilmSchedules(id: string) {
    this.logger.log(`Fetching schedules for film: ${id}`);

    try {
      const schedules = await this.filmRepository.findSchedulesByFilmId(id);
      this.logger.log(`Found ${schedules.total} schedules for film ${id}`);
      return schedules;
    } catch (error) {
      this.logger.error(
        `Failed to fetch schedules for film ${id}`,
        getErrorStack(error),
      );
      throw error;
    }
  }
}
