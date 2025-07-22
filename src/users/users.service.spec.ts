import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let jwtService: JwtService;

  beforeEach(async () => {
  userRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.register({
        firstName: 'Attah',
        lastName: 'ifeanyichukwu',
        email: 'ifyy@yopmail.com',
        password: 'ify1472',
        role: 'user'
      })).rejects.toThrow(ConflictException);
    });

    it('should create and return new user with token', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({ id: 1, email: 'ifyyop@gmail.com', role: 'user' });
      userRepository.save.mockResolvedValue({});
      jwtService.sign = jest.fn().mockReturnValue('mocked-jwt-token');

      const result = await service.register({
        firstName: 'Attah',
        lastName: 'ify',
        email: 'ify@yopmail.com',
        password: '12345tee',
        role: 'user'
      });

      expect(result).toHaveProperty('message', 'User created successfully');
      expect(result).toHaveProperty('accessToken', 'mocked-jwt-token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid email', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login({
        email: 'wrong123@yopmail.com',
        password: 'ify1472'
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = { password: await bcrypt.hash('correct-password', 10) };
      userRepository.findOne.mockResolvedValue(user);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(service.login({
        email: 'ifyyop@gmail.com',
        password: 'ugochi12342ss'
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'ify@yopmail.com',
        password: 'hashedpw',
        role: 'user',
        firstName: 'sixtus',
        lastName: 'Attah'
      });

      jwtService.sign = jest.fn().mockReturnValue('mocked-jwt-token');

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const result = await service.login({
        email: 'ify@yopmail.com',
        password: 'hashedpw'
      });

      expect(result).toHaveProperty('accessToken', 'mocked-jwt-token');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users in response format', async () => {
      userRepository.find.mockResolvedValue([
        { id: 1, firstName: 'Attah', lastName: 'sixtus', email: 'ify@yopmail.com', role: 'user' }
      ]);

      const users = await service.getAllUsers();
      expect(users.length).toBe(1);
      expect(users[0]).toHaveProperty('email', 'ify@yopmail.com');
    });
  });

  describe('getUserById', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserById({ id: 1, role: 'admin' }, 2))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserById', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserById({ id: 1, role: 'admin' }, 2, {}))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserById', () => {
    it('should throw NotFoundException if delete affects 0 rows', async () => {
      userRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteUserById({ id: 1, role: 'admin' }, 2))
        .rejects.toThrow(NotFoundException);
    });

    it('should return success message on valid delete', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteUserById({ id: 1, role: 'admin' }, 2);
      expect(result).toHaveProperty('message', 'User deleted successfully');
    });
  });
});
