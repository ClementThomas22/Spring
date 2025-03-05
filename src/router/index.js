import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import StudentDashboard from '@/views/StudentDashboard.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { public: true }
  },
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/students',
    name: 'StudentList',
    component: () => import('@/components/student/StudentList.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/students/:id',
    name: 'StudentDetails',
    component: () => import('@/components/student/StudentDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/academic-years',
    name: 'AcademicYearList',
    component: () => import('@/components/academicYear/AcademicYearList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/academic-years/:id',
    name: 'AcademicYearDetails',
    component: () => import('@/components/academicYear/AcademicYearDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'MessageList',
    component: () => import('@/components/message/MessageList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/core/student-info/:id',
    name: 'StudentInfo',
    component: () => import('@/components/core/StudentInfo.vue'),
    meta: { requiresAuth: true }
  },
  // Catch all route to redirect to home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const userRole = store.getters['auth/userRole']
  
  // Allow public routes and routes that don't require authentication
  if (to.matched.some(record => record.meta.public) || !to.meta.requiresAuth) {
    next()
    return
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires specific role
  if (to.meta.role && to.meta.role !== userRole) {
    next('/')
    return
  }
  
  next()
})

export default router
