import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js'; // .js যুক্ত করা হলো
import { AuthController } from './auth.controller.js'; // .js যুক্ত করা হলো
import { UsersModule } from '../users/users.module.js'; // .js যুক্ত করা হলো
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: 'SAAD_SECRET_KEY_123',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}