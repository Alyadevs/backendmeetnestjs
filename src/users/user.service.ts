// src/users/user.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Méthode create qui accepte CreateUserDto
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { username, email, password } = createUserDto;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException(
        existingUser.email === email
          ? 'Cet email est déjà utilisé'
          : 'Ce nom d\'utilisateur est déjà pris',
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }
  async findParticipants(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'participant' }).exec();
  }
  // Méthode createUser pour la compatibilité (appelle create avec un DTO)
  async createUser(username: string, password: string, role: string = 'participant'): Promise<UserDocument> {
    const createUserDto: CreateUserDto = {
      username,
      password,
      email: `${username}@example.com`, // Email temporaire
      role,
    };
    return this.create(createUserDto);
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
    });
  }

  async addRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { refreshTokens: refreshToken },
    });
  }
}
