import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './Notifications.service';
import { SendMeetNotificationDto, MarkReadDto } from './Send notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ── ADMIN ────────────────────────────────────────────────────────────────

  /** POST /notifications/send  –  Admin envoie un lien Meet à des participants */
  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  async send(@Body() dto: SendMeetNotificationDto) {
    // adminId can come from JWT guard; hardcoded for demo
    return this.notificationsService.sendMeetNotification(dto);
  }

  /** GET /notifications/all  –  Admin voit toutes les notifications envoyées */
  @Get('all')
  async getAllSent() {
    return this.notificationsService.getAllSentNotifications();
  }

  /** DELETE /notifications/:id  –  Admin supprime une notification */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }

  // ── PARTICIPANT ───────────────────────────────────────────────────────────

  /** GET /notifications/user/:userId  –  Participant voit ses notifications */
  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getNotificationsForUser(userId);
  }

  /** PATCH /notifications/read  –  Marquer une notification comme lue */
  @Patch('read')
  async markRead(@Body() dto: MarkReadDto) {
    return this.notificationsService.markAsRead(dto.notificationId, dto.userId);
  }
}
