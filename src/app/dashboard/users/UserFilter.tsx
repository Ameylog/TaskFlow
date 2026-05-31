"use client";
import { Button } from '@/components/ui/button'
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddUserDialog from './AddUserDialog';
import { BadgeCheck, CircleOff, Plus, Users } from 'lucide-react';

function UserFilter({ currentFilter, total, active, inactive }: { currentFilter: string, total: number, active: number, inactive: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onFilterChange = (newFilter: "all" | "active" | "inactive") => {
        const params = new URLSearchParams(searchParams.toString());
        if (newFilter === "all") {
            params.delete("filter");
        } else {
            params.set("filter", newFilter);
        }
        router.push(`/dashboard/users?${params.toString()}`);
    };

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant={currentFilter === "all" ? "default" : "outline"}
                        onClick={() => onFilterChange("all")}
                        className="rounded-full"
                    >
                        <Users className="h-4 w-4" />
                        All ({total})
                    </Button>
                    <Button
                        size="sm"
                        variant={currentFilter === "active" ? "default" : "outline"}
                        onClick={() => onFilterChange("active")}
                        className="rounded-full"
                    >
                        <BadgeCheck className="h-4 w-4" />
                        Active ({active})
                    </Button>
                    <Button
                        size="sm"
                        variant={currentFilter === "inactive" ? "default" : "outline"}
                        onClick={() => onFilterChange("inactive")}
                        className="rounded-full"
                    >
                        <CircleOff className="h-4 w-4" />
                        Inactive ({inactive})
                    </Button>
                </div>
                <div className="flex items-center justify-end">
                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm mr-4">
                        {total} total members
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)} size="sm" className="rounded-full px-4">
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                </div>
            </div>
            <AddUserDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    )
}

export default UserFilter
