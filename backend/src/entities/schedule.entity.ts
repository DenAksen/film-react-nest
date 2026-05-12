import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Film } from './film.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  daytime: string;

  @Column({ type: 'int', nullable: false })
  hall: number;

  @Column({ type: 'int', nullable: false })
  rows: number;

  @Column({ type: 'int', nullable: false })
  seats: number;

  @Column({ type: 'double precision', nullable: false })
  price: number;

  @Column({ type: 'text', nullable: false })
  taken: string;

  @Column({ type: 'uuid', name: 'filmId', nullable: false })
  filmId: string;

  @ManyToOne(() => Film, (film) => film.schedules)
  @JoinColumn({ name: 'filmId' })
  film: Film;
}
