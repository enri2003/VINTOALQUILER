import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 1033,
  database: process.env.DB_NAME || 'Alquileres-Vinto',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Alquileres1033',
  autoLoadEntities: true,
  synchronize: true,
};
