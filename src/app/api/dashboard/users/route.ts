import { addUserController, deleteUserController, getUserController, updateUserStatusController } from "@/controllers/user.controller";

// get the list of all users (admin only)
export const GET = getUserController;
// add a new user (admin only)
export const POST = addUserController;
// update user status (ACTIVE/INACTIVE) (admin only)
export const PATCH = updateUserStatusController;
// delete a user (admin only)
export const DELETE = deleteUserController;