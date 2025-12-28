<script setup lang="ts">
import AnimeForm from '~/components/admin/AnimeForm.vue'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id

const { data: anime } = await useFetch(`/api/admin/animes/${id}`)

const updateAnime = async (payload: any) => {
  try {
    await $fetch(`/api/admin/animes/${id}`, {
      method: 'PUT',
      body: payload
    })
    toast.success('番剧记录已更新')
    navigateTo('/admin/animes')
  } catch (error) {
    toast.error('更新失败')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">编辑番剧</h1>
      <p class="text-muted-foreground mt-1">修改番剧记录信息。</p>
    </div>

    <AnimeForm v-if="anime" :initial-data="anime" is-edit @submit="updateAnime" />
  </div>
</template>
