<script setup>
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/axios'
import { useThemeStore } from '../stores/theme'
import 'md-editor-v3/lib/style.css'

const MdEditor = defineAsyncComponent(() => import('md-editor-v3').then(m => m.MdEditor))
const MdPreview = defineAsyncComponent(() => import('md-editor-v3').then(m => m.MdPreview))

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const isEditing = computed(() => !!route.params.id)
const saving = ref(false)
const error = ref('')
const previewMode = ref(false)

const form = ref({
  title: '',
  category: 'REDES',
  content: ''
})

const categories = [
  { title: 'Redes', value: 'REDES' },
  { title: 'Proxmox', value: 'PROXMOX' },
  { title: 'Programação', value: 'PROGRAMACAO' },
  { title: 'Linux', value: 'LINUX' },
  { title: 'Segurança', value: 'SEGURANCA' },
  { title: 'DevOps', value: 'DEVOPS' },
]

onMounted(async () => {
  if (isEditing.value) {
    try {
      const { data } = await api.get(`/posts/${route.params.id}`)
      form.value.title = data.title
      form.value.category = data.category
      form.value.content = data.content
    } catch {
      error.value = 'Post não encontrado.'
    }
  }
})

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/posts/${route.params.id}`, form.value)
    } else {
      await api.post('/posts', form.value)
    }
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-container class="py-8" style="max-width: 960px;">
    <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="router.push('/')" class="mb-4">
      Voltar
    </v-btn>

    <h1 class="text-h5 font-weight-bold mb-6">{{ isEditing ? 'Editar post' : 'Novo post' }}</h1>

    <v-form @submit.prevent="handleSubmit">
      <v-text-field v-model="form.title" label="Título" variant="outlined" class="mb-4" />

      <v-select v-model="form.category" :items="categories" item-title="title" item-value="value" label="Categoria" variant="outlined" class="mb-4" />

      <div class="d-flex align-center justify-space-between mb-2">
        <label class="text-body-2 font-weight-medium">Conteúdo (Markdown)</label>
        <v-btn-toggle v-model="previewMode" density="compact" variant="outlined" divided>
          <v-btn :value="false" size="small"><v-icon start>mdi-pencil</v-icon>Editar</v-btn>
          <v-btn :value="true" size="small"><v-icon start>mdi-eye</v-icon>Preview</v-btn>
        </v-btn-toggle>
      </div>

      <MdEditor
        v-if="!previewMode"
        v-model="form.content"
        language="en-US"
        :theme="themeStore.theme"
        :toolbarsExclude="['github', 'htmlPreview', 'catalog']"
        style="height: 450px;"
      />
      <v-card v-else variant="outlined" class="markdown-preview-card pa-5 overflow-y-auto" :class="themeStore.theme === 'dark' ? 'md-editor-dark' : ''" style="min-height: 450px;">
        <MdPreview :model-value="form.content" :theme="themeStore.theme" language="en-US" />
      </v-card>

      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-4">{{ error }}</v-alert>

      <div class="d-flex ga-3 mt-6">
        <v-btn type="submit" :loading="saving" color="primary" size="large">
          <v-icon start>mdi-content-save</v-icon>
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </v-btn>
        <v-btn variant="text" size="large" @click="router.push('/')">Cancelar</v-btn>
      </div>
    </v-form>
  </v-container>
</template>