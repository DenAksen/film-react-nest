import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmRepository } from '../repository/film.repository';
import { FilmDocument, FilmSchema } from '../repository/film.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FilmDocument.name, schema: FilmSchema },
    ]),
  ],
  controllers: [FilmsController],
  providers: [FilmsService, FilmRepository],
  exports: [FilmsService, FilmRepository],
})
export class FilmsModule {}
