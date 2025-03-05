import axios from 'axios'

const API_URL = '/api/messages'

class MessageService {
  // Récupérer tous les messages d'un étudiant
  getStudentMessages(studentId) {
    return axios.get(`${API_URL}/student/${studentId}`)
  }
  
  // Récupérer les messages non lus d'un étudiant
  getUnreadStudentMessages(studentId) {
    return axios.get(`${API_URL}/student/${studentId}/unread`)
  }
  
  // Récupérer un message par son ID
  getMessageById(id) {
    return axios.get(`${API_URL}/${id}`)
  }
  
  // Marquer un message comme lu
  markMessageAsRead(id) {
    return axios.put(`${API_URL}/${id}/read`)
  }
  
  // Créer un message de bienvenue
  createWelcomeMessage(studentId) {
    return axios.post(`${API_URL}/welcome`, null, {
      params: { studentId }
    })
  }
  
  // Supprimer un message
  deleteMessage(id) {
    return axios.delete(`${API_URL}/${id}`)
  }
}

export default new MessageService()
