import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TransactionModule } from './transaction/transaction.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://neondb_owner:npg_HKqji4A8QmDa@ep-falling-queen-azvxbw83-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      ssl: true,
      autoLoadEntities: true,
      synchronize: true, // এটি লাইভ ডাটাবেসে স্বয়ংক্রিয়ভাবে টেবিল তৈরি করে দেবে
    }),
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}