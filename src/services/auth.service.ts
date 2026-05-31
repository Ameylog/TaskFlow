import { prisma } from "@/lib/db";
import { ServiceError } from "@/lib/errorHandling";
import { generateToken } from "@/lib/jwt";
import { sendEmail } from "@/lib/mail/sendEmail";
import { forgotPasswordLink } from "@/lib/utils";
import bcrypt from "bcrypt";

export async function loginService(body: unknown) {
    const payload = body as { email?: string; password?: string }

    const email = typeof payload?.email === "string" ? payload.email.trim() : "";
    const password = typeof payload?.password === "string" ? payload.password.trim() : "";

    if (!email || !password) {
        throw new ServiceError("Email and password are required", 400)
    }

    const user = await prisma.user.findUnique({
        where: { email, isActive: true },
    });

    if (!user) {
        throw new ServiceError("Invalid email or password", 401);
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new ServiceError("Invalid email or password", 401);
    }

    const token = generateToken({ userId: user.id, role: user.role, name: user.name });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    };
}

export async function registerService(body: unknown) {
    const payload = body as { email: string; password: string; name: string; confirmPassword: string }
    const email = typeof payload?.email === "string" ? payload.email.trim() : "";
    const password = typeof payload?.password === "string" ? payload.password.trim() : "";
    const confirmPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword.trim() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";

    if (!email || !password || !name || !confirmPassword) {
        throw new ServiceError("Name, email, password and confirm password are required", 400)
    }

    if (password !== confirmPassword) {
        throw new ServiceError("Passwords don't match", 400)
    };

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new ServiceError("User with this email already exists", 409)
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
        }
    });
    return newUser;
}


export async function forgotPasswordService(body: unknown) {
    const payload = body as { email: string }
    const email = typeof payload?.email === "string" ? payload.email.trim() : "";

    if (!email) {
        throw new ServiceError("Email is required", 400)
    }

    const user = await prisma.user.findUnique({
        where: { email, isActive: true }
    });

    if (!user) {
        throw new ServiceError("User with this email does not exist", 404)
    }

    const resetToken = forgotPasswordLink();
    const hashresetToken = await bcrypt.hash(resetToken, 10);
    const updatedUser = await prisma.user.update({
        where: { email },
        data: {
            resetToken: hashresetToken,
            resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
        },
    });

    if (!updatedUser) {
        throw new ServiceError("Failed to generate reset token", 500)
    }
    const passwordResetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

    await sendEmail({
        template: "passwordReset",
        to: user.email,
        subject: "Password Reset Request",
        resetUrl: passwordResetLink
    });
    return { message: "Password reset link sent to email." }
};

export async function resetPasswordService(body: unknown) {
    const payload = body as { email: string; token: string; password: string; confirmPassword: string }
    const email = typeof payload?.email === "string" ? payload.email.trim() : "";
    const token = typeof payload?.token === "string" ? payload.token.trim() : "";
    const newPassword = typeof payload?.password === "string" ? payload.password.trim() : "";
    const confirmNewPassword = typeof payload?.confirmPassword === "string" ? payload.confirmPassword.trim() : "";

    if (!email || !token || !newPassword || !confirmNewPassword) {
        throw new ServiceError("Email, token, new password and confirm new password are required", 400)
    }
    if (newPassword !== confirmNewPassword) {
        throw new ServiceError("Password and confirm passwords don't match", 400)
    }

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
        throw new ServiceError("Invalid or expired reset token", 400)
    }

    const isTokenValid = await bcrypt.compare(token, user.resetToken);

    if (!isTokenValid || user.resetTokenExpiry < new Date()) {
        throw new ServiceError("Invalid or expired reset token", 400)
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { email },
        data: {
            password: hashedNewPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });
    return { message: "Password has been reset successfully." }
}

