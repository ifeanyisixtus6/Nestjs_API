import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: CreateBlogDto, user: User) {
    const existing = await this.blogRepository.findOne({ where: { title: createBlogDto.title } });

    if (existing) {
      throw new BadRequestException('Title already exists');
    }

    const blog = this.blogRepository.create({
      ...createBlogDto,
      author: user,
    });

    await this.blogRepository.save(blog);

    return blog;
  }

async findAll() {
  const blogs = await this.blogRepository.find({
    relations: ['author'],
    order: { id: 'ASC'  }, 
  
})


  return blogs.map(blog => ({
    id: blog.id,
    title: blog.title,
    content: blog.content,
    author: {
      id: blog.author.id,
      firstName: blog.author.firstName,
      lastName: blog.author.lastName,
      email: blog.author.email,
      role: blog.author.role
    },
  }));
}


async findMine(user: User) {
  const blogs = await this.blogRepository.find({
    where: { author: { id: user.id } },
    relations: ['author'],
  });

  return blogs.map((blog) => ({
    id: blog.id,
    title: blog.title,
    content: blog.content,
    author: {
      id: blog.author.id,
      firstName: blog.author.firstName,
      lastName: blog.author.lastName,
      email: blog.author.email,
      role: blog.author.role,
    },
  }));
}


  async findOne(id: number) {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['author'] });
    if (!blog) throw new NotFoundException('Blog not found');

    return {
    id: blog.id,
    title: blog.title,
    content: blog.content,
    author: {
      id: blog.author.id,
      firstName: blog.author.firstName,
      lastName: blog.author.lastName,
      email: blog.author.email,
      role: blog.author.role
    }
  };
  }

  async update(id: number, user: User, dto: UpdateBlogDto) {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['author'] });

    if (!blog) throw new NotFoundException('Blog not found');

    if (blog.author.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to update this blog');
    }

    Object.assign(blog, dto);

    return await this.blogRepository.save(blog);
  }

  async remove(id: number, user: User) {
    const blog = await this.blogRepository.findOne({ where: { id }, relations: ['author'] });

    if (!blog) throw new NotFoundException('Blog not found');

    if (blog.author.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to delete this blog');
    }

    await this.blogRepository.remove(blog);

    return { message: 'Blog deleted successfully' };
  }
}
