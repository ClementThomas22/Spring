import axios from 'axios'

export default {
  namespaced: true,
  state: {
    academicYears: [],
    currentAcademicYear: null
  },
  mutations: {
    SET_ACADEMIC_YEARS(state, academicYears) {
      state.academicYears = academicYears
    },
    SET_CURRENT_ACADEMIC_YEAR(state, academicYear) {
      state.currentAcademicYear = academicYear
    },
    ADD_ACADEMIC_YEAR(state, academicYear) {
      state.academicYears.push(academicYear)
    },
    UPDATE_ACADEMIC_YEAR(state, updatedAcademicYear) {
      const index = state.academicYears.findIndex(ay => ay.id === updatedAcademicYear.id)
      if (index !== -1) {
        state.academicYears.splice(index, 1, updatedAcademicYear)
      }
    },
    REMOVE_ACADEMIC_YEAR(state, academicYearId) {
      state.academicYears = state.academicYears.filter(ay => ay.id !== academicYearId)
    }
  },
  actions: {
    // Récupérer toutes les années académiques
    async fetchAcademicYears({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get('/academicyears')
        commit('SET_ACADEMIC_YEARS', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération des années académiques", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Récupérer une année académique par son ID
    async fetchAcademicYear({ commit, dispatch }, academicYearId) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get(`/academicyears/${academicYearId}`)
        commit('SET_CURRENT_ACADEMIC_YEAR', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération de l'année académique", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Créer une nouvelle année académique
    async createAcademicYear({ commit, dispatch }, academicYear) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.post('/academicyears', academicYear)
        commit('ADD_ACADEMIC_YEAR', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la création de l'année académique", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Mettre à jour une année académique
    async updateAcademicYear({ commit, dispatch }, { id, updatedData }) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.put(`/academicyears/${id}`, updatedData)
        commit('UPDATE_ACADEMIC_YEAR', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la mise à jour de l'année académique", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Supprimer une année académique
    async deleteAcademicYear({ commit, dispatch }, academicYearId) {
      try {
        dispatch('setLoading', true, { root: true })
        await axios.delete(`/academicyears/${academicYearId}`)
        commit('REMOVE_ACADEMIC_YEAR', academicYearId)
        return true
      } catch (error) {
        dispatch('setError', "Erreur lors de la suppression de l'année académique", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    }
  },
  getters: {
    allAcademicYears: state => state.academicYears,
    currentAcademicYear: state => state.currentAcademicYear,
    academicYearById: state => id => state.academicYears.find(ay => ay.id === id)
  }