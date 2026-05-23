import { ConfigService } from '@nestjs/config';
export interface AppConfigDatabase {
  driver: string;
  url: string;
  username: string;
  password: string;
}
export interface AppConfig {
  database: AppConfigDatabase;
}

export const configProvider = {
  provide: 'CONFIG',
  useFactory: (configService: ConfigService): AppConfig => ({
    database: {
      driver: configService.get<string>('DATABASE_DRIVER'),
      url: configService.get<string>('DATABASE_URL'),
      username: configService.get<string>('DATABASE_USERNAME'),
      password: configService.get<string>('DATABASE_PASSWORD'),
    },
  }),
  inject: [ConfigService],
};
