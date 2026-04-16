<script setup>
defineProps({
  post: { type: Object, required: true }
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <router-link :to="`/posts/${post.id}`" style="text-decoration: none;">
    <v-card variant="flat" class="mb-3 hover:bg-surface-variant transition">
      <v-card-text class="py-4">
        <v-chip size="x-small" variant="outlined" color="primary" class="mb-2">{{ post.category }}</v-chip>
        <div class="text-body-1 font-weight-medium">{{ post.title }}</div>
        <div class="text-caption text-medium-emphasis mt-1">{{ post.author }} &middot; {{ formatDate(post.createdAt) }}</div>
      </v-card-text>
    </v-card>
  </router-link>
</template>