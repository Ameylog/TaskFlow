import { clearNotificationsController, getNotificationsController, updateNotificationController } from "@/controllers/notification.controller";
//  get ths list of all notifications for the logged in user
export const GET = getNotificationsController;

// update notification mark as read status
export const PATCH = updateNotificationController;

// Clear all read notifications for the logged in user
export const DELETE = clearNotificationsController;
