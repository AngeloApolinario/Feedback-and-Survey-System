<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const form = ref({ email: '', password: '' });
const error = ref('');

const handleLogin = async () => {
  try {
    const res = await api.login(form.value);
    const token = res.data.token || res.data; 
    localStorage.setItem('token', token);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data || "Invalid Credentials";
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form @submit.prevent="handleLogin" class="bg-white p-8 rounded shadow-md w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <div v-if="error" class="bg-red-100 text-red-600 p-2 mb-4 text-sm rounded">{{ error }}</div>
      <input v-model="form.email" type="email" placeholder="Email" class="w-full border p-2 mb-4 rounded" required />
      <input v-model="form.password" type="password" placeholder="Password" class="w-full border p-2 mb-6 rounded" required />
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Login</button>
      <p class="mt-4 text-center text-sm">New here? <router-link to="/register" class="text-blue-500">Register</router-link></p>
    </form>
  </div>
</template>