import { prisma } from "@/lib/db";
import { filterTodosByKolkataDate, toYmdInKolkata } from "@/lib/formatDate";

type Todo = {
    description: string
    priority: string
    category: string
    id: number;
    title: string;
    dueDate?: Date | string | null;
    completed: boolean;
    userId: number,
};


export async function getDashboardStatsService(userId: number, userRole: string) {
    const WHERE = userRole === "ADMIN" ? {} : { userId };

    let totalUsers = 0;
    if (userRole === "ADMIN") {
        totalUsers = await prisma.user.count();
    }

    const totalTodos = await prisma.todo.count({ where: WHERE });

    const allTodos = await prisma.todo.findMany({
        where: WHERE,
        select: {
            id: true,
            title: true,
            dueDate: true,
            completed: true,
            description: true,
            priority: true,
            category: true,
            userId: true,
        },
    });
    const filtered = filterTodosByKolkataDate(allTodos as Todo[]);

    const completedTodos = await prisma.todo.count({
        where: {
            ...WHERE,
            completed: true,
        },
    });
    const pendingTodos = await prisma.todo.count({
        where: {
            ...WHERE,
            completed: false,
        },
    });

    const todayKolkata = toYmdInKolkata(new Date()); // "2026-03-13"
    const todayKolkataDate = new Date(todayKolkata + "T00:00:00.000Z"); // Convert to Date object


    const overDueTodos = await prisma.todo.count({
        where: {
            ...WHERE,
            dueDate: {
                lt: todayKolkataDate,
            },
            completed: false,
        },
    });


    return {
        message: "Data fetched successfully",
        total: totalTodos,
        completed: completedTodos,
        active: pendingTodos,
        overdue: overDueTodos,
        todayTodos: filtered.today,
        ...(userRole === "ADMIN" && { users: totalUsers - 1 }), // Only add for admin
    }
}