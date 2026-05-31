"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { changePasswordSchema } from "@/validations/authscehma";
import z from "zod";

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

type ChangePasswordDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<ChangePasswordFormValues>;
    onSubmit: (data: ChangePasswordFormValues) => Promise<void>;
    isLoading: boolean;
};

export function ChangePasswordDialog({
    open,
    onOpenChange,
    form,
    onSubmit,
    isLoading,
}: ChangePasswordDialogProps) {
    const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            form.reset();
            setIsOldPasswordVisible(false);
            setIsNewPasswordVisible(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="mt-3">
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25 md:max-w-lg">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Controller
                            name="oldPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="relative">
                                    <FieldLabel htmlFor="old-password">Old Password<span className="text-red-500">*</span></FieldLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <LockIcon className="h-4 w-4" />
                                        </span>
                                        <Input
                                            {...field}
                                            id="old-password"
                                            type={isOldPasswordVisible ? "text" : "password"}
                                            placeholder="Enter your current password"
                                            aria-invalid={fieldState.invalid}
                                            className="h-10 pr-10 pl-10"
                                        />
                                        <span className="absolute right-2 top-1 ms-6">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
                                                type="button"
                                                className="active:bg-transparent hover:bg-transparent"
                                            >
                                                {isOldPasswordVisible ? (
                                                    <EyeIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeOffIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </span>
                                    </div>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="newPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="relative">
                                    <FieldLabel htmlFor="new-password">New Password<span className="text-red-500">*</span></FieldLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <LockIcon className="h-4 w-4" />
                                        </span>
                                        <Input
                                            {...field}
                                            id="new-password"
                                            type={isNewPasswordVisible ? "text" : "password"}
                                            placeholder="Enter your new password"
                                            aria-invalid={fieldState.invalid}
                                            className="h-10 pr-10 pl-10"
                                        />
                                        <span className="absolute right-2 top-1 ms-6">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                                                type="button"
                                                className="active:bg-transparent hover:bg-transparent"
                                            >
                                                {isNewPasswordVisible ? (
                                                    <EyeIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeOffIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </span>
                                    </div>
                                    <FieldError errors={[fieldState.error]} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        8-16 characters with uppercase, lowercase & symbol
                                    </p>
                                </Field>
                            )}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Changing..." : "Change Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}