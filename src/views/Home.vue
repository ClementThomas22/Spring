<template>
  <div class="home">
    <div class="jumbotron bg-light p-5 rounded">
      <h1 class="display-4">Gestion des Étudiants</h1>
      <p class="lead">Bienvenue sur la plateforme de gestion des inscriptions universitaires.</p>
      <hr class="my-4">
      <p>Cette application permet aux étudiants de gérer leurs inscriptions aux formations et aux UE.</p>
      
      <div v-if="!isAuthenticated" class="mt-4">
        <router-link to="/login" class="btn btn-primary me-2">Se connecter</router-link>
        <router-link to="/register" class="btn btn-outline-primary">Créer un compte</router-link>
      </div>
      
      <div v-else class="mt-4">
        <router-link :to="dashboardPath" class="btn btn-primary">Accéder à mon espace</router-link>
      </div>
    </div>
    
    <div class="row mt-5">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Gérer votre inscription</h5>
            <p class="card-text">Choisissez une formation, inscrivez-vous aux UE optionnelles et gérez vos groupes.</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Suivre vos messages</h5>
            <p class="card-text">Consultez les messages importants concernant votre parcours universitaire.</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Valider vos choix</h5>
            <p class="card-text">Suivez l'état de vos demandes d'inscription et les validations par les responsables.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'HomeView',
  setup() {
    const store = useStore()
    
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const userRole = computed(() => store.getters['auth/userRole'])
    
    // Détermine le chemin du tableau de bord en fonction du rôle
    const dashboardPath = computed(() => {
      return userRole.value === 'admin' ? '/admin-dashboard' : '/student-dashboard'
    })
    
    return {
      isAuthenticated,
      dashboardPath
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  transition: transform 0.3s;
  height: 100%;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
