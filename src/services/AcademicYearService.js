import axios from 'axios'

const API_URL = '/academicyears'

class AcademicYearService {
  // Récupérer toutes les années académiques
  getAllAcademicYears() {
    return axios.get(API_URL)
  }
  
  // Récupérer une année académique par son ID
  getAcademicYearById(id) {
    return axios.get(`${API_URL}/${id}`)
  }
  
  // Créer une nouvelle année académique
  createAcademicYear(academicYear) {
    return axios.post(API_URL, academicYear)
  }
  
  // Mettre à jour une année académique
  updateAcademicYear(id, data) {
    return axios.put(`${API_URL}/${id}`, data)
  }
  
  // Supprimer une année académique
  deleteAcademicYear(id) {
    return axios.delete(`${API_URL}/${id}`)
  }
}

export default new AcademicYearService()
