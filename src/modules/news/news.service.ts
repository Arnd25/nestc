import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  NewsItemResponse,
  NewsListResponse,
  NewsQueryParams,
} from './types/index.type';
import {
  NEWS_DEFAULT,
  NEWS_DEFAULTS,
  NEWS_ERROR,
  NEWS_ERRORS,
} from './constants/index.constant';
import { getImagePublicUrl } from '../../common/utils/file-upload.util';
import { generateSlug } from '../../common/utils/slug.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async create(
    createNewsDto: CreateNewsDto,
    file: Express.Multer.File | undefined,
    authorId: string,
  ): Promise<{ news: NewsItemResponse }> {
    if (!file) {
      throw new BadRequestException(NEWS_ERROR.IMAGE_REQUIRED_ON_CREATE);
    }
    const imageUrl = getImagePublicUrl(file.filename, this.configService);
    const categoryExists = createNewsDto.categoryId
      ? await this.prisma.category.findUnique({
          where: { id: createNewsDto.categoryId },
        })
      : null;

    if (!createNewsDto.categoryId && !categoryExists) {
      throw new BadRequestException(NEWS_ERROR.CATEGORY_NOT_FOUND);
    }
    const news = await this.prisma.news.create({
      data: {
        title: createNewsDto.title,
        slug: generateSlug(createNewsDto.title),
        content: createNewsDto.content,
        imageUrl: imageUrl,
        isActive: createNewsDto.isActive ?? false,
        categoryId: createNewsDto.categoryId ?? null,
        userId: authorId,
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        category: { select: { id: true, title: true, slug: true } },
      },
    });
    return { news: news };
  }

  async update(
    id: string,
    dto: UpdateNewsDto,
    file: Express.Multer.File | undefined,
  ): Promise<{ updated: NewsItemResponse }> {
    const exist = await this.prisma.news.findUnique({
      where: { id: id },
      include: { user: true },
    });
    if (!exist) {
      throw new BadRequestException(NEWS_ERROR.NOT_FOUND);
    }
    let imageUrl = exist.imageUrl;
    if (file) {
      imageUrl = getImagePublicUrl(file.filename, this.configService);
    }

    let slug = exist.slug;
    if (dto.title && dto.title !== exist.title) {
      slug = generateSlug(dto.title);
    }

    const data: Prisma.NewsUpdateInput = {
      title: dto.title,
      content: dto.content,
      isActive: dto.isActive,
      slug: slug,
      imageUrl: imageUrl,
    };
    const updated = await this.prisma.news.update({
      where: { id },
      data: data,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        category: { select: { id: true, title: true, slug: true } },
      },
    });
    return { updated: updated };
  }
  async findById(id: string): Promise<{ news: NewsItemResponse }> {
    const exist = await this.prisma.news.findUnique({
      where: { id: id },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        category: { select: { id: true, title: true, slug: true } },
      },
    });
    if (!exist) {
      throw new BadRequestException(NEWS_ERROR.NOT_FOUND);
    }
    return { news: exist };
  }
  async findAll(query: NewsQueryParams): Promise<{ news: NewsListResponse }> {
    const {
      page = NEWS_DEFAULT.PAGE,
      limit = NEWS_DEFAULT.LIMIT,
      categoryId,
      sortBy,
      orderBy,
    } = query;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.news.findMany({
        where: {
          categoryId: categoryId ?? undefined,
          isActive: true,
        },
        skip: skip,
        take: Math.min(limit, NEWS_DEFAULT.MAX_LIMIT),
        orderBy: {
          [sortBy ?? NEWS_DEFAULT.SORT_BY]: orderBy ?? NEWS_DEFAULT.SORT_ORDER,
        },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          category: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.news.count({
        where: {
          categoryId: categoryId ?? undefined,
          isActive: true,
        },
      }),
    ]);

    return {
      news: {
        items,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
