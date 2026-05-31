"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { List, RowComponentProps } from "react-window";
import { useInfiniteLoader } from "react-window-infinite-loader";
import { Ban, CircleCheckBig, Mail, Shield, UserRound } from "lucide-react";
import UserAction from "./UserAction";
import api from "@/lib/axios";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

interface UserItemProps {
    initialUsers: User[];
    initialTotal: number;
    userId: number;
    userRole: string;
    filter: string;
}

type UserRowProps = {
    users: User[];
    userId: number;
    userRole: string;
    isItemLoaded: (index: number) => boolean;
};

const ITEM_HEIGHT = 76;

const RowComponent = ({
    index,
    style,
    ariaAttributes,
    users,
    userId,
    userRole,
    isItemLoaded,
}: RowComponentProps<UserRowProps>) => {
    if (!isItemLoaded(index)) {
        return (
            <div style={style} {...ariaAttributes} className="pb-3 px-1">
                <div className="h-16 w-full animate-pulse rounded-2xl border border-border/70 bg-muted/30" />
            </div>
        );
    }

    const user = users[index];

    if (!user) {
        return (
            <div style={style} {...ariaAttributes} className="pb-3 px-1">
                <div className="h-16 w-full animate-pulse rounded-2xl border border-border/70 bg-muted/30" />
            </div>
        );
    }

    return (
        <div style={style} {...ariaAttributes} className="pb-3 px-1">
            <div className="grid h-16 grid-cols-[1.4fr_2fr_1fr_1fr_0.9fr] items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 shadow-sm transition-colors hover:bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                        {user.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <UserRound className="h-3.5 w-3.5" />
                            Team member
                        </p>
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm text-foreground">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{user.email}</span>
                    </p>
                </div>
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        <Shield className="h-3.5 w-3.5" />
                        {user.role === "USER" ? "User" : "Admin"}
                    </div>
                </div>
                <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                >
                    {user.isActive ? <CircleCheckBig className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    <span>{user.isActive ? "Active" : "Inactive"}</span>
                </div>
                <UserAction user={user} userId={userId} userRole={userRole} />
            </div>
        </div>
    );
};

const UserItem = ({ initialUsers, initialTotal, userId, userRole, filter }: UserItemProps) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [hasMore, setHasMore] = useState(initialUsers.length < initialTotal);
    const pageRef = useRef(1);
    const isLoadingRef = useRef(false);
    const filterRef = useRef(filter);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        abortControllerRef.current?.abort();
        filterRef.current = filter;
        setUsers(initialUsers);
        setHasMore(initialUsers.length < initialTotal);
        pageRef.current = 1;
    }, [filter, initialUsers, initialTotal]);

    useEffect(() => {
        return () => { abortControllerRef.current?.abort(); };
    }, []);

    const isItemLoaded = useCallback(
        (index: number) => !hasMore || index < users.length,
        [hasMore, users.length]
    );

    const loadMoreRows = useCallback(
        async () => {
            if (isLoadingRef.current || !hasMore) return;
            isLoadingRef.current = true;

            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            const capturedFilter = filterRef.current;

            try {
                const nextPage = pageRef.current + 1;
                const { data } = await api.get<{ data: User[]; page: number; totalPages: number }>(
                    `/dashboard/users?filter=${capturedFilter}&page=${nextPage}`,
                    { signal: controller.signal }
                );

                if (capturedFilter !== filterRef.current) return;

                setUsers((prev) => {
                    const existingIds = new Set(prev.map((u) => u.id));
                    const newUsers = data.data.filter((u) => !existingIds.has(u.id));
                    const newArray = [...prev, ...newUsers];
                    return newArray;
                });
                setHasMore(data.page < data.totalPages);
                pageRef.current = nextPage;
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                if (!controller.signal.aborted) {
                    console.error("Failed to load more users:", err);
                }
            } finally {
                isLoadingRef.current = false;
            }
        },
        [hasMore]
    );

    const itemCount = hasMore ? users.length + 1 : users.length;

    const onRowsRendered = useInfiniteLoader({
        isRowLoaded: isItemLoaded,
        loadMoreRows,
        rowCount: itemCount,
        threshold: 5,
    });

    if (users.length === 0 && !hasMore) {
        return (
            <div className="flex h-[calc(100vh-18rem)] items-center justify-center rounded-2xl border border-dashed bg-muted/10">
                <p className="text-sm text-muted-foreground">No users found.</p>
            </div>
        );
    }

    return (
        <List<UserRowProps>
            rowCount={itemCount}
            rowHeight={ITEM_HEIGHT}
            rowComponent={RowComponent}
            rowProps={{ users, userId, userRole, isItemLoaded }}
            onRowsRendered={onRowsRendered}
            className="scrollbar-thin overflow-x-hidden"
        />
    );
};

export default UserItem;