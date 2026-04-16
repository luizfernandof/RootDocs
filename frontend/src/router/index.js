import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Posts',
    component: () => import('../views/PostsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/new',
    name: 'NewPost',
    component: () => import('../views/PostEditorView.vue'),
    meta: { requiresAuth: true, requiresEditor: true }
  },
  {
    path: '/posts/:id/edit',
    name: 'EditPost',
    component: () => import('../views/PostEditorView.vue'),
    meta: { requiresAuth: true, requiresEditor: true }
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/UsersView.vue'),
    meta: { requiresAuth: true, requiresEditor: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login' }
  }
  if (to.meta.requiresEditor && !auth.isEditor) {
    return { name: 'Posts' }
  }
})

export default router