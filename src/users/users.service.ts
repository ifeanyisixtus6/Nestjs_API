import { Injectable, ConflictException, UnauthorizedException, BadRequestException,ForbiddenException, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserResponse } from '../model/interfaces';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto'
import { UserRole } from './enums/enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto):  Promise<{ message: string; accessToken: string; user: UserResponse }> {
    const { firstName, lastName, email, password, role } = createUserDto;

    if (!firstName || !lastName || !email || !password) {
      throw new BadRequestException('All fields are mandatory');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role as UserRole
    });

    await this.userRepository.save(user);

    const accessToken = this.jwtService.sign({
      userId: user.id,
      role: user.role,
    });

    return {
      message: 'User created successfully',
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<{ message: string; accessToken: string; user: UserResponse }> {
    const { email, password } = loginUserDto;

    if (!email || !password) {
      throw new BadRequestException('Email or Password is missing!');
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.jwtService.sign({
      userId: user.id,
      role: user.role,
    });

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }


async getAllUsers(): Promise<UserResponse[]> {
  const users = await this.userRepository.find({
    order: { id: 'ASC'  },  
  });

  return users.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  }));
}

  async getUserById(requestUser: any, id: number) {
    if (requestUser.id !== id && requestUser.role !== 'admin') {
      throw new ForbiddenException('Not authorized');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateUserById(requestUser: any, id: number, updateData: any) {
    if (requestUser.id !== id && requestUser.role !== 'admin') {
      throw new ForbiddenException('Unauthorized');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.update(id, updateData);

    return { message: 'User Updated successfully' };
  }

  async deleteUserById(requestUser: any, id: number) {
    if (requestUser.id !== id && requestUser.role !== 'admin') {
      throw new ForbiddenException('Unauthorized');
    }

    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
  
}
