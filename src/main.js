import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import AuthService from '@/services/authService';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

// Initialize AuthService with Pinia so it can access stores and manage session
AuthService.init(pinia, { idleTimeoutMs: 15 * 60 * 1000, warningTimeoutMs: 60 * 1000 });

app.mount('#app');