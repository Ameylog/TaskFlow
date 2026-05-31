// SSE Event Emitter for real-time notifications
type SSEClient = {
    userId: number;
    controller: ReadableStreamDefaultController;
};

type NotificationEvent = {
    type: string;
    data?: unknown;
    message?: string;
};

class SSEEmitter {
    private clients: Map<number, SSEClient[]> = new Map();

    // Add a client connection
    addClient(userId: number, controller: ReadableStreamDefaultController) {
        const existingClients = this.clients.get(userId) || [];
        existingClients.push({ userId, controller });
        this.clients.set(userId, existingClients);
//       console.log(`[SSE] Client added for user ${userId}. Total clients: ${existingClients.length}`);
    }

    // Remove a client connection
    removeClient(userId: number, controller: ReadableStreamDefaultController) {
        const existingClients = this.clients.get(userId);
        if (!existingClients) return;

        const filteredClients = existingClients.filter(
            (client) => client.controller !== controller
        );

        if (filteredClients.length === 0) {
            this.clients.delete(userId);
        } else {
            this.clients.set(userId, filteredClients);
        }

        // console.log(`[SSE] Client removed for user ${userId}. Remaining clients: ${filteredClients.length}`);
    }

    // Send notification to specific user
    sendNotification(userId: number, notification: NotificationEvent) {
        const clients = this.clients.get(userId);
        if (!clients || clients.length === 0) {
            return;
        }

        const data = JSON.stringify(notification);
        const message = `data: ${data}\n\n`;
        const encoder = new TextEncoder();
        const staleClients: SSEClient[] = [];

        clients.forEach((client, index) => {
            try {
                client.controller.enqueue(encoder.encode(message));
            } catch (error) {
                console.error(`[SSE] Failed to send to client ${index + 1} for user ${userId}:`, error);
                staleClients.push(client);
            }
        });

        // Remove stale clients after iteration to avoid mutating during loop
        staleClients.forEach((client) => {
            this.removeClient(userId, client.controller);
        });
    }

    // Send message to all connected clients (broadcast)
    broadcast(notification: NotificationEvent) {
        this.clients.forEach((clients, userId) => {
            this.sendNotification(userId, notification);
        });
    }

    // Get count of connected clients for a user
    getClientCount(userId: number): number {
        return this.clients.get(userId)?.length || 0;
    }

    // Get total count of all connected clients
    getTotalClientCount(): number {
        let total = 0;
        this.clients.forEach((clients) => {
            total += clients.length;
        });
        return total;
    }
}

// Use globalThis to persist across hot reloads in development
const globalForSSE = globalThis as unknown as { sseEmitter?: SSEEmitter };

export const sseEmitter = globalForSSE.sseEmitter ?? new SSEEmitter();

if (process.env.NODE_ENV !== 'production') {
    globalForSSE.sseEmitter = sseEmitter;
}
