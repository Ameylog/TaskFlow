import { handleControllerError } from "@/lib/errorHandling";
import { forgotPasswordService, loginService, registerService, resetPasswordService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

export async function loginController(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await loginService(body);

        if (!result) {
            return NextResponse.json(
                { error: "Login failed" },
                { status: 401 }
            );
        }

        const { token, user } = result;
        const res = NextResponse.json(
            { user },
            { status: 200 }
        );

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: Number(process.env.JWT_EXPIRES_IN) * 60, // seconds
        });
        return res;
    }
    catch (error) {1
        return handleControllerError(error, "Failed to login");
    }
};

export async function registerController(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await registerService(body);
        return NextResponse.json(result, { status: 201 });
    }
    catch (error) {
        return handleControllerError(error, "Failed to register");
    }
};

export async function forgotPasswordController(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await forgotPasswordService(body);
        return NextResponse.json(result, { status: 200 });
    }
    catch (error) {
        return handleControllerError(error, "Failed to process forgot password request");
    }
};

export async function logoutController() {
    try {
        const res = NextResponse.json(
            { message: "Logout successful" },
            { status: 200 }
        );

        res.cookies.delete("token");
        return res;
    }
    catch (error) {
        return handleControllerError(error, "Failed to logout");
    }
};


export async function resetPasswordController(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await resetPasswordService(body);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleControllerError(error, "Failed to reset password");
    }
}


