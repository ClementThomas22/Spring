<template>
  <div class="login-container">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Connexion</h2>
        
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="studentNumber" class="form-label">Numéro d'étudiant</label>
            <input
              type="text"
              id="studentNumber"
              v-model="studentNumber"
              class="form-control"
              required
              placeholder="Entrez votre numéro d'étudiant"
            >
          </div>
          
          <div class="mb-3">
            <label for="password" class="form-label">Mot de passe</label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="form-control"
              required
              placeholder="Entrez votre mot de passe"
            >
          </div>
          
          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Se connecter
            </button>
          </div>
        </form>
        
        <p class="text-center mt-3">
          Pas encore de compte ?
          <router-link to="/register">Créer un compte</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const studentNumber = ref('')
    const password = ref('')
    
    const loading = computed(() => store.getters['isLoading'])
    const error = computed(() => store.getters['error'])
    
    const handleLogin = async () => {
      try {
        // Effacer les erreurs précédentes
        store.dispatch('clearError')
        
        // Tenter de se connecter
        await store.dispatch('auth/login', {
          studentNumber: studentNumber.value,
          password: password.value
        })
        
        // La redirection est gérée dans l'action de connexion
      } catch (err) {
        console.error('Erreur de connexion:', err)
      }
    }
    
    return {
      studentNumber,
      password,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 2rem auto;
  padding: 1rem;
}

.card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>