import { getUserIdFromHeader } from "@/lib/utils";
import { generateDescriptionForTodo } from "@/services/chat.service";
import { NextRequest } from "next/server";


export async function getDescrptionGenrationController(req: NextRequest) {
    try {
        const userId = getUserIdFromHeader(req);
        const body = await req.json();
        const data = await generateDescriptionForTodo(userId, body?.title);
        return Response.json({ description: data.output?.[0]?.content }, { status: 200 });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return new Response(JSON.stringify({ message: "Failed to generate description" }), { status: 500 });
    }

}

