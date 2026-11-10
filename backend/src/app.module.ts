import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TransactionModule } from './transaction/transaction.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1', 
      port: 5432,
      username: 'saadspac_dbuser',
      password: 'saad25592@$$$',
      database: 'saadspac_finance',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TransactionModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}