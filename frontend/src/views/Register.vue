<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const form = ref({ username: '', email: '', password: '' });
const error = ref('');
const isSubmitting = ref(false);
const isSuccess = ref(false);

const handleRegister = async () => {
  isSubmitting.value = true;
  error.value = '';
  try {
    await api.register(form.value);
    isSuccess.value = true;
    
    // Smooth transition to login after showing success state
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data || "Registration failed";
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden font-sans selection:bg-indigo-500/30">
    
    <div class="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 1s;"></div>
    <div class="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 3s;"></div>

    <transition name="fade-up" appear>
      <div class="relative z-10 w-full max-w-[460px] px-6">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-2xl shadow-indigo-500/20 mb-6 -rotate-3">
            <span class="text-white text-2xl font-black italic">S</span>
          </div>
          <h1 class="text-4xl font-[900] tracking-tighter text-white mb-2 italic">
            JOIN THE<span class="text-indigo-500">HUB</span>
          </h1>
          <p class="text-slate-400 font-medium">Start creating insights in seconds.</p>
        </div>

        <div class="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl shadow-black/50">
          <form @submit.prevent="handleRegister" class="space-y-5">
            
            <transition name="shake">
              <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                {{ error }}
              </div>
            </transition>

            <div class="space-y-4">
              <div class="group relative">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4 mb-2 block">Username</label>
                <input 
                  v-model="form.username" 
                  type="text" 
                  placeholder="survey_ninja" 
                  class="w-full bg-slate-800/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                  required 
                />
              </div>

              <div class="group relative">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4 mb-2 block">Email Address</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  placeholder="hello@world.com" 
                  class="w-full bg-slate-800/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                  required 
                />
              </div>

              <div class="group relative">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4 mb-2 block">Password</label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="••••••••" 
                  class="w-full bg-slate-800/40 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="isSubmitting || isSuccess"
              class="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 overflow-hidden group relative"
              :class="[
                isSuccess 
                ? 'bg-emerald-500 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]'
              ]"
            >
              <span v-if="!isSubmitting && !isSuccess">Create Account →</span>
              <span v-else-if="isSuccess">Welcome Aboard! ✓</span>
              <div v-else class="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </button>
          </form>

          <div class="mt-8 text-center">
            <p class="text-slate-500 text-sm font-bold">
              Already a member? 
              <router-link to="/login" class="text-indigo-400 hover:text-indigo-300 transition-colors ml-1">Log In Here</router-link>
            </p>
          </div>
        </div>

        <p class="mt-12 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          By joining, you agree to our Terms of Insight
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

@keyframes pulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.1); }
}
</style>