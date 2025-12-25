<script setup lang="ts">
import { Edit, Trash2, Plus } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: posts, refresh } = await useFetch('/api/admin/posts')

const deletePost = async (id: number) => {
  if (!confirm('确定要删除这篇文章吗？')) return
  await $fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">文章管理</h1>
      <NuxtLink to="/admin/posts/create" class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
        <Plus class="w-4 h-4" /> 新建文章
      </NuxtLink>
    </div>

    <div class="border rounded-xl overflow-hidden bg-card shadow-sm">
      <table class="w-full text-sm text-left">
        <thead class="bg-muted/50 text-muted-foreground font-medium border-b">
          <tr>
            <th class="px-6 py-4">标题</th>
            <th class="px-6 py-4">状态</th>
            <th class="px-6 py-4">发布时间</th>
            <th class="px-6 py-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="post in posts" :key="post.id" class="hover:bg-muted/50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ post.title }}</td>
            <td class="px-6 py-4">
              <span v-if="post.isPublished" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">已发布</span>
              <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">草稿</span>
            </td>
            <td class="px-6 py-4 text-muted-foreground">{{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-' }}</td>
            <td class="px-6 py-4 text-right space-x-2">
              <NuxtLink :to="`/admin/posts/${post.id}`" class="inline-flex p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <Edit class="w-4 h-4" />
              </NuxtLink>
              <button @click="deletePost(post.id)" class="inline-flex p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <tr v-if="!posts?.length">
            <td colspan="4" class="px-6 py-12 text-center text-muted-foreground">暂无文章</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
