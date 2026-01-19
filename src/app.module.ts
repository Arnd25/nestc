import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './modules/test/test.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [TestModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
