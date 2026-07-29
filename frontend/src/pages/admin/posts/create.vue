<script setup lang="ts">
import { useRouter } from 'vue-router';
import PostForm from '@/components/admin/PostForm.vue';
import { createPost } from '@/api/posts';

const router = useRouter();

const onSubmit = async (data: any) => {
  await createPost(data);
  router.push('/admin/posts');
};
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold tracking-tight">新建文章</h1>
    <PostForm @submit="onSubmit" />
  </div>
</template>
