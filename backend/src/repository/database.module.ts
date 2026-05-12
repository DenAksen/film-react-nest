import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Film } from '../entities/film.entity';
import { Schedule } from '../entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: configService.get('DATABASE_DRIVER'),
        url: configService.get('DATABASE_URL'),
        username: String(configService.get('DATABASE_USERNAME')),
        password: String(configService.get('DATABASE_PASSWORD')),
        entities: [Film, Schedule],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
