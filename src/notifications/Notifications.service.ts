import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './Notification';
import { SendMeetNotificationDto } from './Send notification.dto';

/** Returns true only for a valid 24-char hex MongoDB ObjectId */
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async sendMeetNotification(
    dto: SendMeetNotificationDto,
    adminId?: string,
  ): Promise<NotificationDocument> {
    const invalidIds = dto.recipientIds.filter((id) => !isValidObjectId(id));
    if (invalidIds.length) {
      throw new BadRequestException(
        `Invalid participant ID(s): ${invalidIds.join(', ')}`,
      );
    }

    const notification = new this.notificationModel({
      title: dto.title,
      meetUrl: dto.meetUrl,
      description: dto.description,
      recipients: dto.recipientIds.map((id) => new Types.ObjectId(id)),
      createdBy:
        adminId && isValidObjectId(adminId)
          ? new Types.ObjectId(adminId)
          : undefined,
    });
    return notification.save();
  }

  async getNotificationsForUser(userId: string): Promise<NotificationDocument[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException(
        `"${userId}" n'est pas un identifiant valide. ` +
          `Vérifiez que CURRENT_USER_ID dans ParticipantNotifPanel.jsx ` +
          `contient le vrai _id MongoDB de l'utilisateur connecté.`,
      );
    }

    return this.notificationModel
      .find({ recipients: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .exec();
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    if (!isValidObjectId(notificationId))
      throw new BadRequestException(`Invalid notification ID: ${notificationId}`);
    if (!isValidObjectId(userId))
      throw new BadRequestException(`Invalid user ID: ${userId}`);

    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) throw new NotFoundException('Notification not found');

    const isRecipient = notification.recipients.some(
      (r) => r.toString() === userId,
    );
    if (!isRecipient)
      throw new NotFoundException('Not a recipient of this notification');

    notification.isRead = true;
    await notification.save();
    return { success: true };
  }

  async getAllSentNotifications(): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find()
      .sort({ createdAt: -1 })
      .populate('recipients', 'name email')
      .populate('createdBy', 'name email')
      .exec();
  }

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    if (!isValidObjectId(id))
      throw new BadRequestException(`Invalid notification ID: ${id}`);
    const result = await this.notificationModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Notification not found');
    return { success: true };
  }
}
