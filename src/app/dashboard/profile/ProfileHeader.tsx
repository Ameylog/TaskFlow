"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

type ProfileHeaderProps = {
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    initials: string;
};

export function ProfileHeader({ name, role, isActive, initials }: ProfileHeaderProps) {
    const roleDisplay = role === "ADMIN" ? "Admin" : "User";

    return (
        <Card className="relative overflow-hidden border-0 bg-linear-to-br from-orange-50 via-white to-amber-50 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-34 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.2),transparent_45%),radial-gradient(circle_at_left,rgba(249,115,22,0.18),transparent_35%)]" />
            <CardContent className="relative p-3 md:p-4">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Avatar and Info Section */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-linear-to-br from-neutral-900 to-neutral-700 text-3xl font-semibold text-white shadow-lg">
                            {initials}
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-700/80">
                                    Profile Overview
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                                    {name}
                                </h1>
                                <p className="text-sm text-neutral-600">
                                    Your account snapshot with role and access details.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge className="rounded-full border-orange-200 bg-orange-100 px-3 py-1 text-orange-800">
                                    <ShieldCheck className="h-4 w-4" />
                                    {roleDisplay}
                                </Badge>
                                <Badge
                                    className={`rounded-full px-3 py-1 ${isActive
                                            ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                                            : "border-rose-200 bg-rose-100 text-rose-800"
                                        }`}
                                >
                                    {isActive ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    {isActive ? "Active account" : "Inactive account"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:w-92">
                        <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Access level</p>
                            <p className="mt-2 text-lg font-semibold text-neutral-900">{roleDisplay}</p>
                            <p className="mt-1 text-sm text-neutral-600">
                                {roleDisplay === "Admin"
                                    ? "Full dashboard control and user management access."
                                    : "Standard workspace access for personal tasks."}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Account state</p>
                            <p className="mt-2 text-lg font-semibold text-neutral-900">
                                {isActive ? "Enabled" : "Restricted"}
                            </p>
                            <p className="mt-1 text-sm text-neutral-600">
                                {isActive
                                    ? "This profile can log in and continue working normally."
                                    : "This profile cannot access the app until it is reactivated."}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}