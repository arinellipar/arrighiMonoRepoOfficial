import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BoletosModule } from './modules/boletos/boletos.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Configuração do banco de dados Azure SQL Server
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Módulos da aplicação
    AuthModule,
    ClientsModule,
    BoletosModule,
    DocumentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
