"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarDays, Pencil, Tag } from "lucide-react"
import { Todo } from "./TodoClient"
import { formatDateLocale, isValidDate } from "@/lib/formatDate"
import DeleteDialog from "@/components/DeleteDialog"
import { descriptionModify, generateColor } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type TodoItemProps = {
  todo: Todo
  onToggle: (id: number, checked: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
  user?: { id: number, name: string, email: string, role: string } | null
}

export function TodoItem({ todo, onToggle, onEdit, onDelete, user }: TodoItemProps) {
  const dueDateOnly = todo.dueDate ? todo.dueDate.split("T")[0] : null
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = !todo.completed && !!dueDateOnly && dueDateOnly < today
  const hasDueDate = !!todo.dueDate && isValidDate(todo.dueDate)

  const priorityColor =
    todo.priority === "High"
      ? "bg-red-100 text-red-700 font-semibold"
      : todo.priority === "Medium"
        ? "bg-amber-100 text-amber-700 font-semibold"
        : "bg-green-100 text-green-700 font-semibold";

  return (
    <div className={`grid ${user?.role === "ADMIN" ? "grid-cols-[2fr_1fr_1fr_1fr_1fr_0.9fr]" : "grid-cols-[2fr_1fr_1fr_1fr_0.9fr]"} items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 shadow-sm transition-colors hover:bg-muted/20`}>
      <div className="flex min-w-0 items-start gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) => onToggle(todo.id, Boolean(checked))}
          className="mt-1"
        />
        <div className="min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className={`truncate text-sm font-semibold ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {todo.title}
              </p>
            </TooltipTrigger>
            {todo.title.length > 40 && (
              <TooltipContent className="max-w-75 wrap-break-word">
                {todo.title}
              </TooltipContent>
            )}
          </Tooltip>

          <p className="line-clamp-1 text-xs text-muted-foreground">
            {todo.description ? descriptionModify(todo?.description) : "No description added"}
          </p>
        </div>
      </div>

      <div>
        <Badge className={`gap-1.5 rounded-full px-3 py-1 ${priorityColor}`}>
          {todo.priority}
        </Badge>
      </div>

      <div>
        <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
          <Tag className="h-3.5 w-3.5" />
          {todo.category}
        </Badge>
      </div>

      <div className={`flex gap-2 ${isOverdue ? "items-start" : "items-center"}`}>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${isOverdue
            ? "bg-rose-50 text-rose-700"
            : hasDueDate
              ? "bg-slate-100 text-slate-700"
              : "bg-muted/60 text-muted-foreground"
            }`}
        >
          <CalendarDays className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className={`text-[13.5px] font-medium leading-none ${isOverdue ? "pt-0.5 text-rose-700" : hasDueDate ? "text-slate-700" : "text-muted-foreground"}`}>
            {hasDueDate ? formatDateLocale(todo.dueDate!) : "No due date"}
          </p>
          {isOverdue && (
            <p className="mt-1 text-xs font-semibold text-rose-600">
              Overdue
            </p>
          )}
        </div>
      </div>

      {user?.role === "ADMIN" && (
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full border text-xs text-white"
            style={{ backgroundColor: generateColor(todo?.user?.name || "User") }}
          >
            {todo?.user?.name?.split(" ").map((n) => n[0]).join("")}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block truncate text-sm">
                {todo.user?.name === user.name ? "Me" : todo.user?.name}
              </span>
            </TooltipTrigger>
            {todo?.user?.name && todo?.user?.name?.length > 14 && (
              <TooltipContent className="max-w-45 wrap-break-word">
                {todo.user?.name}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      )}

      <div className="flex justify-center gap-3 ms-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(todo)}
              className="p-0! m-0! cursor-pointer rounded-full hover:bg-transparent"
            >
              <Pencil className="p-0! m-0!" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Edit Task
          </TooltipContent>
        </Tooltip>

        <DeleteDialog
          buttonLabel="Delete Task"
          dialogTitle="Delete this task?"
          dialogDescription={`This will remove "${todo.title}" forever from your task list.`}
          onDelete={() => onDelete(todo.id)}
        />
      </div>
    </div>
  )
}
