<script setup lang="ts">
import { LayoutDashboard, FileText, Settings, LogOut, Sun, Moon } from 'lucide-vue-next'

const colorMode = useColorMode()
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const { clear } = useUserSession()

const logout = async () => {
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex">
    <!-- Sidebar -->
    <aside class="w-64 border-r bg-muted/40 hidden md:flex flex-col">
      <div class="h-16 flex items-center px-6 border-b">
        <NuxtLink to="/" class="font-bold text-lg hover:text-primary transition-colors">
          Admin Panel
        </NuxtLink>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <NuxtLink to="/admin" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors" active-class="bg-secondary text-primary">
          <LayoutDashboard class="w-4 h-4" />
          仪表盘
        </NuxtLink>
        <NuxtLink to="/admin/posts" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors" active-class="bg-secondary text-primary">
          <FileText class="w-4 h-4" />
          文章管理
        </NuxtLink>
        <!-- Optional Settings -->
        <div class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors cursor-not-allowed opacity-50">
          <Settings class="w-4 h-4" />
          设置
        </div>
      </nav>
      <div class="p-4 border-t">
        <button @click="logout" class="flex items-center gap-3 px-3 py-2 w-full rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-sm font-medium">
          <LogOut class="w-4 h-4" />
          退出登录
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <header class="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
        <NuxtLink to="/" class="md:hidden font-bold hover:text-primary transition-colors">Admin</NuxtLink> <!-- Mobile Placeholder -->
        <div class="ml-auto flex items-center gap-4">
          <button @click="toggleTheme" class="p-2 rounded-full hover:bg-secondary">
             <Sun v-if="colorMode.value === 'light'" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="text-xs font-bold">A</span>
          </div>
        </div>
      </header>
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
