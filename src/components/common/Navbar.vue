<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">Gestion des Étudiants</router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" :to="homePath">Accueil</router-link>
          </li>
          
          <li v-if="isAdmin" class="nav-item">
            <router-link class="nav-link" to="/students">Étudiants</router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" to="/academic-years">Formations</router-link>
          </li>
          
          <li class="nav-item">
            <router-link class="nav-link" to="/messages">
              Messages
              <span v-if="unreadCount > 0" class="badge bg-danger ms-1">{{ unreadCount }}</span>
            </router-link>
          </li>
        </ul>
        
        <div class="d-flex">
          <span v-if="user" class="navbar-text me-3">
            Bonjour, {{ user.firstName }} {{ user.lastName }}
          </span>
          <button v-if="isAuthenticated" class="btn btn-outline-light" @click="logout">Déconnexion</button>
          <router-link v-else class="btn btn-outline-light" to="/login">Connexion</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Navbar',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const user = computed(() => store.getters['auth/user'])
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const userRole = computed(() => store.getters['auth/userRole'])
    const isAdmin = computed(() => userRole.value === 'admin')
    const unreadCount = computed(() => store.getters['message/unreadCount'])
    
    // Détermine le chemin d'accueil en fonction du rôle de l'utilisateur
    const homePath = computed(() => {
      if (!isAuthenticated.value) return '/'
      return isAdmin.value ? '/admin-dashboard' : '/student-dashboard'
    })
    
    // Fonction de déconnexion
    const logout = () => {
      store.dispatch('auth/logout')
    }
    
    return {
      user,
      isAuthenticated,
      isAdmin,
      unreadCount,
      homePath,
      logout
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>
