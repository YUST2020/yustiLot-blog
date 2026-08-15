<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Github, ExternalLink, FolderGit2 } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import ParticleBackground from '@/components/ParticleBackground.vue';
import { fetchProjects } from '@/api/projects';

const projects = ref<any[]>([]);
const loading = ref(true);

// tech_stack 为 JSON 字符串数组（与 posts.tags 同一契约），解析失败按空处理
const parseTechStack = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((t) => typeof t === 'string') : [];
  } catch {
    return [];
  }
};

onMounted(async () => {
  try {
    projects.value = (await fetchProjects()) as any[];
  } catch {
    projects.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <ParticleBackground variant="green">
    <!-- Main Content Card -->
    <div
      class="bg-background/60 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 min-h-[80vh]"
    >
      <!-- Header -->
      <div class="mb-10 text-center space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
          个人作品
        </h1>
        <p class="text-white/90 text-lg max-w-2xl mx-auto font-medium drop-shadow-sm">
          我构建过的项目与实践，那些让想法落地的代码。
        </p>
      </div>

      <!-- 加载骨架 -->
      <div v-if="loading" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-72 rounded-2xl bg-muted/50 animate-pulse" />
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!projects.length"
        class="flex flex-col items-center justify-center py-24 gap-4 text-white/80"
      >
        <FolderGit2 class="w-12 h-12 opacity-60" />
        <p class="text-lg font-medium">暂无作品，敬请期待。</p>
      </div>

      <!-- 卡片墙 -->
      <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="project in projects"
          :key="project.id"
          class="group flex flex-col bg-card/50 hover:bg-card border border-border/50 hover:border-primary/20 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
        >
          <!-- 封面 -->
          <div class="aspect-[16/10] overflow-hidden relative">
            <img
              v-if="project.coverImage"
              :src="project.coverImage"
              :alt="project.name"
              class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary text-muted-foreground"
            >
              <FolderGit2 class="w-12 h-12 opacity-30" />
            </div>
          </div>

          <!-- 内容 -->
          <div class="flex-1 flex flex-col gap-3 p-5">
            <div class="flex items-start justify-between gap-3">
              <h3
                class="font-semibold text-lg text-foreground leading-snug group-hover:text-primary transition-colors"
              >
                {{ project.name }}
              </h3>
              <div class="flex items-center gap-1 shrink-0 pt-0.5">
                <a
                  v-if="project.repoUrl"
                  :href="project.repoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="查看源码"
                  aria-label="查看源码"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Github class="w-4 h-4" />
                </a>
                <a
                  v-if="project.demoUrl"
                  :href="project.demoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="在线预览"
                  aria-label="在线预览"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>
              </div>
            </div>
            <p class="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
              {{ project.description || '暂无简介。' }}
            </p>
            <div v-if="parseTechStack(project.techStack).length" class="flex flex-wrap gap-1.5">
              <Badge
                v-for="tech in parseTechStack(project.techStack)"
                :key="tech"
                variant="secondary"
                class="text-xs font-normal"
              >
                {{ tech }}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ParticleBackground>
</template>
