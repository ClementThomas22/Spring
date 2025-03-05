<template>
  <footer class="footer mt-auto py-3 bg-light">
    <div class="container text-center">
      <span class="text-muted">© {{ currentYear }} Gestion des Étudiants - Projet UBO Master TIIL-A & ILIADE</span>
    </div>
  </footer>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AppFooter',
  setup() {
    const currentYear = ref(new Date().getFullYear())
    
    return {
      currentYear
    }
  }
}
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  line-height: 60px;
  background-color: #f5f5f5;
}
</style>
