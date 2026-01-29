import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NewsItemResponse } from './types/index.type';
import { NEWS_ERROR } from './constants/index.constant';
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
  async findAll(): Promise<{ news: NewsItemResponse[] }> {
    const news = await this.prisma.news.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        category: { select: { id: true, title: true, slug: true } },
      },
    });
    return { news: news };
  }
}
