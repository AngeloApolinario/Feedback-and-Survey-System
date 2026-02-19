<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

const viewMode = ref('creator'); 
const loading = ref(true);
const mySurveys = ref([]);
const exploreSurveys = ref([]);
const isProfileOpen = ref(false);

const isCreateOpen = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const surveyForm = ref({
  title: '',
  description: '',
  questions: [{ questionText: '', options: ['', ''] }]
});

const selectedSurveyAnalytics = ref(null);
const activeSurvey = ref(null);
const currentQuestionIndex = ref(0);
const userAnswers = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.getDashboardData();
    mySurveys.value = res.data.mySurveys || [];
    exploreSurveys.value = res.data.explore || [];
  } catch (err) {
    console.error("Dashboard Fetch Error", err);
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

const openCreate = () => {
  isEditing.value = false;
  surveyForm.value = { title: '', description: '', questions: [{ questionText: '', options: ['', ''] }] };
  isCreateOpen.value = true;
};

const openEdit = (s) => {
  isEditing.value = true;
  editingId.value = s._id;
  surveyForm.value = JSON.parse(JSON.stringify(s));
  isCreateOpen.value = true;
};

const confirmDelete = async (id) => {
  if (confirm("Permanently delete this survey and all collected responses?")) {
    try {
      await api.deleteSurvey(id);
      await fetchData();
    } catch (err) { alert("Delete failed"); }
  }
};

const saveSurvey = async () => {
  try {
    if (isEditing.value) await api.updateSurvey(editingId.value, surveyForm.value);
    else await api.createSurvey(surveyForm.value);
    isCreateOpen.value = false;
    await fetchData();
  } catch (err) { alert("Error saving survey."); }
};

const startSurvey = (s) => {
  activeSurvey.value = s;
  currentQuestionIndex.value = 0;
  userAnswers.value = s.questions.map(() => null);
};

const selectOption = (opt) => {
  userAnswers.value[currentQuestionIndex.value] = opt;
  setTimeout(() => {
    if (currentQuestionIndex.value < activeSurvey.value.questions.length - 1) currentQuestionIndex.value++;
  }, 400);
};

const submitSurveyAnswers = async () => {
  try {
    const payload = {
      surveyId: activeSurvey.value._id,
      answers: userAnswers.value.map((ans, idx) => ({ questionIndex: idx, selectedOption: ans }))
    };
    await api.submitAnswer(payload);
    activeSurvey.value = null;
    await fetchData();
  } catch (err) { alert("Submission error."); }
};

onMounted(fetchData);
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
    
    <header class="bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/60">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <h1 class="text-2xl font-[900] tracking-tighter text-slate-800 italic">SURVEY<span class="text-blue-600">HUB</span></h1>
          
          <nav class="hidden md:flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button @click="viewMode = 'creator'" :class="viewMode === 'creator' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'" class="px-6 py-2 rounded-xl text-sm font-bold transition-all">Manage</button>
            <button @click="viewMode = 'respondent'" :class="viewMode === 'respondent' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'" class="px-6 py-2 rounded-xl text-sm font-bold transition-all">Explore</button>
          </nav>
        </div>

        <div class="relative">
          <button @click="isProfileOpen = !isProfileOpen" class="group flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-slate-50 transition-colors">
            <div class="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">ME</div>
            <span class="text-sm font-bold text-slate-600 group-hover:text-slate-900">Account</span>
          </button>
          
          <transition name="pop">
            <div v-if="isProfileOpen" class="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 p-2 ring-1 ring-black/5 overflow-hidden">
              
              <button @click="handleLogout" class="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-between group">
                Log Out
                <span class="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-12">
      <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 class="text-5xl font-[900] tracking-tight text-slate-900 mb-4">
            {{ viewMode === 'creator' ? 'Design' : 'Discover' }}
          </h2>
          <p class="text-slate-500 text-lg max-w-lg leading-relaxed">
            {{ viewMode === 'creator' ? 'Create powerful surveys and turn feedback into actionable data insights.' : 'Shape the future by providing honest feedback on community projects.' }}
          </p>
        </div>
        <button v-if="viewMode === 'creator'" @click="openCreate" class="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-2xl shadow-blue-200">
          + Create Survey
        </button>
      </div>

      <div v-if="!loading">
        <div v-if="(viewMode === 'creator' ? mySurveys.length : exploreSurveys.length) > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="s in (viewMode === 'creator' ? mySurveys : exploreSurveys)" :key="s._id" 
            class="group bg-white p-10 rounded-[3rem] border border-slate-200 hover:border-blue-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all flex flex-col h-full relative overflow-hidden">
            
            <div v-if="viewMode === 'creator'" class="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
              <button @click="openEdit(s)" class="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">✎</button>
              <button @click="confirmDelete(s._id)" class="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">×</button>
            </div>

            <div class="mb-8">
              <span v-if="viewMode === 'respondent'" class="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">BY {{ s.creator?.username }}</span>
              <span v-else class="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{{ s.totalResponses || 0 }} RESPONSES</span>
            </div>

            <h3 class="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors leading-tight">{{ s.title }}</h3>
            <p class="text-slate-500 text-sm line-clamp-2 mb-10 leading-relaxed">{{ s.description || 'No description provided.' }}</p>
            
            <button @click="viewMode === 'creator' ? selectedSurveyAnalytics = s : startSurvey(s)" 
              class="mt-auto w-full py-5 rounded-[1.5rem] font-black text-sm tracking-widest border-2 transition-all flex items-center justify-center gap-3"
              :class="viewMode === 'creator' ? 'bg-slate-900 text-white border-slate-900 hover:bg-blue-600 hover:border-blue-600' : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'">
              {{ viewMode === 'creator' ? 'VIEW ANALYTICS' : 'START SURVEY' }}
              <span>→</span>
            </button>
          </div>
        </div>

        <div v-else class="py-24 flex flex-col items-center text-center">
          <div class="h-24 w-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-8">
          </div>
          <h3 class="text-2xl font-black mb-2">Nothing here yet</h3>
          <p class="text-slate-400 max-w-xs mb-8">It looks like there are no surveys in this section. Ready to change that?</p>
          <button v-if="viewMode === 'creator'" @click="openCreate" class="text-blue-600 font-black hover:underline underline-offset-8 transition-all tracking-widest text-sm uppercase">Create Your First Project</button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="i" class="h-80 bg-slate-200 animate-pulse rounded-[3rem]"></div>
      </div>
    </main>

    <transition name="slide">
      <div v-if="isCreateOpen" class="fixed inset-0 z-50 overflow-hidden flex justify-end">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isCreateOpen = false"></div>
        <div class="relative w-screen max-w-xl bg-white shadow-2xl rounded-l-[4rem] p-12 flex flex-col">
          <div class="flex items-center justify-between mb-12">
            <h2 class="text-3xl font-black tracking-tight">{{ isEditing ? 'Edit' : 'Create' }} <span class="text-blue-600">Survey</span></h2>
            <button @click="isCreateOpen = false" class="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-2xl hover:bg-slate-100 transition-colors">&times;</button>
          </div>

          <div class="space-y-10 flex-grow overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Survey Title</label>
              <input v-model="surveyForm.title" class="w-full bg-slate-50 border-none rounded-2xl p-6 font-bold focus:ring-2 focus:ring-blue-500 mt-2" placeholder="e.g., Team Culture Poll" />
            </div>

            <div class="space-y-8">
              <div v-for="(q, qIdx) in surveyForm.questions" :key="qIdx" class="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                <input v-model="q.questionText" class="w-full bg-transparent border-b-2 border-slate-200 py-2 focus:outline-none focus:border-blue-600 font-bold text-lg" placeholder="Question Text" />
                
                <div class="space-y-3">
                  <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="flex items-center gap-3 group">
                    <input v-model="q.options[oIdx]" class="flex-grow bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Option..." />
                    <button @click="q.options.splice(oIdx, 1)" class="opacity-0 group-hover:opacity-100 text-red-400 text-xl px-2">&times;</button>
                  </div>
                  <button @click="q.options.push('')" class="text-xs font-black text-blue-600 hover:text-blue-700 mt-2">+ Add Option</button>
                </div>
              </div>
              <button @click="surveyForm.questions.push({ questionText: '', options: ['', ''] })" class="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase tracking-widest text-xs">+ Add Question Block</button>
            </div>
          </div>

          <button @click="saveSurvey" class="mt-12 w-full bg-slate-900 text-white py-6 rounded-3xl font-black shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-colors uppercase tracking-widest">
            {{ isEditing ? 'Update Project' : 'Launch Project' }}
          </button>
        </div>
      </div>
    </transition>

    <div v-if="selectedSurveyAnalytics" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
      <div class="bg-white w-full max-w-3xl rounded-[4rem] p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button @click="selectedSurveyAnalytics = null" class="absolute top-10 right-10 text-slate-400 text-4xl hover:text-slate-900 transition-colors">&times;</button>
        <h2 class="text-4xl font-black mb-2 tracking-tight">{{ selectedSurveyAnalytics.title }}</h2>
        <p class="text-blue-600 font-black tracking-widest uppercase text-xs mb-12 italic">{{ selectedSurveyAnalytics.totalResponses || 0 }} participants contributed</p>
        
        <div v-for="(q, idx) in selectedSurveyAnalytics.questions" :key="idx" class="mb-12 bg-slate-50 p-8 rounded-[3rem]">
          <p class="font-black text-slate-800 mb-8 text-xl leading-snug">{{ idx + 1 }}. {{ q.questionText }}</p>
          <div v-for="opt in q.processedOptions" :key="opt.text" class="mb-6">
            <div class="flex justify-between text-[10px] font-black uppercase mb-2 text-slate-400 tracking-tighter">
              <span>{{ opt.text }}</span>
              <span class="text-blue-600">{{ opt.percentage }}%</span>
            </div>
            <div class="w-full h-5 bg-white rounded-full overflow-hidden border border-slate-100">
              <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000" :style="{ width: opt.percentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="activeSurvey" class="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
        <div class="h-3 w-full bg-slate-100">
          <div class="h-full bg-blue-600 transition-all duration-1000 ease-out" :style="{ width: `${((currentQuestionIndex + 1) / activeSurvey.questions.length) * 100}%` }"></div>
        </div>
        
        <div class="flex-1 flex flex-col items-center justify-center px-8 relative">
          <button @click="activeSurvey = null" class="absolute top-12 left-12 text-[10px] font-black text-slate-400 hover:text-slate-900 tracking-[0.2em] uppercase transition-all">← Cancel Interview</button>
          
          <div class="max-w-3xl w-full">
            <span class="text-blue-600 font-black tracking-[0.3em] uppercase text-[10px] mb-6 block">Question {{ currentQuestionIndex + 1 }} of {{ activeSurvey.questions.length }}</span>
            <h2 class="text-5xl font-black text-slate-900 mb-16 leading-[1.15] tracking-tight">{{ activeSurvey.questions[currentQuestionIndex].questionText }}</h2>
            
            <div class="grid grid-cols-1 gap-4">
              <button v-for="opt in activeSurvey.questions[currentQuestionIndex].options" :key="opt" @click="selectOption(opt)"
                :class="userAnswers[currentQuestionIndex] === opt ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-600/5' : 'border-slate-100 hover:border-blue-400'"
                class="w-full p-8 text-left border-[3px] rounded-[2.5rem] transition-all flex justify-between items-center group active:scale-[0.98]">
                <span class="text-2xl font-bold text-slate-700">{{ opt }}</span>
                <div class="h-10 w-10 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-blue-400">
                  <div v-if="userAnswers[currentQuestionIndex] === opt" class="h-5 w-5 bg-blue-600 rounded-full"></div>
                </div>
              </button>
            </div>

            <div class="mt-20 flex justify-between items-center">
              <button @click="currentQuestionIndex--" :disabled="currentQuestionIndex === 0" class="text-xs font-black text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all uppercase tracking-widest">Back</button>
              <button v-if="currentQuestionIndex === activeSurvey.questions.length - 1" @click="submitSurveyAnswers" :disabled="!userAnswers[currentQuestionIndex]" 
                class="bg-slate-900 text-white px-16 py-6 rounded-[2rem] font-black shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all disabled:opacity-20 uppercase tracking-widest text-sm">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

.pop-enter-active, .pop-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.pop-enter-from, .pop-leave-to { transform: translateY(-10px) scale(0.95); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(1.02); }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
</style>