import { getUserIdFromHeader, getUserRoleFromHeader } from "@/lib/utils";
import { getDashboardStatsService } from "@/services/dashboard.service";
import { NextRequest } from "next/server";

export async function getDashbaordStatsController(req: NextRequest) {
    try {
        const userId = getUserIdFromHeader(req);
        const userRole = getUserRoleFromHeader(req);
        const stats = await getDashboardStatsService(userId, userRole);
        return new Response(JSON.stringify(stats), { status: 200 });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch dashboard stats" }), { status: 500 });
    }
}