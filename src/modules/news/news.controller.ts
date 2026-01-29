import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorations/current-user.decorator';
import { multerImageOptions } from '../../common/utils/file-upload.util';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createNewsDto: CreateNewsDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') authorId: string,
  ) {
    return this.newsService.create(createNewsDto, file, authorId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.newsService.findAll({
      categoryId: query.categoryId,
      published:
        query.published === 'true'
          ? true
          : query.published === 'false'
            ? false
            : undefined,
      page: Number(query.page) || 1,
      sortBy: query.sortBy,
      orderBy: query.orderBy,
    });
  }
  @Patch(':id')
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
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findById(id);
  }
}
