<template>
  <div class="admin-dashboard">
    <h1 class="mb-4">Tableau de bord administrateur</h1>

    <div v-if="loading" class="d-flex justify-content-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else>
      <!-- Cartes de statistiques -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white h-100">
            <div class="card-body d-flex flex-column align-items-center">
              <h2 class="card-title">{{ studentCount }}</h2>
              <p class="card-text">Étudiants</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body d-flex flex-column align-items-center">
              <h2 class="card-title">{{ formationCount }}</h2>
              <p class="card-text">Formations</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body d-flex flex-column align-items-center">
              <h2 class="card-title">{{ pendingEnrollments }}</h2>
              <p class="card-text">Inscriptions en attente</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white h-100">
            <div class="card-body d-flex flex-column align-items-center">
              <h2 class="card-title">{{ messageCount }}</h2>
              <p class="card-text">Messages</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Inscriptions récentes -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Inscriptions récentes en attente</h5>
          <router-link to="/students" class="btn btn-sm btn-primary">Voir tout</router-link>
        </div>
        <div class="card-body">
          <div v-if="pendingStudentEnrollments.length === 0" class="alert alert-info">
            Aucune inscription en attente.
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Formation</th>
                  <th>Date de demande</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="enrollment in pendingStudentEnrollments" :key="enrollment.id">
                  <td>
                    <router-link :to="`/students/${enrollment.studentNumber}`">
                      {{ enrollment.studentName }}
                    </router-link>
                  </td>
                  <td>{{ enrollment.formationName }}</td>
                  <td>{{ formatDate(enrollment.requestDate) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-success" @click="validateEnrollment(enrollment.studentNumber, enrollment.formationId, true)">
                        <i class="bi bi-check-circle"></i>
                      </button>
                      <button class="btn btn-danger" @click="validateEnrollment(enrollment.studentNumber, enrollment.formationId, false)">
                        <i class="bi bi-x-circle"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Formations les plus populaires -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Formations les plus populaires</h5>
              <router-link to="/academic-years" class="btn btn-sm btn-primary">Gérer</router-link>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="formationsChart" ref="formationsChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Activité récente</h5>
              <button class="btn btn-sm btn-primary" @click="refreshActivity">Actualiser</button>
            </div>
            <div class="card-body">
              <div v-if="activities.length === 0" class="alert alert-info">
                Aucune activité récente.
              </div>
              <ul v-else class="list-group">
                <li v-for="(activity, index) in activities" :key="index" class="list-group-item">
                  <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">{{ activity.title }}</h6>
                    <small>{{ formatDateRelative(activity.date) }}</small>
                  </div>
                  <p class="mb-1">{{ activity.description }}</p>
                  <small>{{ activity.user }}</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages récents -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Messages récents</h5>
          <router-link to="/messages" class="btn btn-sm btn-primary">Voir tout</router-link>
        </div>
        <div class="card-body">
          <div v-if="recentMessages.length === 0" class="alert alert-info">
            Aucun message récent.
          </div>
          <div v-else>
            <div v-for="message in recentMessages" :key="message.id" class="card mb-2">
              <div class="card-body">
                <h6 class="card-title">{{ message.subject }}</h6>
                <p class="card-text">{{ message.content }}</p>
                <div class="d-flex justify-content-between">
                  <small class="text-muted">
                    Envoyé à: 
                    <router-link :to="`/students/${message.studentId}`">
                      {{ message.studentName }}
                    </router-link>
                    le {{ formatDate(message.sentDate) }}
                  </small>
                  <div>
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'

export default {
  name: 'AdminDashboard',
  setup() {
    const store = useStore()
    const formationsChart = ref(null)
    
    // États
    const students = ref([])
    const formations = ref([])
    const pendingStudentEnrollments = ref([])
    const activities = ref([])
    const recentMessages = ref([])
    
    // Getters du store
    const loading = computed(() => store.getters['isLoading'])
    
    // Statistiques
    const studentCount = computed(() => students.value.length)
    const formationCount = computed(() => formations.value.length)
    const pendingEnrollments = computed(() => pendingStudentEnrollments.value.length)
    const messageCount = computed(() => recentMessages.value.length)
    
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
    
    // Formatage relatif de la date (il y a X jours)
    const formatDateRelative = (dateString) => {
      if (!dateString) return 'Date inconnue'
      
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) {
          return 'Aujourd\'hui'
        } else if (diffDays === 1) {
          return 'Hier'
        } else {
          return `Il y a ${diffDays} jours`
        }
      } catch (e) {
        return dateString
      }
    }
    
    // Méthode pour valider une inscription
    const validateEnrollment = async (studentId, formationId, isAccepted) => {
      try {
        await store.dispatch('student/validateStudentFormation', {
          studentId,
          formationId,
          isAccepted
        })
        
        // Recharger les inscriptions en attente
        await loadPendingEnrollments()
      } catch (error) {
        console.error('Erreur lors de la validation de l\'inscription:', error)
      }
    }
    
    // Méthode pour supprimer un message
    const deleteMessage = async (messageId) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
        try {
          await store.dispatch('message/deleteMessage', messageId)
          
          // Recharger les messages
          await loadRecentMessages()
        } catch (error) {
          console.error('Erreur lors de la suppression du message:', error)
        }
      }
    }
    
    // Méthode pour actualiser l'activité récente
    const refreshActivity = async () => {
      await loadActivities()
    }
    
    // Initialisation du graphique
    const initFormationsChart = () => {
      if (!formationsChart.value) return
      
      // Préparer les données pour le graphique
      const data = {
        labels: formations.value.map(f => f.formationName),
        datasets: [{
          label: 'Nombre d\'étudiants inscrits',
          data: formations.value.map(f => f.studentCount || 0),
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(75, 192, 192)',
            'rgb(255, 205, 86)',
            'rgb(255, 99, 132)',
            'rgb(153, 102, 255)'
          ],
          borderWidth: 1
        }]
      }
      
      // Configuration du graphique
      const config = {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      }
      
      // Création du graphique
      new Chart(formationsChart.value, config)
    }
    
    // Chargement des étudiants
    const loadStudents = async () => {
      try {
        const response = await store.dispatch('student/fetchStudents')
        students.value = response
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error)
      }
    }
    
    // Chargement des formations
    const loadFormations = async () => {
      try {
        const response = await store.dispatch('academicYear/fetchAcademicYears')
        formations.value = response
        
        // Ajouter un compteur d'étudiants à chaque formation
        formations.value.forEach(formation => {
          formation.studentCount = students.value.filter(s => s.academicYearId === formation.id).length
        })
        
        // Trier par popularité
        formations.value.sort((a, b) => b.studentCount - a.studentCount)
        
        // Initialiser le graphique après le chargement des données
        setTimeout(() => {
          initFormationsChart()
        }, 0)
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error)
      }
    }
    
    // Chargement des inscriptions en attente
    const loadPendingEnrollments = async () => {
      try {
        // Dans une vraie implémentation, vous auriez une API spécifique pour cela
        // Ici, on filtre les étudiants qui ont une formation et un statut en attente
        pendingStudentEnrollments.value = students.value
          .filter(s => s.academicYearId && s.formationEnrollmentStatus === 'PENDING')
          .map(s => {
            const formation = formations.value.find(f => f.id === s.academicYearId)
            return {
              id: `${s.studentNumber}-${s.academicYearId}`,
              studentNumber: s.studentNumber,
              studentName: `${s.firstName} ${s.lastName}`,
              formationId: s.academicYearId,
              formationName: formation ? formation.formationName : 'Formation inconnue',
              requestDate: new Date().toISOString().split('T')[0], // Simulé
              status: s.formationEnrollmentStatus
            }
          })
      } catch (error) {
        console.error('Erreur lors du chargement des inscriptions en attente:', error)
      }
    }
    
    // Chargement des activités récentes
    const loadActivities = async () => {
      try {
        // Simuler des activités récentes
        activities.value = [
          {
            title: 'Nouvel étudiant inscrit',
            description: 'Un nouvel étudiant s\'est inscrit à la plateforme.',
            user: 'Système',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Hier
          },
          {
            title: 'Formation mise à jour',
            description: 'La formation "Master TIIL-A" a été mise à jour.',
            user: 'Admin',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Il y a 2 jours
          },
          {
            title: 'Nouvelles UE ajoutées',
            description: 'Trois nouvelles UE ont été ajoutées à la formation "Master ILIADE".',
            user: 'Admin',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // Il y a 3 jours
          },
          {
            title: 'Message envoyé à tous les étudiants',
            description: 'Un message a été envoyé à tous les étudiants concernant la semaine de révision.',
            user: 'Admin',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // Il y a 5 jours
          }
        ]
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error)
      }
    }
    
    // Chargement des messages récents
    const loadRecentMessages = async () => {
      try {
        // Simuler des messages récents
        recentMessages.value = [
          {
            id: 1,
            subject: 'Bienvenue dans le Master TIIL-A',
            content: 'Bonjour et bienvenue dans le Master TIIL-A. N\'hésitez pas à contacter le secrétariat pour toute question.',
            studentId: 1,
            studentName: 'Jean Dupont',
            sentDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Hier
          },
          {
            id: 2,
            subject: 'Informations importantes - Rentrée 2024',
            content: 'Veuillez trouver ci-joint les informations concernant la rentrée universitaire 2024.',
            studentId: 2,
            studentName: 'Marie Martin',
            sentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Il y a 2 jours
          },
          {
            id: 3,
            subject: 'Validation de votre inscription',
            content: 'Votre inscription au Master ILIADE a été validée. Félicitations !',
            studentId: 3,
            studentName: 'Pierre Durand',
            sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // Il y a 3 jours
          }
        ]
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error)
      }
    }
    
    // Au montage du composant
    onMounted(async () => {
      // Charger les données
      await loadStudents()
      await loadFormations()
      await loadPendingEnrollments()
      await loadActivities()
      await loadRecentMessages()
    })
    
    return {
      students,
      formations,
      pendingStudentEnrollments,
      activities,
      recentMessages,
      loading,
      studentCount,
      formationCount,
      pendingEnrollments,
      messageCount,
      formationsChart,
      formatDate,
      formatDateRelative,
      validateEnrollment,
      deleteMessage,
      refreshActivity
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
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

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>
