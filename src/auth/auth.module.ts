import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';

@Module({
  //mengimport jwt module untuk membuat token jwt
  imports: [JwtModule.register({})],
  //menggunakan controller dan provider yang telah dibuat
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
