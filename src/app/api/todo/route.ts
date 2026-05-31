import { createTodoController, getTodosController ,updateManyTodoController} from "@/controllers/todo.controller"

// get all todos with optional filtering and searching
export const GET = getTodosController;
// create a new todo
export const POST = createTodoController;

export const PATCH = updateManyTodoController;