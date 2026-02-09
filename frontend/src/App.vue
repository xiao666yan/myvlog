<template>
  <div class="app-container">
    <template v-if="!isAdminRoute">
      <NavBar />
      <SideBar />
    </template>
    <main :class="['main-content', { 'admin-mode': isAdminRoute }]">
      <router-view />
    </main>

    <!-- Global Message -->
    <div v-if="visible" class="alert-overlay">
      <div :class="['alert-box', type]">
        {{ message }}
      </div>
    </div>

    <!-- Global Confirm -->
    <div v-if="confirmVisible" class="modal-overlay">
      <div class="modal">
        <h3>确认操作</h3>
        <p>{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button @click="handleConfirm(false)" class="btn-secondary">取消</button>
          <button @click="handleConfirm(true)" class="btn-primary">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import SideBar from './components/SideBar.vue';
import { useMessage } from './utils/message';
import { useConfirm, handleConfirm } from './utils/confirm';

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'));
const { message, type, visible } = useMessage();
const { message: confirmMessage, visible: confirmVisible } = useConfirm();
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  margin-top: 64px; /* Height of the navbar */
  margin-left: 260px; /* Width of the sidebar */
  flex: 1;
  width: calc(100% - 260px);
  transition: margin-left 0.3s, width 0.3s;
}

.main-content.admin-mode {
  margin-top: 0;
  margin-left: 0;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
  }
}
</style>
