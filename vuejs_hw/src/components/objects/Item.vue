<template>
  <div class="container mx-auto">
    <li class="flex items-center justify-between text-2xl border-b border-gray-300 py-4">
      <div class="flex items-center">
        <!-- 綁定checked屬性到object.checked -->
        <input class="m-2" type="checkbox" style="transform: scale(1.5);" v-model="object.checked">

        <!-- 根據object.checked的值動態添加line-through class -->
        <span :class="{ 'line-through': object.checked }">{{ object.title }}</span>
      </div>

      <button :data-objectid="object.id" @click="removeObject" class="btn btn-xs">
        <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 448 512">
          <path d="M163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3C140.6 6.8 151.7 0 163.8 0zM32 128H416L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32 128zM143 239c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"></path>
        </svg>
      </button>
    </li>
  </div>
</template>

<style>
  .line-through {
    text-decoration: line-through;
  }
</style>

<script setup>
import { defineProps, defineEmits } from "vue"

defineProps({
  object: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(["remove-object"])

const removeObject = (e) => {
  const btn = e.currentTarget
  const id = btn?.dataset.objectid
  if (id) {
    emits("remove-object", id)
  }
}
</script>

