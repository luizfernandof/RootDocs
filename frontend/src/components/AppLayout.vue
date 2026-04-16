<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useTheme } from 'vuetify'

const auth = useAuthStore()
const themeStore = useThemeStore()
const vuetifyTheme = useTheme()
const router = useRouter()
const route = useRoute()
const drawer = ref(null)

const categories = [
  { title: 'Redes', value: 'REDES', icon: 'mdi-web' },
  { title: 'Proxmox', value: 'PROXMOX', icon: 'mdi-server' },
  { title: 'Programação', value: 'PROGRAMACAO', icon: 'mdi-code-braces' },
  { title: 'Linux', value: 'LINUX', icon: 'mdi-linux' },
  { title: 'Segurança', value: 'SEGURANCA', icon: 'mdi-shield-lock' },
  { title: 'DevOps', value: 'DEVOPS', icon: 'mdi-cog' },
]

const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { q: searchQuery.value.trim() } })
  }
}

function selectCategory(value) {
  if (value) {
    router.push({ path: '/', query: { category: value } })
  } else {
    router.push('/')
  }
}

function clearSearch() {
  searchQuery.value = ''
  router.push('/')
}

function toggleTheme() {
  themeStore.toggle()
  vuetifyTheme.change(themeStore.theme)
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <!-- Sidebar -->
  <v-navigation-drawer v-model="drawer" :permanent="$vuetify.display.mdAndUp" :temporary="!$vuetify.display.mdAndUp" width="260">
    <!-- Logo -->
    <div class="d-flex align-center pa-4 ga-3">
      <v-icon size="28" color="primary">mdi-folder-text</v-icon>
      <span class="text-h6 font-weight-bold">RootDocs</span>
    </div>

    <v-divider />

    <!-- Search -->
    <div class="px-3 pt-3">
      <v-text-field
        v-model="searchQuery"
        density="compact"
        variant="outlined"
        placeholder="Buscar..."
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        @keyup.enter="handleSearch"
        @click:clear="clearSearch"
      />
    </div>

    <!-- Navigation -->
    <v-list density="compact" nav class="px-2 mt-2">
      <v-list-item
        prepend-icon="mdi-file-document-multiple"
        title="Todos os posts"
        :active="route.path === '/' && !route.query.q && !route.query.category"
        @click="selectCategory(null)"
      />

      <v-list-subheader class="mt-2">Categorias</v-list-subheader>

      <v-list-item
        v-for="cat in categories"
        :key="cat.value"
        :prepend-icon="cat.icon"
        :title="cat.title"
        :active="route.query.category === cat.value"
        @click="selectCategory(cat.value)"
      />

      <template v-if="auth.isEditor">
        <v-list-subheader class="mt-2">Administração</v-list-subheader>
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Usuários"
          :active="route.path === '/users'"
          @click="router.push('/users')"
        />
      </template>
    </v-list>

    <!-- Bottom -->
    <template v-slot:append>
      <v-divider />
      <div class="pa-3">
        <v-btn v-if="auth.isEditor" to="/posts/new" color="primary" block class="mb-2">
          <v-icon start>mdi-plus</v-icon>
          Novo Post
        </v-btn>
        <v-btn v-if="auth.isEditor && route.path === '/users'" color="primary" variant="outlined" block class="mb-2" @click="router.push('/users?create=1')">
          <v-icon start>mdi-account-plus</v-icon>
          Novo Usuário
        </v-btn>
        <div class="d-flex align-center justify-space-between px-1 pt-1">
          <span class="text-body-2 text-medium-emphasis">{{ auth.username }}</span>
          <div class="d-flex ga-1">
            <v-btn icon size="x-small" variant="text" @click="toggleTheme">
              <v-icon size="18">{{ themeStore.theme === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
            </v-btn>
            <v-btn icon size="x-small" variant="text" color="error" @click="handleLogout">
              <v-icon size="18">mdi-logout</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </template>
  </v-navigation-drawer>

  <!-- Top bar (mobile) -->
  <v-app-bar elevation="0" v-if="!$vuetify.display.mdAndUp">
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-toolbar-title class="font-weight-bold">
      <v-icon color="primary" class="mr-1">mdi-folder-text</v-icon>
      RootDocs
    </v-toolbar-title>
  </v-app-bar>

  <!-- Content -->
  <v-main>
    <router-view />
  </v-main>
</template>