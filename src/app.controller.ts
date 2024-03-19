import { Bind, Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  @Bind(UploadedFiles(), Body())
  uploadImage(files: (Express.Multer.File)[]) {
    return this.appService.upload(files);
  }
}
