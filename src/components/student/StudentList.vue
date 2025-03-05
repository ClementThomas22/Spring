<template>
  <div class="student-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Liste des étudiants</h1>
      <button class="btn btn-primary" @click="showAddStudentModal">
        <i class="bi bi-plus-circle"></i> Ajouter un étudiant
      </button>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher un étudiant..." 
                v-model="searchQuery"
              >
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">Formation</span>
              <select class="form-select" v-model="formationFilter">
                <option value="">Toutes les formations</option>
                <option v-for="formation in formations" :key="formation.id" :value="formation.id">
                  {{ formation.formationName }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tableau des étudiants -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="d-flex justify-content-center my-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        
        <div v-else-if="filteredStudents.length === 0" class="alert alert-info">
          Aucun étudiant ne correspond à vos critères de recherche.
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th @click="sortBy('studentNumber')">
                  Numéro étudiant 
                  <i v-if="sortKey === 'studentNumber'" 
                     :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </th>
                <th @click="sortBy('lastName')">
                  Nom 
                  <i v-if="sortKey === 'lastName'" 
                     :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </th>
                <th @click="sortBy('firstName')">
                  Prénom 
                  <i v-if="sortKey === 'firstName'" 
                     :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </th>
                <th>Email</th>
                <th>Formation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents" :key="student.studentNumber">
                <td>{{ student.studentNumber }}</td>
                <td>{{ student.lastName }}</td>
                <td>{{ student.firstName }}</td>
                <td>{{ student.mail }}</td>
                <td>
                  <span v-if="getFormationName(student.academicYearId)">
                    {{ getFormationName(student.academicYearId) }}
                  </span>
                  <span v-else class="text-muted">Non inscrit</span>
                </td>
                <td>
                  <span v-if="student.formationEnrollmentStatus === 'PENDING'" class="badge bg-warning">En attente</span>
                  <span v-else-if="student.formationEnrollmentStatus === 'ACCEPTED'" class="badge bg-success">Accepté</span>
                  <span v-else-if="student.formationEnrollmentStatus === 'REJECTED'" class="badge bg-danger">Refusé</span>
                  <span v-else class="badge bg-secondary">Non défini</span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link :to="`/students/${student.studentNumber}`" class="btn btn-outline-info">
                      <i class="bi bi-eye"></i>
                    </router-link>
                    <button class="btn btn-outline-primary" @click="editStudent(student)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="confirmDeleteStudent(student)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="currentPage--">Précédent</a>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="currentPage++">Suivant</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    
    <!-- Modal d'ajout/modification d'étudiant -->
    <div class="modal fade" id="studentModal" tabindex="-1" aria-hidden="true" ref="studentModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Modifier un étudiant' : 'Ajouter un étudiant' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveStudent">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">Prénom</label>
                  <input type="text" class="form-control" id="firstName" v-model="currentStudent.firstName" required>
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Nom</label>
                  <input type="text" class="form-control" id="lastName" v-model="currentStudent.lastName" required>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="currentStudent.mail" required>
              </div>
              
              <div class="mb-3">
                <label for="birthDate" class="form-label">Date de naissance</label>
                <input type="date" class="form-control" id="birthDate" v-model="currentStudent.birthDate">
              </div>
              
              <div class="mb-3">
                <label for="address" class="form-label">Adresse</label>
                <textarea class="form-control" id="address" v-model="currentStudent.address" rows="3"></textarea>
              </div>
              
              <div class="mb-3">
                <label for="formation" class="form-label">Formation</label>
                <select class="form-select" id="formation" v-model="currentStudent.academicYearId">
                  <option value="">-- Sélectionner une formation --</option>
                  <option v-for="formation in formations" :key="formation.id" :value="formation.id">
                    {{ formation.formationName }}
                  </option>
                </select>
              </div>
              
              <div v-if="!isEditing" class="mb-3">
                <label for="password" class="form-label">Mot de passe</label>
                <input type="password" class="form-control" id="password" v-model="currentStudent.password" required>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isEditing ? 'Modifier' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer l'étudiant <strong v-if="studentToDelete">{{ studentToDelete.firstName }} {{ studentToDelete.lastName }}</strong> ?</p>
            <p class="text-danger">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-danger" @click="deleteStudent" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'

export default {
  name: 'StudentList',
  setup() {
    const store = useStore()
    
    // Références pour les modals
    const studentModal = ref(null)
    const deleteModal = ref(null)
    
    // États
    const loading = computed(() => store.getters['isLoading'])
    const students = ref([])
    const formations = ref([])
    const currentStudent = ref({
      firstName: '',
      lastName: '',
      mail: '',
      birthDate: '',
      address: '',
      academicYearId: '',
      password: ''
    })
    const studentToDelete = ref(null)
    const isEditing = ref(false)
    const submitting = ref(false)
    
    // Filtres et tri
    const searchQuery = ref('')
    const formationFilter = ref('')
    const sortKey = ref('studentNumber')
    const sortOrder = ref('asc')
    
    // Pagination
    const itemsPerPage = 10
    const currentPage = ref(1)
    
    // Filtrer les étudiants
    const filteredStudents = computed(() => {
      let result = [...students.value]
      
      // Filtrer par recherche (prénom, nom, email)
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(student => 
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.mail.toLowerCase().includes(query) ||
          student.studentNumber.toString().includes(query)
        )
      }
      
      // Filtrer par formation
      if (formationFilter.value) {
        result = result.filter(student => 
          student.academicYearId === parseInt(formationFilter.value)
        )
      }
      
      // Trier les résultats
      result.sort((a, b) => {
        let aValue = a[sortKey.value]
        let bValue = b[sortKey.value]
        
        // Gérer les valeurs null ou undefined
        if (aValue === null || aValue === undefined) aValue = ''
        if (bValue === null || bValue === undefined) bValue = ''
        
        // Comparaison selon l'ordre de tri
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      return result
    })
    
    // Données paginées
    const paginatedStudents = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return filteredStudents.value.slice(startIndex, endIndex)
    })
    
    // Nombre total de pages
    const totalPages = computed(() => {
      return Math.ceil(filteredStudents.value.length / itemsPerPage)
    })
    
    // Réinitialiser la page courante quand les filtres changent
    watch([searchQuery, formationFilter], () => {
      currentPage.value = 1
    })
    
    // Récupérer le nom de la formation à partir de son ID
    const getFormationName = (formationId) => {
      if (!formationId) return ''
      const formation = formations.value.find(f => f.id === formationId)
      return formation ? formation.formationName : ''
    }
    
    // Changer le critère de tri
    const sortBy = (key) => {
      if (sortKey.value === key) {
        // Inverser l'ordre de tri si on clique sur la même colonne
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        // Nouvelle colonne, tri ascendant par défaut
        sortKey.value = key
        sortOrder.value = 'asc'
      }
    }
    
    // Afficher la modal d'ajout d'étudiant
    const showAddStudentModal = () => {
      isEditing.value = false
      currentStudent.value = {
        firstName: '',
        lastName: '',
        mail: '',
        birthDate: '',
        address: '',
        academicYearId: '',
        password: ''
      }
      new Modal(studentModal.value).show()
    }
    
    // Modifier un étudiant
    const editStudent = (student) => {
      isEditing.value = true
      currentStudent.value = { ...student }
      // Supprimer le mot de passe pour éviter de l'écraser
      currentStudent.value.password = ''
      new Modal(studentModal.value).show()
    }
    
    // Confirmer la suppression d'un étudiant
    const confirmDeleteStudent = (student) => {
      studentToDelete.value = student
      new Modal(deleteModal.value).show()
    }
    
    // Sauvegarder un étudiant (ajout ou modification)
    const saveStudent = async () => {
      submitting.value = true
      
      try {
        if (isEditing.value) {
          // Mise à jour
          await store.dispatch('student/updateStudent', {
            studentId: currentStudent.value.studentNumber,
            updatedData: currentStudent.value
          })
          
          // Mettre à jour la liste locale
          const index = students.value.findIndex(s => s.studentNumber === currentStudent.value.studentNumber)
          if (index !== -1) {
            students.value[index] = { ...currentStudent.value }
          }
        } else {
          // Création
          const newStudent = await store.dispatch('student/createStudent', currentStudent.value)
          students.value.push(newStudent)
        }
        
        // Fermer la modal
        new Modal(studentModal.value).hide()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'étudiant:', error)
      } finally {
        submitting.value = false
      }
    }
    
    // Supprimer un étudiant
    const deleteStudent = async () => {
      if (!studentToDelete.value) return
      
      submitting.value = true
      
      try {
        await store.dispatch('student/deleteStudent', studentToDelete.value.studentNumber)
        
        // Supprimer de la liste locale
        students.value = students.value.filter(s => s.studentNumber !== studentToDelete.value.studentNumber)
        
        // Fermer la modal
        new Modal(deleteModal.value).hide()
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'étudiant:', error)
      } finally {
        submitting.value = false
      }
    }
    
    // Chargement initial des données
    onMounted(async () => {
      try {
        // Charger les étudiants
        const studentsData = await store.dispatch('student/fetchStudents')
        students.value = studentsData
        
        // Charger les formations
        const formationsData = await store.dispatch('academicYear/fetchAcademicYears')
        formations.value = formationsData
        
        // Initialiser les références des modals
        studentModal.value = document.getElementById('studentModal')
        deleteModal.value = document.getElementById('deleteConfirmationModal')
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    })
    
    return {
      students,
      formations,
      loading,
      filteredStudents,
      paginatedStudents,
      totalPages,
      currentPage,
      searchQuery,
      formationFilter,
      sortKey,
      sortOrder,
      currentStudent,
      studentToDelete,
      isEditing,
      submitting,
      studentModal,
      deleteModal,
      getFormationName,
      sortBy,
      showAddStudentModal,
      editStudent,
      confirmDeleteStudent,
      saveStudent,
      deleteStudent
    }
  }
}
</script>

<style scoped>
.student-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

th {
  cursor: pointer;
}

th:hover {
  background-color: #f8f9fa;
}
</style>