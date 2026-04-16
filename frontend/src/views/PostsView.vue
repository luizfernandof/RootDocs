<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api/axios'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const posts = ref([])
const loading = ref(true)

const categories = {
  REDES: 'Redes',
  PROXMOX: 'Proxmox',
  PROGRAMACAO: 'Programação',
  LINUX: 'Linux',
  SEGURANCA: 'Segurança',
  DEVOPS: 'DevOps',
}

async function fetchPosts() {
  loading.value = true
  try {
    const { data } = route.query.q
      ? await api.get('/posts/search', { params: { q: route.query.q } })
      : route.query.category
        ? await api.get(`/posts/category/${route.query.category}`)
        : await api.get('/posts')
    posts.value = data
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
watch(() => route.query, fetchPosts)
</script>

<template>
  <v-container class="py-8" style="max-width: 800px;">
    <h1 class="text-h5 font-weight-bold mb-6">
      <span v-if="route.query.q">Busca: "{{ route.query.q }}"</span>
      <span v-else-if="route.query.category">{{ categories[route.query.category] || route.query.category }}</span>
      <span v-else>Todos os posts</span>
    </h1>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-6" />

    <div v-else-if="posts.length === 0" class="text-center text-medium-emphasis py-16">
      <v-icon size="64" class="mb-4">mdi-text-box-search-outline</v-icon>
      <p>Nenhum post encontrado.</p>
    </div>

    <div v-else>
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </v-container>
</template>