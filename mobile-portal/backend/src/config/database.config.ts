import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const host = configService.get<string>('DB_HOST');
  const portStr = configService.get<string>('DB_PORT', '1433');
  const port = parseInt(portStr, 10); // Converter string para number
  const username = configService.get<string>('DB_USERNAME');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_DATABASE');

  // Debug: mostrar valores carregados (REMOVER EM PRODUÇÃO!)
  console.log('🔧 Database Config:');
  console.log('   DB_HOST:', host || '❌ NÃO DEFINIDO');
  console.log('   DB_PORT:', port);
  console.log('   DB_USERNAME:', username || '❌ NÃO DEFINIDO');
  console.log('   DB_DATABASE:', database || '❌ NÃO DEFINIDO');
  console.log('   DB_PASSWORD:', password ? `✅ "${password.substring(0, 5)}..."` : '❌ NÃO DEFINIDO');

  return {
    type: 'mssql',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};
