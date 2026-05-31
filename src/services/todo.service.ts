import { prisma } from "@/lib/db";
import { ServiceError } from "@/lib/errorHandling";
import { createNotificationService } from "./notification.service";
import { sendEmail } from "@/lib/mail/sendEmail";
import { formatDateLocale } from "@/lib/formatDate";
import { PAGE_SIZE } from "@/lib/constant";

function parseDateInput(value: unknown): Date | null | undefined {
    if (value === undefined) return undefined
    if (value === null) return null
    if (typeof value !== "string") throw new ServiceError("Invalid due date format", 400)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ServiceError("Invalid due date format", 400)

    const parsed = new Date(`${value}T00:00:00.000Z`)
    if (Number.isNaN(parsed.getTime())) throw new ServiceError("Invalid due date format", 400)

    return parsed;
}

export async function getTodosService(
    userId: number,
    category: string | null,
    q: string | null,
    userRole: string,
    page: number = 1,
    view: string | null = null,
) {
    if (category && category !== "completed" && category !== "active") {
        throw new ServiceError("Invalid category. Use completed or active.", 400)
    }
    const role = userRole === "ADMIN" ? {} : { userId };

    const where: {
        userId?: number;
        completed?: boolean;
        title?: { contains: string };
    } = { ...role };

    if (category === "completed") where.completed = true
    if (category === "active") where.completed = false
    if (q) where.title = { contains: q }

    const isCalendarView = view === "calendar";

    const [todos, totalCount, completedCount] = await Promise.all([
        prisma.todo.findMany({
            where,
            orderBy: isCalendarView ? [{ dueDate: "asc" }, { id: "desc" }] : { id: "desc" },
            select: {
                id: true,
                title: true,
                completed: true,
                description: true,
                dueDate: true,
                category: true,
                priority: true,
                ...(userRole === "ADMIN" && {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }),
            },
            ...(isCalendarView
                ? {}
                : {
                    skip: (page - 1) * PAGE_SIZE,
                    take: PAGE_SIZE,
                }),
        }),
        prisma.todo.count({ where: role }),
        prisma.todo.count({ where: { ...role, completed: true } }),
    ]);
    const activeCount = totalCount - completedCount

    return {
        message: "Todos fetched successfully",
        data: todos,
        total: totalCount,
        completed: completedCount,
        active: activeCount,
        page,
        totalPages: isCalendarView ? 1 : Math.ceil(totalCount / PAGE_SIZE),
    }
}

export async function createTodoService(userId: number, body: unknown, userRole: string) {
    const payload = body as {
        title?: string; description?: string; dueDate?: unknown; category?: string; priority?: string; newUserId?: number
    };
    const title = typeof payload?.title === "string" ? payload.title.trim() : "";
    const dueDate = payload?.dueDate ? parseDateInput(payload?.dueDate) : null;
    const description = typeof payload?.description === "string" ? payload.description.trim() : undefined;
    const category = payload.category || undefined;
    const priority = payload.priority || undefined;
    const newUserId = typeof payload?.newUserId === "number" ? payload.newUserId : undefined;

    if (!title) {
        throw new ServiceError("Title is required", 400);
    }

    const existingTodo = await prisma.todo.findFirst({ where: { title }, select: { id: true } });
    if (existingTodo) {
        throw new ServiceError("Todo with this title already exists", 409);
    }

    const targetUserId = userRole === "ADMIN" && newUserId ? newUserId : userId;

    const newTodo = await prisma.todo.create({
        data: { title, dueDate: dueDate ?? null, userId: targetUserId, description, category, priority },
        select: {
            id: true,
            title: true,
            completed: true,
            description: true,
            dueDate: true,
            category: true,
            priority: true
        },
    });

    return {
        message: "Todo created successfully",
        data: newTodo,
    };
}

export async function deleteTodoByIdService(userId: number, todoId: number, role: string) {
    const whereClause = role === "ADMIN" ? { id: todoId } : { id: todoId, userId };
    const deleted = await prisma.todo.deleteMany({ where: whereClause });
    if (deleted.count === 0) {
        throw new ServiceError("Todo not found", 404);
    }
    return { message: "Todo deleted successfully" };
}

export async function updateTodoByIdService(userId: number, todoId: number, body: unknown, role: string) {
    const payload = body as {
        title?: string;
        completed?: boolean;
        description?: string;
        dueDate?: unknown;
        category?: string;
        priority?: string;
        newUserId?: number;
    };

    const title = typeof payload?.title === "string" ? payload.title.trim() : undefined;
    const completed = typeof payload?.completed === "boolean" ? payload.completed : undefined;
    const description = typeof payload?.description === "string" ? payload.description.trim() : undefined;
    const category = payload.category || undefined;
    const priority = payload.priority || undefined;
    const newUserId = typeof payload?.newUserId === "number" ? payload.newUserId : undefined;

    let dueDate: Date | null | undefined = undefined;
    if (Object.prototype.hasOwnProperty.call(payload, "dueDate")) {
        dueDate = payload.dueDate === "" ? null : parseDateInput(payload.dueDate);
    }

    const whereClause = role === "ADMIN" ? { id: todoId } : { id: todoId, userId };
    const existingTodo = await prisma.todo.findFirst({
        where: whereClause,
        select: { id: true, title: true, completed: true, description: true, dueDate: true, category: true, priority: true, userId: true },
    });
    if (!existingTodo) {
        throw new ServiceError("Todo not found", 404);
    }

    const updatedTodo = await prisma.todo.update({
        where: { id: existingTodo.id },
        data: {
            title: title && title.length > 0 ? title : existingTodo.title,
            completed: completed ?? existingTodo.completed,
            description: description !== undefined ? description : existingTodo.description,
            dueDate: dueDate !== undefined ? dueDate : existingTodo.dueDate,
            category: category !== undefined ? category : existingTodo.category,
            priority: priority !== undefined ? priority : existingTodo.priority,
            userId: newUserId !== undefined ? newUserId : existingTodo.userId,
        },
        select: {
            id: true,
            title: true,
            completed: true,
            description: true,
            dueDate: true,
            category: true,
            priority: true,
            userId: true,
            ...(role === "ADMIN" && newUserId !== undefined && {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                        notifyOnAssign: true,
                    }
                }

            })
        }
    });


    const isReassigned = role === "ADMIN" && newUserId && newUserId !== existingTodo.userId && newUserId !== userId;

    if (isReassigned && updatedTodo.user) {
        // Run side effects in background so user doesn't wait for SMTP server
        (async () => {
            try {
                if (updatedTodo.user?.notifyOnAssign) {
                    await createNotificationService(newUserId, userId, updatedTodo.id, updatedTodo.title);
                }

                await sendEmail({
                    template: "taskAssigned",
                    to: updatedTodo.user?.email,
                    subject: "New Task Assigned",
                    userName: updatedTodo.user?.name,
                    taskTitle: updatedTodo.title,
                    dueDate: updatedTodo.dueDate ? formatDateLocale(updatedTodo.dueDate.toString()) : null,
                    taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/todo`,
                    actorName: (await prisma.user.findUnique({ where: { id: userId }, select: { name: true } }))?.name || "System",
                });
            } catch (error) {
                console.error("Post-update side effects failed:", error);
            }
        })();
    }


    return {
        message: "Todo updated successfully",
        data: updatedTodo,
    };
}

export async function clearCompletedTodosService(userId: number, role: string) {
    const whereClause = role === "ADMIN" ? { completed: true } : { userId, completed: true };
    const deleted = await prisma.todo.deleteMany({ where: whereClause });
    return { message: `Deleted ${deleted.count} completed todos` };
}

export function parseTodoId(id: string): number {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new ServiceError("Invalid id", 400);
    }
    return parsed;
}

export async function updateManyTodoService(userId: number, todoIds: unknown, completed: unknown, role: string) {
    if (!Array.isArray(todoIds)) {
        throw new ServiceError("Expected an array of todo ids", 400);
    }

    if (typeof completed !== "boolean") {
        throw new ServiceError("completed must be a boolean", 400);
    }

    const idsToUpdate = [...new Set(todoIds.map((id) => parseTodoId(String(id))))];

    if (idsToUpdate.length === 0) {
        return { message: "Todos updated successfully" };
    }

    await prisma.$transaction(async (tx) => {
        const whereClause = role === "ADMIN" ? { id: { in: idsToUpdate } } : { userId, id: { in: idsToUpdate } };
        const existing = await tx.todo.findMany({
            where: whereClause,
            select: { id: true },
        });

        if (existing.length !== idsToUpdate.length) {
            const existingIds = new Set(existing.map((t) => t.id));
            const missingIds = idsToUpdate.filter((id) => !existingIds.has(id));
            throw new ServiceError(`Todo with id ${missingIds.join(", ")} not found`, 404);
        }

        await tx.todo.updateMany({
            where: whereClause,
            data: { completed },
        });
    });

    return { message: "Todos updated successfully" };
}
