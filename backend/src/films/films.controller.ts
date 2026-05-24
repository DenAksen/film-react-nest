import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { LoggerFactory } from '../logger/logger.factory';
import { getErrorStack } from '../utils/error.utils';

@Controller('films')
export class FilmsController {
  private readonly logger = LoggerFactory.createLogger(FilmsController.name);

  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getAllFilms() {
    this.logger.log('Incoming request: GET /films');

    try {
      const result = await this.filmsService.getAllFilms();
      this.logger.log(
        `Response: GET /films - success, found ${result.total} films`,
      );
      return result;
    } catch (error) {
      this.logger.error('GET /films failed', getErrorStack(error));
      throw new HttpException(
        'Failed to fetch films',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getFilmById(@Param('id') id: string) {
    this.logger.log(`Incoming request: GET /films/${id}`);

    try {
      const film = await this.filmsService.getFilmById(id);

      if (!film) {
        this.logger.warn(`GET /films/${id} - film not found`);
        throw new HttpException('Film not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(
        `Response: GET /films/${id} - success, film: ${film.title}`,
      );
      return film;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`GET /films/${id} failed`, getErrorStack(error));
      throw new HttpException(
        'Failed to fetch film',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/schedule')
  async getFilmSchedule(@Param('id') id: string) {
    this.logger.log(`Incoming request: GET /films/${id}/schedule`);

    try {
      const schedules = await this.filmsService.getFilmSchedules(id);
      const count = schedules.total || 0;
      this.logger.log(
        `Response: GET /films/${id}/schedule - success, found ${count} schedules`,
      );
      return schedules;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `GET /films/${id}/schedule failed`,
        getErrorStack(error),
      );
      throw new HttpException(
        'Failed to fetch schedules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
