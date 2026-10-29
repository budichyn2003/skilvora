import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan",
): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as { message?: string | string[] };
    if (data.message) {
      return Array.isArray(data.message)
        ? data.message.join(", ")
        : String(data.message);
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
