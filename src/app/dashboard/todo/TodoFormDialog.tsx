"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, ChevronDownIcon, CircleAlert, Flag, Layers3 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Todo } from "./TodoClient"
import { generateColor } from "@/lib/utils"
import { Controller, useForm } from "react-hook-form"
import TextEditor from "./TextEditor"


type Priority = "High" | "Medium" | "Low"
type Category = "General" | "Development" | "DevOps" | "Backend" | "Programming"

type TodoForm = {
  title: string
  description: string
  priority: string
  category: string
  dueDate: string
  newUserId?: number
}

const categoryOptions: Category[] = ["General", "Development", "DevOps", "Backend", "Programming"]
const priorityOptions: Priority[] = ["High", "Medium", "Low"]

type UserList = {
  id: number
  name: string
  email: string
  role: string
}

type TodoFormDialogProps = {
  open: boolean
  editingTodo: Todo | null
  initialDueDate?: string | null
  onClose: () => void
  onSuccess: () => void
  user: UserList | null
}

export function TodoFormDialog({ open, editingTodo, initialDueDate = null, onClose, onSuccess, user }: TodoFormDialogProps) {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userList, setUserList] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    control, register, handleSubmit, reset, setValue, trigger, getValues, watch,
    formState: { errors },
  } = useForm<TodoForm>({
    defaultValues: {
      title: "",
      description: "",
      priority: "",
      category: "",
      dueDate: "",
      newUserId: undefined,
    },
  })

  const isEditMode = !!editingTodo
  const formValues = watch()
  const selectedAssignee = userList.find((assignee) => assignee.id === formValues.newUserId)
  const isUpdateDisable = isEditMode
    && formValues.title.trim() === editingTodo.title
    && formValues.description === (editingTodo.description || "")
    && formValues.priority === editingTodo.priority
    && formValues.category === editingTodo.category
    && formValues.dueDate === (editingTodo.dueDate ? new Date(editingTodo.dueDate).toISOString().slice(0, 10) : "")
    && formValues.newUserId === editingTodo.user?.id

  useEffect(() => {
    if (editingTodo) {
      reset({
        title: editingTodo.title,
        description: editingTodo.description || "",
        priority: editingTodo.priority,
        category: editingTodo.category,
        dueDate: editingTodo.dueDate
          ? new Date(editingTodo.dueDate).toISOString().slice(0, 10)
          : "",
        newUserId: editingTodo.user?.id,
      })
    } else {
      reset({
        title: "",
        description: "",
        priority: "",
        category: "",
        dueDate: initialDueDate ?? "",
        newUserId: undefined,
      })
    }
    setIsSubmitting(false)
  }, [editingTodo, initialDueDate, open, reset])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/dashboard/users/userlist?filter=active");
        if (response.status !== 200) {
          throw new Error(response.data?.message || "Failed to fetch users")
        }
        setUserList(response.data.data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch users")
      }
    }

    if (user?.role === "ADMIN" && open) {
      fetchUsers()
    }
  }, [user?.role, open])

  const onSubmit = async (data: TodoForm) => {
    setIsSubmitting(true)
    try {
      if (isEditMode) {
        const response = await api.patch(`/todo/${editingTodo.id}`, data)
        if (response.status !== 200) {
          throw new Error(response.data?.message || "Failed to update todo")
        }
        toast.success(response.data?.message || "Todo updated")
      } else {
        const response = await api.post("/todo", data)
        if (response.status !== 201) {
          throw new Error(response.data?.message || "Failed to add todo")
        }
        toast.success(response.data?.message || "Todo added")
      }
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save todo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlegeneratedescription = async () => {
    const isValid = await trigger("title")
    if (!isValid) {
      return;
    }
    const title = getValues("title")
    setLoading(true);
    try {
      const res = await api.post("/chat", { title });
      if (res.status !== 200) {
        throw new Error("Unable to generate the description")
      }
      setValue("description", res.data.description ?? "", { shouldDirty: true })
      console.log(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
          setIsDateOpen(false)
        }
      }}
    >
      <DialogContent
        className="sm:max-w-3xl"
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null
          if (target?.closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root")) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Task" : "Create a new task"}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditMode ? "Update your task details below." : "Add the key details now. You can always come back and refine the task later."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit(onSubmit)()
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="title">
                Title<span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="title"
                {...register("title", {
                  required: "Title is required",
                  validate: (value) => value.trim().length > 0 || "Title is required",
                })}
                aria-invalid={!!errors.title}
                placeholder="Enter task title"
              />
              {errors.title && <FieldError className="mt-1 text-sm text-red-500">{errors.title.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="priority">Priority</FieldLabel>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Priority</SelectLabel>
                        {priorityOptions.map((item) => (
                          <SelectItem key={item} value={item} >
                            <div className="flex items-center gap-2">
                              <Flag className={`h-4 w-4 ${item === "High" ? "text-red-500" : item === "Medium" ? "text-yellow-500" : "text-green-500"}`} />
                              {item}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field className="md:col-span-2">
              <div className="flex justify-between">
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Button className="bg-blue-100 rounded-md text-xs" type="button" variant="secondary" size="xs"
                  onClick={handlegeneratedescription}>
                  {loading ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              {/* <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter task description"
                className="min-h-24 max-h-60  overflow-auto"
              /> */}
              <Controller
                    name="description"
                control={control}
                render={({ field }) => (
                  <TextEditor
                    id="description"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Category</SelectLabel>
                        {categoryOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            <div className="flex items-center gap-2">
                              <Layers3 className="h-4 w-4" />
                              {item}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dueDate">Due Date</FieldLabel>
              <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-between font-normal data-[empty=true]:text-muted-foreground"
                    data-empty={!formValues.dueDate}
                  >
                    {formValues.dueDate ? (
                      new Date(formValues.dueDate).toLocaleDateString()
                    ) : (
                      <span>Select due date</span>
                    )}
                    <div className="flex items-center gap-2">
                      {formValues.dueDate && <CalendarDays className="h-4 w-4 text-muted-foreground" />}
                      <ChevronDownIcon />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? date.toLocaleDateString("en-CA") : "")
                          setIsDateOpen(false)
                        }}
                        captionLayout="dropdown"
                      />
                    )}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            {user && user.role === "ADMIN" && (
              <Field>
                <FieldLabel htmlFor="assignee">Assignee</FieldLabel>
                <Controller
                  name="newUserId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    >
                      <SelectTrigger className="w-full min-h-11">
                        <SelectValue placeholder="Select assignee">
                          {selectedAssignee && (
                            <div className="flex min-w-0 items-center gap-2">
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs text-white"
                                style={{ backgroundColor: generateColor(selectedAssignee.name || "User") }}
                              >
                                {selectedAssignee.name?.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="truncate text-sm text-foreground">{selectedAssignee.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{selectedAssignee.email}</p>
                              </div>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Assignee</SelectLabel>
                          {userList?.map((assignee) => (
                            <SelectItem key={assignee.id} value={String(assignee.id)}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded-full border text-xs text-white"
                                  style={{ backgroundColor: generateColor(assignee.name || "User") }}
                                >
                                  {assignee.name?.split(" ").map((n) => n[0]).join("")}
                                </div>
                                <div className="flex flex-col">
                                  <span>{assignee.name}</span>
                                  <span className="text-xs text-muted-foreground">{assignee.email}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-muted/20  text-xs text-muted-foreground">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {user?.role === "ADMIN"
                ? "Admins can assign tasks directly while creating or editing them."
                : "Priority, category, and due date help keep your task list easier to manage."}
            </span>
          </div>
        </form>

        <DialogFooter className="">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit(onSubmit)()} type="button" disabled={isSubmitting || isUpdateDisable}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update Task" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}
