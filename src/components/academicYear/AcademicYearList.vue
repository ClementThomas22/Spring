<template>
  <div class="academic-year-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Liste des formations</h1>
      <button v-if="isAdmin" class="btn btn-primary" @click="showAddFormationModal">
        <i class="bi bi-plus-circle"></i> Ajouter une formation
      </button>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-12">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher une formation..." 
                v-model="searchQuery"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Liste des formations -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="d-flex justify-content-center my-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        
        <div v-else-if="filteredFormations.length === 0" class="alert alert-info">
          Aucune formation ne correspond à vos critères de recherche.
        </div>
        
        <div v-else>
          <div class="row">
            <div class="col-md-6 col-lg-4 mb-4" v-for="formation in filteredFormations" :key="formation.id">
              <div class="card h-100">
                <div class="card-header bg-primary text-white">
                  <h5 class="card-title mb-0">{{ formation.formationName }}</h5>
                </div>
                <div class="card-body">
                  <p class="card-text">
                    <strong>Responsable:</strong> {{ formation.responsibleEmail }}
                  </p>
                  <p class="card-text">
                    <strong>Taille groupe TD:</strong> {{ formation.tdGroupSize }} étudiants
                  </p>
                  <p class="card-text">
                    <strong>Taille groupe TP:</strong> {{ formation.tpGroupSize }} étudiants
                  </p>
                  <p class="card-text">
                    <strong>UE optionnelles à choisir:</strong> {{ formation.optionalTeachingUnitsCount }}
                  </p>
                  
                  <div v-if="isStudent && canEnroll" class="mt-3">
                    <button 
                      class="btn btn-primary" 
                      @click="enrollInFormation(formation)"
                      :disabled="isStudentEnrolled(formation.id)"
                    >
                      {{ isStudentEnrolled(formation.id) ? 'Déjà inscrit' : 'S\'inscrire' }}
                    </button>
                  </div>
                </div>
                <div v-if="isAdmin" class="card-footer d-flex justify-content-between">
                  <router-link :to="`/academic-years/${formation.id}`" class="btn btn-outline-info">
                    <i class="bi bi-eye"></i> Détails
                  </router-link>
                  <div>
                    <button class="btn btn-outline-primary me-2" @click="editFormation(formation)">
                      <i class="bi bi-pencil"></i> Modifier
                    </button>
                    <button class="btn btn-outline-danger" @click="confirmDeleteFormation(formation)">
                      <i class="bi bi-trash"></i> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal d'ajout/modification de formation -->
    <div class="modal fade" id="formationModal" tabindex="-1" aria-hidden="true" ref="formationModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Modifier une formation' : 'Ajouter une formation' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveFormation">
              <div class="mb-3">
                <label for="formationName" class="form-label">Nom de la formation</label>
                <input type="text" class="form-control" id="formationName" v-model="currentFormation.formationName" required>
              </div>
              
              <div class="mb-3">
                <label for="responsibleEmail" class="form-label">Email du responsable</label>
                <input type="email" class="form-control" id="responsibleEmail" v-model="currentFormation.responsibleEmail" required>
              </div>
              
              <div class="mb-3">
                <label for="tdGroupSize" class="form-label">Taille des groupes de TD</label>
                <input type="number" class="form-control" id="tdGroupSize" v-model="currentFormation.tdGroupSize" required min="1">
              </div>
              
              <div class="mb-3">
                <label for="tpGroupSize" class="form-label">Taille des groupes de TP</label>
                <input type="number" class="form-control" id="tpGroupSize" v-model="currentFormation.tpGroupSize" required min="1">
              </div>
              
              <div class="mb-3">
                <label for="optionalTeachingUnitsCount" class="form-label">Nombre d'UE optionnelles à choisir</label>
                <input type="number" class="form-control" id="optionalTeachingUnitsCount" v-model="currentFormation.optionalTeachingUnitsCount" required min="0">
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
            <p>Êtes-vous sûr de vouloir supprimer la formation <strong v-if="formationToDelete">{{ formationToDelete.formationName }}</strong> ?</p>
            <p class="text-danger">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-danger" @click="deleteFormation" :disabled="submitting">
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
  name: 'AcademicYearList',
  setup() {
    const store = useStore()
    
    // Références pour les modals
    const formationModal = ref(null)
    const deleteModal = ref(null)
    
    // États
    const formations = ref([])
    const currentFormation = ref({
      formationName: '',
      responsibleEmail: '',
      tdGroupSize: 30,
      tpGroupSize: 15,
      optionalTeachingUnitsCount: 2
    })
    const formationToDelete = ref(null)
    const isEditing = ref(false)
    const submitting = ref(false)
    const searchQuery = ref('')
    
    // Getters du store
    const loading = computed(() => store.getters['isLoading'])
    const user = computed(() => store.getters['auth/user'])
    const userRole = computed(() => store.getters['auth/userRole'])
    
    // Autorisations