import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CategoryNewsResponse,
  NewsCategoryItemResponse,
} from './types/index.type';
import { CreateCategoryDto } from './dto/create-category.dto';
import { generateSlug } from '../../common/utils/slug.util';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<{ categories: CategoryNewsResponse[] }> {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        news: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return { categories: categories };
  }
  async findOne(id: string): Promise<{ category: CategoryNewsResponse }> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException();
    }
    const category = await this.prisma.category.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        news: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return { category: category };
  }

  async create(
    dto: CreateCategoryDto,
  ): Promise<{ category: NewsCategoryItemResponse }> {
    const slug = dto.slug || generateSlug(dto.title);
    try {
      const category = await this.prisma.category.create({
        data: {
          title: dto.title,
          slug: slug,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          news: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
      return { category: category };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Категория с таким slug уже существует');
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<{ category: NewsCategoryItemResponse }> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });
    if (!existing) {
      throw new NotFoundException('такой категории не существует');
    }
    const data: Partial<Prisma.CategoryUpdateInput> = {};
    if (dto.title) data.title = dto.title;
    if (dto.slug) {
      data.slug = dto.slug;
    } else if (dto.title !== undefined) {
      data.slug = generateSlug(dto.title);
    }
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
      },
    });

    return {
      category: category,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException();
    }
    await this.prisma.category.delete({
      where: { id },
    });
    return { message: 'удаленно' };
  }
}
