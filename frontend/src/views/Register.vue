<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const form = ref({ username: '', email: '', password: '' });
const error = ref('');

const handleRegister = async () => {
  try {
    await api.register(form.value);
    alert('Success! Now please login.');
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data || "Registration failed";
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form @submit.prevent="handleRegister" class="bg-white p-8 rounded shadow-md w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
      <div v-if="error" class="bg-red-100 text-red-600 p-2 mb-4 text-sm rounded">{{ error }}</div>
      <input v-model="form.username" type="text" placeholder="Username" class="w-full border p-2 mb-4 rounded" required />
      <input v-model="form.email" type="email" placeholder="Email" class="w-full border p-2 mb-4 rounded" required />
      <input v-model="form.password" type="password" placeholder="Password" class="w-full border p-2 mb-6 rounded" required />
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Create Account</button>
      <p class="mt-4 text-center text-sm">Already have an account? <router-link to="/login" class="text-blue-500">Login</router-link></p>
    </form>
  </div>
</template>