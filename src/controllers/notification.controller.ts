import { handleControllerError } from "@/lib/errorHandling";
import { sseEmitter } from "@/lib/sseEmitter";
import { getUserIdFromHeader, getUserRoleFromHeader } from "@/lib/utils";
import { clearNotificationService, getNotificationsService, updateMarkAllReadService, updateNotificationService } from "@/services/notification.service";
import { NextRequest, NextResponse } from "next/server";

export async function getNotificationsController(request: NextRequest) {
    try {
        const userId = getUserIdFromHeader(request);
        const notifications = await getNotificationsService(userId);
        return NextResponse.json(notifications, { status: 200 });
    }
    catch (error) {
        return handleControllerError(error, "Failed to fetch notifications");
    }
};

export async function updateNotificationController(request: NextRequest) {
    try {
        const userId = getUserIdFromHeader(request);
        const role = getUserRoleFromHeader(request);
        const { notificationId, read } = await request.json();
        await updateNotificationService(notificationId, userId, read, role);
        return NextResponse.json({ message: "Notification updated successfully" }, { status: 200 });
    }
    catch (error) {
        return handleControllerError(error, "Failed to update notification");
    }
};

export async function clearNotificationsController(request: NextRequest) {
    try {
        const userId = getUserIdFromHeader(request);
        const role = getUserRoleFromHeader(request);
        await clearNotificationService(userId, role);
        return NextResponse.json({ message: "Read notifications cleared successfully" }, { status: 200 });
    }
    catch (error) {
        return handleControllerError(error, "Failed to clear notifications");
    }
};

export async function updateMarkAllReadController(request: NextRequest) {
    try {
        const userId = getUserIdFromHeader(request);
        const role = getUserRoleFromHeader(request);
        await updateMarkAllReadService(userId, role);
        return NextResponse.json({ message: "All notifications marked as read successfully" }, { status: 200 });
    }
    catch (error) {
        return handleControllerError(error, "Failed to mark all notifications as read");
    }
};


export async function getNotificationStreamController(request: NextRequest) {
    try {
        // Get user ID from request headers
        const userId = getUserIdFromHeader(request);

        // console.log(`[SSE] User ${userId} connecting to notification stream`);

        // Create a ReadableStream for SSE
        const stream = new ReadableStream({
            start(controller) {
                // Add this client to the SSE emitter
                sseEmitter.addClient(userId, controller);

                // Send initial connection message
                const encoder = new TextEncoder();
                const message = `data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`;
                controller.enqueue(encoder.encode(message));

                // Send keepalive ping every 30 seconds to prevent connection timeout
                const keepAliveInterval = setInterval(() => {
                    try {
                        controller.enqueue(encoder.encode(': keepalive\n\n'));
                    } catch (error) {
                        // Controller is closed, stop sending keepalives
                        clearInterval(keepAliveInterval);
                        // console.log(`[SSE] Keepalive stopped for user ${userId} - connection closed`);
                    }
                }, 30000);

                // Store interval ID for cleanup
                (controller as unknown as { keepAliveInterval: NodeJS.Timeout }).keepAliveInterval = keepAliveInterval;
            },
            cancel(controller) {
                // Clean up when client disconnects
                const keepAliveInterval = (controller as unknown as { keepAliveInterval?: NodeJS.Timeout }).keepAliveInterval;
                if (keepAliveInterval) {
                    clearInterval(keepAliveInterval);
                }
                sseEmitter.removeClient(userId, controller);
                // console.log(`[SSE] Connection closed for user ${userId}`);
            }
        });

        // Return the stream with appropriate SSE headers
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no', // Disable buffering for nginx
            },
        });
    } catch (error) {
        console.error('SSE connection error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to establish SSE connection' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
