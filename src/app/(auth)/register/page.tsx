"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { registerSchema } from "@/validations/authscehma";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import loginBg from "../../../../public/BgImage.png"
import Loader from "@/components/Loader";

type RegisterFormValues = z.infer<typeof registerSchema>

function Register() {
    const router = useRouter();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isCnfPasswordVisible, setIsCnfPasswordVisible] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const { handleSubmit } = form

    async function onSubmit(data: RegisterFormValues) {
        try {
            const response = await api.post("/auth/register", data);
            if (response.status !== 201) {
                throw new Error("Registration failed");
            }
            toast("Registration successful", {
                position: "top-right",
                classNames: {
                    content: "flex flex-col gap-2",
                },

            });
            form.reset();
            router.push("/login");
        } catch (error) {
            toast.error("Registration failed. Please check your credentials and try again.");
            console.log(error);
        }

    }

    return (
        <Suspense fallback={<Loader />}>
            <main className="w-screen h-screen flex">
                {/* Left Side - Image */}
                <div className="hidden lg:block lg:w-1/2 relative">
                    <Image
                        src={loginBg}
                        alt="Login background"
                        fill
                        className="object-cover"
                        priority
                        sizes="100vh,50vw"
                    />
                </div>
                {/* Right Side - Register Form */}
                <div className="w-full lg:w-1/2 bg-muted/30 px-4 py-8 flex items-center justify-center">
                    <Card className="w-full max-w-md shadow-lg">
                        <CardHeader className="space-y-2 text-center">
                            <CardTitle className="text-2xl">Register</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form id="form-rhf-demo" onSubmit={handleSubmit(onSubmit)} noValidate>
                                <FieldGroup className="gap-5">
                                    <Controller
                                        name="name"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="name">
                                                    Name
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter your name"
                                                    autoComplete="false"
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
                                                <FieldLabel htmlFor="email">
                                                    Email
                                                </FieldLabel>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        <MailIcon className="h-4 w-4 mt-1" />
                                                    </span>
                                                    <Input
                                                        {...field}
                                                        id="email"
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        autoComplete="email"
                                                        aria-invalid={fieldState.invalid}
                                                        className="h-10 pl-10"
                                                    />
                                                </div>
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="password"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid} className="relative">
                                                <FieldLabel htmlFor="password">
                                                    Password
                                                </FieldLabel>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        <LockIcon className="h-4 w-4" />
                                                    </span>
                                                    <Input
                                                        {...field}
                                                        id="password"
                                                        type={isPasswordVisible ? "text" : "password"}
                                                        placeholder="Enter your password"
                                                        aria-invalid={fieldState.invalid}
                                                        className="h-10 pr-10 pl-10"
                                                    />
                                                    <span className="absolute right-2 top-1">
                                                        {
                                                            isPasswordVisible ? (
                                                                <Button variant="ghost" size="icon" onClick={() => setIsPasswordVisible(false)} type="button" className="active:bg-transparent hover:bg-transparent">
                                                                    <EyeIcon />
                                                                </Button>
                                                            ) : (
                                                                <Button variant="ghost" size="icon" onClick={() => setIsPasswordVisible(true)} type="button" className="active:bg-transparent hover:bg-transparent">
                                                                    <EyeOffIcon />
                                                                </Button>
                                                            )
                                                        }
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
                                                    Confirm Password
                                                </FieldLabel>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        <LockIcon className="h-4 w-4" />
                                                    </span>
                                                    <Input
                                                        {...field}
                                                        id="confirmPassword"
                                                        type={isCnfPasswordVisible ? "text" : "password"}
                                                        placeholder="Enter your confirm password"
                                                        aria-invalid={fieldState.invalid}
                                                        className="h-10 pr-10 pl-10"
                                                    />
                                                    <span className="absolute right-2 top-1 ">
                                                        {
                                                            isCnfPasswordVisible ? (
                                                                <Button variant="ghost" size="icon" onClick={() => setIsCnfPasswordVisible(false)} type="button" className="active:bg-transparent hover:bg-transparent">
                                                                    <EyeIcon />
                                                                </Button>
                                                            ) : (
                                                                <Button variant="ghost" size="icon" onClick={() => setIsCnfPasswordVisible(true)} type="button" className="active:bg-transparent hover:bg-transparent">
                                                                    <EyeOffIcon />
                                                                </Button>
                                                            )
                                                        }
                                                    </span>
                                                </div>
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>
                            </form>
                        </CardContent>
                        <CardFooter className="w-full">
                            <Button type="submit" form="form-rhf-demo" size={"lg"} className="w-full">
                                Submit
                            </Button>
                        </CardFooter>
                        <div className="text-center">
                            <span className="text-sm">Already have an account? <Link href="/login" className="text-blue-500">Login</Link>
                            </span>
                        </div>
                    </Card>
                </div>
            </main>
        </Suspense>
    )
}


export default Register;



