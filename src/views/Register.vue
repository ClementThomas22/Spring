<template>
  <div class="register-container">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">Créer un compte</h2>
        
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        
        <form @submit.prevent="handleRegister">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label">Prénom</label>
              <input
                type="text"
                id="firstName"
                v-model="firstName"
                class="form-control"
                required
                placeholder="Entrez votre prénom"
              >
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label">Nom</label>
              <input
                type="text"
                id="lastName"
                v-model="lastName"
                class="form-control"
                required
                placeholder="Entrez votre nom"
              >
            </div>
          </div>
          
          <div class="mb-3">
            <label for="email" class="form-label">Adresse email</label>
            <input
              type="email"
              id="email"
              v-model="email"
              class="form-control"
              required
              placeholder="Entrez votre adresse email"
            >
          </div>
          
          <div class="mb-3">
            <label for="birthDate" class="form-label">Date de naissance</label>
            <input
              type="date"
              id="birthDate"
              v-model="birthDate"
              class="form-control"
              required
            >
          </div>
          
          <div class="mb-3">
            <label for="address" class="form-label">Adresse postale</label>
            <textarea
              id="address"
              v-model="address"
              class="form-control"
              rows="3"
              required
              placeholder="Entrez votre adresse postale"
            ></textarea>
          </div>
          
          <div class="mb-3">
            <label for="password" class="form-label">Mot de passe</label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="form-control"
              required
              placeholder="Choisissez un mot de passe"
            >
          </div>
          
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              class="form-control"
              required
              placeholder="Confirmez votre mot de passe"
            >
            <div v-if="passwordMismatch" class="text-danger mt-1">
              Les mots de passe ne correspondent pas.
            </div>
          </div>
          
          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading || passwordMismatch">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              S'inscrire
            </button>
          </div>
        </form>
        
        <p class="text-center mt-3">
          Vous avez déjà un compte ?
          <router-link to="/login">Se connecter</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterView',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    // Données du formulaire
    const firstName = ref('')
    const lastName = ref('')
    const email = ref('')
    const birthDate = ref('')
    const address = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    
    // États
    const loading = computed(() => store.getters['isLoading'])
    const error = computed(() => store.getters['error'])
    const passwordMismatch = computed(() => {
      return password.value && confirmPassword.value 
             && password.value !== confirmPassword.value
    })
    
    // Actions
    const handleRegister = async () => {
      if (passwordMismatch.value) {
        return
      }
      
      try {
        // Effacer les erreurs précédentes
        store.dispatch('clearError')
        
        // Préparer les données de l'étudiant
        const studentData = {
          firstName: firstName.value,
          lastName: lastName.value,
          mail: email.value,
          birthDate: birthDate.value,
          address: address.value,
          password: password.value
        }
        
        // Enregistrer l'étudiant
        await store.dispatch('auth/register', studentData)
        
        // Rediriger vers la page de connexion avec un message de succès
        router.push('/login')
      } catch (err) {
        console.error('Erreur d\'inscription:', err)
      }
    }
    
    return {
      firstName,
      lastName,
      email,
      birthDate,
      address,
      password,
      confirmPassword,
      loading,
      error,
      passwordMismatch,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 650px;
  margin: 2rem auto;
  padding: 1rem;
}

.card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
