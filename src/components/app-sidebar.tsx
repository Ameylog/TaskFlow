"use client"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { LayoutDashboard, ListChecks, LogOutIcon, Users, User, LucideIcon } from "lucide-react"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { handleLogout } from "@/lib/utils";

// Define menu items array
const menuItems: Array<{
    href: string;
    label: string;
    icon: LucideIcon;
    requiresAdmin?: boolean;
}> = [
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            requiresAdmin: false,
        },
        {
            href: "/dashboard/todo",
            label: "Tasks",
            icon: ListChecks,
            requiresAdmin: false,
        },
        {
            href: "/dashboard/users",
            label: "Users",
            icon: Users,
            requiresAdmin: true,
        },
        {
            href: "/dashboard/profile",
            label: "Profile",
            icon: User,
            requiresAdmin: false,
        },
    ];

export function AppSidebar({ user }: { user: { role: string } | null }) {
    const router = useRouter();
    const pathname = usePathname()

    // Filter menu items based on user role
    const visibleMenuItems = menuItems.filter(item => {
        if (item.requiresAdmin) {
            return user?.role === "ADMIN";
        }
        return true;
    });

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="rounded-md bg-sidebar-accent p-3">
                    {/* <p className="text-xs text-sidebar-foreground/70">Workspace</p> */}
                    <p className="text-sm font-semibold">Task Mangement Application</p>
                </div>
            </SidebarHeader>
            <SidebarSeparator className="w-[97%]!" />
            <SidebarContent className="ps-1">
                <SidebarGroup>
                    <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleMenuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href}
                                        >
                                            <Link href={item.href}>
                                                <Icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>
            <SidebarSeparator className="w-[97%]!" />
            <SidebarFooter>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => handleLogout(router)}>
                        <LogOutIcon />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
        </Sidebar>
    )
}
