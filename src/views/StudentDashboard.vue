<template>
  <div class="student-dashboard">
    <h1 class="mb-4">Tableau de bord étudiant</h1>
    
    <div v-if="loading" class="d-flex justify-content-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    
    <div v-else>
      <!-- Résumé des informations de l'étudiant -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Informations personnelles</h5>
          <div v-if="studentInfo">
            <p><strong>Numéro d'étudiant:</strong> {{ studentInfo.student.studentNumber }}</p>
            <p><strong>Nom:</strong> {{ studentInfo.student.firstName }} {{ studentInfo.student.lastName }}</p>
            <p><strong>Email:</strong> {{ studentInfo.student.mail }}</p>
          </div>
        </div>
      </div>
      
      <!-- Inscription à une formation -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Ma formation</h5>
          
          <div v-if="!studentInfo || !studentInfo.academicYear">
            <p class="alert alert-warning">
              Vous n'êtes pas encore inscrit à une formation.
            </p>
            <router-link to="/academic-years" class="btn btn-primary">
              Choisir une formation
            </router-link>
          </div>
          
          <div v-else>
            <div class="alert" :class="formationStatusClass">
              {{ formationStatusMessage }}
            </div>
            
            <div v-if="studentInfo.academicYear">
              <p><strong>Formation:</strong> {{ studentInfo.academicYear.formationName }}</p>
              <p><strong>Responsable:</strong> {{ studentInfo.academicYear.responsibleEmail }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Affichage des groupes -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Mes groupes</h5>
          
          <div v-if="!studentInfo || !groupsAssigned">
            <p class="alert alert-info">
              Vous n'êtes pas encore affecté à des groupes. L'affectation sera faite par le responsable de la formation.
            </p>
          </div>
          
          <div v-else>
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Groupe de TD</h6>
                    <p v-if="tdGroup">Groupe TD-{{ tdGroup }}</p>
                    <p v-else>Non affecté</p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Groupe de TP</h6>
                    <p v-if="tpGroup">Groupe TP-{{ tpGroup }}</p>
                    <p v-else>Non affecté</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Messages récents -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Messages récents</h5>
          
          <div v-if="!messages || messages.length === 0">
            <p>Vous n'avez pas de nouveaux messages.</p>
          </div>
          
          <div v-else>
            <div v-for="message in messages.slice(0, 3)" :key="message.id" class="message-item">
              <div class="card mb-2" :class="{ 'border-primary': !message.read }">
                <div class="card-body">
                  <h6 class="card-title">
                    {{ message.subject }}
                    <span v-if="!message.read" class="badge bg-primary ms-2">Nouveau</span>
                  </h6>
                  <p class="card-text">{{ message.content }}</p>
                  <small class="text-muted">{{ formatDate(message.sentDate) }}</small>
                </div>
              </div>
            </div>
            
            <router-link to="/messages" class="btn btn-outline-primary mt-2">
              Voir tous les messages
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'StudentDashboard',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const studentInfo = ref(null)
    const messages = ref([])
    const loading = computed(() => store.getters['isLoading'])
    const user = computed(() => store.getters['auth/user'])
    
    // Vérifier si l'étudiant est affecté à des groupes
    const groupsAssigned = computed(() => {
      if (!studentInfo.value || !studentInfo.value.groups) return false
      return studentInfo.value.groups.length > 0
    })
    
    // Récupérer le numéro du groupe TD
    const tdGroup = computed(() => {
      if (!studentInfo.value || !studentInfo.value.groups) return null
      // Logique simplifiée - à adapter selon la structure réelle des données
      return 1 // Simulé
    })
    
    // Récupérer le numéro du groupe TP
    const tpGroup = computed(() => {
      if (!studentInfo.value || !studentInfo.value.groups) return null
      // Logique simplifiée - à adapter selon la structure réelle des données
      return 2 // Simulé
    })
    
    // Message et classe pour le statut de l'inscription à la formation
    const formationStatusMessage = computed(() => {
      if (!studentInfo.value || !studentInfo.value.student) return ''
      
      const status = studentInfo.value.student.formationEnrollmentStatus
      
      if (status === 'PENDING') {
        return 'Votre demande d\'inscription est en attente de validation.'
      } else if (status === 'ACCEPTED') {
        return 'Votre inscription à la formation a été acceptée.'
      } else if (status === 'REJECTED') {
        return 'Votre demande d\'inscription a été refusée.'
      }
      
      return 'Statut d\'inscription inconnu.'
    })
    
    const formationStatusClass = computed(() => {
      if (!studentInfo.value || !studentInfo.value.student) return 'alert-info'
      
      const status = studentInfo.value.student.formationEnrollmentStatus
      
      if (status === 'PENDING') return 'alert-warning'
      if (status === 'ACCEPTED') return 'alert-success'
      if (status === 'REJECTED') return 'alert-danger'
      
      return 'alert-info'
    })
    
    // Formatage de la date
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Chargement des données au montage du composant
    onMounted(async () => {
      if (!user.value) return
      
      try {
        // Charger les informations de l'étudiant
        const response = await store.dispatch('fetchStudentInfo', user.value.studentNumber)
        studentInfo.value = response
        
        // Charger les messages de l'étudiant
        const messagesResponse = await store.dispatch('message/fetchStudentMessages', user.value.studentNumber)
        messages.value = messagesResponse
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    })
    
    return {
      studentInfo,
      messages,
      loading,
      groupsAssigned,
      tdGroup,
      tpGroup,
      formationStatusMessage,
      formationStatusClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.student-dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.message-item {
  transition: transform 0.2s;
}

.message-item:hover {
  transform: translateX(5px);
}
</style>
