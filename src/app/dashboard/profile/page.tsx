"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BriefcaseBusiness, KeyRound, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, updateNameSchema } from "@/validations/authscehma";
import z from "zod";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/lib/utils";
import { ProfileHeader } from "./ProfileHeader";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

type ProfileUser = {
    name: string;
    email: string;
    role: string;
    isActive?: boolean;
};

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
type UpdateNameFormValues = z.infer<typeof updateNameSchema>;

const detailCards = [
    { key: "name", label: "Display name", icon: UserRound, editable: true },
    { key: "email", label: "Email address", icon: Mail, editable: false },
    { key: "role", label: "Role", icon: BriefcaseBusiness, editable: false },
] as const;

function getInitials(name: string) {
    if (!name?.trim()) return "";
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export default function Profile() {
    const [user, setUser] = useState<ProfileUser | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const nameForm = useForm<UpdateNameFormValues>({
        resolver: zodResolver(updateNameSchema),
        defaultValues: { name: "" },
    });

    const passwordForm = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { oldPassword: "", newPassword: "" },
    });

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) return;

        try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            nameForm.reset({ name: parsedUser.name || "" });
        } catch {
            setUser(null);
        }
    }, [nameForm]);

    const name = user?.name || "";
    const email = user?.email || "";
    const role = user?.role === "ADMIN" ? "Admin" : "User";
    const isActive = user?.isActive ?? true;
    const initials = getInitials(name || "");

    const handleNameSave = async (data: UpdateNameFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.patch("/dashboard/users/profile", { name: data.name });
            if (response.status !== 200) throw new Error("Failed to update name");

            const updatedUser = { ...user!, name: data.name };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setEditingName(false);
            router.refresh();
            toast.success("Display name updated successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update name");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (data: ChangePasswordFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.patch("/dashboard/users/change-password", {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            if (response.status !== 200) throw new Error("Failed to change password");

            toast.success("Password changed successfully");
            setPasswordDialogOpen(false);
            passwordForm.reset();
            setTimeout(() => handleLogout(router), 2000);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to change password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="w-full ps-2">
            <ProfileHeader name={name} email={email} role={user?.role || ""} isActive={isActive} initials={initials} />

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                {/* Account Information Card */}
                <Card className="rounded-3xl shadow-sm">
                    <CardContent className="ps-3 md:ps-5">
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold text-neutral-900">Account Information</h2>
                            <p className="mt-1 text-sm text-neutral-600">
                                Core profile details shown in a clean format.
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {detailCards.map((item) => {
                                const Icon = item.icon;
                                const value = item.key === "name" ? name : item.key === "email" ? email : role;
                                const isEditing = item.key === "name" && editingName;

                                return (
                                    <div
                                        key={item.key}
                                        className="flex items-center gap-4 rounded-2xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
                                            <Icon className="h-5 w-5 text-neutral-700" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-neutral-500">{item.label}</p>
                                            {isEditing ? (
                                                <form onSubmit={nameForm.handleSubmit(handleNameSave)} className="mt-1">
                                                    <Controller
                                                        name="name"
                                                        control={nameForm.control}
                                                        render={({ field, fieldState }) => (
                                                            <Field>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1">
                                                                        <Input
                                                                            {...field}
                                                                            className="h-8"
                                                                            placeholder="Enter new name"
                                                                            aria-invalid={fieldState.invalid}
                                                                        />
                                                                        <FieldError errors={[fieldState.error]} />
                                                                    </div>
                                                                    <Button type="submit" size="sm" disabled={isLoading} className="h-8">
                                                                        Save
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            nameForm.reset({ name: user?.name || "" });
                                                                            setEditingName(false);
                                                                        }}
                                                                        disabled={isLoading}
                                                                        className="h-8"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </Field>
                                                        )}
                                                    />
                                                </form>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <p className="truncate text-base font-medium text-neutral-900">{value}</p>
                                                    {item.editable && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setEditingName(true)}
                                                            className="h-8 text-xs"
                                                        >
                                                            Edit
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="rounded-3xl shadow-sm">
                    <CardContent className="ps-3 md:ps-5">
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold text-neutral-900">Security</h2>
                            <p className="mt-1 text-sm text-neutral-600">
                                Manage your password and security settings.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-2xl border bg-muted/30 p-4">
                                <div className="flex items-start gap-4">
                                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
                                        <KeyRound className="h-5 w-5 text-neutral-700" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-neutral-500">Password</p>
                                        <p className="text-base font-medium text-neutral-900">••••••••</p>
                                        <ChangePasswordDialog
                                            open={passwordDialogOpen}
                                            onOpenChange={setPasswordDialogOpen}
                                            form={passwordForm}
                                            onSubmit={handlePasswordChange}
                                            isLoading={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}