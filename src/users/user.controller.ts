// src/users/user.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get('participants')
  async getParticipants() {
    const users = await this.usersService.findParticipants();

    return {
      success: true,
      total: users.length,
      users: users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      })),
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      user: {
        id: user._id.toString(), // Utiliser _id et convertir en string
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return { success: false, message: 'Utilisateur non trouvé' };
    }
    return {
      success: true,
      user: {
        id: user._id.toString(), // Utiliser _id et convertir en string
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  // Endpoint pour créer un utilisateur avec paramètres individuels
  @Post('create-user')
  async createUser(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('role') role: string = 'participant',
  ) {
    const user = await this.usersService.createUser(username, password, role);
    return {
      success: true,
      user: {
        id: user._id.toString(), // Utiliser _id et convertir en string
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
