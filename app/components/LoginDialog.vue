<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'radix-vue'
import { User as UserIcon, Lock as LockIcon, Loader2, ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  open?: boolean
  preventClose?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'login-success'): void
}>()

const internalOpen = computed({
  get: () => props.open || false,
  set: (val) => emit('update:open', val)
})

const username = ref('')
const password = ref('')
const loading = ref(false)
const { fetch: refreshSession } = useUserSession()

const login = async () => {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    await refreshSession()
    emit('update:open', false)
    emit('login-success')
  } catch (e) {
    alert('登录失败，请检查用户名或密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <DialogRoot v-model:open="internalOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent class="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] 
        p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 duration-200 
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        @pointer-down-outside="(e) => props.preventClose && e.preventDefault()"
        @escape-key-down="(e) => props.preventClose && e.preventDefault()"
        @focus-outside="(e) => props.preventClose && e.preventDefault()"
        @interact-outside="(e) => props.preventClose && e.preventDefault()"
      >
        <div class="flex flex-col space-y-2 text-center mb-6">
          <DialogTitle class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            管理员登录
          </DialogTitle>
          <DialogDescription class="text-sm text-zinc-500 dark:text-zinc-400">
            请输入您的凭据以访问后台
          </DialogDescription>
        </div>

        <form @submit.prevent="login" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100">用户名</label>
            <div class="relative">
              <UserIcon class="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <input 
                v-model="username" 
                type="text" 
                class="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 pl-9" 
                placeholder="Username" 
                required 
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100">密码</label>
            <div class="relative">
              <LockIcon class="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <input 
                v-model="password" 
                type="password" 
                class="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 pl-9" 
                placeholder="Password" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="loading" 
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-9 px-4 w-full mt-2"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <span v-else class="flex items-center gap-2">
              登录 <ArrowRight class="w-4 h-4" />
            </span>
          </button>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

