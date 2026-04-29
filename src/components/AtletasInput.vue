<template>
  <div class="space-y-4">
    <!-- Upload de arquivo -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Carregar arquivo CSV
      </label>
      <input
        type="file"
        accept=".csv,.txt"
        @change="onFileChange"
        class="block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100 cursor-pointer"
      />
    </div>

    <!-- Área de texto -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Ou cole o conteúdo CSV aqui
        <span class="text-gray-400 font-normal">(formato: id, nome, categoria, escola)</span>
      </label>
      <textarea
        v-model="textoLocal"
        rows="8"
        placeholder="1,João Silva,Sub-13 Masculino,Escola Estadual A
2,Maria Santos,Sub-13 Masculino,Escola Municipal B
3,Pedro Lima,Sub-13 Masculino,Escola Estadual A"
        class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2
               text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500
               focus:border-transparent resize-y"
      />
    </div>

    <!-- Seletor de categoria -->
    <div v-if="categorias.length > 0">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Categoria para sortear
      </label>
      <select
        v-model="categoriaSelecionada"
        class="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2
               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">— Selecione —</option>
        <option v-for="cat in categorias" :key="cat" :value="cat">
          {{ cat }}
          <template v-if="contagemPorCategoria[cat]">
            ({{ contagemPorCategoria[cat] }} atleta{{ contagemPorCategoria[cat] !== 1 ? 's' : '' }})
          </template>
        </option>
      </select>
    </div>

    <!-- Erros de parse -->
    <div
      v-if="erros.length > 0"
      class="rounded-md bg-yellow-50 border border-yellow-200 p-3"
    >
      <p class="text-xs font-semibold text-yellow-800 mb-1">
        Avisos ao processar CSV:
      </p>
      <ul class="text-xs text-yellow-700 space-y-0.5 list-disc list-inside">
        <li v-for="(e, i) in erros" :key="i">{{ e }}</li>
      </ul>
    </div>

    <!-- Botão sortear -->
    <button
      @click="sortear"
      :disabled="!podeSortear"
      class="w-full py-2.5 px-4 rounded-md font-semibold text-sm transition-colors
             disabled:opacity-40 disabled:cursor-not-allowed
             bg-blue-600 hover:bg-blue-700 text-white focus:outline-none
             focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      🎲 Sortear Grupos
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { extrairCategorias, parseAtletas } from '../logic/parseAtletas.js';

const emit = defineEmits(['sortear']);

const textoLocal = ref('');
const categoriaSelecionada = ref('');
const todosAtletas = ref([]);
const erros = ref([]);

// Parse reativo sempre que o texto mudar
watch(textoLocal, (val) => {
  if (!val.trim()) {
    todosAtletas.value = [];
    erros.value = [];
    categoriaSelecionada.value = '';
    return;
  }
  const resultado = parseAtletas(val);
  todosAtletas.value = resultado.atletas;
  erros.value = resultado.erros;
  // auto-selecionar se só houver 1 categoria
  const cats = extrairCategorias(resultado.atletas);
  if (cats.length === 1) categoriaSelecionada.value = cats[0];
});

const categorias = computed(() => extrairCategorias(todosAtletas.value));

const contagemPorCategoria = computed(() => {
  const cnt = {};
  for (const a of todosAtletas.value) {
    cnt[a.categoria] = (cnt[a.categoria] || 0) + 1;
  }
  return cnt;
});

const atletasDaCategoria = computed(() =>
  todosAtletas.value.filter((a) => a.categoria === categoriaSelecionada.value)
);

const podeSortear = computed(
  () => categoriaSelecionada.value && atletasDaCategoria.value.length >= 2
);

function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    textoLocal.value = e.target.result;
  };
  reader.readAsText(file, 'UTF-8');
}

function sortear() {
  if (!podeSortear.value) return;
  emit('sortear', {
    atletas: atletasDaCategoria.value,
    categoria: categoriaSelecionada.value,
  });
}
</script>
