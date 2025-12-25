<script setup lang="ts">
import PostForm from '~/components/admin/PostForm.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const onSubmit = async (data: any) => {
  await $fetch('/api/admin/posts', {
    method: 'POST',
    body: data
  })
  navigateTo('/admin/posts')
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold tracking-tight">新建文章</h1>
    <PostForm @submit="onSubmit" />
  </div>
</template>
