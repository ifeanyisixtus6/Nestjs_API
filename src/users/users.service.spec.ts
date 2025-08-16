import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { ConflictException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
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

      await expect(
        service.register({
          firstName: 'Attah',
          lastName: 'Ifeanyichukwu',
          email: 'ify@yopmail.com',
          password: 'ify1472',
          role: 'user',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and return new user with token', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({ id: 1, email: 'ify@yopmail.com' });
      userRepository.save.mockResolvedValue({});
      jwtService.sign = jest.fn().mockReturnValue('mocked-jwt-token');

      const result = await service.register({
        firstName: 'Attah',
        lastName: 'Ifeanyichukwu',
        email: 'ify@yopmail.com',
        password: 'password123',
        role: 'user',
      });

    expect(result).toMatchObject({
  message: 'User created successfully',
  accessToken: 'mocked-jwt-token',
});
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if email not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'wrong@email.com', password: '123' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      userRepository.findOne.mockResolvedValue({ password: await bcrypt.hash('correct', 10) });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.login({ email: 'email@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken if login is successful', async () => {
      userRepository.findOne.mockResolvedValue({ password: 'hashedpw' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jwtService.sign = jest.fn().mockReturnValue('jwt-token');

      const result = await service.login({ email: 'test@email.com', password: 'hashedpw' });

      expect(result).toHaveProperty('accessToken', 'jwt-token');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      userRepository.find.mockResolvedValue([
        { id: 1, firstName: 'Attah', lastName: 'Sixtus', email: 'ify@yopmail.com', role: 'user' },
      ]);

      const users = await service.getAllUsers();
      expect(users.length).toBe(1);
    });
  });

  describe('getUserById', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.getUserById({ id: 1, role: 'admin' }, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserById', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.updateUserById({ id: 1, role: 'admin' }, 2, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteUserById', () => {
    it('should throw ForbiddenException if not owner or admin', async () => {
      await expect(service.softDeleteUserById({ id: 1, role: 'user' }, 2))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.softDeleteUserById({ id: 1, role: 'admin' }, 2))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is already soft-deleted', async () => {
      userRepository.findOne.mockResolvedValue({ id: 2, isDeleted: true });

      await expect(service.softDeleteUserById({ id: 1, role: 'admin' }, 2))
        .rejects.toThrow(NotFoundException);
    });

    it('should soft-delete the user', async () => {
      const user = { id: 2, isDeleted: false };
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, isDeleted: true });

      const result = await service.softDeleteUserById({ id: 1, role: 'admin' }, 2);

      expect(userRepository.save).toHaveBeenCalledWith({ ...user, isDeleted: true });
      expect(result).toEqual({ message: 'User soft-deleted successfully' });
    });
  });

describe('deleteUserById', () => {
  it('should throw NotFoundException if user not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.deleteUserById({ id: 1, role: 'admin' }, 2))
      .rejects.toThrow(NotFoundException);
  });

  it('should return success message when user is soft-deleted', async () => {
    const user = { id: 2, isDeleted: false };
    userRepository.findOne.mockResolvedValue(user);
    userRepository.save.mockResolvedValue({ ...user, isDeleted: true });

    const result = await service.deleteUserById({ id: 1, role: 'admin' }, 2);

    expect(userRepository.save).toHaveBeenCalledWith({ ...user, isDeleted: true });
    expect(result).toEqual({ message: 'User soft-deleted successfully' });
  });
});

});












