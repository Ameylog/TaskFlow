"use client";
import { Button } from '@/components/ui/button'
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; // Add this import
import DeleteDialog from '@/components/DeleteDialog';
import { Ban, CircleCheckBig } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function UserAction({ user, userId, userRole }: { user: { id: number; isActive: boolean; name: string }, userId: number, userRole: string }) {
    const router = useRouter(); // Add this hook

    const handleDevactivate = async (targetUserId: number, isActive: boolean) => {
        try {
            const newStatus = !isActive;
            const payload = { userId, userRole, targetUserId, isActive: newStatus };
            const response = await api.patch("/dashboard/users", payload);
            if (response.status === 200) {
                toast.success(`User has been ${newStatus ? "activated" : "deactivated"} successfully.`);
                router.refresh(); // ✅ Refresh server component data
            }
        }
        catch (error) {
            console.error("Failed to update user status:", error);
            toast.error("Failed to update user status.");
        }
    };

    const handleDelete = async (targetUserId: number) => {
        try {
            const payload = { userId, userRole, targetUserId };
            const response = await api.delete("/dashboard/users", { data: payload });
            if (response.status === 200) {
                toast.success("User has been deleted successfully.");
                router.refresh(); // ✅ Refresh server component data
            }
        }
        catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Failed to delete user.");
        }
    };


    return (
        <div className="flex items-center space-x-2 ms-6">
            {/* Active/inactive user */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm"
                        onClick={() => handleDevactivate(user?.id, user?.isActive)}
                        className='cursor-pointer rounded-full hover:bg-transparent'
                    >
                        {user.isActive ? (
                            <Ban className='size-4.5 text-red-600' />
                        ) : (
                            <CircleCheckBig className='size-4.5 text-green-600' />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {user.isActive ? "Deactivate User" : "Activate User"}
                </TooltipContent>
            </Tooltip>

            {/* delete the user */}
            <DeleteDialog
                buttonLabel="Delete User"
                dialogTitle="Delete this user?"
                dialogDescription={`This will remove "${user.name}" forever from your user list.`}
                onDelete={() => handleDelete(user.id)}
            />
        </div>
    )
}

export default UserAction
