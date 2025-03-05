import axios from 'axios'

// Si votre application Spring Boot tourne sur le port 8080
const API_URL = 'http://localhost:8080/api/students'

class studentService{
    async getAllStudents(){
        const response = await axios.get(API_URL)
        return response.data
    }
    async deleteStudent(id) {
        const response = await axios.delete(`${API_URL}/${id}`)
        return response.data
    }

    async createStudent(student) {
        const response = await axios.post(API_URL, student)
        return response.data
    }
}

export default  new studentService()