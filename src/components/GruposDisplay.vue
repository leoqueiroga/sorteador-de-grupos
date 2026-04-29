<template>
  <div class="space-y-4">
    <div
      v-for="grupo in grupos"
      :key="grupo.nome"
      class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
    >
      <div class="bg-blue-600 px-4 py-2">
        <h3 class="text-white font-semibold text-sm">{{ grupo.nome }}</h3>
        <p class="text-blue-100 text-xs">{{ grupo.atletas.length }} atleta{{ grupo.atletas.length !== 1 ? 's' : '' }}</p>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500 w-12">#</th>
            <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Nome</th>
            <th class="text-left px-3 py-2 text-xs font-semibold text-gray-500">Escola</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(atleta, idx) in grupo.atletas"
            :key="atleta.id"
            class="border-b border-gray-100 last:border-0 hover:bg-gray-50"
          >
            <td class="px-3 py-2 text-gray-400 text-xs">{{ atleta.id }}</td>
            <td class="px-3 py-2 font-medium text-gray-800">{{ atleta.nome }}</td>
            <td class="px-3 py-2 text-gray-500 text-xs">{{ atleta.escola }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  grupos: {
    type: Array,
    required: true,
  },
});
</script>
