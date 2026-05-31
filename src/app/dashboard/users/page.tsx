import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getUserService } from "@/services/user.service";
import { headers } from "next/headers";
import UserFilter from "./UserFilter";
import { Suspense } from "react";
import { TodoSkeleton } from "../todo/TodoSkeleton";
import UserItem from "./UserItem";

async function Users({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
    const hdrs = await headers();
    const userId = Number(hdrs.get("x-user-id"));
    const userRole = hdrs.get("x-user-role") || "USER";
    const params = await searchParams;
    const filter = params.filter || "all";
    const { data: userList = [], total, active, inactive } = await getUserService(userId, userRole, filter, 1);

    return (
        <Suspense fallback={<TodoSkeleton />}>
            <section>
                <div className="p-2">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <UserFilter currentFilter={filter} total={total} active={active} inactive={inactive} />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[1.4fr_2fr_1fr_1fr_0.9fr] gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <p>Name</p>
                                <p>Email</p>
                                <p>Role</p>
                                <p>Status</p>
                                <p className="ms-8">Actions</p>
                            </div>
                            <div className="h-[calc(100vh-16rem)]">
                                <UserItem
                                    initialUsers={userList}
                                    initialTotal={total}
                                    userId={userId}
                                    userRole={userRole}
                                    filter={filter}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section >
        </Suspense >
    )
}

export default Users;

