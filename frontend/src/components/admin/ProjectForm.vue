<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  initialData?: any;
  isEdit?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

// tech_stack 存储为 JSON 字符串数组，表单内以逗号分隔编辑，提交时序列化
const parseTechStack = (raw: string | null): string => {
  if (!raw) return '';
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.join(', ') : '';
  } catch {
    return '';
  }
};

const form = ref({
  name: props.initialData?.name || '',
  description: props.initialData?.description || '',
  coverImage: props.initialData?.coverImage || '',
  repoUrl: props.initialData?.repoUrl || '',
  demoUrl: props.initialData?.demoUrl || '',
  techStackInput: parseTechStack(props.initialData?.techStack),
  sortOrder: String(props.initialData?.sortOrder ?? 0),
  isVisible: props.initialData?.isVisible ?? true,
});

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;
  try {
    const tags = form.value.techStackInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    await emit('submit', {
      name: form.value.name.trim(),
      description: form.value.description.trim() || null,
      coverImage: form.value.coverImage.trim() || null,
      repoUrl: form.value.repoUrl.trim() || null,
      demoUrl: form.value.demoUrl.trim() || null,
      techStack: JSON.stringify(tags),
      sortOrder: Number(form.value.sortOrder) || 0,
      isVisible: form.value.isVisible,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <!-- 名称 / 封面 -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium text-foreground">作品名称</label>
        <input
          id="name"
          v-model="form.name"
          required
          maxlength="255"
          placeholder="请输入作品名称"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="space-y-2">
        <label for="coverImage" class="text-sm font-medium text-foreground">封面图片 URL（可选，16:10）</label>
        <input
          id="coverImage"
          v-model="form.coverImage"
          maxlength="512"
          placeholder="https://..."
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
    </div>

    <!-- 简介 -->
    <div class="space-y-2">
      <label for="description" class="text-sm font-medium text-foreground">作品简介</label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        maxlength="1000"
        placeholder="介绍这个作品是做什么的、解决了什么问题..."
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors resize-y"
      />
    </div>

    <!-- 源码 / 预览链接 -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <label for="repoUrl" class="text-sm font-medium text-foreground">源码链接（可选）</label>
        <input
          id="repoUrl"
          v-model="form.repoUrl"
          maxlength="512"
          placeholder="https://github.com/..."
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="space-y-2">
        <label for="demoUrl" class="text-sm font-medium text-foreground">在线预览链接（可选）</label>
        <input
          id="demoUrl"
          v-model="form.demoUrl"
          maxlength="512"
          placeholder="https://..."
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
    </div>

    <!-- 技术栈 -->
    <div class="space-y-2">
      <label for="techStack" class="text-sm font-medium text-foreground">技术栈（逗号分隔）</label>
      <input
        id="techStack"
        v-model="form.techStackInput"
        placeholder="Vue3, NestJS, Prisma"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
      />
      <p class="text-xs text-muted-foreground">例如：Vue3, TypeScript, Tailwind CSS</p>
    </div>

    <!-- 排序 / 可见性 -->
    <div class="grid gap-6 md:grid-cols-2 md:items-end">
      <div class="space-y-2">
        <label for="sortOrder" class="text-sm font-medium text-foreground">排序权重（越大越靠前）</label>
        <input
          id="sortOrder"
          v-model="form.sortOrder"
          type="number"
          min="0"
          step="1"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="flex items-center gap-3 h-10">
        <input
          id="isVisible"
          v-model="form.isVisible"
          type="checkbox"
          class="h-4 w-4 rounded border-input bg-background accent-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <label for="isVisible" class="text-sm font-medium text-foreground cursor-pointer select-none">
          前台可见
        </label>
      </div>
    </div>

    <!-- 操作 -->
    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="loading"
        class="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {{ loading ? '保存中...' : '保存作品' }}
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="inline-flex items-center justify-center h-10 px-6 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        取消
      </button>
    </div>
  </form>
</template>
