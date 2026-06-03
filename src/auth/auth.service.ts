// src/auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetToken, ResetTokenDocument } from './reset-token.schema';
import { MailService } from '../mailjs/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/Reset password.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/user';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import * as JsonWebToken from 'jsonwebtoken';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    private usersService: UsersService,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,

    @InjectModel(ResetToken.name)
    private resetTokenModel: Model<ResetTokenDocument>,

    private readonly mailService: MailService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

async signup(signUpDto: SignUpDto) {
  try {
    const user = await this.usersService.create(signUpDto);

    const token = this.generateJitsiToken(user.username, user.role);

    return {
      success: true,
      message: 'Inscription réussie',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,     // ← nouveau
        address: user.address, // ← nouveau
        role: user.role,
      },
      access_token: token,
    };
  } catch (error) {
    throw error;
  }
}

  // Méthode login corrigée pour accepter LoginDto
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    // Trouver l'utilisateur par username
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException(
        "Nom d'utilisateur ou mot de passe incorrect",
      );
    }

    // Vérifier le mot de passe
    if (password && user.password) {
      const isPasswordValid = await this.usersService.validatePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException(
          "Nom d'utilisateur ou mot de passe incorrect",
        );
      }
    }

    // Générer le token Jitsi
    const token = this.generateJitsiToken(user.username, user.role);

    return {
      access_token: token,
      role: user.role,
      username: user.username,
      userId: user._id,
      email: user.email,
      phone: user.phone,    
    address: user.address,
    };
  }

  // Méthode refreshToken manquante
  async refreshToken(refreshToken: string) {
    try {
      // Vérifier et décoder le refresh token
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      // Générer un nouveau token
      const newToken = this.generateJitsiToken(user.username, user.role);
      return {
        access_token: newToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  // Méthode utilitaire pour générer le token Jitsi
  private generateJitsiToken(username: string, role: string = 'participant') {
    const payload = {
      aud: 'jitsi',
      iss: 'meeting-app',
      sub: 'monjitsi.duckdns.org',
      room: '*',
      exp: Math.floor(Date.now() / 1000) + 86400,
      context: {
        user: {
          name: username,
          role: role === 'admin' ? 'moderator' : 'participant',
        },
        features: {
          recording: role === 'admin',
          'screen-sharing': true,
        },
      },
    };

    const token = JsonWebToken.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { 
      algorithm: 'HS256',
       
    });

    return token;
  }

  // Méthode pour générer un token spécifique à une salle
  async generateMeetingToken(
    username: string,
    roomName: string,
    userRole: string = 'participant',
  ) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const payload = {
      aud: 'jitsi',
      iss: 'meeting-app',
      sub: 'monjitsi.duckdns.org',
      room: roomName,
      exp: Math.floor(Date.now() / 1000) + 86400,
      context: {
        user: {
          name: user.username,
          role: userRole === 'moderator' ? 'moderator' : 'participant',
        },
        features: {
          recording: userRole === 'moderator',
          'screen-sharing': false,
        },
      },
    };

    const token = this.jwtService.sign(payload, {
      algorithm: 'HS256',
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });

    return {
      access_token: token,
      role: user.role,
      meetingRole: userRole,
    };
  }
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = dto;
    const user = await this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
    if (!user) {
      // Réponse générique volontaire
      this.logger.warn(`Forgot-password : e-mail inconnu "${email}"`);
      return { message: 'Si cet e-mail existe, un lien a été envoyé.' };
    }
    // Invalide les anciens tokens en attente pour cet utilisateur
    await this.resetTokenModel.deleteMany({ userId: user._id }).exec();
    // Génère un token aléatoire 32 octets (64 hex chars)
    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1 heure
    await this.resetTokenModel.create({
      userId: user._id,
      token: hashedToken,
      expiresAt,
      used: false,
    });
    // On envoie le token brut (jamais le hash) dans l'URL
    try {
      await this.mailService.sendResetPasswordEmail(user.email, rawToken);
    } catch (err) {
      this.logger.error('Envoi e-mail échoué', err);
      // On ne propage pas l'erreur pour ne pas bloquer l'UX
    }
    return { message: 'Si cet e-mail existe, un lien a été envoyé.' };
  }
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = dto;
    // Récupère tous les tokens non-utilisés et non-expirés
    const validRecords = await this.resetTokenModel
      .find({
        used: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();
    // Recherche le token correspondant par comparaison bcrypt
    let matchedRecord: ResetTokenDocument | null = null;
    for (const record of validRecords) {
      const isMatch = await bcrypt.compare(token, record.token);
      if (isMatch) {
        matchedRecord = record;
        break;
      }
    }
    if (!matchedRecord) {
      throw new BadRequestException(
        'Token invalide ou expiré. Veuillez refaire une demande de réinitialisation.',
      );
    }
    // Récupère l'utilisateur
    const user = await this.userModel.findById(matchedRecord.userId).exec();
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    // Hash du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel
      .findByIdAndUpdate(user._id, { password: hashedPassword })
      .exec();
    // Marque le token comme utilisé (ou supprime-le directement)
    await this.resetTokenModel.findByIdAndDelete(matchedRecord._id).exec();
    this.logger.log(
      `Mot de passe réinitialisé pour l'utilisateur : ${user.email}`,
    );
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    const validRecords = await this.resetTokenModel
      .find({ used: false, expiresAt: { $gt: new Date() } })
      .exec();
    for (const record of validRecords) {
      const isMatch = await bcrypt.compare(token, record.token);
      if (isMatch) return { valid: true };
    }
    return { valid: false };
  }
  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (dto.email) {
      const existing = await this.userModel
        .findOne({ email: dto.email })
        .exec();
      if (existing) throw new BadRequestException('Cet email est déjà utilisé');
      user.email = dto.email;
    }

    if (dto.newPassword) {
    if (!dto.oldPassword)
      throw new BadRequestException('Mot de passe actuel requis');
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch)
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    user.password = await bcrypt.hash(dto.newPassword, 10);
  }

  // ── Profil (username, phone, address) ──────────────────────────────────────
  if (dto.username) {
      const existing = await this.userModel
        .findOne({ username: dto.username })
        .exec();
    if (existing && existing._id.toString() !== userId)
      throw new BadRequestException("Ce nom d'utilisateur est déjà pris");
    user.username = dto.username;
  }
    if (dto.phone) user.phone = dto.phone;
  if (dto.address) user.address = dto.address;

    await user.save();

    return {
      success: true,
      message: 'Informations mises à jour avec succès',
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
    },
  };
}
}
