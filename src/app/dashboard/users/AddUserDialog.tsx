"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { addUserSchema } from "@/validations/authscehma";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, LockIcon, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
    const router = useRouter();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isCnfPasswordVisible, setIsCnfPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AddUserFormValues>({
        resolver: zodResolver(addUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "USER",
        },
    });

    const { handleSubmit } = form;

    useEffect(() => {
        if (!open) {
            form.reset();
            setIsPasswordVisible(false);
            setIsCnfPasswordVisible(false);
        }
    }, [open, form]);

    async function onSubmit(data: AddUserFormValues) {
        setIsSubmitting(true);
        try {
            const response = await api.post("/dashboard/users", data);
            if (response.status === 201) {
                toast.success("User added successfully!");
                form.reset();
                onOpenChange(false);
            }
        } catch (error) {
            let errorMessage = "Failed to add user. Please try again.";
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string } } };
                errorMessage = axiosError.response?.data?.error || errorMessage;
            }
            toast.error(errorMessage);
            console.error("Add user error:", error);
        } finally {
            router.refresh();
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>Create new user</DialogTitle>
                    <DialogDescription>
                        Create a new user account. Fill in all the required fields.
                    </DialogDescription>
                </DialogHeader>
                <form id="add-user-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FieldGroup className="gap-4">
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="name">Name<span className="text-red-500">*</span></FieldLabel>
                                    <Input
                                        {...field}
                                        id="name"
                                        type="text"
                                        placeholder="Enter full name"
                                        autoComplete="off"
                                        aria-invalid={fieldState.invalid}
                                        className="h-10"
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">Email<span className="text-red-500">*</span></FieldLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Mail className="h-4 w-4 mt-1" />
                                        </span>
                                        <Input
                                            {...field}
                                            id="email"
                                            type="email"
                                            placeholder="Enter email"
                                            autoComplete="off"
                                            aria-invalid={fieldState.invalid}
                                            className="h-10 pl-10 pr-5"
                                        />
                                    </div>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="role"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="role">Role</FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full h-10">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">user</SelectItem>
                                            <SelectItem value="ADMIN">admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="relative">
                                    <FieldLabel htmlFor="password">Password<span className="text-red-500">*</span></FieldLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <LockIcon className="h-4 w-4" />
                                        </span>
                                        <Input
                                            {...field}
                                            id="password"
                                            type={isPasswordVisible ? "text" : "password"}
                                            placeholder="Enter password"
                                            aria-invalid={fieldState.invalid}
                                            className="h-10 pr-10 pl-10"
                                        />
                                        <span className="absolute right-1.5 top-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                                type="button"
                                                className="active:bg-transparent hover:bg-transparent"
                                            >
                                                {isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
                                            </Button>
                                        </span>
                                    </div>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="relative">
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirm Password<span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <LockIcon className="h-4 w-4" />
                                        </span>
                                        <Input
                                            {...field}
                                            id="confirmPassword"
                                            type={isCnfPasswordVisible ? "text" : "password"}
                                            placeholder="Confirm password"
                                            aria-invalid={fieldState.invalid}
                                            className="h-10 pr-10 pl-10"
                                        />
                                        <span className="absolute right-1.5 top-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsCnfPasswordVisible(!isCnfPasswordVisible)}
                                                type="button"
                                                className="active:bg-transparent hover:bg-transparent"
                                            >
                                                {isCnfPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
                                            </Button>
                                        </span>
                                    </div>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.reset();
                                onOpenChange(false);
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AddUserDialog;
