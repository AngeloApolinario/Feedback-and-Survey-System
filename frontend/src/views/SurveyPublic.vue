<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const token = localStorage.getItem('token');
  const surveyId = route.params.id;

  if (!token) {
    router.push({ 
      path: '/login', 
      query: { redirect: `/survey/${surveyId}` } 
    });
  } else {
    router.push({ 
      path: '/dashboard', 
      query: { open: surveyId } 
    });
  }
});
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <p class="text-slate-400 animate-pulse font-bold">Verifying access...</p>
  </div>
</template>