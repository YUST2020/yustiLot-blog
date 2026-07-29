<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Edit, Trash2, Plus, Search } from 'lucide-vue-next';
import { fetchAdminPosts, deletePost } from '@/api/posts';

const posts = ref<any[]>([]);
const loading = ref(true);
const keyword = ref('');

onMounted(loadPosts);

async function loadPosts() {
  loading.value = true;
  try {
    posts.value = (await fetchAdminPosts()) as any[];
  } catch {
    posts.value = [];
  } finally {
    loading.value = false;
  }
}

// 前端关键词过滤（按标题/标签）
const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return posts.value;
  return posts.value.filter((p) => {
    const title = (p.title || '').toLowerCase();
    let tags = '';
    try {
      tags = Array.isArray(p.tags) ? p.tags.join(' ') : JSON.parse(p.tags || '[]').join(' ');
    } catch {
      tags = '';
    }
    return title.includes(k) || tags.toLowerCase().includes(k);
  });
});

async function deletePostConfirm(id: number) {
  if (!confirm('确定要删除这篇文章吗？')) return;
  await deletePost(id);
  await loadPosts();
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页头 -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">文章管理</h1>
        <p class="mt-1 text-sm text-muted-foreground">管理博客的全部文章。</p>
      </div>
      <RouterLink
        to="/admin/posts/create"
        class="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus class="h-4 w-4" />
        新建文章
      </RouterLink>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center gap-3">
      <div class="relative w-full max-w-xs">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索标题或标签..."
          class="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="ml-auto text-sm text-muted-foreground">共 {{ filtered.length }} 篇</div>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/40 border-b border-border">
            <tr class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <th class="px-4 py-3">标题</th>
              <th class="px-4 py-3 w-24">状态</th>
              <th class="px-4 py-3 w-36">发布时间</th>
              <th class="px-4 py-3 w-24 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="loading">
              <td colspan="4" class="px-4 py-10 text-center text-muted-foreground">
                <div class="inline-block h-5 w-5 border-2 border-muted border-t-primary rounded-full animate-spin align-middle mr-2" />
                加载中...
              </td>
            </tr>
            <tr v-else-if="!filtered.length">
              <td colspan="4" class="px-4 py-12 text-center text-muted-foreground">
                {{ keyword ? '未找到匹配的文章' : '暂无文章' }}
              </td>
            </tr>
            <tr
              v-for="post in filtered"
              :key="post.id"
              class="hover:bg-muted/30 transition-colors"
            >
              <td class="px-4 py-3">
                <RouterLink
                  :to="`/admin/posts/${post.id}`"
                  class="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {{ post.title }}
                </RouterLink>
              </td>
              <td class="px-4 py-3">
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
              </td>
              <td class="px-4 py-3 text-muted-foreground">
                {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-' }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <RouterLink
                    :to="`/admin/posts/${post.id}`"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="编辑"
                  >
                    <Edit class="h-4 w-4" />
                  </RouterLink>
                  <button
                    @click="deletePostConfirm(post.id)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="删除"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
