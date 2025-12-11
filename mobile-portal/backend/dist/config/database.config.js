"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => {
    const host = configService.get('DB_HOST');
    const portStr = configService.get('DB_PORT', '1433');
    const port = parseInt(portStr, 10);
    const username = configService.get('DB_USERNAME');
    const password = configService.get('DB_PASSWORD');
    const database = configService.get('DB_DATABASE');
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
        logging: configService.get('NODE_ENV') === 'development',
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map