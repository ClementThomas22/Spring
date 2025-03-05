import axios from 'axios'
import router from '@/router'

// Initialiser l'état à partir du localStorage
const getInitialState = () => {
  const savedUser = localStorage.getItem('user')
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('token')
  
  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: token || null,
    role: role || null
  }
}

export default {
  namespaced: true,
  state: getInitialState(),
  mutations: {
    SET_USER(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_ROLE(state, role) {
      state.role = role
      if (role) {
        localStorage.setItem('role', role)
      } else {
        localStorage.removeItem('role')
      }
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      state.role = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    }
  },
  actions: {
    // Action pour se connecter (dans ce cas, nous simulons - pas de vrai token dans le backend)
    async login({ commit, dispatch }, credentials) {
      try {
        dispatch('setLoading', true, { root: true })
        
        // Ici, vous pouvez implémenter l'appel réel à votre API,
        // mais puisque le backend ne semble pas avoir d'authentification, nous simulons
        
        // Récupérer l'étudiant par son numéro
        const response = await axios.get(`/students/${credentials.studentNumber}`)
        
        if (response.data) {
          // Dans une vraie implémentation, vérifiez le mot de passe ici
          const user = response.data
          
          // Simuler un token (dans une vraie app, il viendrait du backend)
          const token = `fake-token-${Date.now()}`
          
          // Déterminer le rôle (dans une vraie app, il viendrait du backend)
          // Pour simuler, on suppose que l'étudiant avec ID 1 est le responsable
          const role = user.studentNumber === 1 ? 'admin' : 'student'
          
          commit('SET_USER', user)
          commit('SET_TOKEN', token)
          commit('SET_ROLE', role)
          
          // Configurer axios pour inclure le token dans les futures requêtes
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Rediriger vers le tableau de bord approprié
          router.push(role === 'admin' ? '/admin-dashboard' : '/student-dashboard')
          
          return user
        }
      } catch (error) {
        dispatch('setError', 'Identifiants incorrects. Veuillez réessayer.', { root: true })
        commit('CLEAR_AUTH')
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Action pour s'inscrire
    async register({ commit, dispatch }, newStudent) {
      try {
        dispatch('setLoading', true, { root: true })
        
        // Envoyer les données d'inscription
        const response = await axios.post('/students', newStudent)
        
        if (response.data) {
          // Après inscription réussie, rediriger vers la page de connexion
          router.push('/login')
          return response.data
        }
      } catch (error) {
        dispatch('setError', "Erreur lors de l'inscription. Veuillez réessayer.", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Action pour se déconnecter
    logout({ commit }) {
      commit('CLEAR_AUTH')
      // Supprimer le token des en-têtes par défaut
      delete axios.defaults.headers.common['Authorization']
      // Rediriger vers la page d'accueil
      router.push('/')
    }
  },
  getters: {
    user: state => state.user,
    isAuthenticated: state => !!state.token,
    userRole: state => state.role
  }
}
