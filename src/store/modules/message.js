import axios from 'axios'

export default {
  namespaced: true,
  state: {
    messages: [],
    currentMessage: null,
    unreadCount: 0
  },
  mutations: {
    SET_MESSAGES(state, messages) {
      state.messages = messages
      state.unreadCount = messages.filter(msg => !msg.read).length
    },
    SET_CURRENT_MESSAGE(state, message) {
      state.currentMessage = message
    },
    MARK_AS_READ(state, messageId) {
      const message = state.messages.find(msg => msg.id === messageId)
      if (message && !message.read) {
        message.read = true
        state.unreadCount--
      }
    },
    ADD_MESSAGE(state, message) {
      state.messages.push(message)
      if (!message.read) {
        state.unreadCount++
      }
    }
  },
  actions: {
    // Récupérer tous les messages d'un étudiant
    async fetchStudentMessages({ commit, dispatch }, studentId) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get(`/messages/student/${studentId}`)
        commit('SET_MESSAGES', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération des messages", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Récupérer les messages non lus d'un étudiant
    async fetchUnreadMessages({ commit, dispatch }, studentId) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get(`/messages/student/${studentId}/unread`)
        commit('SET_MESSAGES', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération des messages non lus", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Récupérer un message par son ID
    async fetchMessage({ commit, dispatch }, messageId) {
      try {
        dispatch('setLoading', true, { root: true })
        const response = await axios.get(`/messages/${messageId}`)
        commit('SET_CURRENT_MESSAGE', response.data)
        return response.data
      } catch (error) {
        dispatch('setError', "Erreur lors de la récupération du message", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    },
    
    // Marquer un message comme lu
    async markMessageAsRead({ commit, dispatch }, messageId) {
      try {
        dispatch('setLoading', true, { root: true })
        await axios.put(`/messages/${messageId}/read`)
        commit('MARK_AS_READ', messageId)
        return true
      } catch (error) {
        dispatch('setError', "Erreur lors du marquage du message comme lu", { root: true })
        throw error
      } finally {
        dispatch('setLoading', false, { root: true })
      }
    }
  },
  getters: {
    allMessages: state => state.messages,
    currentMessage: state => state.currentMessage,
    unreadCount: state => state.unreadCount,
    messageById: state => id => state.messages.find(msg => msg.id === id)
  }
}
