import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  //menggunakan provider untuk mengambil data dari .env
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
