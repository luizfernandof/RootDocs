<script setup>
import { defineAsyncComponent } from 'vue'
import 'md-editor-v3/lib/preview.css'
import { useThemeStore } from '../stores/theme'

const MdPreview = defineAsyncComponent(() => import('md-editor-v3').then(m => m.MdPreview))

defineProps({
  content: { type: String, required: true }
})

const themeStore = useThemeStore()
</script>

<template>
  <div class="md-preview-container" :class="themeStore.theme === 'dark' ? 'md-editor-dark' : ''">
    <MdPreview :model-value="content" :theme="themeStore.theme" language="en-US" />
  </div>
</template>

<style scoped>
.md-preview-container {
  width: 100%;
  overflow-wrap: break-word;
}
</style>