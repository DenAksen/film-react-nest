import { ConfigModule, ConfigService } from '@nestjs/config';
export interface AppConfigDatabase {
  driver: string;
  url: string;
}
export interface AppConfig {
  database: AppConfigDatabase;
}

export const configProvider = {
  imports: [ConfigModule.forRoot()],
  provide: 'CONFIG',
  useFactory: (configService: ConfigService): AppConfig => ({
    database: {
      driver: configService.get<string>('DATABASE_DRIVER', 'mongodb'),
      url: configService.get<string>(
        'DATABASE_URL',
        'mongodb://localhost:27017/prac',
      ),
    },
  }),
  inject: [ConfigService],
};
