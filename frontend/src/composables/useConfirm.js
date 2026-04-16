import { ref, readonly } from 'vue'

const visible = ref(false)
const options = ref({})
let _resolve = null

function confirm(opts = {}) {
  options.value = {
    title: opts.title || 'Confirmar',
    message: opts.message || 'Tem certeza?',
    confirmText: opts.confirmText || 'Confirmar',
    confirmColor: opts.confirmColor || 'error'
  }
  visible.value = true
  return new Promise(resolve => { _resolve = resolve })
}

function onConfirm() {
  visible.value = false
  if (_resolve) _resolve(true)
  _resolve = null
}

function onCancel() {
  visible.value = false
  if (_resolve) _resolve(false)
  _resolve = null
}

export function useConfirm() {
  return { confirm }
}

export function useConfirmState() {
  return { visible: readonly(visible), options, onConfirm, onCancel }
}