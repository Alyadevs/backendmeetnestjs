import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { TelecomService } from './telecom.service';

@Controller('telecom')
export class TelecomController {
  constructor(private readonly telecomService: TelecomService) {}

  // Vérifie si un numéro est bloqué (appelé par Asterisk)
  @Get('check-blocked')
  async checkBlocked(@Query('phone') phone: string): Promise<string> {
    const blocked = await this.telecomService.isBlocked(phone);
    return blocked ? 'true' : 'false';
  }

  // Vérifie le PIN et retourne le roomId
  @Get('verify-pin')
  async verifyPin(
    @Query('pin') pin: string,
    @Query('phone') phone: string,
  ): Promise<string> {
    const result = await this.telecomService.verifyPin(pin, phone);
    if (!result) return 'invalid';
    return `valid|${result.roomId}`;
  }

  // L'admin banni un utilisateur (appelé depuis React)
  @Post('ban')
  async banUser(
    @Body() body: { phone: string; roomId: string; adminId: string },
  ) {
    return this.telecomService.banUser(body.phone, body.roomId, body.adminId);
  }
}
