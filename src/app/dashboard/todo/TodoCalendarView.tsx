"use client"

import { useEffect, useMemo, useState } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { CalendarDays, Check, ChevronLeft, ChevronRight, Pencil, Plus, Tag, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Todo } from "./TodoClient"

type TodoCalendarViewProps = {
  todos: Todo[]
  isLoading: boolean
  onToggle: (id: number, checked: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
  onCreateTask: (date: string) => void
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const VISIBLE_TODOS_PER_DAY = 3

function getTodoDateKey(dueDate: string | null) {
  return dueDate ? dueDate.split("T")[0] : null
}

function getMonthTitle(date: Date) {
  return format(date, "MMMM yyyy")
}

function getTodoPillClass(todo: Todo) {
  if (todo.completed) return "bg-emerald-100 text-emerald-900"
  if (todo.priority === "High") return "bg-rose-100 text-rose-900"
  if (todo.priority === "Medium") return "bg-amber-100 text-amber-900"
  return "bg-violet-100 text-violet-900"
}

export function TodoCalendarView({
  todos,
  isLoading,
  onToggle,
  onEdit,
  onDelete,
  onCreateTask,
}: TodoCalendarViewProps) {
  const initialMonthDate = useMemo(() => {
    const todayTodo = todos.find((todo) => getTodoDateKey(todo.dueDate) === format(new Date(), "yyyy-MM-dd"))
    if (todayTodo?.dueDate) return parseISO(todayTodo.dueDate)

    const firstDatedTodo = todos.find((todo) => todo.dueDate)
    return firstDatedTodo?.dueDate ? parseISO(firstDatedTodo.dueDate) : new Date()
  }, [todos])

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(initialMonthDate))

  useEffect(() => {
    setCurrentMonth(startOfMonth(initialMonthDate))
  }, [initialMonthDate])

  const todosByDate = useMemo(() => {
    return todos.reduce<Record<string, Todo[]>>((acc, todo) => {
      const key = getTodoDateKey(todo.dueDate)
      if (!key) return acc

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(todo)
      return acc
    }, {})
  }, [todos])

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentMonth)),
      end: endOfWeek(endOfMonth(currentMonth)),
    })
  }, [currentMonth])

  return (
    <Card className="rounded-2xl border">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5" />
            {getMonthTitle(currentMonth)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {todos.filter((todo) => todo.dueDate).length} scheduled tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-0">
        {isLoading ? (
          <div className="py-10 text-sm text-muted-foreground">Loading calendar tasks...</div>
        ) : (
          <>
            <div className="grid grid-cols-7 overflow-hidden rounded-t-2xl border border-b-0 border-border/70">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="border-r border-border/70 bg-muted/20 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 overflow-hidden rounded-b-2xl border border-border/70">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd")
                const dayTodos = todosByDate[key] ?? []
                const visibleTodos = dayTodos.slice(0, VISIBLE_TODOS_PER_DAY)
                const hiddenCount = Math.max(dayTodos.length - VISIBLE_TODOS_PER_DAY, 0)

                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-40 border-r border-b border-border/70 bg-background p-3 last:border-r-0",
                      !isSameMonth(day, currentMonth) && "bg-muted/10 text-muted-foreground",
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex h-4 w-4 items-center justify-center rounded-full text-sm font-medium",
                          isToday(day) ? "bg-black px-2.5 py-2.5 text-white" : "text-foreground",
                          !isSameMonth(day, currentMonth) && !isToday(day) && "text-muted-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      {isSameMonth(day, currentMonth) ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => onCreateTask(key)}
                          title="Add the task"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      {visibleTodos.map((todo) => (
                        <div
                          key={todo.id}
                          className={cn(
                            "truncate rounded-md px-2.5 py-1.5 text-[12px] font-medium",
                            getTodoPillClass(todo),
                            todo.completed && "line-through",
                          )}
                        >
                          {todo.title}
                        </div>
                      ))}

                      {hiddenCount > 0 ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-auto px-1 py-0 text-[12px] font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
                            >
                              + {hiddenCount} more
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-80 rounded-2xl p-4">
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xl font-semibold text-foreground">{format(day, "EEE d")}</p>
                                <p className="text-xs text-muted-foreground">{dayTodos.length} tasks scheduled</p>
                              </div>
                              <Button size="sm" className="rounded-full" onClick={() => onCreateTask(key)}>
                                <Plus className="h-4 w-4" />
                                Add
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {dayTodos.map((todo) => (
                                <div key={todo.id} className={cn("rounded-md px-3 py-2", getTodoPillClass(todo))}>
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="min-w-0 flex-1">
                                      <p className={cn("truncate text-[12px] font-medium", todo.completed && "line-through")}>
                                        {todo.title}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full"
                                        onClick={() => onToggle(todo.id, !todo.completed)}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => onEdit(todo)}>
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => onDelete(todo.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-white/55 px-2 py-0.5 text-[11px] font-medium text-foreground/85">
                                      {todo.priority}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/55 px-2 py-0.5 text-[11px] text-foreground/85">
                                      <Tag className="h-3 w-3" />
                                      {todo.category}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
