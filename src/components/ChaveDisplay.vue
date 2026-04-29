<template>
  <div class="space-y-6">
    <!-- Agrupado por etapa -->
    <div v-for="(jogos, etapa) in jogosPorEtapa" :key="etapa">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {{ etapa }}
      </h3>
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-center px-3 py-2 text-xs font-semibold text-gray-500 w-14">Jogo</th>
              <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Lado A</th>
              <th class="text-center px-3 py-2 text-xs font-semibold text-gray-500 w-8">×</th>
              <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Lado B</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="jogo in jogos"
              :key="jogo.jogo"
              class="border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <td class="px-3 py-2 text-center text-xs font-bold text-blue-600">{{ jogo.jogo }}</td>
              <td class="px-3 py-2 font-medium" :class="ladoClass(jogo.lado1)">
                {{ formatarLado(jogo.lado1) }}
              </td>
              <td class="px-3 py-2 text-center text-gray-400 font-bold">×</td>
              <td class="px-3 py-2 font-medium" :class="ladoClass(jogo.lado2)">
                {{ formatarLado(jogo.lado2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Legenda SORTEIO -->
    <div
      v-if="temSorteio"
      class="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700"
    >
      <span class="font-semibold">Nota:</span>
      Os slots <span class="font-semibold">Nº SORTEIO</span> serão preenchidos pelos
      classificados das fases de grupo (2ºs colocados ou outros conforme a regra),
      ordenados por desempenho e por sorteio em caso de empate.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatarLado } from '../utils/exportCsv.js';

const props = defineProps({
  bracket: {
    type: Array,
    required: true,
  },
});

const jogosPorEtapa = computed(() => {
  const mapa = {};
  for (const jogo of props.bracket) {
    if (!mapa[jogo.etapa]) mapa[jogo.etapa] = [];
    mapa[jogo.etapa].push(jogo);
  }
  return mapa;
});

const temSorteio = computed(() =>
  props.bracket.some(
    (j) => j.lado1?.tipo === 'sorteio' || j.lado2?.tipo === 'sorteio'
  )
);

function ladoClass(lado) {
  if (!lado) return 'text-gray-800';
  if (lado.tipo === 'sorteio') return 'text-blue-600';
  if (lado.tipo === 'vencedor') return 'text-green-700';
  if (lado.tipo === 'perdedor') return 'text-orange-600';
  if (lado.tipo === 'grupo') return 'text-gray-800';
  if (lado.tipo === 'bye') return 'text-gray-400 italic';
  return 'text-gray-800';
}
</script>
