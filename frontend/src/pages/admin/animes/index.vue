<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Star, Edit, Trash2, Plus, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useDialogOpen } from '@/composables/useDialogOpen';
import AnimeDialog from '@/components/admin/AnimeDialog.vue';
import { fetchAdminAnimes, createAnime, updateAnime, deleteAnime } from '@/api/animes';

const route = useRoute();
const router = useRouter();

// 查询参数
const page = ref(Number(route.query.page) || 1);
const search = ref((route.query.search as string) || '');
const sortBy = ref((route.query.sortBy as string) || 'releaseDate');
const order = ref((route.query.order as string) || 'desc');

const data = ref<any>(null);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    data.value = await fetchAdminAnimes({
      page: page.value,
      search: search.value,
      sortBy: sortBy.value,
      order: order.value,
    });
  } catch {
    data.value = { items: [], total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

// 搜索防抖
let searchTimeout: ReturnType<typeof setTimeout>;
const handleSearch = (val: string) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    search.value = val;
    page.value = 1;
    loadData();
  }, 300);
};

// 查询参数变化时重新加载并同步 URL
watch([page, search, sortBy, order], () => {
  loadData();
  const query: any = { page: page.value };
  if (search.value) query.search = search.value;
  if (sortBy.value !== 'releaseDate') query.sortBy = sortBy.value;
  if (order.value !== 'desc') query.order = order.value;
  router.push({ query });
});

// 从 URL 恢复（浏览器前进后退）
watch(
  () => route.query,
  (newQuery) => {
    page.value = Number(newQuery.page) || 1;
    search.value = (newQuery.search as string) || '';
    sortBy.value = (newQuery.sortBy as string) || 'releaseDate';
    order.value = (newQuery.order as string) || 'desc';
  },
);

const animes = computed(() => data.value?.items || []);
const totalPages = computed(() => data.value?.totalPages || 0);
const total = computed(() => data.value?.total || 0);

const openCreateDialog = () => {
  useDialogOpen(AnimeDialog, {
    isEdit: false,
    onConfirm: async (formData: any) => {
      await createAnime(formData);
      toast.success('番剧记录已创建');
      loadData();
    },
  });
};

const openEditDialog = (anime: any) => {
  useDialogOpen(AnimeDialog, {
    isEdit: true,
    initialData: anime,
    onConfirm: async (formData: any) => {
      await updateAnime(anime.id, formData);
      toast.success('番剧记录已更新');
      loadData();
    },
  });
};

const deleteAnimeConfirm = async (id: number) => {
  if (!confirm('确定要删除这条番剧记录吗？')) return;
  try {
    await deleteAnime(id);
    toast.success('删除成功');
    loadData();
  } catch {
    toast.error('删除失败');
  }
};

const getQuarterLabel = (q: number) => {
  const labels: Record<number, string> = { 1: '1月', 4: '4月', 7: '7月', 10: '10月' };
  return labels[q] || q + '月';
};

const toggleOrder = () => {
  order.value = order.value === 'desc' ? 'asc' : 'desc';
};
</script>

<template>
  <div class="space-y-6">
    <!-- 页头 -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">番剧管理</h1>
        <p class="mt-1 text-sm text-muted-foreground">记录和管理我看过的番剧。</p>
      </div>
      <button
        @click="openCreateDialog"
        class="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus class="h-4 w-4" />
        新增记录
      </button>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="relative w-full max-w-xs">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          :value="search"
          @input="handleSearch(($event.target as HTMLInputElement).value)"
          type="search"
          placeholder="搜索番剧..."
          class="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="flex items-center gap-2 ml-auto">
        <select
          v-model="sortBy"
          class="flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        >
          <option value="releaseDate">上映时间</option>
          <option value="rating">评分</option>
          <option value="createdAt">创建时间</option>
        </select>
        <button
          @click="toggleOrder"
          :title="order === 'desc' ? '当前降序，点击切换' : '当前升序，点击切换'"
          class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowUpDown class="h-4 w-4 transition-transform" :class="{ 'rotate-180': order === 'asc' }" />
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/40 border-b border-border">
            <tr class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <th class="px-4 py-3">番剧</th>
              <th class="px-4 py-3 w-28">评分</th>
              <th class="px-4 py-3 w-36">上映时间</th>
              <th class="px-4 py-3 w-24 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="loading">
              <td colspan="4" class="px-4 py-10 text-center text-muted-foreground">
                <span class="inline-block h-5 w-5 border-2 border-muted border-t-primary rounded-full animate-spin align-middle mr-2" />
                加载中...
              </td>
            </tr>
            <tr v-else-if="!animes.length">
              <td colspan="4" class="px-4 py-12 text-center text-muted-foreground">
                {{ search ? '未找到相关番剧' : '暂无番剧记录' }}
              </td>
            </tr>
            <tr v-for="anime in animes" :key="anime.id" class="group hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    <img
                      :src="anime.coverImage"
                      :alt="anime.title"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div class="min-w-0 space-y-1">
                    <div class="font-medium text-foreground leading-snug truncate">{{ anime.title }}</div>
                    <div class="text-xs text-muted-foreground line-clamp-1 max-w-[280px]" :title="anime.review">
                      {{ anime.review || '暂无评价' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span class="font-semibold text-foreground">{{ anime.rating }}</span>
                  <span class="text-xs text-muted-foreground">/10</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-medium">
                  {{ anime.releaseYear }}年 {{ getQuarterLabel(anime.releaseQuarter) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditDialog(anime)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="编辑"
                  >
                    <Edit class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteAnimeConfirm(anime.id)"
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

    <!-- 分页 -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="text-sm text-muted-foreground">共 {{ total }} 条记录</div>
      <div class="flex items-center gap-3">
        <button
          :disabled="page <= 1"
          @click="page--"
          class="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft class="h-4 w-4" />
          上一页
        </button>
        <span class="text-sm text-muted-foreground">第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
        <button
          :disabled="page >= totalPages"
          @click="page++"
          class="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          下一页
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
