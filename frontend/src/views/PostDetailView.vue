<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/axios'
import { useAuthStore } from '../stores/auth'
import { useConfirm } from '../composables/useConfirm'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { confirm } = useConfirm()

const post = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get(`/posts/${route.params.id}`)
    post.value = data
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.push('/')
}

async function handleDelete() {
  const ok = await confirm({
    title: 'Excluir post',
    message: 'Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.',
    confirmText: 'Excluir'
  })
  if (!ok) return
  await api.delete(`/posts/${route.params.id}`)
  router.push('/')
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <v-container class="py-8" style="max-width: 800px;">
    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <article v-else-if="post">
      <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="goBack" class="mb-4">
        Voltar
      </v-btn>

      <header class="mb-8">
        <v-chip size="small" variant="outlined" color="primary" class="mb-3">{{ post.category }}</v-chip>
        <h1 class="text-h4 font-weight-bold">{{ post.title }}</h1>
        <p class="text-body-2 text-medium-emphasis mt-2">{{ post.author }} &middot; {{ formatDate(post.createdAt) }}</p>
      </header>

      <MarkdownRenderer :content="post.content" />

      <div v-if="auth.isEditor" class="mt-10 d-flex ga-2">
        <v-btn variant="outlined" size="small" prepend-icon="mdi-pencil" :to="`/posts/${post.id}/edit`">Editar</v-btn>
        <v-btn variant="outlined" size="small" color="error" prepend-icon="mdi-delete" @click="handleDelete">Excluir</v-btn>
      </div>
    </article>
  </v-container>
</template>