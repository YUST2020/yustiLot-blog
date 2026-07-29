<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  initialData?: any;
  isEdit?: boolean;
}>();

const emit = defineEmits(['submit']);

const form = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  isPublished: false,
  ...props.initialData,
  tags: props.initialData?.tags ? JSON.parse(props.initialData.tags).join(', ') : '',
});

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;
  try {
    const payload = {
      ...form.value,
      tags: JSON.stringify(
        form.value.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean),
      ),
    };
    await emit('submit', payload);
  } finally {
    loading.value = false;
  }
};

watch(
  () => form.value.title,
  (newVal) => {
    if (!props.isEdit && newVal) {
      form.value.slug = newVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
  },
);
</script>

<template>
  <form @submit.prevent="onSubmit" class="max-w-4xl space-y-6">
    <!-- 标题 / Slug -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">标题</label>
        <input
          v-model="form.title"
          type="text"
          required
          placeholder="输入文章标题"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Slug (URL)</label>
        <input
          v-model="form.slug"
          type="text"
          required
          placeholder="url-slug"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors font-mono"
        />
      </div>
    </div>

    <!-- 摘要 -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">摘要</label>
      <textarea
        v-model="form.excerpt"
        rows="3"
        placeholder="一句话概括文章内容"
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors resize-y"
      />
    </div>

    <!-- 内容 -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">内容 (Markdown)</label>
      <textarea
        v-model="form.content"
        rows="15"
        required
        placeholder="# 在此输入 Markdown 内容"
        class="flex min-h-[320px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors resize-y font-mono leading-relaxed"
      />
    </div>

    <!-- 封面 / 标签 -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">封面图片 URL</label>
        <input
          v-model="form.coverImage"
          type="text"
          placeholder="https://..."
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">标签 (逗号分隔)</label>
        <input
          v-model="form.tags"
          type="text"
          placeholder="Vue, Nuxt, Tech"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
    </div>

    <!-- 发布开关 -->
    <label
      for="published"
      class="flex items-center gap-3 cursor-pointer select-none w-fit"
    >
      <input
        v-model="form.isPublished"
        type="checkbox"
        id="published"
        class="h-4 w-4 rounded border-input text-primary focus:ring-ring accent-primary"
      />
      <span class="text-sm font-medium text-foreground">立即发布</span>
    </label>

    <!-- 操作 -->
    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="loading"
        class="inline-flex items-center justify-center h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {{ loading ? '保存中...' : '保存文章' }}
      </button>
      <button
        type="button"
        @click="$router.back()"
        class="inline-flex items-center justify-center h-10 px-5 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        取消
      </button>
    </div>
  </form>
</template>
