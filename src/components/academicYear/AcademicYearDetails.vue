<template>
  <div class="academic-year-details">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Détails de la formation</h1>
      <div>
        <router-link to="/academic-years" class="btn btn-outline-secondary me-2">
          <i class="bi bi-arrow-left"></i> Retour
        </router-link>
        <button v-if="isAdmin" class="btn btn-primary" @click="editFormation">
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

    <div v-else-if="!formation" class="alert alert-warning">
      Aucune formation trouvée avec cet identifiant.
    </div>

    <div v-else>
      <div class="row">
        <!-- Informations de la formation -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Informations générales</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Nom:</div>
                <div class="col-md-8">{{ formation.formationName }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Responsable:</div>
                <div class="col-md-8">{{ formation.responsibleEmail }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Taille groupe TD:</div>
                <div class="col-md-8">{{ formation.tdGroupSize }} étudiants</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">Taille groupe TP:</div>
                <div class="col-md-8">{{ formation.tpGroupSize }} étudiants</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-4 fw-bold">UE optionnelles:</div>
                <div class="col-md-8">{{ formation.optionalTeachingUnitsCount }} à choisir</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Statistiques</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-8 fw-bold">Nombre d'étudiants:</div>
                <div class="col-md-4">{{ enrolledStudents.length }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-8 fw-bold">Inscriptions en attente:</div>
                <div class="col-md-4">{{ pendingEnrollments }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-8 fw-bold">Inscriptions acceptées:</div>
                <div class="col-md-4">{{ acceptedEnrollments }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-8 fw-bold">Inscriptions refusées:</div>
                <div class="col-md-4">{{ rejectedEnrollments }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-8 fw-bold">Groupes de TD:</div>
                <div class="col-md-4">{{ Math.ceil(enrolledStudents.length / formation.tdGroupSize) }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-md-8 fw-bold">Groupes de TP:</div>
                <div class="col-md-4">{{ Math.ceil(enrolledStudents.length / formation.tpGroupSize) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Étudiants inscrits -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Étudiants inscrits</h5>
          <div>
            <button v-if="isAdmin && pendingEnrollments > 0" class="btn btn-sm btn-light me-2" @click="validateAllPending(true)">
              <i class="bi bi-check-all"></i> Accepter toutes les inscriptions en attente
            </button>
            <button v-if="isAdmin" class="btn btn-sm btn-light" @click="generateGroups">
              <i class="bi bi-diagram-3"></i> Générer les groupes
            </button>
          </div>
        </div>
        <div class="card-body">
          <div v-if="enrolledStudents.length === 0" class="alert alert-info">
            Aucun étudiant inscrit à cette formation.
          </div>
          <div v-else>
            <!-- Filtres -->
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">Rechercher</span>
                  <input type="text" class="form-control" v-model="searchQuery" placeholder="Nom, prénom ou email">
                </div>
              </div>
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">Statut</span>
                  <select class="form-select" v-model="statusFilter">
                    <option value="">Tous</option>
                    <option value="PENDING">En attente</option>
                    <option value="ACCEPTED">Accepté</option>
                    <option value="REJECTED">Refusé</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tableau des étudiants -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th @click="sortBy('studentNumber')">
                    Numéro
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
                  <th>Statut</th>
                  <th>Groupe TD</th>
                  <th>Groupe TP</th>
                  <th v-if="isAdmin">Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="student in filteredStudents" :key="student.studentNumber">
                  <td>{{ student.studentNumber }}</td>
                  <td>{{ student.lastName }}</td>
                  <td>{{ student.firstName }}</td>
                  <td>{{ student.mail }}</td>
                  <td>
                      <span class="badge" :class="getStatusClass(student.formationEnrollmentStatus)">
                        {{ getStatusText(student.formationEnrollmentStatus) }}
                      </span>
                  </td>
                  <td>{{ student.tdGroup || '-' }}</td>
                  <td>{{ student.tpGroup || '-' }}</td>
                  <td v-if="isAdmin">
                    <div class="btn-group btn-group-sm">
                      <router-link :to="`/students/${student.studentNumber}`" class="btn btn-outline-info">
                        <i class="bi bi-eye"></i>
                      </router-link>
                      <button
                          v-if="student.formationEnrollmentStatus === 'PENDING'"
                          class="btn btn-outline-success"
                          @click="validateStudentEnrollment(student.studentNumber, true)"
                      >
                        <i class="bi bi-check"></i>
                      </button>
                      <button
                          v-if="student.formationEnrollmentStatus === 'PENDING'"
                          class="btn btn-outline-danger"
                          @click="validateStudentEnrollment(student.studentNumber, false)"
                      >
                        <i class="bi bi-x"></i>
                      </button>
                      <button
                          class="btn btn-outline-danger"
                          @click="removeStudent(student.studentNumber)"
                      >
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
      </div>

      <!-- Unités d'enseignement (UE) -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Unités d'enseignement</h5>
          <button v-if="isAdmin" class="btn btn-sm btn-light" @click="showAddUeModal">
            <i class="bi bi-plus-circle"></i> Ajouter une UE
          </button>
        </div>
        <div class="card-body">
          <div v-if="teachingUnits.length === 0" class="alert alert-info">
            Aucune UE définie pour cette formation.
          </div>
          <div v-else>
            <div class="row">
              <div class="col-md-6">
                <h6>UE obligatoires</h6>
                <ul class="list-group mb-3">
                  <li v-for="ue in mandatoryUnits" :key="ue.id" class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{ ue.code }}</strong> - {{ ue.name }}
                    </div>
                    <div v-if="isAdmin" class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" @click="editUe(ue)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" @click="deleteUe(ue.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6>UE optionnelles</h6>
                <ul class="list-group">
                  <li v-for="ue in optionalUnits" :key="ue.id" class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{ ue.code }}</strong> - {{ ue.name }}
                    </div>
                    <div v-if="isAdmin" class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" @click="editUe(ue)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" @click="deleteUe(ue.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition de formation -->
    <div class="modal fade" id="formationEditModal" tabindex="-1" aria-hidden="true" ref="editModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Modifier la formation</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveFormation">
              <div class="mb-3">
                <label for="formationName" class="form-label">Nom de la formation</label>
                <input type="text" class="form-control" id="formationName" v-model="editedFormation.formationName" required>
              </div>

              <div class="mb-3">
                <label for="responsibleEmail" class="form-label">Email du responsable</label>
                <input type="email" class="form-control" id="responsibleEmail" v-model="editedFormation.responsibleEmail" required>
              </div>

              <div class="mb-3">
                <label for="tdGroupSize" class="form-label">Taille des groupes de TD</label>
                <input type="number" class="form-control" id="tdGroupSize" v-model="editedFormation.tdGroupSize" required min="1">
              </div>

              <div class="mb-3">
                <label for="tpGroupSize" class="form-label">Taille des groupes de TP</label>
                <input type="number" class="form-control" id="tpGroupSize" v-model="editedFormation.tpGroupSize" required min="1">
              </div>

              <div class="mb-3">
                <label for="optionalTeachingUnitsCount" class="form-label">Nombre d'UE optionnelles à choisir</label>
                <input type="number" class="form-control" id="optionalTeachingUnitsCount" v-model="editedFormation.optionalTeachingUnitsCount" required min="0">
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

    <!-- Modal d'ajout/édition d'UE -->
    <div class="modal fade" id="ueModal" tabindex="-1" aria-hidden="true" ref="ueModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditingUe ? 'Modifier une UE' : 'Ajouter une UE' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUe">
              <div class="mb-3">
                <label for="ueCode" class="form-label">Code de l'UE</label>
                <input type="text" class="form-control" id="ueCode" v-model="currentUe.code" required>
              </div>

              <div class="mb-3">
                <label for="ueName" class="form-label">Nom de l'UE</label>
                <input type="text" class="form-control" id="ueName" v-model="currentUe.name" required>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="ueOptional" v-model="currentUe.optional">
                  <label class="form-check-label" for="ueOptional">
                    UE optionnelle
                  </label>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isEditingUe ? 'Modifier' : 'Ajouter' }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'

export default {
  name: 'AcademicYearDetails',
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    // Références pour les modals
    const editModal = ref(null)
    const ueModal = ref(null)

    // États
    const formation = ref(null)
    const enrolledStudents = ref([])
    const teachingUnits = ref([])
    const editedFormation = ref({})
    const currentUe = ref({
      code: '',
      name: '',
      optional: false
    })

    // Filtres et tri
    const searchQuery = ref('')
    const statusFilter = ref('')
    const sortKey = ref('lastName')
    const sortOrder = ref('asc')

    // Pagination
    const itemsPerPage = 10
    const currentPage = ref(1)

    // États des modals
    const isEditingUe = ref(false)
    const submitting = ref(false)

    // Getters du store
    const loading = computed(() => store.getters['isLoading'])
    const error = computed(() => store.getters['error'])
    const userRole = computed(() => store.getters['auth/userRole'])
    const isAdmin = computed(() => userRole.value === 'admin')

    // Statistiques
    const pendingEnrollments = computed(() => {
      return enrolledStudents.value.filter(s => s.formationEnrollmentStatus === 'PENDING').length
    })

    const acceptedEnrollments = computed(() => {
      return enrolledStudents.value.filter(s => s.formationEnrollmentStatus === 'ACCEPTED').length
    })

    const rejectedEnrollments = computed(() => {
      return enrolledStudents.value.filter(s => s.formationEnrollmentStatus === 'REJECTED').length
    })

    // UE obligatoires et optionnelles
    const mandatoryUnits = computed(() => {
      return teachingUnits.value.filter(ue => !ue.optional)
    })

    const optionalUnits = computed(() => {
      return teachingUnits.value.filter(ue => ue.optional)
    })

    // Filtrage et tri des étudiants
    const filteredStudents = computed(() => {
      let result = [...enrolledStudents.value]

      // Filtrer par recherche
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(student =>
            student.firstName.toLowerCase().includes(query) ||
            student.lastName.toLowerCase().includes(query) ||
            student.mail.toLowerCase().includes(query) ||
            student.studentNumber.toString().includes(query)
        )
      }

      // Filtrer par statut
      if (statusFilter.value) {
        result = result.filter(student =>
            student.formationEnrollmentStatus === statusFilter.value
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

    // Pagination
    const paginatedStudents = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return filteredStudents.value.slice(startIndex, endIndex)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredStudents.value.length / itemsPerPage)
    })

    // Réinitialiser la pagination quand les filtres changent
    watch([searchQuery, statusFilter], () => {
      currentPage.value = 1
    })

    // Helpers pour les statuts
    const getStatusClass = (status) => {
      if (status === 'PENDING') return 'En attente'
      if (status === 'ACCEPTED') return 'Accepté'
      if (status === 'REJECTED') return 'Refusé'
      return 'Non défini'
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

    // Méthode pour ouvrir le modal d'édition
    const editFormation = () => {
      editedFormation.value = { ...formation.value }
      new Modal(editModal.value).show()
    }

    // Méthode pour sauvegarder les modifications de la formation
    const saveFormation = async () => {
      submitting.value = true

      try {
        await store.dispatch('academicYear/updateAcademicYear', {
          id: editedFormation.value.id,
          updatedData: editedFormation.value
        })

        // Mettre à jour la formation dans la vue
        formation.value = { ...editedFormation.value }

        // Fermer le modal
        new Modal(editModal.value).hide()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la formation:', error)
      } finally {
        submitting.value = false
      }
    }

    // Méthode pour valider l'inscription d'un étudiant
    const validateStudentEnrollment = async (studentId, isAccepted) => {
      try {
        await store.dispatch('student/validateStudentFormation', {
          studentId,
          formationId: formation.value.id,
          isAccepted
        })

        // Mettre à jour le statut dans la liste locale
        const student = enrolledStudents.value.find(s => s.studentNumber === studentId)
        if (student) {
          student.formationEnrollmentStatus = isAccepted ? 'ACCEPTED' : 'REJECTED'
        }
      } catch (error) {
        console.error('Erreur lors de la validation de l\'inscription:', error)
      }
    }

    // Méthode pour valider toutes les inscriptions en attente
    const validateAllPending = async (isAccepted) => {
      try {
        const pendingStudents = enrolledStudents.value.filter(s => s.formationEnrollmentStatus === 'PENDING')

        for (const student of pendingStudents) {
          await validateStudentEnrollment(student.studentNumber, isAccepted)
        }
      } catch (error) {
        console.error('Erreur lors de la validation des inscriptions en attente:', error)
      }
    }

    // Méthode pour retirer un étudiant de la formation
    const removeStudent = async (studentId) => {
      if (confirm('Êtes-vous sûr de vouloir retirer cet étudiant de la formation ?')) {
        try {
          await store.dispatch('student/removeStudentFromFormation', {
            studentId,
            formationId: formation.value.id
          })

          // Retirer l'étudiant de la liste locale
          enrolledStudents.value = enrolledStudents.value.filter(s => s.studentNumber !== studentId)
        } catch (error) {
          console.error('Erreur lors du retrait de l\'étudiant:', error)
        }
      }
    }

    // Méthode pour générer les groupes de TD et TP
    const generateGroups = () => {
      if (confirm('Êtes-vous sûr de vouloir (re)générer les groupes ? Cela écrasera les groupes existants.')) {
        try {
          // Filtrer les étudiants acceptés
          const acceptedStudents = enrolledStudents.value.filter(s => s.formationEnrollmentStatus === 'ACCEPTED')

          // Générer les groupes de TD
          const tdGroupCount = Math.ceil(acceptedStudents.length / formation.value.tdGroupSize)

          // Générer les groupes de TP
          const tpGroupCount = Math.ceil(acceptedStudents.length / formation.value.tpGroupSize)

          // Assigner les étudiants aux groupes
          acceptedStudents.forEach((student, index) => {
            student.tdGroup = `TD${Math.floor(index / formation.value.tdGroupSize) + 1}`
            student.tpGroup = `TP${Math.floor(index / formation.value.tpGroupSize) + 1}`
          })

          alert(`Groupes générés avec succès. ${tdGroupCount} groupes de TD et ${tpGroupCount} groupes de TP ont été créés.`)
        } catch (error) {
          console.error('Erreur lors de la génération des groupes:', error)
        }
      }
    }

    // Méthode pour afficher le modal d'ajout d'UE
    const showAddUeModal = () => {
      isEditingUe.value = false
      currentUe.value = {
        code: '',
        name: '',
        optional: false
      }
      new Modal(ueModal.value).show()
    }

    // Méthode pour éditer une UE
    const editUe = (ue) => {
      isEditingUe.value = true
      currentUe.value = { ...ue }
      new Modal(ueModal.value).show()
    }

    // Méthode pour sauvegarder une UE
    const saveUe = async () => {
      submitting.value = true

      try {
        if (isEditingUe.value) {
          // Mise à jour
          // Ici, vous devriez appeler votre API
          const index = teachingUnits.value.findIndex(ue => ue.id === currentUe.value.id)
          if (index !== -1) {
            teachingUnits.value[index] = { ...currentUe.value }
          }
        } else {
          // Création
          // Ici, vous devriez appeler votre API
          const newUe = {
            id: Date.now(), // Temporaire, à remplacer par l'ID généré par le backend
            ...currentUe.value,
            academicYearId: formation.value.id
          }
          teachingUnits.value.push(newUe)
        }

        // Fermer le modal
        new Modal(ueModal.value).hide()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'UE:', error)
      } finally {
        submitting.value = false
      }
    }

    // Méthode pour supprimer une UE
    const deleteUe = async (ueId) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette UE ?')) {
        try {
          // Ici, vous devriez appeler votre API
          teachingUnits.value = teachingUnits.value.filter(ue => ue.id !== ueId)
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'UE:', error)
        }
      }
    }

    // Chargement des données au montage du composant
    onMounted(async () => {
      const formationId = parseInt(route.params.id)

      try {
        // Initialiser les références des modals
        editModal.value = document.getElementById('formationEditModal')
        ueModal.value = document.getElementById('ueModal')

        // Charger la formation
        const formationResponse = await store.dispatch('academicYear/fetchAcademicYear', formationId)
        formation.value = formationResponse

        // Charger les étudiants inscrits à cette formation
        const studentsResponse = await store.dispatch('student/fetchStudents')
        enrolledStudents.value = studentsResponse.filter(s => s.academicYearId === formationId)

        // Simuler des UE pour la démo
        teachingUnits.value = [
          { id: 1, code: 'UE1', name: 'Algorithmique avancée', optional: false, academicYearId: formationId },
          { id: 2, code: 'UE2', name: 'Base de données', optional: false, academicYearId: formationId },
          { id: 3, code: 'UE3', name: 'Intelligence artificielle', optional: true, academicYearId: formationId },
          { id: 4, code: 'UE4', name: 'Réseaux et sécurité', optional: true, academicYearId: formationId },
          { id: 5, code: 'UE5', name: 'Développement web', optional: true, academicYearId: formationId }
        ]

        // Simuler des groupes pour les étudiants
        if (enrolledStudents.value.length > 0) {
          enrolledStudents.value.forEach((student, index) => {
            if (student.formationEnrollmentStatus === 'ACCEPTED') {
              student.tdGroup = `TD${Math.floor(index / formation.value.tdGroupSize) + 1}`
              student.tpGroup = `TP${Math.floor(index / formation.value.tpGroupSize) + 1}`
            } else {
              student.tdGroup = null
              student.tpGroup = null
            }
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    })

    return {
      formation,
      enrolledStudents,
      teachingUnits,
      filteredStudents,
      paginatedStudents,
      pendingEnrollments,
      acceptedEnrollments,
      rejectedEnrollments,
      mandatoryUnits,
      optionalUnits,
      editedFormation,
      currentUe,
      loading,
      error,
      submitting,
      searchQuery,
      statusFilter,
      sortKey,
      sortOrder,
      currentPage,
      totalPages,
      isAdmin,
      isEditingUe,
      Math, // Pour les calculs dans le template
      editModal,
      ueModal,
      getStatusClass,
      getStatusText,
      sortBy,
      editFormation,
      saveFormation,
      validateStudentEnrollment,
      validateAllPending,
      removeStudent,
      generateGroups,
      showAddUeModal,
      editUe,
      saveUe,
      deleteUe
    }
  }
}
</script>

<style scoped>
.academic-year-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: bold;
}

th {
  cursor: pointer;
}

th:hover {
  background-color: #f8f9fa;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>'bg-warning'
if (status === 'ACCEPTED') return 'bg-success'
if (status === 'REJECTED') return 'bg-danger'
return 'bg-secondary'
}

const getStatusText = (status) => {
if (status === 'PENDING') return
