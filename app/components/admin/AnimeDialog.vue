<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import AnimeForm from '~/components/admin/AnimeForm.vue'

const props = defineProps<{
  // Props passed by useDialogOpen
  modelValue?: boolean
  // Props for AnimeForm
  initialData?: any
  isEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: any): void
  (e: 'cancel'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleSubmit = (data: any) => {
  emit('confirm', data)
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? '编辑番剧' : '新增番剧' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? '修改番剧记录信息。' : '添加一部新看过的番剧记录。' }}
        </DialogDescription>
      </DialogHeader>
      
      <AnimeForm 
        :initial-data="initialData" 
        :is-edit="isEdit" 
        @submit="handleSubmit" 
        @cancel="$emit('cancel')"
      />
    </DialogContent>
  </Dialog>
</template>
