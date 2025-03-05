<template>
  <div class="student-details">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Détails de l'étudiant</h1>
      <div>
        <router-link to="/students" class="btn btn-outline-secondary me-2">
          <i class="bi bi-arrow-left"></i> Retour
        </router-link>
        <button v-if="isAdmin" class="btn btn-primary" @click="editStudent">
          <i class="bi bi-pencil"></i> Modifier
        </button>
      </div>
    </div>

    <div v-if="loading" class="d-flex justify-content-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="!student" class="alert alert-warning">
      Aucun étudiant trouvé avec cet identifiant.
    </div>

    <div v-else>
      <div class="row">
        <!-- Informations personnelles -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Informations personnelles</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Numéro étudiant:</div>
                <div class="col-md-8">{{ student.studentNumber }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Nom:</div>
                <div class="col-md-8">{{ student.lastName }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Prénom:</div>
                <div class="col-md-8">{{ student.firstName }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Email:</div>
                <div class="col-md-8">{{ student.mail }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Date de naissance:</div>
                <div class="col-md-8">{{ formatDate(student.birthDate) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations académiques -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Informations académiques</h5>
            </div>
            <div class="card-body">
              <div v-if="!studentFormation">
                <p class="alert alert-info">
                  Aucune formation associée
                </p>
                <div v-if="isAdmin || isCurrentUserProfile">
                  <router-link to="/academic-years" class="btn btn-sm btn-outline-primary">
                    Ajouter une formation
                  </router-link>
                </div>
              </div>
              <div v-else>
                <div class="row mb-3">
                  <div class="col-md-4 fw-bold">Formation:</div>
                  <div class="col-md-8">{{ studentFormation.formationName }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-4 fw-bold">Responsable:</div>
                  <div class="col-md-8">{{ studentFormation.responsibleEmail }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-4 fw-bold">Statut d'inscription:</div>
                  <div class="col-md-8">
                    <span class="badge" :class="statusClass">{{ statusText }}</span>
                  </div>
                </div>
                <div v-if="isAdmin && student.formationEnrollmentStatus === 'PENDING'" class="mt-3">
                  <button class="btn btn-sm btn-success me-2" @click="validateEnrollment(true)">
                    <i class="bi bi-check-circle"></i> Accepter l'inscription
                  </button>
                  <button class="btn btn-sm btn-danger" @click="validateEnrollment(false)">
                    <i class="bi bi-x-circle"></i> Refuser l'inscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Groupes de l'étudiant -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="card-title mb-0">Groupes</h5>
        </div>
        <div class="card-body">
          <div v-if="!studentGroups || studentGroups.length === 0" class="alert alert-info">
            L'étudiant n'est inscrit à aucun groupe.
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Nom</th>
                  <th>Statut</th>
                  <th v-if="isAdmin">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in studentGroups" :key="group.id">
                  <td>{{ group.id }}</td>
                  <td>{{ group.type }}</td>
                  <td>{{ group.name }}</td>
                  <td>
                    <span class="badge" :class="getStatusClass(group.status)">
                      {{ getStatusText(group.status) }}
                    </span>
                  </td>
                  <td v-if="isAdmin">
                    <button v-if="group.status === 'PENDING'" class="btn btn-sm btn-success me-1" @click="validateGroupEnrollment(group.id, true)">
                      <i class="bi bi-check"></i>
                    </button>
                    <button v-if="group.status === 'PENDING'" class="btn btn-sm btn-danger me-1" @click="validateGroupEnrollment(group.id, false)">
                      <i class="bi bi-x"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removeFromGroup(group.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- UEs de l'étudiant -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="card-title mb-0">UEs</h5>
        </div>
        <div class="card-body">
          <div v-if="!studentModules || studentModules.length === 0" class="alert alert-info">
            L'étudiant n'est inscrit à aucune UE.
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th v-if="isAdmin">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="module in studentModules" :key="module.id">
                  <td>{{ module.id }}</td>
                  <td>{{ module.code }}</td>
                  <td>{{ module.name }}</td>
                  <td>{{ module.optional ? 'Optionnelle' : 'Obligatoire' }}</td>
                  <td>
                    <span class="badge" :class="getStatusClass(module.status)">
                      {{ getStatusText(module.status) }}
                    </span>
                  </td>
                  <td v-if="isAdmin">
                    <button v-if="module.status === 'PENDING'" class="btn btn-sm btn-success me-1" @click="validateModuleEnrollment(module.id, true)">
                      <i class="bi bi-check"></i>
                    </button>
                    <button v-if="module.status === 'PENDING'" class="btn btn-sm btn-danger me-1" @click="validateModuleEnrollment(module.id, false)">
                      <i class="bi bi-x"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="removeFromModule(module.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Messages à l'étudiant -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Messages</h5>
          <button v-if="isAdmin" class="btn btn-sm btn-light" @click="showSendMessageModal">
            <i class="bi bi-envelope"></i> Envoyer un message
          </button>
        </div>
        <div class="card-body">
          <div v-if="!studentMessages || studentMessages.length === 0" class="alert alert-info">
            Aucun message pour cet étudiant.
          </div>
          <div v-else>
            <div v-for="message in studentMessages" :key="message.id" class="card mb-2" :class="{ 'border-primary': !message.read }">
              <div class="card-body">
                <h6 class="card-title">
                  {{ message.subject }}
                  <span v-if="!message.read" class="badge bg-primary ms-2">Nouveau</span>
                </h6>
                <p class="card-text">{{ message.content }}</p>
                <div class="d-flex justify-content-between">
                  <small class="text-muted">{{ formatDate(message.sentDate) }}</small>
                  <div v-if="isAdmin">
                    <button class="btn btn-sm btn-outline-danger" @click="deleteMessage(message.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition d'étudiant -->
    <div class="modal fade" id="studentEditModal" tabindex="-1" aria-hidden="true" ref="editModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Modifier l'étudiant</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveStudent">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">Prénom</label>
                  <input type="text" class="form-control" id="firstName" v-model="editedStudent.firstName" required>
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Nom</label>
                  <input type="text" class="form-control" id="lastName" v-model="editedStudent.lastName" required>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="editedStudent.mail" required>
              </div>
              
              <div class="mb-3">
                <label for="birthDate" class="form-label">Date de naissance</label>
                <input type="date" class="form-control" id="birthDate" v-model="editedStudent.birthDate">
              </div>
              
              <div class="mb-3">
                <label for="formation" class="form-label">Formation</label>
                <select class="form-select" id="formation" v-model="editedStudent.academicYearId">
                  <option value="">-- Aucune formation --</option>
                  <option v-for="formation in formations" :key="formation.id" :value="formation.id">
                    {{ formation.formationName }}
                  </option>
                </select>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'envoi de message -->
    <div class="modal fade" id="sendMessageModal" tabindex="-1" aria-hidden="true" ref="messageModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Envoyer un message</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="sendMessage">
              <div class="mb-3">
                <label for="messageSubject" class="form-label">Sujet</label>
                <input type="text" class="form-control" id="messageSubject" v-model="newMessage.subject" required>
              </div>
              
              <div class="mb-3">
                <label for="messageContent" class="form-label">Message</label>
                <textarea class="form-control" id="messageContent" v-model="newMessage.content" rows="5" required></textarea>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'

export default {
  name: 'StudentDetails',
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    // Références pour les modals
    const editModal = ref(null)
    const messageModal = ref(null)
    
    // États
    const student = ref(null)
    const studentFormation = ref(null)
    const studentGroups = ref([])
    const studentModules = ref([])
    const studentMessages = ref([])
    const formations = ref([])
    const editedStudent = ref({})
    const newMessage = ref({
      subject: '',
      content: ''
    })
    const submitting = ref(false)
    
    // Getters du store
    const loading = computed(() => store.getters['isLoading'])
    const error = computed(() => store.getters['error'])
    const currentUser = computed(() => store.getters['auth/user'])
    const userRole = computed(() => store.getters['auth/userRole'])
    const isAdmin = computed(() => userRole.value === 'admin')
    
    // Vérifier si c'est le profil de l'utilisateur actuel
    const isCurrentUserProfile = computed(() => {
      return currentUser.value && student.value && currentUser.value.studentNumber === student.value.studentNumber
    })
    
    // Classe et texte pour le statut d'inscription
    const statusClass = computed(() => {
      if (!student.value) return 'bg-secondary'
      
      const status = student.value.formationEnrollmentStatus
      
      if (status === 'PENDING') return 'bg-warning'
      if (status === 'ACCEPTED') return 'bg-success'
      if (status === 'REJECTED') return 'bg-danger'
      
      return 'bg-secondary'
    })
    
    const statusText = computed(() => {
      if (!student.value) return 'Non défini'
      
      const status = student.value.formationEnrollmentStatus
      
      if (status === 'PENDING') return 'En attente'
      if (status === 'ACCEPTED') return 'Acceptée'
      if (status === 'REJECTED') return 'Refusée'
      
      return 'Non défini'
    })
    
    // Formatage de la date
    const formatDate = (dateString) => {
      if (!dateString) return 'Non définie'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('fr-FR')
      } catch (e) {
        return dateString
      }
    }
    
    // Helpers pour les statuts
    const getStatusClass = (status) => {
      if (status === 'PENDING') return 'bg-warning'
      if (status === 'ACCEPTED') return 'bg-success'
      if (status === 'REJECTED') return 'bg-danger'
      return 'bg-secondary'
    }
    
    const getStatusText = (status) => {
      if (status === 'PENDING') return 'En attente'
      if (status === 'ACCEPTED') return 'Acceptée'
      if (status === 'REJECTED') return 'Refusée'
      return 'Non défini'
    }
    
    // Méthode pour ouvrir le modal d'édition
    const editStudent = () => {
      editedStudent.value = { ...student.value }
      // S'assurer que la date est au bon format pour l'input date (YYYY-MM-DD)
      if (editedStudent.value.birthDate) {
        try {
          const date = new Date(editedStudent.value.birthDate)
          editedStudent.value.birthDate = date.toISOString().split('T')[0]
        } catch (e) {
          console.error('Erreur lors du formatage de la date:', e)
        }
      }
      
      new Modal(editModal.value).show()
    }
    
    // Méthode pour sauvegarder les modifications
    const saveStudent = async () => {
      submitting.value = true
      
      try {
        await store.dispatch('student/updateStudent', {
          studentId: student.value.studentNumber,
          updatedData: editedStudent.value
        })
        
        // Recharger les données
        await loadStudentData()
        
        // Fermer le modal
        new Modal(editModal.value).hide()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des modifications:', error)
      } finally {
        submitting.value = false
      }
    }
    
    // Méthode pour valider l'inscription à une formation
    const validateEnrollment = async (isAccepted) => {
      if (!student.value || !student.value.academicYearId) return
      
      try {
        await store.dispatch('student/validateStudentFormation', {
          studentId: student.value.studentNumber,
          formationId: student.value.academicYearId,
          isAccepted
        })
        
        // Recharger les données
        await loadStudentData()
      } catch (error) {
        console.error('Erreur lors de la validation de l\'inscription:', error)
      }
    }
    
    // Méthode pour valider l'inscription à un groupe
    const validateGroupEnrollment = async (groupId, isAccepted) => {
      try {
        await store.dispatch('student/validateStudentGroup', {
          studentId: student.value.studentNumber,
          groupId,
          isAccepted
        })
        
        // Recharger les groupes
        await loadStudentGroups()
      } catch (error) {
        console.error('Erreur lors de la validation de l\'inscription au groupe:', error)
      }
    }
    
    // Méthode pour valider l'inscription à une UE
    const validateModuleEnrollment = async (moduleId, isAccepted) => {
      try {
        await store.dispatch('student/validateStudentUE', {
          studentId: student.value.studentNumber,
          ueId: moduleId,
          isAccepted
        })
        
        // Recharger les UE
        await loadStudentModules()
      } catch (error) {
        console.error('Erreur lors de la validation de l\'inscription à l\'UE:', error)
      }
    }
    
    // Méthode pour retirer un étudiant d'un groupe
    const removeFromGroup = async (groupId) => {
      if (confirm('Êtes-vous sûr de vouloir retirer l\'étudiant de ce groupe ?')) {
        try {
          await store.dispatch('student/removeStudentFromGroup', {
            studentId: student.value.studentNumber,
            groupId
          })
          
          // Recharger les groupes
          await loadStudentGroups()
        } catch (error) {
          console.error('Erreur lors du retrait de l\'étudiant du groupe:', error)
        }
      }
    }
    
    // Méthode pour retirer un étudiant d'une UE
    const removeFromModule = async (moduleId) => {
      if (confirm('Êtes-vous sûr de vouloir retirer l\'étudiant de cette UE ?')) {
        try {
          await store.dispatch('student/removeStudentFromUE', {
            studentId: student.value.studentNumber,
            ueId: moduleId
          })
          
          // Recharger les UE
          await loadStudentModules()
        } catch (error) {
          console.error('Erreur lors du retrait de l\'étudiant de l\'UE:', error)
        }
      }
    }
    
    // Méthode pour ouvrir le modal d'envoi de message
    const showSendMessageModal = () => {
      newMessage.value = {
        subject: '',
        content: ''
      }
      
      new Modal(messageModal.value).show()
    }
    
    // Méthode pour envoyer un message
    const sendMessage = async () => {
      submitting.value = true
      
      try {
        await store.dispatch('message/sendMessage', {
          studentId: student.value.studentNumber,
          message: newMessage.value
        })
        
        // Recharger les messages
        await loadStudentMessages()
        
        // Fermer le modal
        new Modal(messageModal.value).hide()
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
      } finally {
        submitting.value = false
      }
    }
    
    // Méthode pour supprimer un message
    const deleteMessage = async (messageId) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
        try {
          await store.dispatch('message/deleteMessage', messageId)
          
          // Recharger les messages
          await loadStudentMessages()
        } catch (error) {
          console.error('Erreur lors de la suppression du message:', error)
        }
      }
    }
    
    // Chargement des données de l'étudiant
    const loadStudentData = async () => {
      const studentId = route.params.id
      
      try {
        // Charger les données de l'étudiant
        const response = await store.dispatch('student/fetchStudent', studentId)
        student.value = response
        
        // Si l'étudiant a une formation, la charger
        if (student.value && student.value.academicYearId) {
          const formationResponse = await store.dispatch('academicYear/fetchAcademicYear', student.value.academicYearId)
          studentFormation.value = formationResponse
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de l\'étudiant:', error)
      }
    }
    
    // Chargement des groupes de l'étudiant
    const loadStudentGroups = async () => {
      const studentId = route.params.id
      
      try {
        // Simuler ou récupérer les groupes
        // Cette partie sera à adapter selon votre API
        studentGroups.value = [
          { id: 1, type: 'TD', name: 'Groupe TD1', status: 'ACCEPTED' },
          { id: 2, type: 'TP', name: 'Groupe TP1', status: 'ACCEPTED' }
        ]
      } catch (error) {
        console.error('Erreur lors du chargement des groupes:', error)
      }
    }
    
    // Chargement des UE de l'étudiant
    const loadStudentModules = async () => {
      const studentId = route.params.id
      
      try {
        // Simuler ou récupérer les UE
        // Cette partie sera à adapter selon votre API
        studentModules.value = [
          { id: 1, code: 'UE1', name: 'Algorithmique avancée', optional: false, status: 'ACCEPTED' },
          { id: 2, code: 'UE2', name: 'Base de données', optional: false, status: 'ACCEPTED' },
          { id: 3, code: 'UE3', name: 'Intelligence artificielle', optional: true, status: 'PENDING' }
        ]
      } catch (error) {
        console.error('Erreur lors du chargement des UE:', error)
      }
    }
    
    // Chargement des messages de l'étudiant
    const loadStudentMessages = async () => {
      const studentId = route.params.id
      
      try {
        // Simuler ou récupérer les messages
        // Cette partie sera à adapter selon votre API
        studentMessages.value = [
          { 
            id: 1, 
            subject: 'Bienvenue dans le Master TIIL-A', 
            content: 'Bonjour et bienvenue dans le Master TIIL-A. N\'hésitez pas à contacter le secrétariat pour toute question.', 
            sentDate: '2024-03-01T10:00:00', 
            read: true 
          },
          { 
            id: 2, 
            subject: 'Inscription UE validée', 
            content: 'Votre inscription aux UE obligatoires a été validée. Vous pouvez maintenant choisir vos UE optionnelles.', 
            sentDate: '2024-03-02T14:30:00', 
            read: false 
          }
        ]
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error)
      }
    }
    
    // Chargement des formations disponibles
    const loadFormations = async () => {
      try {
        const response = await store.dispatch('academicYear/fetchAcademicYears')
        formations.value = response
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error)
      }
    }
    
    // Au montage du composant
    onMounted(async () => {
      // Initialiser les références des modals
      editModal.value = document.getElementById('studentEditModal')
      messageModal.value = document.getElementById('sendMessageModal')
      
      // Charger les données
      await loadStudentData()
      await loadStudentGroups()
      await loadStudentModules()
      await loadStudentMessages()
      await loadFormations()
    })
    
    return {
      student,
      studentFormation,
      studentGroups,
      studentModules,
      studentMessages,
      formations,
      editedStudent,
      newMessage,
      loading,
      error,
      submitting,
      isAdmin,
      isCurrentUserProfile,
      statusClass,
      statusText,
      editModal,
      messageModal,
      formatDate,
      getStatusClass,
      getStatusText,
      editStudent,
      saveStudent,
      validateEnrollment,
      validateGroupEnrollment,
      validateModuleEnrollment,
      removeFromGroup,
      removeFromModule,
      showSendMessageModal,
      sendMessage,
      deleteMessage
    }
  }
}
</script>

<style scoped>
.student-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  margin-bottom: 1.5rem;
}

.badge {
  font-size: 0.85rem;
}
</style>