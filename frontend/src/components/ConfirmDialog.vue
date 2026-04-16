<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Confirmar' },
  message: { type: String, default: 'Tem certeza?' },
  confirmText: { type: String, default: 'Confirmar' },
  confirmColor: { type: String, default: 'error' },
  maxWidth: { type: [String, Number], default: 400 }
})

const emit = defineEmits(['update:modelValue', 'confirm'])
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :max-width="maxWidth">
    <v-card>
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn variant="flat" :color="confirmColor" @click="emit('confirm'); emit('update:modelValue', false)">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>