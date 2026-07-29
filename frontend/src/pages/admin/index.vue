<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { FileText, CheckCircle2, FileEdit, ArrowRight, Plus } from 'lucide-vue-next';
import { fetchAdminPosts } from '@/api/posts';
import { useAuthStore } from '@/stores/auth';

const posts = ref<any[]>([]);
const authStore = useAuthStore();
const loading = ref(true);

onMounted(async () => {
  try {
    posts.value = (await fetchAdminPosts()) as any[];
  } catch {
    posts.value = [];
  } finally {
    loading.value = false;
  }
});

const stats = computed(() => {
  const total = posts.value.length;
  const published = posts.value.filter((p) => p.isPublished).length;
  const draft = total - published;
  return [
    { label: '总文章数', value: total, icon: FileText, hint: '全部文章' },
    { label: '已发布', value: published, icon: CheckCircle2, hint: '对外可见' },
    { label: '草稿', value: draft, icon: FileEdit, hint: '未发布' },
  ];
});

const recent = computed(() => posts.value.slice(0, 5));
</script>

<template>
  <div class="space-y-8">
    <!-- 欢迎区 -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          欢迎回来，{{ authStore.user?.name || '管理员' }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">这里是你博客的内容概览。</p>
      </div>
      <RouterLink
        to="/admin/posts/create"
        class="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus class="h-4 w-4" />
        写文章
      </RouterLink>
    </div>

    <!-- 统计卡片 -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded-lg border border-border bg-card shadow-sm p-6 transition-colors"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-muted-foreground">{{ s.label }}</p>
          <span class="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <component :is="s.icon" class="h-5 w-5" />
          </span>
        </div>
        <p class="mt-3 text-3xl font-bold tracking-tight">
          <span v-if="loading" class="inline-block w-10 h-8 rounded bg-muted/60 animate-pulse align-bottom" />
          <template v-else>{{ s.value }}</template>
        </p>
        <p class="mt-1 text-xs text-muted-foreground">{{ s.hint }}</p>
      </div>
    </div>

    <!-- 最近文章 -->
    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 class="text-base font-semibold">最近文章</h2>
        <RouterLink
          to="/admin/posts"
          class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          查看全部 <ArrowRight class="h-3.5 w-3.5" />
        </RouterLink>
      </div>
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="i in 4" :key="i" class="h-10 rounded bg-muted/40 animate-pulse" />
      </div>
      <ul v-else-if="recent.length" class="divide-y divide-border">
        <li
          v-for="post in recent"
          :key="post.id"
          class="flex items-center justify-between gap-4 px-6 py-3 hover:bg-muted/30 transition-colors"
        >
          <RouterLink :to="`/admin/posts/${post.id}`" class="min-w-0 flex-1">
            <p class="text-sm font-medium text-foreground truncate hover:text-primary transition-colors">
              {{ post.title }}
            </p>
          </RouterLink>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            :class="
              post.isPublished
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            "
          >
            {{ post.isPublished ? '已发布' : '草稿' }}
          </span>
          <span class="text-xs text-muted-foreground w-24 text-right hidden sm:block">
            {{ post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : '-' }}
          </span>
        </li>
      </ul>
      <div v-else class="px-6 py-12 text-center text-sm text-muted-foreground">暂无文章</div>
    </div>
  </div>
</template>
