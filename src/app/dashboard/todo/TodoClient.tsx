"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { List, type RowComponentProps } from "react-window"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useRouter, useSearchParams } from "next/navigation"
import { TodoFilters } from "./TodoFilters"
import { TodoItem } from "./TodoItem"
import { TodoFormDialog } from "./TodoFormDialog"
import { CheckCheck, Loader2, TimerReset, Trash2 } from "lucide-react"
import { TodoCalendarView } from "./TodoCalendarView"

const ITEM_SIZE = 76

type TodoRowProps = {
    todos: Todo[]
    isLoadingMore: boolean
    onToggle: (id: number, checked: boolean) => void
    onEdit: (todo: Todo) => void
    onDelete: (id: number) => void
    user: { id: number; name: string; email: string; role: string } | null
}

function TodoRow({ index, style, todos, isLoadingMore, onToggle, onEdit, onDelete, user }: RowComponentProps<TodoRowProps>) {
    if (index === todos.length) {
        return (
            <div style={style}>
                <div className="flex items-center justify-center py-4">
                    {isLoadingMore && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
            </div>
        )
    }
    const todo = todos[index]
    return (
        <div style={style}>
            <div style={{ paddingBottom: 12 }}>
                <TodoItem
                    todo={todo}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    user={user}
                />
            </div>
        </div>
    )
}

export type Todo = {
    id: number
    title: string
    completed: boolean
    description: string
    category: string
    isActive: boolean
    priority: string
    dueDate: string | null
    user?: {
        id: number
        name: string
        email: string
        role: string
    }
}

type Filter = "all" | "active" | "completed"
type ViewMode = "list" | "calendar"

type TodoClientProps = {
    initialData: {
        data: Todo[]
        total: number
        completed: number
        active: number
        totalPages: number
    }
    initialFilter: Filter
}

export function TodoClient({ initialData, initialFilter }: TodoClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [todos, setTodos] = useState<Todo[]>(initialData.data)
    const [count, setCount] = useState({
        total: initialData.total,
        completed: initialData.completed,
        active: initialData.active,
    })
    const [filter, setFilter] = useState<Filter>(initialFilter)
    const [viewMode, setViewMode] = useState<ViewMode>("list")
    const [initialCompletedIds, setInitialCompletedIds] = useState<Set<number>>(() => {
        return new Set(initialData.data.filter((t) => t.completed).map((t) => t.id))
    })
    const [toCompleteIds, setToCompleteIds] = useState<Set<number>>(new Set())
    const [toUncompleteIds, setToUncompleteIds] = useState<Set<number>>(new Set())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
    const [prefilledDueDate, setPrefilledDueDate] = useState<string | null>(null)
    const [user, setUser] = useState<{ id: number, name: string, email: string, role: string } | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(initialData.totalPages ?? 1)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [calendarTodos, setCalendarTodos] = useState<Todo[]>([])
    const [isCalendarLoading, setIsCalendarLoading] = useState(false)
    const isLoadingMoreRef = useRef(false)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        setUser(storedUser ? JSON.parse(storedUser) : null)
    }, [])

    useEffect(() => {
        const searchQuery = searchParams?.get("q") || ""
        const fetchSearchResults = async () => {
            try {
                const params = new URLSearchParams()
                if (searchQuery) params.set("q", searchQuery)
                if (filter !== "all") params.set("category", filter)
                params.set("page", "1")

                const queryString = params.toString()
                const url = `/todo${queryString ? `?${queryString}` : ""}`

                const response = await api.get(url)
                const { data, total, completed, active, totalPages: tp } = response.data
                setTodos(data)
                setCount({ total, completed, active })
                setPage(1)
                setTotalPages(tp ?? 1)

                const completedSet = new Set<number>(data.filter((t: Todo) => t.completed).map((t: Todo) => t.id))
                setInitialCompletedIds(completedSet)
                setToCompleteIds(new Set())
                setToUncompleteIds(new Set())
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to search todos")
            }
        }

        fetchSearchResults()
    }, [searchParams, filter])

    useEffect(() => {
        if (viewMode !== "calendar") return

        const searchQuery = searchParams?.get("q") || ""

        const fetchCalendarTodos = async () => {
            setIsCalendarLoading(true)
            try {
                const params = new URLSearchParams()
                if (searchQuery) params.set("q", searchQuery)
                if (filter !== "all") params.set("category", filter)
                params.set("view", "calendar")

                const queryString = params.toString()
                const url = `/todo${queryString ? `?${queryString}` : ""}`
                const response = await api.get(url)
                setCalendarTodos(response.data.data ?? [])
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to load calendar todos")
            } finally {
                setIsCalendarLoading(false)
            }
        }

        void fetchCalendarTodos()
    }, [viewMode, searchParams, filter])

    const refreshTodos = async () => {
        try {
            const params = new URLSearchParams()
            const searchQuery = searchParams?.get("q") || ""
            if (searchQuery) params.set("q", searchQuery)
            if (filter !== "all") params.set("category", filter)
            params.set("page", "1")

            const response = await api.get(`/todo?${params.toString()}`)
            const { data, total, completed, active, totalPages: tp } = response.data
            setTodos(data)
            setCount({ total, completed, active })
            setPage(1)
            setTotalPages(tp ?? 1)

            const completedSet = new Set<number>(data.filter((t: Todo) => t.completed).map((t: Todo) => t.id))
            setInitialCompletedIds(completedSet)
            setToCompleteIds(new Set())
            setToUncompleteIds(new Set())

            if (viewMode === "calendar") {
                const calendarParams = new URLSearchParams(params)
                calendarParams.delete("page")
                calendarParams.set("view", "calendar")
                const calendarResponse = await api.get(`/todo?${calendarParams.toString()}`)
                setCalendarTodos(calendarResponse.data.data ?? [])
            }

            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch todos")
        }
    }

    const loadMoreTodos = useCallback(async () => {
        if (isLoadingMoreRef.current || page >= totalPages) return
        isLoadingMoreRef.current = true
        setIsLoadingMore(true)
        try {
            const nextPage = page + 1
            const params = new URLSearchParams()
            const searchQuery = searchParams?.get("q") || ""
            if (searchQuery) params.set("q", searchQuery)
            if (filter !== "all") params.set("category", filter)
            params.set("page", String(nextPage))

            const queryString = params.toString()
            const url = `/todo${queryString ? `?${queryString}` : ""}`

            const response = await api.get(url)
            const { data, totalPages: tp } = response.data

            setTodos((prev) => [...prev, ...data])
            setPage(nextPage)
            setTotalPages(tp ?? 1)

            const newCompletedIds = new Set(initialCompletedIds)
            data.filter((t: Todo) => t.completed).forEach((t: Todo) => newCompletedIds.add(t.id))
            setInitialCompletedIds(newCompletedIds)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load more todos")
        } finally {
            isLoadingMoreRef.current = false
            setIsLoadingMore(false)
        }
    }, [page, totalPages, searchParams, filter, initialCompletedIds])

    const handleFilterChange = async (newFilter: Filter) => {
        setFilter(newFilter)
    }

    const toggleTodo = (id: number, checked: boolean) => {
        if (checked && toUncompleteIds.size > 0) {
            toast.error("Apply 'Mark as Uncompleted' first")
            return
        }
        if (!checked && toCompleteIds.size > 0) {
            toast.error("Apply 'Mark as Completed' first")
            return
        }

        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: checked } : t)))
        setCalendarTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: checked } : t)))
        const wasInitiallyCompleted = initialCompletedIds.has(id)

        setToCompleteIds((prev) => {
            const next = new Set(prev)
            if (checked && !wasInitiallyCompleted) next.add(id)
            else next.delete(id)
            return next
        })

        setToUncompleteIds((prev) => {
            const next = new Set(prev)
            if (!checked && wasInitiallyCompleted) next.add(id)
            else next.delete(id)
            return next
        })
    }

    const markAsCompleted = async () => {
        const ids = Array.from(toCompleteIds)
        if (ids.length === 0) return

        try {
            const response = await api.patch("/todo", { todoIds: ids, completed: true })
            if (response.status !== 200) {
                throw new Error("Failed to update todo")
            }
            toast.success("Todo updated successfully")
            await refreshTodos()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update todo")
        }
    }

    const markAsUncompleted = async () => {
        const ids = Array.from(toUncompleteIds)
        if (ids.length === 0) return
        try {
            const response = await api.patch("/todo", { todoIds: ids, completed: false })
            if (response.status !== 200) {
                throw new Error("Failed to update todo")
            }
            toast.success("Todo updated successfully")
            await refreshTodos()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update todo")
        }
    }

    const deleteTodo = async (id: number) => {
        try {
            const response = await api.delete(`/todo/${id}`)
            if (response.status !== 200) {
                throw new Error("Failed to delete todo")
            }
            toast.success("Todo deleted")
            await refreshTodos()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete todo")
        }
    }

    const clearCompleted = async () => {
        if (count.completed === 0) return
        try {
            const response = await api.delete("/todo/clear-completed")
            if (response.status !== 200) {
                throw new Error("Failed to clear completed todos")
            }
            toast.success(response.data?.message || "Completed todos cleared")
            await refreshTodos()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to clear completed todos")
        }
    }

    const handleFormSuccess = async () => {
        setIsFormOpen(false)
        setEditingTodo(null)
        setPrefilledDueDate(null)
        await refreshTodos()
    }

    const handleEdit = useCallback((currentTodo: Todo) => {
        setPrefilledDueDate(null)
        setEditingTodo(currentTodo)
        setIsFormOpen(true)
    }, [])

    const handleCreateTaskForDate = useCallback((date: string) => {
        setEditingTodo(null)
        setPrefilledDueDate(date)
        setIsFormOpen(true)
    }, [])

    const hasMore = page < totalPages
    const rowCount = todos.length + (hasMore ? 1 : 0)

    const handleRowsRendered = useCallback(
        (visibleRows: { startIndex: number; stopIndex: number }) => {
            if (hasMore && visibleRows.stopIndex >= todos.length - 3) {
                loadMoreTodos()
            }
        },
        [hasMore, todos.length, loadMoreTodos],
    )

    const progress = count.total ? Math.round((count.completed / count.total) * 100) : 0

    return (
        <section>
            <div className="p-2">
                <Card className="rounded-2xl">
                    <CardHeader className="space-y-4">
                        <TodoFilters
                            filter={filter}
                            viewMode={viewMode}
                            count={count}
                            onFilterChange={handleFilterChange}
                            onViewModeChange={setViewMode}
                            onAddTask={() => setIsFormOpen(true)}
                        />
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {viewMode === "list" ? (
                            <>
                                <div className={`grid ${user?.role === "ADMIN" ? "grid-cols-[2fr_1fr_1fr_1fr_1fr_0.9fr]" : "grid-cols-[2fr_1fr_1fr_1fr_0.9fr]"} gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground`}>
                                    <p>Task</p>
                                    <p>Priority</p>
                                    <p>Category</p>
                                    <p>Due Date</p>
                                    {user?.role === "ADMIN" && <p>Assignee</p>}
                                    <p className="text-center">Actions</p>
                                </div>

                                <div className="h-[calc(100vh-20rem)]">
                                    {todos.length === 0 ? (
                                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed bg-muted/10">
                                            <p className="text-sm text-muted-foreground">No tasks found.</p>
                                        </div>
                                    ) : (
                                        <List<TodoRowProps>
                                            rowCount={rowCount}
                                            rowHeight={ITEM_SIZE}
                                            rowComponent={TodoRow}
                                            rowProps={{
                                                todos,
                                                isLoadingMore,
                                                onToggle: toggleTodo,
                                                onEdit: handleEdit,
                                                onDelete: deleteTodo,
                                                user,
                                            }}
                                            overscanCount={5}
                                            onRowsRendered={handleRowsRendered}
                                            className="scrollbar-thin"
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            <TodoCalendarView
                                todos={calendarTodos}
                                isLoading={isCalendarLoading}
                                onToggle={toggleTodo}
                                onEdit={handleEdit}
                                onDelete={deleteTodo}
                                onCreateTask={handleCreateTaskForDate}
                            />
                        )}

                        <div className="mt-2 flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className=" flex items-center gap-2">
                                <div className="h-3 w-64 rounded-full bg-muted">
                                    <div className="h-3 rounded-full bg-linear-to-r from-emerald-500 to-lime-400" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground">{progress}% complete</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAsUncompleted}
                                    disabled={toUncompleteIds.size === 0}
                                    className="rounded-full"
                                >
                                    <TimerReset className="h-4 w-4" />
                                    Mark as Uncompleted
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAsCompleted}
                                    disabled={toCompleteIds.size === 0}
                                    className="rounded-full"
                                >
                                    <CheckCheck className="h-4 w-4" />
                                    Mark as Completed
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearCompleted}
                                    disabled={count.completed === 0}
                                    className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Clear Completed
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <TodoFormDialog
                open={isFormOpen}
                editingTodo={editingTodo}
                initialDueDate={prefilledDueDate}
                onClose={() => {
                    setIsFormOpen(false)
                    setEditingTodo(null)
                    setPrefilledDueDate(null)
                }}
                onSuccess={handleFormSuccess}
                user={user}
            />
        </section>
    )
}
