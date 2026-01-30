import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateNewsDto } from './dto/create-news.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { multerImageOptions } from '../../common/utils/file-upload.util';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppRole } from '../../common/types/shared.type';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateNewsDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') authorId: string,
  ) {
    return this.newsService.create(dto, file, authorId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', multerImageOptions(new ConfigService())),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.newsService.update(id, dto, file);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.newsService.findAll({
      categoryId: query.categoryId,
      isActive:
        query.isActive === 'true'
          ? true
          : query.isActive === 'false'
            ? false
            : true,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      sortBy: query.sortBy,
      order: query.order,
    });
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }
}
