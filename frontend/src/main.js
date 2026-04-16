import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './assets/main.css'
import { createVuetify } from 'vuetify'
import { config as mdConfig } from 'md-editor-v3'

mdConfig({
  editorConfig: {
    languageUserDefined: {
      copyCode: {
        text: 'Copiar',
        successTips: 'Copiado!',
        failTips: 'Falha ao copiar!'
      }
    }
  }
})

const vuetify = createVuetify({
  theme: {
    defaultTheme: localStorage.getItem('theme') || 'dark',
    themes: {
      light: {
        colors: {
          primary: '#6366f1',
          secondary: '#818cf8',
          background: '#ffffff',
          surface: '#f8f9fa',
          'surface-variant': '#f1f3f5',
        }
      },
      dark: {
        colors: {
          primary: '#818cf8',
          secondary: '#6366f1',
          background: '#0f1117',
          surface: '#1a1d27',
          'surface-variant': '#242836',
        }
      }
    }
  }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')