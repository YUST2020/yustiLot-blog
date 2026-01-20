import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 防止异步函数重复执行
 * @param fn 需要执行的异步函数
 * @returns 包装后的函数
 */
export function preventAsyncRepeat(fn: (...args: any[]) => Promise<any>) {
  let loading = false
  return async (...args: any[]) => {
    if (loading) return
    loading = true
    try {
      return await fn(...args)
    } finally {
      loading = false
    }
  }
}
