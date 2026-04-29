# Sorteador de Grupos — Tênis de Mesa

Aplicativo local para sorteio de grupos em campeonatos de tênis de mesa, seguindo o regulamento da etapa regional. Desenvolvido em Vue 3 + Vite, sem backend.

## Funcionalidades

- Importação de atletas via **upload de arquivo CSV** ou **colagem de texto**
- Detecção automática de separador (`,` ou `;`) e de cabeçalho
- Seleção de categoria a partir das presentes no CSV — um sorteio por vez
- Distribuição em grupos respeitando o regulamento:

| Atletas | Modo                             |
| ------- | -------------------------------- |
| 2       | Jogo Único                       |
| 3 – 5   | Grupo Único (rodízio)            |
| 6 – 8   | 2 Grupos                         |
| 9 – 11  | 3 Grupos                         |
| 12 – 16 | 4 Grupos                         |
| 17      | 5 Grupos                         |
| 18 – 23 | 6 Grupos                         |
| 24 – 32 | 8 Grupos                         |
| 33 – 35 | 11 Grupos                        |
| 36 – 48 | 12 Grupos (1ºs + 4 melhores 2ºs) |
| 49+     | Eliminatória Simples             |

- **Restrição de escola**: atletas da mesma escola são distribuídos em grupos diferentes sempre que matematicamente possível
- Geração automática da **chave eliminatória (2ª Etapa)** conforme as tabelas do regulamento
- Botão **Ressortear** para repetir sem reimportar os dados
- **Exportação CSV** do resultado (grupos + bracket)

## Formato do CSV

```
id,nome,categoria,escola
1,Ana Silva,Sub-13 Feminino,Escola Estadual A
2,Pedro Lima,Sub-13 Feminino,Escola Municipal B
```

Campos obrigatórios (nessa ordem): `id`, `nome`, `categoria`, `escola`.  
Aceita separador `,` ou `;`. Cabeçalho é opcional.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Testes

```bash
npm test
```

203 testes cobrindo parse de CSV, cálculo de modos, brackets eliminatórios, sorteio e restrição de escola.

## Estrutura do projeto

```
src/
  logic/
    parseAtletas.js     # parser de CSV/texto
    regras.js           # faixas de atletas, número de grupos e brackets
    sortearGrupos.js    # algoritmo de sorteio com restrição de escola
  utils/
    exportCsv.js        # serialização e download do resultado
  components/
    AtletasInput.vue    # entrada de dados e seleção de categoria
    GruposDisplay.vue   # exibição dos grupos sorteados
    ChaveDisplay.vue    # exibição da chave eliminatória
  tests/
    parseAtletas.test.js
    regras.test.js
    sortearGrupos.test.js
    exportCsv.test.js
  App.vue
```
