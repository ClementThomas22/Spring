<template>
  <div id="app">
    <Navbar v-if="isAuthenticated" />
    <div class="container-fluid">
      <div class="row">
        <Sidebar v-if="isAuthenticated" class="col-md-3 col-lg-2 d-md-block bg-light sidebar" />
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <router-view />
        </main>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import Navbar from '@/components/common/Navbar.vue'
import Sidebar from '@/components/common/Sidebar.vue'
import Footer from '@/components/common/Footer.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar,
    Footer
  },
  setup() {
    const store = useStore()
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

    return {
      isAuthenticated
    }
  }
}
</script>

<style>
/* Global styles */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f8f9fa;
}

.sidebar {
  position: fixed;
  top: 56px;
  left: 0;
  height: calc(100vh - 56px);
  z-index: 100;
  padding: 1rem;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
}

main {
  padding: 2rem 1rem;
}

@media (min-width: 768px) {
  main {
    padding-top: 4rem;
  }
}
</style>
