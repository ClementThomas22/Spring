import axios from 'axios'

const API_URL = '/api/students'

class StudentService {
  // Récupérer tous les étudiants
  getAllStudents() {
    return axios.get(API_URL)
  }
  
  // Récupérer un étudiant par son ID
  getStudentById(id) {
    return axios.get(`${API_URL}/${id}`)
  }
  
  // Créer un nouvel étudiant
  createStudent(student) {
    return axios.post(API_URL, student)
  }
  
  // Mettre à jour un étudiant
  updateStudent(id, data) {
    return axios.put(`${API_URL}/${id}`, data)
  }
  
  // Supprimer un étudiant
  deleteStudent(id) {
    return axios.delete(`${API_URL}/${id}`)
  }
  
  // Récupérer les groupes d'un étudiant
  getStudentGroups(id) {
    return axios.get(`${API_URL}/${id}/groupes`)
  }
  
  // Récupérer les formations d'un étudiant
  getStudentFormations(id) {
    return axios.get(`${API_URL}/${id}/formations`)
  }
  
  // Récupérer les UEs d'un étudiant
  getStudentModules(id) {
    return axios.get(`${API_URL}/${id}/ues`)
  }
  
  // Ajouter un étudiant à un groupe
  addStudentToGroup(studentId, groupId) {
    return axios.post(`${API_URL}/${studentId}/groupes/${groupId}`)
  }
  
  // Retirer un étudiant d'un groupe
  removeStudentFromGroup(studentId, groupId) {
    return axios.delete(`${API_URL}/${studentId}/groupes/${groupId}`)
  }
  
  // Valider l'inscription d'un étudiant à un groupe
  validateStudentGroup(studentId, groupId, isAccepted) {
    return axios.put(`${API_URL}/${studentId}/groupes/${groupId}`, { accept: isAccepted })
  }
  
  // Ajouter un étudiant à une formation
  addStudentToFormation(studentId, formationId) {
    return axios.post(`${API_URL}/${studentId}/formations/${formationId}`)
  }
  
  // Retirer un étudiant d'une formation
  removeStudentFromFormation(studentId, formationId) {
    return axios.delete(`${API_URL}/${studentId}/formations/${formationId}`)
  }
  
  // Valider l'inscription d'un étudiant à une formation
  validateStudentFormation(studentId, formationId, isAccepted) {
    return axios.put(`${API_URL}/${studentId}/formations/${formationId}`, { accept: isAccepted })
  }
  
  // Ajouter un étudiant à une UE
  addStudentToUE(studentId, ueId) {
    return axios.post(`${API_URL}/${studentId}/ues/${ueId}`)
  }
  
  // Retirer un étudiant d'une UE
  removeStudentFromUE(studentId, ueId) {
    return axios.delete(`${API_URL}/${studentId}/ues/${ueId}`)
  }
  
  // Valider l'inscription d'un étudiant à une UE
  validateStudentUE(studentId, ueId, isAccepted) {
    return axios.put(`${API_URL}/${studentId}/ues/${ueId}`, { accept: isAccepted })
  }
}

export default new StudentService()
