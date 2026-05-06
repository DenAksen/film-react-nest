import { OmitType } from '@nestjs/mapped-types';

export class ScheduleItem {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmWithScheduleDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
  schedule: ScheduleItem[];
}

export class FilmDto extends OmitType(FilmWithScheduleDto, ['schedule']) {}
