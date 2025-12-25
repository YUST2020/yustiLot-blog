<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: posts } = await useFetch('/api/admin/posts')
const { user } = useUserSession()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">仪表盘</h1>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div class="p-6 bg-card border rounded-xl shadow-sm">
        <div class="text-sm font-medium text-muted-foreground">总文章数</div>
        <div class="text-3xl font-bold mt-2">{{ posts?.length || 0 }}</div>
      </div>
    </div>

    <div class="p-6 bg-card border rounded-xl shadow-sm">
      <h2 class="text-xl font-bold mb-4">欢迎回来, {{ user?.name }}</h2>
      <p class="text-muted-foreground">准备好发布新内容了吗？</p>
      <div class="mt-4">
        <NuxtLink to="/admin/posts/create" class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2">
          <span>✍️</span> 写文章
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
