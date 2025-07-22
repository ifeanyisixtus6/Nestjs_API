import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserRole } from '../users/enums/enum';

describe('BlogService', () => {
  let service: BlogService;
  let blogRepository: any;

  const mockUser = { id: 1, role: UserRole.User, firstName: 'Attah', lastName: 'Ifeanyichukwu', email: 'ify@yopmail.com', password: 'sixtus1237', blogs: [] };
  const mockAdmin = { id: 2, role: UserRole.Admin };

  beforeEach(async () => {
    blogRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: getRepositoryToken(Blog), useValue: blogRepository },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  describe('create', () => {
    it('should throw BadRequestException if title already exists', async () => {
      blogRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create({ title: 'my blogPost', content: 'learning backend' }, mockUser))
        .rejects.toThrow(BadRequestException);
    });

    it('should create and return the blog', async () => {
      blogRepository.findOne.mockResolvedValue(null);
      blogRepository.create.mockReturnValue({ title: 'my blogPost', content: 'learning backend' });
      blogRepository.save.mockResolvedValue({});

      const result = await service.create({ title: 'my blogPost', content: 'learning backend' }, mockUser);

      expect(blogRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('title', 'my blogPost');
    });
  });

  describe('findAll', () => {
    it('should return formatted list of blogs', async () => {
      blogRepository.find.mockResolvedValue([
        {
          id: 1,
          title: 'seamfix',
          content: 'backend cohort 6',
          author: mockUser,
        },
      ]);

      const blogs = await service.findAll();
      expect(blogs[0]).toHaveProperty('title', 'seamfix');
    });
  });

  describe('findMine', () => {
    it('should return blogs belonging to the user', async () => {
      blogRepository.find.mockResolvedValue([
        { id: 1, title: 'node.js 1', content: 'ifeanyichukwu blogs', author: mockUser },
      ]);

      const result = await service.findMine(mockUser);

      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('title', 'node.js 1');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if blog not found', async () => {
      blogRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return the blog if found', async () => {
      blogRepository.findOne.mockResolvedValue({ id: 1, title: 'Blog', author: mockUser });

      const result = await service.findOne(1);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if blog not found', async () => {
      blogRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, mockUser, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner/admin', async () => {
      blogRepository.findOne.mockResolvedValue({ id: 1, author: { id: 99 } });

      await expect(service.update(1, mockUser, {})).rejects.toThrow(ForbiddenException);
    });

    it('should update and return blog if authorized', async () => {
      blogRepository.findOne.mockResolvedValue({ id: 1, author: { id: 1 }, save: jest.fn() });
      blogRepository.save.mockResolvedValue({ id: 1, title: 'Updated blogs' });

      const result = await service.update(1, mockUser, { title: 'Updated blogs' });

      expect(result).toHaveProperty('title', 'Updated blogs');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if blog not found', async () => {
      blogRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner/admin', async () => {
      blogRepository.findOne.mockResolvedValue({ id: 1, author: { id: 9 } });

      await expect(service.remove(1, mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should remove blog if authorized', async () => {
      blogRepository.findOne.mockResolvedValue({ id: 1, author: mockUser });
      blogRepository.remove.mockResolvedValue({});

      const result = await service.remove(1, mockUser);

      expect(result).toHaveProperty('message', 'Blog deleted successfully');
    });
  });
});
