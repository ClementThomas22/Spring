import axios from 'axios'

const API_URL = '/api/core'

class CoreService {
  // Récupérer les informations agrégées d'un étudiant
  getStudentInfo(studentId) {
    return axios.get(`${API_URL}/student-info/${studentId}`)
  }
}

export default new CoreService()
