<template>
  <div class="dog-list-container">
    <h1>Liste des étudiants</h1>

    <div class="action-bar">
      <button @click="showAddDogModal = true" class="btn btn-primary">
        Ajouter un étudiant
      </button>
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th>ID</th>
        <th>Anniversaire</th>
        <th>Nom</th>
        <th>Prénom</th>
        <th>Mail</th>
        <th>Academic Year</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="student in students" :key="student.id">
        <td>{{ student.student_number }}</td>
        <td>{{ student.birth_date}}</td>
        <td>{{ student.first_name}}</td>
        <td>{{ student.last_name }}</td>
        <td>{{ student.mail }}</td>
        <td>{{ student.academic_year_id }}</td>
        <td>
          <button @click="deleteStudent(student.id)" class="btn btn-danger">
            Supprimer
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Modal d'ajout de chien -->
    <div v-if="showAddStudentModal" class="modal">
      <div class="modal-content">
        <h2>Ajouter un étudiant</h2>
        <form @submit.prevent="addStudent">
          <div class="form-group">
            <label>Nom</label>
            <input
                v-model="newStudent.name"
                type="text"
                required
            >
          </div>
          <div class="form-group">
            <label>Race</label>
            <input
                v-model="newStudent.race"
                type="text"
                required
            >
          </div>
          <div class="modal-actions">
            <button
                type="button"
                @click="showAddStudentModal = false"
                class="btn btn-secondary"
            >
              Annuler
            </button>
            <button
                type="submit"
                class="btn btn-primary"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>

import studentService from '@/services/studentService'

export default {
  data() {
    return {
      students: [],
      showAddStudentModal: false,
      newStudent: {
        student_number: '',
        birth_date: '',
        first_name: '',
        last_name: '',
        mail: '',
        academic_year_id: ''
      }
    }
  },
  methods: {
    async fetchStudent() {
      try {
        this.students = await studentService.getAllStudents()
      } catch (error) {
        console.error('Erreur lors de la récupération des étudiants', error)
      }
    },
    async deleteStudent(id) {
      try {
        await studentService.deleteStudent(id)
        this.students = this.students.filter(student => student.id !== id)
      } catch (error) {
        console.error('Erreur lors de la suppression du chien', error)
      }
    },
    async addStudent() {
      try {
        const createdStudent = await studentService.createStudent(this.newStudent)
        this.students.push(createdStudent)
        this.showAddStudentModal = false
        this.newStudent = { student_number: '',
          birth_date: '',
          first_name: '',
          last_name: '',
          mail: '',
          academic_year_id: '' }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'étudiant', error)
      }
    }
  },
  mounted() {
    this.fetchStudent()
  }
}
</script>

<style scoped>
.dog-list-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.data-table thead {
  background-color: #f2f2f2;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-secondary {
  background-color: #e7e7e7;
  color: black;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>