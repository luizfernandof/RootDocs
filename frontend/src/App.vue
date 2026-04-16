<script setup>
import { useAuthStore } from './stores/auth'
import AppLayout from './components/AppLayout.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useConfirmState } from './composables/useConfirm'

const auth = useAuthStore()
const { visible, options, onConfirm, onCancel } = useConfirmState()
</script>

<template>
  <v-app>
    <AppLayout v-if="auth.isAuthenticated" />
    <router-view v-else />

    <ConfirmDialog
      :model-value="visible"
      @update:model-value="(v) => { if (!v) onCancel() }"
      :title="options.title"
      :message="options.message"
      :confirm-text="options.confirmText"
      :confirm-color="options.confirmColor"
      @confirm="onConfirm"
    />
  </v-app>
</template>