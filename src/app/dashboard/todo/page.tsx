import { Suspense } from "react"
import { cookies } from "next/headers"
import { TodoClient } from "./TodoClient"
import { TodoSkeleton } from "./TodoSkeleton"

async function getTodos(searchParams: {
    q?: string
    category?: "all" | "active" | "completed"
}) {
    try {
        const params = new URLSearchParams()
        if (searchParams.q) params.set("q", searchParams.q)
        if (searchParams.category && searchParams.category !== "all") {
            params.set("category", searchParams.category)
        }

        const q = params.toString()
        const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/todo${q ? `?${q}` : ""}`

        const cookieStore = await cookies()
        const cookieString = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ")

        const response = await fetch(url, {
            headers: {
                Cookie: cookieString,
            },
            cache: "no-store", // Always fresh data
        })

        if (!response.ok) {
            throw new Error("Failed to fetch todos")
        }

        return response.json()
    } catch (error) {
        console.error("Error fetching todos:", error)
        return { data: [], total: 0, completed: 0, active: 0, totalPages: 1 }
    }
}

export default async function TodoPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string
        category?: "all" | "active" | "completed"
    }>
}) {
    // Await searchParams before using it
    const resolvedSearchParams = await searchParams
    const initialData = await getTodos(resolvedSearchParams)

    return (
        <Suspense fallback={<TodoSkeleton />}>
            <TodoClient
                initialData={initialData}
                initialFilter={(resolvedSearchParams.category as "all" | "active" | "completed") || "all"}
            />
        </Suspense>
    )
}
