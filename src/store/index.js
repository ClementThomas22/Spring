import { createStore } from 'vuex'
import student from './modules/student'
import academicYear from './modules/academicYear'
import message from './modules/message'
import auth from './modules/auth'

export default createStore({
  state: {
    loading: false,
    error: null
  },
  mutations: {
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  actions: {
    setLoading({ commit }, status) {
      commit('SET_LOADING', status)
    },
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    },
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  },
  getters: {
    isLoading: state => state.loading,
    error: state => state.error
  },
  modules: {
    student,
    academicYear,
    message,
    auth
  }
})
