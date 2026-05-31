import { NextRequest, NextResponse } from "next/server";
import {
  clearCompletedTodosService,
  createTodoService,
  deleteTodoByIdService,
  getTodosService,
  parseTodoId,
  updateManyTodoService,
  updateTodoByIdService,
} from "@/services/todo.service";
import { handleControllerError } from "@/lib/errorHandling";
import { getUserIdFromHeader, getUserRoleFromHeader } from "@/lib/utils";

export async function getTodosController(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);
    const userRole = getUserRoleFromHeader(request);
    const category = request.nextUrl.searchParams.get("category");
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? null;
    const page = Number(request.nextUrl.searchParams.get("page") || "1");
    const view = request.nextUrl.searchParams.get("view");
    const response = await getTodosService(userId, category, q, userRole, page, view);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleControllerError(error, "Failed to fetch todos");
  }
}

export async function createTodoController(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);
    const userRole = getUserRoleFromHeader(request);
    const body = await request.json();
    const response = await createTodoService(userId, body, userRole);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleControllerError(error, "Failed to create todo");
  }
}

export async function deleteTodoController(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromHeader(request);
    const { id } = await context.params;
    const todoId = parseTodoId(id);
    const role = getUserRoleFromHeader(request);
    const response = await deleteTodoByIdService(userId, todoId, role);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleControllerError(error, "Todo not found");
  }
}

export async function updateTodoController(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromHeader(request);
    const { id } = await context.params;
    const todoId = parseTodoId(id);
    const role = getUserRoleFromHeader(request);
    const body = await request.json();
    const response = await updateTodoByIdService(userId, todoId, body, role);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleControllerError(error, "Failed to update todo");
  }
}

export async function updateManyTodoController(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);
    const role = getUserRoleFromHeader(request);
    const body = await request.json();
    const response = await updateManyTodoService(userId, body.todoIds, body.completed, role);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleControllerError(error, "Failed to update todos");
  }
}

export async function clearCompletedController(request: NextRequest) {
  try {
    const userId = getUserIdFromHeader(request);
    const role = getUserRoleFromHeader(request);
    const response = await clearCompletedTodosService(userId, role);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleControllerError(error, "Failed to clear completed todos");
  }
}
