<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';
import AnimeForm from '@/components/admin/AnimeForm.vue';

const props = defineProps<{
  // 由 useDialogOpen 传入
  modelValue?: boolean;
  // AnimeForm 用
  initialData?: any;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', data: any): void;
  (e: 'cancel'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const handleSubmit = (data: any) => {
  emit('confirm', data);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
        <!-- 遮罩 -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('update:modelValue', false)"
        />
        <!-- 卡片 -->
        <div
          class="relative z-10 w-full max-w-3xl my-8 rounded-lg border border-border bg-card shadow-lg"
          @pointer-down-outside="$emit('update:modelValue', false)"
        >
          <!-- 头部 -->
          <div class="flex items-start justify-between gap-4 px-6 py-4 border-b border-border">
            <div>
              <h2 class="text-lg font-semibold tracking-tight">
                {{ isEdit ? '编辑番剧' : '新增番剧' }}
              </h2>
              <p class="mt-0.5 text-sm text-muted-foreground">
                {{ isEdit ? '修改番剧记录信息。' : '添加一部新看过的番剧记录。' }}
              </p>
            </div>
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              @click="$emit('cancel')"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <!-- 内容 -->
          <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <AnimeForm
              :initial-data="initialData"
              :is-edit="isEdit"
              @submit="handleSubmit"
              @cancel="$emit('cancel')"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
