import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto";
import api from "./axios";
import { toast } from "sonner";
import { ServiceError } from "./errorHandling";
import { NextRequest } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function forgotPasswordLink() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  return resetToken;
};


// Helper to generate a hex color from a string
export const generateColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleLogout = async (router?: any) => {
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  try {
    await api.get("/auth/logout")
    toast.success("Logged out successfully")
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to logout")
  } finally {
    if (router) {
      router.replace("/login");
    } else {
      window.location.replace("/login"); // Fallback if no router is provided
    }
  }
};


export function getUserIdFromHeader(request: NextRequest): number {
  const raw = request.headers.get("x-user-id");
  const userId = Number(raw);

  if (!raw || !Number.isInteger(userId) || userId <= 0) {
    throw new ServiceError("Unauthorized", 401);
  }

  return userId;
}

export function getUserRoleFromHeader(request: NextRequest): string {
  const role = request.headers.get("x-user-role");
  if (!role) {
    throw new ServiceError("Unauthorized", 401);
  }
  return role;
}


// export function debouncing(fn: any, delay: any) {
//   let timeout: any;
//   return function (...args) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       fn(...args);
//     }, delay);
//   }
// }

export const descriptionModify = (html: string) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .replace(/[*]/g, "")
    .trim();
};
