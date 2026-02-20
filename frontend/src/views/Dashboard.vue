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
const activeTab = ref('summary');
const searchQuery = ref('');

const isCreateOpen = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const surveyForm = ref({
  title: '',
  description: '',
  questions: [{ questionText: '', type: 'multiple-choice', options: ['', ''] }]
});

const selectedSurveyAnalytics = ref(null);
const activeSurvey = ref(null);
const currentQuestionIndex = ref(0);
const userAnswers = ref([]); 
const showThankYou = ref(false);

const filteredSurveys = computed(() => {
  const target = viewMode.value === 'creator' ? mySurveys.value : exploreSurveys.value;
  if (!searchQuery.value) return target;
  return target.filter(s => 
    s.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.getDashboardData();
    mySurveys.value = res.data.mySurveys || [];
    exploreSurveys.value = res.data.explore || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openAnalytics = async (survey) => {
  try {
    activeTab.value = 'summary';
    const res = await api.getSurveyAnalytics(survey._id);
    selectedSurveyAnalytics.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const openCreate = () => {
  isEditing.value = false;
  surveyForm.value = { 
    title: '', 
    description: '', 
    questions: [{ questionText: '', type: 'multiple-choice', options: ['', ''] }] 
  };
  isCreateOpen.value = true;
};

const openEdit = (s) => {
  isEditing.value = true;
  editingId.value = s._id;
  surveyForm.value = JSON.parse(JSON.stringify(s));
  isCreateOpen.value = true;
};

const saveSurvey = async () => {
  try {
    if (isEditing.value) {
      await api.updateSurvey(editingId.value, surveyForm.value);
    } else {
      await api.createSurvey(surveyForm.value);
    }
    isCreateOpen.value = false;
    await fetchData();
  } catch (err) { 
    console.error(err);
  }
};

const confirmDelete = async (id) => {
  if (confirm("Delete this survey?")) {
    try {
      await api.deleteSurvey(id);
      await fetchData();
    } catch (err) { console.error(err); }
  }
};

const startSurvey = (s) => {
  if (s.hasResponded) return; 
  activeSurvey.value = s;
  currentQuestionIndex.value = 0;
  userAnswers.value = s.questions.map(q => q.type === 'checkbox' ? [] : '');
  showThankYou.value = false;
};

const handleCheckbox = (opt) => {
  const currentArr = userAnswers.value[currentQuestionIndex.value];
  const index = currentArr.indexOf(opt);
  if (index > -1) currentArr.splice(index, 1);
  else currentArr.push(opt);
};

const submitSurveyAnswers = async () => {
  try {
    const payload = {
      surveyId: activeSurvey.value._id,
      responses: userAnswers.value.map((ans, idx) => ({ 
        questionIndex: idx, 
        selectedOption: ans 
      }))
    };
    await api.submitAnswer(payload);
    activeSurvey.value = null;
    showThankYou.value = true;
    await fetchData(); 
  } catch (err) { 
    console.error(err);
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

onMounted(fetchData);
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
    
    <header class="bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/60">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <h1 class="text-2xl font-[900] tracking-tighter text-slate-800 italic group cursor-pointer" @click="fetchData">SURVEY<span class="text-blue-600 group-hover:text-indigo-600 transition-colors">HUB</span></h1>
          <nav class="hidden md:flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button @click="viewMode = 'creator'" :class="viewMode === 'creator' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'" class="px-6 py-2 rounded-xl text-sm font-bold transition-all">Manage</button>
            <button @click="viewMode = 'respondent'" :class="viewMode === 'respondent' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'" class="px-6 py-2 rounded-xl text-sm font-bold transition-all">Explore</button>
          </nav>
        </div>

        <div class="hidden lg:flex flex-1 max-w-md mx-8">
          <div class="relative w-full group">
            <input v-model="searchQuery" type="text" placeholder="Search surveys..." class="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
          </div>
        </div>

        <div class="relative">
          <button @click="isProfileOpen = !isProfileOpen" class="group flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-slate-50 transition-colors">
            <div class="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">ME</div>
            <span class="text-sm font-bold text-slate-600">Account</span>
          </button>
          <transition name="pop">
            <div v-if="isProfileOpen" class="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 p-2 overflow-hidden">
              <button @click="handleLogout" class="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">Log Out →</button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-12">
      <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <transition name="fade" mode="out-in">
          <div :key="viewMode">
            <h2 class="text-5xl font-[900] tracking-tight text-slate-900 mb-4">{{ viewMode === 'creator' ? 'Design' : 'Discover' }}</h2>
            <p class="text-slate-500 text-lg max-w-lg leading-relaxed">
              {{ viewMode === 'creator' ? 'Create powerful surveys and turn feedback into actionable data insights.' : 'Shape the future by providing honest feedback.' }}
            </p>
          </div>
        </transition>
        <button v-if="viewMode === 'creator'" @click="openCreate" class="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all shadow-2xl shadow-blue-200">
          + Create Survey
        </button>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="i" class="bg-white p-10 rounded-[3rem] border border-slate-100 animate-pulse">
          <div class="h-4 w-24 bg-slate-100 rounded-full mb-8"></div>
          <div class="h-8 w-3/4 bg-slate-100 rounded-lg mb-4"></div>
          <div class="h-4 w-full bg-slate-100 rounded-lg mb-2"></div>
          <div class="h-4 w-2/3 bg-slate-100 rounded-lg mb-10"></div>
          <div class="h-14 w-full bg-slate-50 rounded-2xl"></div>
        </div>
      </div>

      <div v-else>
        <transition-group name="list" tag="div" v-if="filteredSurveys.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="s in filteredSurveys" :key="s._id" 
            class="group bg-white p-10 rounded-[3rem] border border-slate-200 hover:border-blue-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all flex flex-col h-full relative overflow-hidden">
            
            <div v-if="viewMode === 'creator'" class="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button @click="openEdit(s)" class="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors">✎</button>
              <button @click="confirmDelete(s._id)" class="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors">×</button>
            </div>

            <div class="mb-8">
              <span v-if="viewMode === 'respondent'" class="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">BY {{ s.creator?.username }}</span>
              <span v-else class="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{{ s.totalResponses || 0 }} RESPONSES</span>
            </div>

            <h3 class="text-2xl font-black mb-4 leading-tight">{{ s.title }}</h3>
            <p class="text-slate-500 text-sm line-clamp-2 mb-10">{{ s.description || 'No description provided.' }}</p>
            
            <button @click="viewMode === 'creator' ? openAnalytics(s) : startSurvey(s)" 
              class="mt-auto w-full py-5 rounded-[1.5rem] font-black text-sm tracking-widest border-2 transition-all flex items-center justify-center gap-3"
              :class="[
                viewMode === 'creator' 
                  ? 'bg-slate-900 text-white border-slate-900 hover:bg-blue-600 hover:border-blue-600' 
                  : s.hasResponded 
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
              ]"
              :disabled="viewMode === 'respondent' && s.hasResponded">
              <template v-if="viewMode === 'creator'">VIEW ANALYTICS</template>
              <template v-else-if="s.hasResponded">SUBMITTED ✓</template>
              <template v-else>START SURVEY</template>
              <span v-if="viewMode === 'creator' || !s.hasResponded">→</span>
            </button>
          </div>
        </transition-group>

        <div v-else class="flex flex-col items-center justify-center py-24 text-center">
          <div class="w-32 h-32 mb-8 bg-slate-100 rounded-full flex items-center justify-center text-4xl shadow-inner">
            {{ searchQuery ? '' : (viewMode === 'creator' ? '' : '') }}
          </div>
          <h3 class="text-3xl font-black text-slate-800 mb-2">
            {{ searchQuery ? 'No matches found' : (viewMode === 'creator' ? 'No surveys yet' : 'Nothing to explore') }}
          </h3>
          <p class="text-slate-500 max-w-xs mx-auto mb-8 font-medium italic">
            {{ searchQuery ? `We couldn't find any results for your search.` : (viewMode === 'creator' ? 'Your creative journey starts here. Build your first survey today!' : 'Check back later for new surveys from the community.') }}
          </p>
          <button v-if="viewMode === 'creator' && !searchQuery" @click="openCreate" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Create Your First Survey
          </button>
          <button v-else-if="searchQuery" @click="searchQuery = ''" class="text-blue-600 font-bold hover:underline">
            Clear search filter
          </button>
        </div>
      </div>
    </main>

    <transition name="slide">
      <div v-if="isCreateOpen" class="fixed inset-0 z-50 overflow-hidden flex justify-end">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isCreateOpen = false"></div>
        <div class="relative w-screen max-w-2xl bg-[#F0EBF8] shadow-2xl rounded-l-[3rem] p-8 flex flex-col overflow-y-auto custom-scrollbar">
          <div class="bg-white border-t-[10px] border-blue-600 rounded-xl p-8 mb-6 shadow-sm border border-slate-200">
            <input v-model="surveyForm.title" class="text-4xl font-black w-full outline-none mb-4" placeholder="Untitled Form" />
            <textarea v-model="surveyForm.description" class="w-full text-slate-500 outline-none" placeholder="Form description"></textarea>
          </div>
          <div class="space-y-6">
            <div v-for="(q, qIdx) in surveyForm.questions" :key="qIdx" class="p-8 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
              <div class="flex flex-col md:flex-row gap-4 mb-6">
                <input v-model="q.questionText" class="flex-grow bg-slate-50 p-4 rounded-lg font-bold outline-none" placeholder="Question" />
                <select v-model="q.type" class="bg-white border border-slate-200 rounded-lg px-4 py-2 font-bold text-xs uppercase cursor-pointer">
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="checkbox">Checkboxes</option>
                  <option value="text">Short Answer</option>
                </select>
              </div>
              <div v-if="q.type !== 'text'" class="space-y-3">
                <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="flex items-center gap-3">
                  <div :class="q.type === 'checkbox' ? 'rounded-sm' : 'rounded-full'" class="h-5 w-5 border-2 border-slate-300"></div>
                  <input v-model="q.options[oIdx]" class="flex-grow p-2 outline-none focus:border-blue-600 border-b border-transparent focus:border-b-blue-600" placeholder="Option" />
                  <button @click="q.options.splice(oIdx, 1)" class="text-slate-400 hover:text-red-500">×</button>
                </div>
                <button @click="q.options.push('')" class="text-sm font-black text-blue-600 mt-2">+ Add Option</button>
              </div>
              <button @click="surveyForm.questions.splice(qIdx, 1)" class="absolute bottom-4 right-4 text-slate-300 hover:text-red-500">🗑️</button>
            </div>
          </div>
          <div class="mt-8 flex gap-4">
            <button @click="surveyForm.questions.push({questionText: '', type: 'multiple-choice', options: ['','']})" class="flex-1 py-4 bg-white rounded-xl border-2 border-dashed border-slate-300 font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">+ Add Question</button>
            <button @click="saveSurvey" class="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition-all">Launch Survey</button>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="selectedSurveyAnalytics" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
      <div class="bg-[#F0EBF8] w-full max-w-4xl rounded-[3rem] shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
        <div class="bg-white p-10 border-b border-slate-200">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-3xl font-black text-slate-800">{{ selectedSurveyAnalytics.title }}</h2>
              <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{{ selectedSurveyAnalytics.totalResponses }} Responses</p>
            </div>
            <button @click="selectedSurveyAnalytics = null" class="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-2xl hover:bg-slate-100">×</button>
          </div>
          <div class="flex gap-8">
            <button @click="activeTab = 'summary'" :class="activeTab === 'summary' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'" class="pb-4 font-black uppercase tracking-widest text-xs transition-all">Summary</button>
            <button @click="activeTab = 'individual'" :class="activeTab === 'individual' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'" class="pb-4 font-black uppercase tracking-widest text-xs transition-all">Individual</button>
          </div>
        </div>

        <div class="p-10 overflow-y-auto custom-scrollbar">
          <div v-if="activeTab === 'summary'" class="space-y-6">
            <div v-for="(q, idx) in selectedSurveyAnalytics.questions" :key="idx" class="bg-white p-10 rounded-[2rem] border border-slate-200">
              <p class="font-black text-slate-800 mb-8 text-xl">{{ q.questionText }}</p>
              <div v-if="q.type !== 'text'" class="space-y-6">
                <div v-for="opt in q.processedOptions" :key="opt.text">
                  <div class="flex justify-between text-[10px] font-black uppercase mb-2 text-slate-500">
                    <span>{{ opt.text }}</span>
                    <span class="text-blue-600">{{ opt.count }} responses ({{ opt.percentage || 0 }}%)</span>
                  </div>
                  <div class="w-full h-8 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shadow-inner">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out" :style="{ width: (opt.percentage || 0) + '%' }"></div>
                  </div>
                </div>
              </div>
              <div v-else class="space-y-3">
                <div v-for="(txt, ti) in q.textResponses" :key="ti" class="p-5 bg-slate-50 rounded-2xl text-sm border border-slate-100 text-slate-700 italic">
                  "{{ txt }}"
                </div>
                <p v-if="!q.textResponses?.length" class="text-slate-400 italic text-sm">No text responses yet.</p>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'individual'" class="space-y-6">
            <div v-for="(resp, rIdx) in selectedSurveyAnalytics.individualResponses" :key="rIdx" class="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <div class="flex justify-between items-center mb-6 border-b pb-4 border-slate-50">
                <div>
                  <p class="font-black text-blue-600 text-lg uppercase tracking-tight">{{ resp.username }}</p>
                  <p class="text-xs text-slate-400">{{ resp.email }}</p>
                </div>
                <span class="text-[10px] bg-slate-100 px-3 py-1.5 rounded-full font-bold text-slate-500 uppercase tracking-widest">{{ new Date(resp.submittedAt).toLocaleDateString() }}</span>
              </div>
              <div class="space-y-6">
                <div v-for="(ans, aIdx) in resp.answers" :key="aIdx">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{{ ans.question }}</p>
                  <p class="text-slate-800 font-bold bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {{ Array.isArray(ans.answer) ? ans.answer.join(', ') : (ans.answer || 'No answer provided') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="activeSurvey" class="fixed inset-0 z-[100] bg-white flex flex-col">
        <div class="h-2 w-full bg-slate-100">
          <div class="h-full bg-blue-600 transition-all duration-500" :style="{ width: `${((currentQuestionIndex + 1) / activeSurvey.questions.length) * 100}%` }"></div>
        </div>
        <div class="flex-1 flex flex-col items-center justify-center px-8 relative">
          <button @click="activeSurvey = null" class="absolute top-12 left-12 text-[10px] font-black text-slate-400 tracking-widest uppercase hover:text-slate-900 transition-colors">← Exit Survey</button>
          <div class="max-w-3xl w-full">
            <span class="text-blue-600 font-black tracking-[0.3em] uppercase text-[10px] mb-6 block">Question {{ currentQuestionIndex + 1 }} of {{ activeSurvey.questions.length }}</span>
            <h2 class="text-4xl font-black text-slate-900 mb-12 tracking-tight">{{ activeSurvey.questions[currentQuestionIndex].questionText }}</h2>
            
            <div class="grid grid-cols-1 gap-4">
              <template v-if="activeSurvey.questions[currentQuestionIndex].type === 'multiple-choice'">
                <button v-for="opt in activeSurvey.questions[currentQuestionIndex].options" :key="opt" @click="userAnswers[currentQuestionIndex] = opt"
                  :class="userAnswers[currentQuestionIndex] === opt ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-blue-200'"
                  class="w-full p-6 text-left border-[3px] rounded-2xl font-bold text-lg flex justify-between items-center transition-all group active:scale-[0.99]">
                  {{ opt }}
                  <div class="h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center" :class="userAnswers[currentQuestionIndex] === opt ? 'border-blue-600' : 'border-slate-200'">
                    <div v-if="userAnswers[currentQuestionIndex] === opt" class="h-3 w-3 bg-blue-600 rounded-full"></div>
                  </div>
                </button>
              </template>
              
              <template v-else-if="activeSurvey.questions[currentQuestionIndex].type === 'checkbox'">
                <button v-for="opt in activeSurvey.questions[currentQuestionIndex].options" :key="opt" @click="handleCheckbox(opt)"
                  :class="userAnswers[currentQuestionIndex].includes(opt) ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-blue-200'"
                  class="w-full p-6 text-left border-[3px] rounded-2xl font-bold text-lg flex justify-between items-center transition-all active:scale-[0.99]">
                  {{ opt }}
                  <div class="h-6 w-6 rounded-md border-2 transition-all flex items-center justify-center" :class="userAnswers[currentQuestionIndex].includes(opt) ? 'border-blue-600 bg-blue-600' : 'border-slate-200'">
                    <span v-if="userAnswers[currentQuestionIndex].includes(opt)" class="text-white text-xs">✓</span>
                  </div>
                </button>
              </template>

              <template v-else>
                <input v-model="userAnswers[currentQuestionIndex]" class="w-full p-8 bg-slate-50 border-b-4 border-blue-600 rounded-t-3xl outline-none text-2xl font-bold placeholder:text-slate-300 transition-all focus:bg-white focus:shadow-2xl focus:shadow-blue-500/5" placeholder="Type your answer here..." />
              </template>
            </div>

            <div class="mt-16 flex justify-between items-center">
              <button @click="currentQuestionIndex--" :disabled="currentQuestionIndex === 0" class="font-black text-slate-400 uppercase tracking-widest text-[10px] disabled:opacity-0 transition-opacity">Back</button>
              <button v-if="currentQuestionIndex < activeSurvey.questions.length - 1" @click="currentQuestionIndex++" 
                :disabled="activeSurvey.questions[currentQuestionIndex].type === 'checkbox' ? userAnswers[currentQuestionIndex].length === 0 : !userAnswers[currentQuestionIndex]" 
                class="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50">Next Question</button>
              <button v-else @click="submitSurveyAnswers" class="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">Submit Survey</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="pop">
      <div v-if="showThankYou" class="fixed inset-0 z-[110] bg-blue-600 flex items-center justify-center p-6 text-center">
        <div class="max-w-md">
          <div class="h-24 w-24 bg-white rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl animate-bounce">✓</div>
          <h2 class="text-5xl font-black text-white mb-4 tracking-tighter">You're Awesome!</h2>
          <p class="text-blue-100 text-lg mb-10 font-medium">Your response has been recorded. Thank you for contributing to the community.</p>
          <button @click="showThankYou = false" class="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Back to Dashboard</button>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

.pop-enter-active, .pop-leave-active { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
.pop-enter-from, .pop-leave-to { transform: scale(0.5) translateY(20px); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from { opacity: 0; transform: translateY(30px); }
.list-leave-to { opacity: 0; transform: scale(0.9); }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
</style>