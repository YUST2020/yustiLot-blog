<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  initialData?: any
  isEdit?: boolean
}>()

const emit = defineEmits(['submit'])

const form = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  tags: '',
  isPublished: false,
  ...props.initialData,
  tags: props.initialData?.tags ? JSON.parse(props.initialData.tags).join(', ') : ''
})

const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    const payload = {
      ...form.value,
      tags: JSON.stringify(form.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean))
    }
    await emit('submit', payload)
  } finally {
    loading.value = false
  }
}

watch(() => form.value.title, (newVal) => {
  if (!props.isEdit && newVal) {
    form.value.slug = newVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6 max-w-4xl">
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="text-sm font-medium">标题</label>
        <input v-model="form.title" type="text" class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none" required />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium">Slug (URL)</label>
        <input v-model="form.slug" type="text" class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none" required />
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">摘要</label>
      <textarea v-model="form.excerpt" rows="3" class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">内容 (Markdown)</label>
      <textarea v-model="form.content" rows="15" class="w-full px-3 py-2 border rounded-md bg-background font-mono focus:ring-2 focus:ring-primary focus:outline-none" required></textarea>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="text-sm font-medium">封面图片 URL</label>
        <input v-model="form.coverImage" type="text" class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium">标签 (逗号分隔)</label>
        <input v-model="form.tags" type="text" class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Vue, Nuxt, Tech" />
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input v-model="form.isPublished" type="checkbox" id="published" class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
      <label for="published" class="text-sm font-medium">立即发布</label>
    </div>

    <div class="flex gap-4">
      <button type="submit" :disabled="loading" class="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
        {{ loading ? '保存中...' : '保存文章' }}
      </button>
      <button type="button" @click="$router.back()" class="px-6 py-2 border bg-background rounded-md font-medium hover:bg-secondary transition-colors">
        取消
      </button>
    </div>
  </form>
</template>
