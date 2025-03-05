import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DogListView from '@/views/Dogs/DogListView.vue'
import StudentListView from '@/views/Students/StudentListView.vue'
import AcademicYearListView from '@/views/AcademicYears/AcademicYearListView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/dogs',
        name: 'Dogs',
        component: DogListView
    },
    {
        path: '/students',
        name: 'Students',
        component: StudentListView
    },
    {
        path: '/academic-years',
        name: 'AcademicYears',
        component: AcademicYearListView
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router