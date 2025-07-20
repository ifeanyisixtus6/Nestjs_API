import { Controller, Post, Get, Param, Patch, Body, Delete, Request, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateBlogDto, @Request() req) {
    return this.blogService.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get('my-blogs')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req) {
    return this.blogService.findMine(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto, @Request() req) {
    return this.blogService.update(+id, req.user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.blogService.remove(+id, req.user);
  }
}
