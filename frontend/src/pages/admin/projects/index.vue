<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Edit, Trash2, Plus, Search, Github, ExternalLink, FolderGit2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useDialogOpen } from '@/composables/useDialogOpen';
import ProjectDialog from '@/components/admin/ProjectDialog.vue';
import { fetchAdminProjects, createProject, updateProject, deleteProject } from '@/api/projects';

const projects = ref<any[]>([]);
const loading = ref(true);
const search = ref('');

const loadData = async () => {
  loading.value = true;
  try {
    projects.value = (await fetchAdminProjects()) as any[];
  } catch {
    projects.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

// 作品量级小，搜索直接在客户端过滤（名称/简介/技术栈）
const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return projects.value;
  return projects.value.filter((p) =>
    [p.name, p.description, p.techStack].some((v) => (v || '').toLowerCase().includes(keyword)),
  );
});

const parseTechStack = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const openCreateDialog = () => {
  useDialogOpen(ProjectDialog, {
    isEdit: false,
    onConfirm: async (formData: any) => {
      await createProject(formData);
      toast.success('作品已创建');
      loadData();
    },
  });
};

const openEditDialog = (project: any) => {
  useDialogOpen(ProjectDialog, {
    isEdit: true,
    initialData: project,
    onConfirm: async (formData: any) => {
      await updateProject(project.id, formData);
      toast.success('作品已更新');
      loadData();
    },
  });
};

const deleteProjectConfirm = async (id: number) => {
  if (!confirm('确定要删除这个作品吗？')) return;
  try {
    await deleteProject(id);
    toast.success('删除成功');
    loadData();
  } catch {
    toast.error('删除失败');
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- 页头 -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">作品管理</h1>
        <p class="mt-1 text-sm text-muted-foreground">管理和展示你的个人作品。</p>
      </div>
      <button
        @click="openCreateDialog"
        class="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus class="h-4 w-4" />
        新增作品
      </button>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="relative w-full max-w-xs">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          v-model="search"
          type="search"
          placeholder="搜索作品..."
          class="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="ml-auto text-sm text-muted-foreground">共 {{ filtered.length }} 个作品</div>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/40 border-b border-border">
            <tr class="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <th class="px-4 py-3">作品</th>
              <th class="px-4 py-3 w-24">链接</th>
              <th class="px-4 py-3 w-64">技术栈</th>
              <th class="px-4 py-3 w-20">排序</th>
              <th class="px-4 py-3 w-24">可见性</th>
              <th class="px-4 py-3 w-24 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="loading">
              <td colspan="6" class="px-4 py-10 text-center text-muted-foreground">
                <span class="inline-block h-5 w-5 border-2 border-muted border-t-primary rounded-full animate-spin align-middle mr-2" />
                加载中...
              </td>
            </tr>
            <tr v-else-if="!filtered.length">
              <td colspan="6" class="px-4 py-12 text-center text-muted-foreground">
                {{ search ? '未找到相关作品' : '暂无作品记录' }}
              </td>
            </tr>
            <tr v-for="project in filtered" :key="project.id" class="group hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    <img
                      v-if="project.coverImage"
                      :src="project.coverImage"
                      :alt="project.name"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div v-else class="h-full w-full flex items-center justify-center text-muted-foreground/50">
                      <FolderGit2 class="h-5 w-5" />
                    </div>
                  </div>
                  <div class="min-w-0 space-y-1">
                    <div class="font-medium text-foreground leading-snug truncate">{{ project.name }}</div>
                    <div class="text-xs text-muted-foreground line-clamp-1 max-w-[280px]" :title="project.description">
                      {{ project.description || '暂无简介' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <a
                    v-if="project.repoUrl"
                    :href="project.repoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="源码链接"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Github class="h-4 w-4" />
                  </a>
                  <a
                    v-if="project.demoUrl"
                    :href="project.demoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="在线预览"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <ExternalLink class="h-4 w-4" />
                  </a>
                  <span v-if="!project.repoUrl && !project.demoUrl" class="text-muted-foreground/50">—</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div v-if="parseTechStack(project.techStack).length" class="flex flex-wrap gap-1">
                  <span
                    v-for="tech in parseTechStack(project.techStack).slice(0, 4)"
                    :key="tech"
                    class="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-medium"
                  >
                    {{ tech }}
                  </span>
                  <span
                    v-if="parseTechStack(project.techStack).length > 4"
                    class="text-xs text-muted-foreground self-center"
                  >
                    +{{ parseTechStack(project.techStack).length - 4 }}
                  </span>
                </div>
                <span v-else class="text-muted-foreground/50">—</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-foreground font-medium">{{ project.sortOrder }}</span>
              </td>
              <td class="px-4 py-3">
                <span
                  v-if="project.isVisible"
                  class="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium"
                >
                  可见
                </span>
                <span
                  v-else
                  class="inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-xs font-medium"
                >
                  隐藏
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditDialog(project)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="编辑"
                  >
                    <Edit class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteProjectConfirm(project.id)"
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
