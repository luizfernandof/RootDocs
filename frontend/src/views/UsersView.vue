<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../api/axios'
import { useConfirm } from '../composables/useConfirm'

const router = useRouter()
const route = useRoute()
const { confirm } = useConfirm()

const users = ref([])
const loading = ref(true)
const dialog = ref(false)
const dialogTitle = ref('Novo Usuário')
const editingId = ref(null)
const saving = ref(false)
const error = ref('')

const defaultForm = { username: '', password: '', role: 'ROLE_LEITOR' }
const form = ref({ ...defaultForm })

const roleLabels = {
  ROLE_LEITOR: 'Leitor',
  ROLE_EDITOR: 'Editor',
}

const roleItems = [
  { title: 'Leitor', value: 'ROLE_LEITOR' },
  { title: 'Editor', value: 'ROLE_EDITOR' },
]

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await api.get('/users')
    users.value = data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  dialogTitle.value = 'Novo Usuário'
  form.value = { ...defaultForm }
  error.value = ''
  dialog.value = true
}

function openEdit(user) {
  editingId.value = user.id
  dialogTitle.value = 'Editar Usuário'
  form.value = { username: user.username, password: '', role: user.role }
  error.value = ''
  dialog.value = true
}

async function handleSave() {
  error.value = ''
  saving.value = true
  try {
    if (editingId.value) {
      const payload = { ...form.value }
      if (!payload.password) delete payload.password
      await api.put(`/users/${editingId.value}`, payload)
    } else {
      await api.post('/users', form.value)
    }
    dialog.value = false
    await fetchUsers()
  } catch (err) {
    error.value = err.response?.data?.detail || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

async function handleDelete(user) {
  const ok = await confirm({
    title: 'Excluir usuário',
    message: `Tem certeza que deseja excluir o usuário "${user.username}"?`,
    confirmText: 'Excluir',
  })
  if (!ok) return
  await api.delete(`/users/${user.id}`)
  await fetchUsers()
}

onMounted(() => {
  fetchUsers().then(() => {
    if (route.query.create === '1') {
      openCreate()
      router.replace('/users')
    }
  })
})
</script>

<template>
  <v-container class="py-8" style="max-width: 800px;">
    <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="router.push('/')" class="mb-4">
      Voltar
    </v-btn>

    <h1 class="text-h5 font-weight-bold mb-6">Gerência de Usuários</h1>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-6" />

    <div v-else-if="users.length === 0" class="text-center text-medium-emphasis py-16">
      <v-icon size="64" class="mb-4">mdi-account-off-outline</v-icon>
      <p>Nenhum usuário cadastrado.</p>
    </div>

    <div v-else>
      <v-card
        v-for="user in users"
        :key="user.id"
        variant="flat"
        class="mb-3 hover:bg-surface-variant transition"
      >
        <v-card-text class="py-4 d-flex align-center justify-space-between">
          <div>
            <v-chip
              size="x-small"
              variant="outlined"
              :color="user.role === 'ROLE_EDITOR' ? 'primary' : 'secondary'"
              class="mb-2"
            >
              {{ roleLabels[user.role] || user.role }}
            </v-chip>
            <div class="text-body-1 font-weight-medium">{{ user.username }}</div>
          </div>
          <div class="d-flex ga-2">
            <v-btn variant="outlined" size="small" prepend-icon="mdi-pencil" @click="openEdit(user)">Editar</v-btn>
            <v-btn variant="outlined" size="small" color="error" prepend-icon="mdi-delete" @click="handleDelete(user)">Excluir</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title class="text-h6">{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSave">
            <v-text-field v-model="form.username" label="Usuário" variant="outlined" class="mb-4" />
            <v-text-field
              v-model="form.password"
              :label="editingId ? 'Nova senha (deixe vazio para manter)' : 'Senha'"
              type="password"
              variant="outlined"
              class="mb-4"
            />
            <v-select
              v-model="form.role"
              :items="roleItems"
              item-title="title"
              item-value="value"
              label="Role"
              variant="outlined"
            />

            <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-4">{{ error }}</v-alert>

            <div class="d-flex ga-3 mt-6">
              <v-btn type="submit" :loading="saving" color="primary">Salvar</v-btn>
              <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>