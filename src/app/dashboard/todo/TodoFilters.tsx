"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCheck, Circle, ListTodo, Plus } from "lucide-react"

type Filter = "all" | "active" | "completed"
type ViewMode = "list" | "calendar"

type TodoFiltersProps = {
  filter: Filter
  viewMode: ViewMode
  count: { total: number; active: number; completed: number }
  onFilterChange: (filter: Filter) => void
  onViewModeChange: (viewMode: ViewMode) => void
  onAddTask: () => void
}

export function TodoFilters({ filter, viewMode, count, onFilterChange, onViewModeChange, onAddTask }: TodoFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => onFilterChange("all")}
            className="rounded-full"
          >
            <ListTodo className="h-4 w-4" />
            All ({count.total})
          </Button>
          <Button
            size="sm"
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => onFilterChange("active")}
            className="rounded-full"
          >
            <Circle className="h-4 w-4" />
            Active ({count.active})
          </Button>
          <Button
            size="sm"
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => onFilterChange("completed")}
            className="rounded-full"
          >
            <CheckCheck className="h-4 w-4" />
            Completed ({count.completed})
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => onViewModeChange("list")}
            className="rounded-full"
          >
            <ListTodo className="h-4 w-4" />
            List View
          </Button>
          <Button
            size="sm"
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => onViewModeChange("calendar")}
            className="rounded-full"
          >
            <CalendarDays className="h-4 w-4" />
            Calendar View
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {count.active} active
        </Badge>
        <Button onClick={onAddTask} size="sm" className="rounded-full px-4">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  )
}
