import { Injectable, ForbiddenException } from '@nestjs/common';
// import { User, Bookmark } from '@prisma/client';
import { AuthDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    //memanggil prisma service
    private prisma: PrismaService,
    //memanggil jwt service
    private jwt: JwtService,
    //memanggil config service
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    //generate the password
    const hash = await argon.hash(dto.password);

    //save the new user
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;
      //return the saved user
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email sudah terdaftar');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user does not exist throw exeption
    if (!user) throw new ForbiddenException('Email yang anda masukkan salah');

    //compare the password
    const pwMatches = await argon.verify(user.hash, dto.password);
    //if password does not match throw exeption
    if (!pwMatches) throw new ForbiddenException('Password salah');
    return this.signToken(user.id, user.email);
  }

  async signToken(
    //membuat token
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    //membuat payload
    const payload = {
      sub: userId,
      email,
    };
    //memanggil secret dari .env
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      //membuat token yang akan expired dalam 15 menit
      expiresIn: '15m',
      secret: secret,
    });

    return {
      //mengembalikan token
      access_token: token,
    };
  }
}
