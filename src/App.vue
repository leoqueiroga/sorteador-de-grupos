<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-blue-700 shadow-md">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <span class="text-2xl">🏓</span>
        <div>
          <h1 class="text-white text-xl font-bold leading-tight">Sorteador de Grupos</h1>
          <p class="text-blue-200 text-xs">Tênis de mesa · Distribuição por categoria</p>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <!-- Painel de entrada -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 class="text-base font-semibold text-gray-700 mb-4">1. Importar atletas</h2>
        <AtletasInput @sortear="onSortear" />
      </section>

      <!-- Resultado -->
      <section v-if="resultado" class="space-y-6">
        <!-- Info do sorteio -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-gray-700">
                Resultado — {{ categoriaSorteada }}
              </h2>
              <p class="text-sm text-gray-500 mt-0.5">
                <span class="font-medium text-blue-600">{{ resultado.modo.label }}</span>
                · {{ numAtletas }} atleta{{ numAtletas !== 1 ? 's' : '' }}
              </p>
              <p v-if="descricaoModo" class="text-xs text-gray-400 mt-1">
                {{ descricaoModo }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="ressortear"
                class="text-sm px-3 py-1.5 rounded border border-gray-300
                       text-gray-600 hover:bg-gray-50 transition-colors"
              >
                🔀 Ressortear
              </button>
              <button
                @click="exportar"
                class="text-sm px-3 py-1.5 rounded border border-blue-300
                       text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors font-medium"
              >
                ⬇ Exportar CSV
              </button>
            </div>
          </div>
        </div>

        <!-- Jogo único -->
        <div
          v-if="resultado.modo.modo === 'jogo_unico'"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <h2 class="text-base font-semibold text-gray-700 mb-4">Jogo Único</h2>
          <div class="flex items-center gap-4">
            <div
              v-for="atleta in resultado.grupos[0].atletas"
              :key="atleta.id"
              class="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-100 text-center"
            >
              <p class="text-xs text-gray-400">#{{ atleta.id }}</p>
              <p class="font-bold text-gray-800 mt-0.5">{{ atleta.nome }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ atleta.escola }}</p>
            </div>
            <div class="text-2xl font-bold text-gray-400 shrink-0">×</div>
          </div>
        </div>

        <!-- Grupos -->
        <div
          v-if="resultado.grupos.length > 0 && resultado.modo.modo !== 'jogo_unico'"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <h2 class="text-base font-semibold text-gray-700 mb-4">
            {{ resultado.modo.modo === 'grupo_unico' ? 'Grupo Único' : '2. Grupos (1ª Etapa)' }}
          </h2>
          <GruposDisplay :grupos="resultado.grupos" />
        </div>

        <!-- Chave eliminatória -->
        <div
          v-if="resultado.bracket && resultado.bracket.length > 0"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <h2 class="text-base font-semibold text-gray-700 mb-4">
            {{ resultado.modo.modo === 'eliminatoria_simples'
              ? 'Chave Eliminatória'
              : '3. Chave Eliminatória (2ª Etapa)' }}
          </h2>
          <ChaveDisplay :bracket="resultado.bracket" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import AtletasInput from './components/AtletasInput.vue';
import ChaveDisplay from './components/ChaveDisplay.vue';
import GruposDisplay from './components/GruposDisplay.vue';
import { sortear } from './logic/sortearGrupos.js';
import { exportarCSV } from './utils/exportCsv.js';

const resultado = ref(null);
const categoriaSorteada = ref('');
const atletasAtuais = ref([]);

const numAtletas = computed(() => atletasAtuais.value.length);

const descricaoModo = computed(() => {
  if (!resultado.value) return '';
  const { modo } = resultado.value;
  if (modo.modo === 'grupo_unico') return 'Todos jogam entre si · Sistema rodízio · Melhor de 2 sets';
  if (modo.modo === 'grupos') return `${modo.numGrupos} grupos de até 4 atletas · Classificam 1º e 2º de cada grupo`;
  if (modo.modo === 'grupos_12') return '12 grupos · Classificam 1ºs + 4 melhores 2ºs';
  if (modo.modo === 'eliminatoria_simples') return 'Eliminatória simples · 2 sets venc. até a semi · 3 sets venc. a partir da semi';
  return '';
});

function onSortear({ atletas, categoria }) {
  atletasAtuais.value = atletas;
  categoriaSorteada.value = categoria;
  resultado.value = sortear(atletas);
}

function ressortear() {
  if (atletasAtuais.value.length > 0) {
    resultado.value = sortear(atletasAtuais.value);
  }
}

function exportar() {
  exportarCSV(resultado.value, categoriaSorteada.value);
}
</script>
