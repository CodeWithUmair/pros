import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAmount = (amount: number) => {
  if (amount == 0) {
    return "0";
  }
  return amount.toFixed(6).replace(/\.?0+$/, "");
};

export const formatNextExecutionDate = (nextExecutionDate?: string) => {
  if (!nextExecutionDate) return "";
  const nextExecution = new Date(nextExecutionDate);
  return nextExecution.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const DELAY = async (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};