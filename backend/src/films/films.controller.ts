import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getAllFilms() {
    return await this.filmsService.getAllFilms();
  }

  @Get(':id')
  async getFilmById(@Param('id') id: string) {
    return await this.filmsService.getFilmById(id);
  }

  @Get(':id/schedule')
  async getFilmSchedule(@Param('id') id: string) {
    return await this.filmsService.getFilmSchedules(id);
  }
}
