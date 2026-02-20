<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const form = ref({ email: '', password: '' });
const error = ref('');
const isSubmitting = ref(false);

const handleLogin = async () => {
  isSubmitting.value = true;
  error.value = '';
  try {
    const res = await api.login(form.value);
    const token = res.data.token || res.data; 
    localStorage.setItem('token', token);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data || "Invalid Credentials";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden font-sans selection:bg-blue-500/30">
    
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>

    <transition name="fade-up" appear>
      <div class="relative z-10 w-full max-w-[440px] px-6">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-2xl shadow-blue-500/20 mb-6 rotate-3">
            <span class="text-white text-2xl font-black italic">S</span>
          </div>
          <h1 class="text-4xl font-[900] tracking-tighter text-white mb-2 italic">
            WELCOME<span class="text-blue-500">BACK</span>
          </h1>
          <p class="text-slate-400 font-medium">Step inside to manage your insights.</p>
        </div>

        <div class="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl shadow-black/50">
          <form @submit.prevent="handleLogin" class="space-y-6">
            
            <transition name="shake">
              <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
                {{ error }}
              </div>
            </transition>

            <div class="space-y-4">
              <div class="group relative">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4 mb-2 block">Email Address</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  placeholder="name@company.com" 
                  class="w-full bg-slate-800/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                  required 
                />
              </div>

              <div class="group relative">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4 mb-2 block">Password</label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="••••••••" 
                  class="w-full bg-slate-800/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
            >
              <span v-if="!isSubmitting">Secure Login →</span>
              <div v-else class="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </button>
          </form>

          <div class="mt-8 text-center">
            <p class="text-slate-500 text-sm font-bold">
              New explorer? 
              <router-link to="/register" class="text-blue-400 hover:text-blue-300 transition-colors ml-1">Create Account</router-link>
            </p>
          </div>
        </div>

        <p class="mt-12 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          Protected by AES-256 Encryption
        </p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-up-enter-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.shake-enter-active {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

/* Smooth Pulse for BG Glow */
@keyframes pulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.1); }
}
</style>