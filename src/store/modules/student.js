import axios from 'axios'

export default {
  namespaced: true,
  state: {
    students: [],
    currentStudent: null
  },
  mutations: {
    SET_STUDENTS(state, students) {
      state.students = students
    },
    SET_CURRENT_STUDENT(state, student) {
      state.currentStudent = student
    },
    ADD_STUDENT(state, student) {
      state.students.push(student)
    },
    UPDATE_STUDENT(state, updatedStudent) {
      const index = state.students.findIndex(s => s.studentNumber === updatedStudent.studentNumber)
      if (index !== -1) {
        state.students.splice(index, 1, updatedStudent)
      }
    },
    REMOVE_STUDENT(state, studentId) {
      state.students = state.students.filter(s => s.studentNumber !== studentId)
    }
  },
  actions: {
    // Récupérer tous les étudiants
    async fetchStudents({ commit, dispatch }) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get('/students')
        commit('SET_STUDENTS', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération des étudiants", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Récupérer un étudiant par son ID
    async fetchStudent({ commit, dispatch }, studentId) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get(`/students/${studentId}`)
        commit('SET_CURRENT_STUDENT', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération de l'étudiant", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Créer un nouvel étudiant
    async createStudent({ commit, dispatch }, student) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.post('/students', student)
        commit('ADD_STUDENT', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la création de l'étudiant", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Mettre à jour un étudiant
    async updateStudent({ commit, dispatch }, { studentId, updatedData }) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.put(`/students/${studentId}`, updatedData)
        commit('UPDATE_STUDENT', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la mise à jour de l'étudiant", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Supprimer un étudiant
    async deleteStudent({ commit, dispatch }, studentId) {
      try {
        dispatch('setLoading', true, { root: true })
        await axios.delete(`/students/${studentId}`)
        commit('REMOVE_STUDENT', studentId)
        return true
      } catch (error) {
        dispatch('setError', "Erreur lors de la suppression de l'étudiant", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Récupérer les groupes d'un étudiant
    async fetchStudentGroups({ dispatch }, studentId) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get(`/students/${studentId}/groupes`)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération des groupes de l'étudiant", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Récupérer les formations d'un étudiant
    async fetchStudentFormations({ dispatch }, studentId) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get(`/students/${studentId}/formations`)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération des formations de l'étudiant", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Ajouter un étudiant à une formation
    async addStudentToFormation({ dispatch }, { studentId, formationId }) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.post(`/students/${studentId}/formations/${formationId}`)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de l'ajout de l'étudiant à la formation", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    }
  },
  getters: {
    allStudents: state => state.students,
    currentStudent: state => state.currentStudent,
    studentById: state => id => state.students.find(student => student.studentNumber === id)
  }
}
