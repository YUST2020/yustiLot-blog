<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  LayoutDashboard,
  FileText,
  Tv,
  FolderGit2,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
} from 'lucide-vue-next';
import { useColorMode } from '@/composables/useColorMode';
import { useAuthStore } from '@/stores/auth';
import request from '@/api/request';
import LoginDialog from '@/components/LoginDialog.vue';

const router = useRouter();
const colorMode = useColorMode();
const authStore = useAuthStore();
const mobileNavOpen = ref(false);

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

const logout = async () => {
  try {
    await request.post('/auth/logout');
  } catch {
    // 忽略登出接口错误
  }
  authStore.logout();
  router.push('/');
};

// 用户名首字母作为头像
const avatarLetter = () => {
  const name = authStore.user?.name || authStore.user?.username || 'A';
  return name.charAt(0).toUpperCase();
};

// 导航项（统一类型，exact 控制是否精确匹配激活态）
interface NavItem {
  to: string;
  icon: any;
  label: string;
  exact?: boolean;
}
const navItems: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: '仪表盘', exact: true },
  { to: '/admin/posts', icon: FileText, label: '文章管理' },
  { to: '/admin/animes', icon: Tv, label: '番剧管理' },
  { to: '/admin/projects', icon: FolderGit2, label: '作品管理' },
];
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 移动端遮罩 -->
    <Transition name="fade">
      <div
        v-if="mobileNavOpen"
        class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
        @click="mobileNavOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0"
      :class="mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-border">
        <RouterLink to="/" class="flex items-center gap-2 font-bold text-base tracking-tight">
          <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm">
            B
          </span>
          <span>Blog Admin</span>
        </RouterLink>
        <button class="lg:hidden p-1 rounded-md hover:bg-secondary" @click="mobileNavOpen = false">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p class="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
          管理
        </p>
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="mobileNavOpen = false"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </RouterLink>

        <p class="px-3 pt-5 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
          快捷
        </p>
        <RouterLink
          to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ExternalLink class="h-4 w-4" />
          访问前台
        </RouterLink>
      </nav>

      <!-- User / Logout -->
      <div class="border-t border-border p-3">
        <div class="flex items-center gap-3 px-2 py-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
            {{ avatarLetter() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ authStore.user?.name || '管理员' }}</p>
            <p class="text-xs text-muted-foreground truncate">@{{ authStore.user?.username }}</p>
          </div>
        </div>
        <button
          @click="logout"
          class="mt-1 flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut class="h-4 w-4" />
          退出登录
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="lg:pl-64">
      <!-- Topbar -->
      <header
        class="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8"
      >
        <div class="flex items-center gap-3">
          <button
            class="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary"
            @click="mobileNavOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="toggleTheme"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="切换主题"
          >
            <Sun v-if="colorMode.value === 'light'" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>
        </div>
      </header>

      <!-- Content -->
      <main class="p-4 md:p-8">
        <div v-if="authStore.loggedIn">
          <router-view />
        </div>
        <!-- 未登录骨架屏 -->
        <div v-else class="space-y-6">
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div v-for="i in 4" :key="i" class="h-28 rounded-lg bg-muted/50 animate-pulse" />
          </div>
          <div class="h-96 rounded-lg bg-muted/50 animate-pulse" />
        </div>
      </main>
    </div>

    <LoginDialog :open="!authStore.loggedIn" prevent-close />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* 导航激活态：用精确匹配类，避免 /admin 在子路由也高亮 */
:deep(.router-link-exact-active) {
  background-color: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}
</style>
