import { Controller, Get, Request, Post, Body, Patch, Param, Delete, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/roles.decorator';




@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.usersService.register(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.usersService.login(body);
  }

  
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getUserById(@Request() req, @Param('id') id: string) {
    return this.usersService.getUserById(req.user, parseInt(id, 10));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateUserById(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUserById(req.user, parseInt(id, 10), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteUserById(@Request() req, @Param('id') id: string) {
    return this.usersService.deleteUserById(req.user, parseInt(id, 10));
  }

}


