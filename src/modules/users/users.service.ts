import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseType } from './types/index.type';
import { CreateUserDto } from './dto/create-user.dto';
import { hashString } from '../../common/utils/hash.util';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<{ users: UserResponseType[] }> {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { users: users };
  }
  async findOne(id: string): Promise<{ user: UserResponseType }> {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
    return { user: user };
  }

  async create(dto: CreateUserDto): Promise<{ user: UserResponseType }> {
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: await hashString(dto.password),
          fullName: dto.fullName,
          role: dto.role,
        },
        select: {
          id: true,
          email: true,
          password: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      });
      return { user };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Пользователь с таким email уже существует!',
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<{ user: UserResponseType }> {
    const data: Partial<Prisma.UserUpdateInput> = {};
    const existing = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException();
    }
    if (dto.email) data.email = dto.email;
    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.role) data.role = dto.role;
    if (dto.password) {
      data.refreshToken = null;
      data.password = await hashString(dto.password);
    }

    const user = await this.prismaService.user.update({
      where: { id },
      data: data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
    return { user };
  }

  async delete(id: string): Promise<{ message: string; status: boolean }> {
    const existing = await this.prismaService.user.findUnique({
      where: { id: id },
    });
    if (!existing) {
      throw new NotFoundException('');
    }
    await this.prismaService.user.delete({ where: { id } });
    return { message: 'пользователь удален', status: true };
  }
}
