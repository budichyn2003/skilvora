import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const email = dto.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Format email tidak valid');
    }
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('Password minimal 8 karakter');
    }
    const role = this.parseRole(dto.role);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    return this.prisma.user.create({
      data: {
        email,
        name: dto.name?.trim() || null,
        password: await bcrypt.hash(dto.password, 10),
        role,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
      },
    });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Pengguna tidak ditemukan');
    if (dto.password !== undefined && dto.password.length < 8) {
      throw new BadRequestException('Password minimal 8 karakter');
    }
    const role = dto.role === undefined ? undefined : this.parseRole(dto.role);
    const email = dto.email?.trim().toLowerCase();
    if (email && email !== existing.email) {
      const emailOwner = await this.prisma.user.findUnique({
        where: { email },
      });
      if (emailOwner) throw new ConflictException('Email sudah terdaftar');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(email ? { email, emailVerifiedAt: null } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() || null } : {}),
        ...(dto.password
          ? { password: await bcrypt.hash(dto.password, 10) }
          : {}),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true },
    });
  }

  private parseRole(role: string | undefined): Role {
    const parsedRole = Object.values(Role).find(
      (candidate) => candidate === role,
    );
    if (parsedRole) return parsedRole;
    if (!role) return Role.STUDENT;
    throw new BadRequestException('Role pengguna tidak valid');
  }
}
