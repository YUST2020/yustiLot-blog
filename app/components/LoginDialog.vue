<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'radix-vue'
import { X, User as UserIcon, Lock as LockIcon, Loader2, ArrowRight } from 'lucide-vue-next'

const isOpen = ref(false)
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
    isOpen.value = false
    navigateTo('/admin')
  } catch (e) {
    alert('登录失败，请检查用户名或密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <DialogRoot v-model:open="isOpen">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent class="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] 
        p-0 bg-transparent shadow-none border-none duration-200 
        data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
      >
        <div 
          class="relative w-full overflow-hidden rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-8 transition-transform duration-200 ease-out"
        >
          <!-- Moving Border Gradient -->
          <div class="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50 blur-xl animate-pulse"></div>
          
          <!-- Animated Background Blobs -->
          <div class="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.3)_360deg)] animate-[spin_4s_linear_infinite] opacity-30 pointer-events-none"></div>
          <div class="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/30 rounded-full blur-[80px] pointer-events-none animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
          <div class="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/30 rounded-full blur-[80px] pointer-events-none animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/30 rounded-full blur-[80px] pointer-events-none animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>

          <!-- Noise Texture Overlay -->
          <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>

          <div class="relative z-10">
            <!-- Header -->
            <div class="flex flex-col space-y-2 text-center mb-8">
              <div class="mx-auto w-16 h-16 relative group">
                <div class="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/20">
                  <Lock class="w-8 h-8 text-white drop-shadow-md" />
                </div>
              </div>
              <DialogTitle class="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mt-4 animate-gradient-x">
                Welcome Back
              </DialogTitle>
              <DialogDescription class="text-sm text-muted-foreground/80 font-medium">
                请输入您的管理员凭据以继续
              </DialogDescription>
            </div>

            <form @submit.prevent="login" class="space-y-6">
              <!-- Username Input -->
              <div class="space-y-2 group">
                <label class="text-xs font-bold ml-1 text-muted-foreground group-focus-within:text-blue-500 transition-colors uppercase tracking-wider">Username</label>
                <div class="relative transition-all duration-300 group-focus-within:scale-[1.02] group-focus-within:-translate-y-1">
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                  <UserIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors z-20" />
                  <input 
                    v-model="username" 
                    type="text" 
                    class="relative flex h-12 w-full rounded-xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 px-11 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all duration-300 hover:bg-white/80 dark:hover:bg-black/40 shadow-sm z-10" 
                    placeholder="请输入用户名" 
                    required 
                  />
                </div>
              </div>
              
              <!-- Password Input -->
              <div class="space-y-2 group">
                <label class="text-xs font-bold ml-1 text-muted-foreground group-focus-within:text-purple-500 transition-colors uppercase tracking-wider">Password</label>
                <div class="relative transition-all duration-300 group-focus-within:scale-[1.02] group-focus-within:-translate-y-1">
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                  <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-purple-500 transition-colors z-20" />
                  <input 
                    v-model="password" 
                    type="password" 
                    class="relative flex h-12 w-full rounded-xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 px-11 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 transition-all duration-300 hover:bg-white/80 dark:hover:bg-black/40 shadow-sm z-10" 
                    placeholder="请输入密码" 
                    required 
                  />
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                :disabled="loading" 
                class="relative overflow-hidden group w-full rounded-xl p-[1px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-lg hover:shadow-blue-500/40 mt-8"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>
                <div class="relative flex h-12 w-full items-center justify-center rounded-xl bg-white/90 dark:bg-black/90 group-hover:bg-opacity-0 dark:group-hover:bg-opacity-0 transition-all duration-300 text-foreground group-hover:text-white font-bold tracking-wide z-10">
                  <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                  <span v-else class="flex items-center gap-2">
                    立即登录 <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </button>
            </form>
          </div>

          <DialogClose class="absolute right-4 top-4 rounded-full p-2 opacity-50 ring-offset-background transition-all hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-20">
            <X class="h-5 w-5" />
            <span class="sr-only">Close</span>
          </DialogClose>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 15s ease infinite;
}
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-xy {
  background-size: 200% 200%;
  animation: gradient-xy 6s ease infinite;
}
@keyframes gradient-xy {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
