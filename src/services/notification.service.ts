import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sseEmitter } from "@/lib/sseEmitter";
import { PAGE_SIZE } from "@/lib/constant";
import { ServiceError } from "@/lib/errorHandling";


export async function createNotificationService(userId: number, actorId: number, taskId: number, message: string) {
    // console.log(`[Notification] Creating notification for user ${userId} from actor ${actorId}`);
    // console.log(`[Notification] Client count:`, sseEmitter.getClientCount(userId));

    const notification = await prisma.notification.create({
        data: {
            userId: userId,
            actorId: actorId,
            taskId: taskId,
            message: message,
        },
        select: {
            id: true,
            taskId: true,
            message: true,
            isRead: true,
            createdAt: true,
            actor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
        }
    });

    // Try to send via SSE (will fail if no clients)
    sseEmitter.sendNotification(userId, {
        type: 'notification',
        data: notification
    });

    return notification;
};

export async function getNotificationsService(userId: number) {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            taskId: true,
            message: true,
            isRead: true,
            createdAt: true,
            actor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
        },
    });

    const notifyOnAssign = await prisma.user.findUnique({
        where: { id: userId },
        select: { notifyOnAssign: true },
    });

    return {
        notifications,
        notifyOnAssign: notifyOnAssign?.notifyOnAssign ?? true,
        message: "Notifications list"
    }
}

// Update notification mark as read status
export async function updateNotificationService(notificationId: number, userId: number, read: boolean, role: string) {
    if (role === "ADMIN") return NextResponse.json({ message: "Admins cannot update notifications" }, { status: 403 });
    await prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId: userId,
        },
        data: {
            isRead: read,
        },
    });
}

//clear all read notifications for a user
export async function clearNotificationService(userId: number, role: string) {
    if (role === "ADMIN") return NextResponse.json({ message: "Admins cannot clear notifications" }, { status: 403 });
    await prisma.notification.deleteMany({
        where: {
            userId: userId,
            isRead: true,
        },
    });
}

export async function updateMarkAllReadService(userId: number, role: string) {
    if (role === "ADMIN") return NextResponse.json({ message: "Admins cannot update notifications" }, { status: 403 });
    await prisma.notification.updateMany({
        where: {
            userId: userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
}