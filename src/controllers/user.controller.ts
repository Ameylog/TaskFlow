import { handleControllerError } from "@/lib/errorHandling";
import { getUserIdFromHeader, getUserRoleFromHeader } from "@/lib/utils";
import { addUserService, changeUserPasswordService, deleteUserService, getUserService, updateUserProfileDetailsService, updateUserStatusService } from "@/services/user.service";
import { changePasswordSchema } from "@/validations/authscehma";
import { NextRequest, NextResponse } from "next/server";

export async function updateUserStatusController(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userRole, targetUserId, isActive } = body;
        const result = await updateUserStatusService(userId, userRole, targetUserId, isActive);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Failed to update user status");
    }
};

export async function deleteUserController(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userRole, targetUserId } = body;
        const result = await deleteUserService(userId, userRole, targetUserId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Failed to delete user");
    }
};

export async function addUserController(request: NextRequest) {
    try {
        const userRole = getUserRoleFromHeader(request);
        const body = await request.json();
        const result = await addUserService(body, userRole);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return handleControllerError(error, "Failed to add user");
    }
};

export async function getUserController(request: NextRequest) {
    try {
        const userId = getUserIdFromHeader(request);
        const userRole = getUserRoleFromHeader(request);

        // Get filter from search params
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") || "all";
        const page = Number(searchParams.get("page") || 1);

        const users = await getUserService(userId, userRole, filter, page);
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Failed to fetch users");
    }
};

export async function updateUserProfileDetailsController(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, notifyOnAssign } = body;
        const userId = getUserIdFromHeader(request);
        const result = await updateUserProfileDetailsService(userId, name, notifyOnAssign);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Failed to update user profile details");
    }
};

export async function changeUserPasswordController(request: NextRequest) {
    try {
        const body = await request.json();
        const userId = getUserIdFromHeader(request);
        // Validate the request body with Zod schema
        const validatedData = changePasswordSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                {
                    message: "Invalid request data",
                    errors: validatedData.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }
        const { oldPassword, newPassword } = validatedData.data;
        const result = await changeUserPasswordService(userId, oldPassword, newPassword);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Failed to change password");
    }
};

// assignee dropdown list for task details page
export async function getUserListController(request: NextRequest) {
    try {
        const userRole = getUserRoleFromHeader(request);
        // Get filter from search params
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") || "all";
        const page = null;  // don't paginate this endpoint as it's only used for dropdown list with limited users
        const users = await getUserService(null, userRole, filter, page);
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Failed to fetch users");
    }
};
