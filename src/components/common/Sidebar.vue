<template>
  <div class="sidebar bg-light">
    <div class="d-flex flex-column p-3">
      <ul class="nav nav-pills flex-column mb-auto">
        <!-- Menu Étudiant -->
        <li v-if="!isAdmin" class="nav-item mb-2">
          <router-link to="/student-dashboard" class="nav-link" :class="{ 'active': isActive('/student-dashboard') }">
            Tableau de bord
          </router-link>
        </li>
        
        <li v-if="!isAdmin" class="nav-item mb-2">
          <router-link :to="`/students/${user?.studentNumber}`" class="nav-link" :class="{ 'active': isActive(`/students/${user?.studentNumber}`) }">
            Mon profil
          </router-link>
        </li>
        
        <li v-if="!isAdmin" class="nav-item mb-2">
          <router-link to="/academic-years" class="nav-link" :class="{ 'active': isActive('/academic-years') }">
            Choisir une formation
          </router-link>
        </li>
        
        <!-- Menu Admin -->
        <li v-if="isAdmin" class="nav-item mb-2">
          <router-link to="/admin-dashboard" class="nav-link" :class="{ 'active': isActive('/admin-dashboard') }">
            Tableau de bord
          </router-link>
        </li>
        
        <li v-if="isAdmin" class="nav-item mb-2">
          <router-link to="/students" class="nav-link" :class="{ 'active': isActive('/students') }">
            Gérer les étudiants
          </router-link>
        </li>
        
        <li v-if="isAdmin" class="nav-item mb-2">
          <router-link to="/academic-years" class="nav-link" :class="{ 'active': isActive('/academic-years') }">
            Gérer les formations
          </router-link>
        </li>
        
        <!-- Menu commun -->
        <li class="nav-item mb-2">
          <router-link to="/messages" class="nav-link" :class="{ 'active': isActive('/messages') }">
            Mes messages
            <span v-if="unreadCount > 0" class="badge bg-danger ms-1">{{ unreadCount }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  name: 'Sidebar',
  setup() {
    const store = useStore()
    const route = useRoute()
    
    const user = computed(() => store.getters['auth/user'])
    const userRole = computed(() => store.getters['auth/userRole'])
    const isAdmin = computed(() => userRole.value === 'admin')
    const unreadCount = computed(() => store.getters['message/unreadCount'])
    
    // Détermine si un chemin est actif
    const isActive = (path) => {
      return route.path === path
    }
    
    return {
      user,
      isAdmin,
      unreadCount,
      isActive
    }
  }
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  padding-top: 70px;
}

.nav-link {
  color: #333;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: #e9ecef;
}

.nav-link.active {
  background-color: #0d6efd;
  color: white;
}
</style>
