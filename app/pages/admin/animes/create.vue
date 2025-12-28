<script setup lang="ts">
import AnimeForm from '~/components/admin/AnimeForm.vue'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const createAnime = async (payload: any) => {
  try {
    await $fetch('/api/admin/animes', {
      method: 'POST',
      body: payload
    })
    toast.success('番剧记录已创建')
    navigateTo('/admin/animes')
  } catch (error) {
    toast.error('创建失败')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">新增番剧</h1>
      <p class="text-muted-foreground mt-1">添加一部新看过的番剧记录。</p>
    </div>

    <AnimeForm @submit="createAnime" />
  </div>
</template>
