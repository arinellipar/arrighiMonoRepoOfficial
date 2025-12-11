import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getAll(req: any): Promise<import("./notifications.service").Notification[]>;
    registerToken(req: any, token: string): Promise<{
        success: boolean;
    }>;
}
