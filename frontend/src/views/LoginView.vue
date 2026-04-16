<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useTheme } from 'vuetify'

const auth = useAuthStore()
const themeStore = useThemeStore()
const vuetifyTheme = useTheme()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ username: username.value, password: password.value })
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Credenciais inválidas'
  } finally {
    loading.value = false
  }
}

function toggleTheme() {
  themeStore.toggle()
  vuetifyTheme.change(themeStore.theme)
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="fill-height">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="6" md="4">
            <v-card rounded="lg" class="pa-2">
              <v-card-text class="text-center">
                <div class="d-flex justify-end mb-2">
                  <v-btn icon size="small" variant="text" @click="toggleTheme">
                    <v-icon>{{ themeStore.theme === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
                  </v-btn>
                </div>
                <v-icon size="48" color="primary" class="mb-2">mdi-folder-text</v-icon>
                <div class="text-h5 font-weight-bold">RootDocs</div>
                <div class="text-body-2 text-medium-emphasis mb-6">Base de conhecimento</div>

                <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4 text-left">{{ error }}</v-alert>

                <v-form @submit.prevent="handleLogin">
                  <v-text-field v-model="username" label="Usuário" prepend-inner-icon="mdi-account" variant="outlined" density="comfortable" class="mb-3" />
                  <v-text-field v-model="password" label="Senha" type="password" prepend-inner-icon="mdi-lock" variant="outlined" density="comfortable" class="mb-4" />

                  <v-btn type="submit" :loading="loading" color="primary" block size="large" rounded="lg">
                    Entrar
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>