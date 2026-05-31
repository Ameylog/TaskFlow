"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";

type Notification = {
    id: string;
    message: string;
    time: string;
    isRead: boolean;
    createdAt: string;
    actor: {
        id: string;
        name: string;
        email: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
    };
};

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [sseConnected, setSseConnected] = useState(false);
    const unreadCount = notificationsEnabled
        ? notifications.filter((n) => !n.isRead).length
        : 0;
    const abortControllerRef = useRef<AbortController | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized fetch function with AbortController
    const fetchNotifications = useCallback(async () => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            const res = await api.get("/dashboard/users/notification", {
                signal: abortControllerRef.current.signal,
            });

            if (res.status === 200) {
                setNotifications(res?.data?.notifications || []);
                setNotificationsEnabled(res?.data?.notifyOnAssign ?? true);
            }
        } catch (error) {
            // Ignore abort errors
            if (error instanceof Error && (error.name === 'AbortError' || error.message === 'canceled')) {
                return;
            }
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, []);

    // Setup SSE connection
    const setupSSE = useCallback(() => {
        // Close existing connection if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        try {
            // Create the EventSource URL - use relative path or construct from window.location
            const sseUrl = `/api/dashboard/users/notification/stream`;
            const eventSource = new EventSource(sseUrl);

            eventSource.onopen = () => {
                setSseConnected(true);
                // Clear any reconnection timeout
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'connected') {
                        // console.log('SSE:', data.message);
                    } else if (data.type === 'notification') {
                        // Add new notification to the top of the list
                        setNotifications((prev) => [data.data, ...prev]);

                        // Show toast notification
                        toast.info(
                            `New task from ${data.data?.actor?.name}`,
                            {
                                description: data.data?.message
                            }
                        );
                    }
                } catch (error) {
                    console.error('Failed to parse SSE message:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE connection error:', error);
                setSseConnected(false);
                eventSource.close();

                // Attempt to reconnect after 5 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('Attempting to reconnect SSE...');
                    setupSSE();
                }, 5000);
            };

            eventSourceRef.current = eventSource;
        } catch (error) {
            console.error('Failed to setup SSE:', error);
            setSseConnected(false);
        }
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.patch("/dashboard/users/notification", {
                notificationId: id,
                read: true,
            });
            setNotifications((prev) =>
                prev.map((n) => (Number(n.id) === Number(id) ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to mark as read"
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            const markAllReadRes = await api.patch("/dashboard/users/notification/mark-all-read");
            if (markAllReadRes.status !== 200) {
                throw new Error("Failed to mark all as read");
            }

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to mark all as read"
            );
        }
    };

    const clearAll = async () => {
        try {
            const response = await api.delete("/dashboard/users/notification");
            if (response.status !== 200) {
                throw new Error("Failed to clear notifications");
            }
            setNotifications((prev) => prev.filter((n) => !n.isRead));
            toast.success("Read notifications cleared");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to clear notifications"
            );
        }
    };


    useEffect(() => {
        // Fetch initial notifications
        fetchNotifications();

        // Setup SSE connection for real-time updates
        setupSSE();

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [fetchNotifications, setupSSE]);

    const handleChangeNotifications = async (checked: boolean) => {
        try {
            setNotificationsEnabled(checked);
            const response = await api.patch("/dashboard/users/profile", { notifyOnAssign: checked });
            if (response.status !== 200) {
                throw new Error("Failed to update notification settings");
            }
            toast.success(`Notifications turned ${checked ? "on" : "off"}`);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update notification settings"
            );
        }


    };



    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8"
                    aria-label="Notifications"
                >
                    {notificationsEnabled ? (
                        <Bell className="size-4" />
                    ) : (
                        <BellOff className="size-4 text-muted-foreground" />
                    )}
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white leading-none">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-80 p-0 shadow-lg"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                                {unreadCount} new
                            </span>
                        )}
                        {/* SSE Connection Status Indicator */}
                        <span
                            className={cn(
                                "h-2 w-2 rounded-full",
                                sseConnected ? "bg-green-500" : "bg-gray-400"
                            )}
                            title={sseConnected ? "Real-time connected" : "Reconnecting..."}
                        />
                    </div>
                    {unreadCount > 0 && notificationsEnabled && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <Separator />

                {/* Toggle + Clear All row */}
                <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="notifications-toggle"
                            checked={notificationsEnabled}
                            onCheckedChange={handleChangeNotifications}
                            className="scale-90"
                        />
                        <Label
                            htmlFor="notifications-toggle"
                            className="text-xs text-muted-foreground cursor-pointer select-none"
                        >
                            {notificationsEnabled ? "Notifications on" : "Notifications off"}
                        </Label>
                    </div>

                    {notifications.filter((n) => n.isRead).length > 0 && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <Trash2 className="size-3" />
                            Clear all
                        </button>
                    )}
                </div>

                <Separator />

                {/* Notification List */}
                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground h-6">
                            {!notificationsEnabled ? (
                                <>
                                    <BellOff className="size-8 opacity-30" />
                                    <p className="text-sm">Notifications are turned off</p>
                                </>
                            ) : (
                                <>
                                    <Bell className="size-8 opacity-30" />
                                    <p className="text-sm">No notifications</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div>
                            {!notificationsEnabled && (
                                <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
                                    <p className="text-xs text-amber-700 flex items-center gap-1.5">
                                        <BellOff className="size-3" />
                                        Notifications are currently turned off
                                    </p>
                                </div>
                            )}
                            <ul>
                                {notifications.map((notification, index) => (
                                    <li key={notification.id}>
                                        <button
                                            onClick={() => markAsRead(Number(notification.id))}
                                            className={cn(
                                                "w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-muted/50",
                                                !notification.isRead && "bg-muted/30"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                                    notification.isRead ? "bg-transparent" : "bg-blue-500"
                                                )}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={cn(
                                                        "text-[13px] truncate",
                                                        notification.isRead
                                                            ? "font-normal text-muted-foreground"
                                                            : "font-medium text-foreground"
                                                    )}
                                                >
                                                    <span className="font-semibold">
                                                        {notification?.actor?.name}
                                                    </span>{" "}
                                                    assigned a task to you
                                                </p>

                                                <p className={cn(
                                                    "text-[13px] mt-1 truncate",
                                                    notification.isRead
                                                        ? "text-muted-foreground"
                                                        : "text-foreground"
                                                )}>
                                                    Title: {notification.message}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground mt-1">
                                                    {new Date(notification.createdAt).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </button>
                                        {index < notifications.length - 1 && (
                                            <Separator className="mx-4 w-auto" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </ScrollArea>
                <Separator />
            </PopoverContent>
        </Popover >
    );
}