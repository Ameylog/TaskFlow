import { PAGE_SIZE } from "@/lib/constant";
import { prisma } from "@/lib/db";
import { ServiceError } from "@/lib/errorHandling";
import bcrypt from "bcrypt";

export async function getUserService(userId: number | null, userRole: string, filter?: string, page?: number | null) {
    if (userRole !== "ADMIN") {
        throw new ServiceError("Unauthorized", 403);
    }

    // Build where clause based on filter when user id is null then we are fetching all users otherwise we are fetching users except the one with userId that is admin is fetching all users except itself
    const whereClause: {
        id?: { not: number };
        isActive?: boolean;
    } = {
        ...(userId !== null && { id: { not: userId } })
    };

    if (filter === "active") {
        whereClause.isActive = true;
    } else if (filter === "inactive") {
        whereClause.isActive = false;
    }
    // if filter is "all" or undefined, don't add isActive filter

    const total = await prisma.user.count({ where: whereClause });
    const active = await prisma.user.count({ where: { ...whereClause, isActive: true } });
    const inactive = await prisma.user.count({ where: { ...whereClause, isActive: false } });


    const user = await prisma.user.findMany({
        where: whereClause,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
        },
        orderBy: {
            createdAt: "desc"
        },
        ...(page ? page > 0 ? { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE } : {} : {})

    });

    const totalPage = Math.ceil(total / PAGE_SIZE);
    const paginationInfo = page ? { page, totalPages: totalPage } : null;

    return { data: user, total, active, inactive, ...paginationInfo };
}

export async function updateUserStatusService(userId: number, userRole: string, targetUserId: number, isActive: boolean) {
    if (userRole !== "ADMIN") {
        throw new ServiceError("Unauthorized", 403);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: targetUserId,
        }
    });

    if (!user) {
        throw new ServiceError("User not found", 404);
    }

    const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { isActive }
    });

    return updatedUser;
};

export async function deleteUserService(userId: number, userRole: string, targetUserId: number) {
    if (userRole !== "ADMIN") {
        throw new ServiceError("Unauthorized", 403);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: targetUserId,
        }
    });

    if (!user) throw new ServiceError("User not found", 404);

    await prisma.user.delete({
        where: { id: targetUserId }
    });
    return { message: "User deleted successfully" };
};

export async function addUserService(body: unknown, userRole: string) {
    if (userRole !== "ADMIN") {
        throw new ServiceError("Unauthorized", 403);
    }

    const payload = body as { email: string; password: string; name: string; confirmPassword: string; role?: string };
    const email = typeof payload?.email === "string" ? payload.email.trim() : "";
    const password = typeof payload?.password === "string" ? payload.password.trim() : "";
    const confirmPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword.trim() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    const role = typeof payload?.role === "string" ? payload.role : "USER";

    if (!email || !password || !name || !confirmPassword) {
        throw new ServiceError("Name, email, password and confirm password are required", 400);
    }

    if (password !== confirmPassword) {
        throw new ServiceError("Passwords don't match", 400);
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new ServiceError("User with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: role === "ADMIN" ? "ADMIN" : "USER",
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
        }
    });
    return newUser;
}


export async function updateUserProfileDetailsService(userId: number, name?: string, notifyOnAssign?: boolean) {

    if (!userId) {
        throw new ServiceError("User ID is required", 400);
    }

    // Build the data object dynamically
    const updateData: {
        name?: string;
        notifyOnAssign?: boolean;  // true to enable notifications, false to disable, undefined to keep unchanged
    } = {};

    // Only update fields that were provided
    if (name !== undefined && name?.trim()) {
        updateData.name = name.trim();
    }

    if (notifyOnAssign !== undefined) {
        updateData.notifyOnAssign = notifyOnAssign;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
        throw new ServiceError("No valid fields to update", 400);
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            notifyOnAssign: true,
        }
    });

    return updatedUser;
}

export async function changeUserPasswordService(userId: number, oldPassword: string, newPassword: string) {
    if (!oldPassword || !newPassword) {
        throw new ServiceError("Old password and new password are required", 400);
    }
    if (!userId) {
        throw new ServiceError("User ID is required", 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ServiceError("User not found", 404);
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
        throw new ServiceError("Old password is incorrect", 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });
    return { message: "Password changed successfully" };
}