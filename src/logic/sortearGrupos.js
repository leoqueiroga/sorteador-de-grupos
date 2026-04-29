import { calcularModo, getBracket, LETRAS } from "./regras.js";

/** Fisher-Yates shuffle (in-place, retorna o array) */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Distribui `n` atletas em `g` grupos da forma mais uniforme possível.
 * Retorna array com o tamanho de cada grupo.
 * Ex: 10 atletas em 3 grupos → [4, 3, 3]
 */
function calcularTamanhosGrupos(n, g) {
    const base = Math.floor(n / g);
    const extras = n % g;
    return Array.from({ length: g }, (_, i) => (i < extras ? base + 1 : base));
}

/**
 * Distribui atletas nos grupos maximizando a separação de atletas
 * da mesma escola.
 *
 * Estratégia:
 * 1. Agrupa atletas por escola e ordena as escolas da mais numerosa
 *    para a menos numerosa (escolas mais restritas primeiro).
 * 2. Para cada escola, distribui seus atletas espalhando-os em grupos
 *    diferentes usando round-robin em ordem aleatória de grupos — assim
 *    nenhum grupo recebe dois atletas da mesma escola enquanto houver
 *    grupos livres.
 * 3. Mistura a ordem de inserção dentro de cada escola para aleatoriedade.
 * 4. Ao final, embaralha a ordem dos atletas dentro de cada grupo.
 *
 * Conflitos só ocorrem quando uma escola tem mais atletas do que grupos
 * existentes — situação inevitável pelo próprio tamanho do campeonato.
 */
function distribuirComRestricaoEscola(atletas, tamanhos) {
    const numGrupos = tamanhos.length;

    // -- Agrupar por escola --------------------------------------------------
    const porEscola = new Map();
    for (const atleta of atletas) {
        const key =
            (atleta.escola || "").trim().toLowerCase() || "__sem_escola__";
        if (!porEscola.has(key)) porEscola.set(key, []);
        porEscola.get(key).push(atleta);
    }

    // Ordenar escolas: mais atletas primeiro (mais restritas = colocar cedo)
    const escolasOrdenadas = [...porEscola.entries()].sort(
        ([, a], [, b]) => b.length - a.length,
    );

    // Embaralhar atletas dentro de cada escola (garante aleatoriedade)
    for (const [, lista] of escolasOrdenadas) shuffle(lista);

    // -- Slots disponíveis por grupo -----------------------------------------
    // Cada slot é { grupoIdx, vagasRestantes }
    // Mantemos um cursor rotativo para round-robin
    const grupos = tamanhos.map(() => []);
    // vagas ainda disponíveis por grupo
    const vagas = [...tamanhos];

    // Ordem aleatória dos grupos para o round-robin inicial
    const ordemGrupos = shuffle(Array.from({ length: numGrupos }, (_, i) => i));

    // -- Distribuição ---------------------------------------------------------
    for (const [, listaAtletas] of escolasOrdenadas) {
        // Para esta escola, queremos colocar cada atleta num grupo diferente.
        // Selecionamos os grupos que:
        //   a) ainda têm vaga
        //   b) ainda não têm nenhum atleta desta escola
        // em ordem aleatória (rotacionada a cada escola para distribuir o "primeiro grupo").

        const gruposDisponiveis = ordemGrupos.filter((gi) => vagas[gi] > 0);
        // Rotacionar ordemGrupos para próxima escola (spreads seed randomness)
        ordemGrupos.push(ordemGrupos.shift());

        let cursorIdx = 0; // posição na lista de gruposDisponiveis

        for (const atleta of listaAtletas) {
            // Preferência 1: grupo sem vaga ocupada desta escola E com vaga livre
            const semConflito = gruposDisponiveis.filter(
                (gi) =>
                    vagas[gi] > 0 &&
                    !grupos[gi].some(
                        (a) =>
                            (a.escola || "").trim().toLowerCase() ===
                            (atleta.escola || "").trim().toLowerCase(),
                    ),
            );

            let escolhido;
            if (semConflito.length > 0) {
                // Dentre os sem conflito, escolher o que tem mais vagas (equilibra tamanho)
                // mas com um toque de aleatoriedade: embaralha os de mesmo nível de vagas
                semConflito.sort((a, b) => vagas[b] - vagas[a]);
                // pegar dentre os top com mesma quantidade de vagas
                const maxVagas = vagas[semConflito[0]];
                const topCandidatos = semConflito.filter(
                    (gi) => vagas[gi] === maxVagas,
                );
                escolhido =
                    topCandidatos[
                        Math.floor(Math.random() * topCandidatos.length)
                    ];
            } else {
                // Todos os grupos já têm alguém desta escola — conflito inevitável.
                // Colocar no grupo com mais vagas para equilibrar tamanhos.
                const comVaga = gruposDisponiveis.filter((gi) => vagas[gi] > 0);
                if (comVaga.length === 0) {
                    // Segurança: não deve ocorrer se os tamanhos estiverem corretos
                    continue;
                }
                comVaga.sort((a, b) => vagas[b] - vagas[a]);
                const maxVagas = vagas[comVaga[0]];
                const topCandidatos = comVaga.filter(
                    (gi) => vagas[gi] === maxVagas,
                );
                escolhido =
                    topCandidatos[
                        Math.floor(Math.random() * topCandidatos.length)
                    ];
            }

            grupos[escolhido].push(atleta);
            vagas[escolhido]--;
        }
    }

    // Embaralhar a ordem dos atletas dentro de cada grupo (para visual sem viés)
    for (const g of grupos) shuffle(g);

    return grupos;
}

/**
 * Função principal. Recebe array de atletas e retorna o resultado do sorteio.
 *
 * Retorna:
 * {
 *   modo: object (de calcularModo),
 *   grupos: [{ nome: 'Grupo A', atletas: [...] }],
 *   bracket: [...] | null,
 * }
 */
export function sortear(atletas) {
    const n = atletas.length;
    const modo = calcularModo(n);

    if (!modo) return null;

    // Jogo único
    if (modo.modo === "jogo_unico") {
        return {
            modo,
            grupos: [{ nome: "Jogo Único", atletas: shuffle([...atletas]) }],
            bracket: null,
        };
    }

    // Grupo único (round-robin)
    if (modo.modo === "grupo_unico") {
        return {
            modo,
            grupos: [{ nome: "Grupo Único", atletas: shuffle([...atletas]) }],
            bracket: null,
        };
    }

    // Eliminatória simples (49+)
    if (modo.modo === "eliminatoria_simples") {
        const shuffled = shuffle([...atletas]);
        const chave = gerarChaveEliminatoria(shuffled);
        return {
            modo,
            grupos: [],
            bracket: chave,
        };
    }

    // Grupos com fase eliminatória
    const tamanhos = calcularTamanhosGrupos(n, modo.numGrupos);
    const gruposAtletas = distribuirComRestricaoEscola(atletas, tamanhos);

    const grupos = gruposAtletas.map((ats, i) => ({
        nome: `Grupo ${LETRAS[i]}`,
        letra: LETRAS[i],
        atletas: ats,
    }));

    const bracket = getBracket(modo.numGrupos);

    return { modo, grupos, bracket };
}

/**
 * Gera chave de eliminatória simples para 49+ atletas.
 * Expande para a próxima potência de 2 com byes (null).
 */
function gerarChaveEliminatoria(atletas) {
    const n = atletas.length;
    const potencia = Math.pow(2, Math.ceil(Math.log2(n)));
    const slots = [...atletas];
    while (slots.length < potencia) slots.push(null); // byes

    const jogos = [];
    let jogoNum = 1;

    // Rodada 1 (pode ter byes)
    const rodada1 = [];
    for (let i = 0; i < potencia; i += 2) {
        rodada1.push({
            jogo: jogoNum++,
            lado1: slots[i]
                ? { tipo: "atleta", atleta: slots[i] }
                : { tipo: "bye" },
            lado2: slots[i + 1]
                ? { tipo: "atleta", atleta: slots[i + 1] }
                : { tipo: "bye" },
            etapa:
                potencia > 4
                    ? nomearEtapa(potencia / 2)
                    : nomearEtapa(potencia / 2),
        });
    }
    jogos.push(...rodada1);

    // Rodadas subsequentes
    let rodadaAnterior = rodada1;
    let totalVagas = potencia / 2;
    while (totalVagas > 1) {
        const novosJogos = [];
        for (let i = 0; i < rodadaAnterior.length; i += 2) {
            const etapa = nomearEtapaElim(totalVagas / 2);
            novosJogos.push({
                jogo: jogoNum++,
                lado1: { tipo: "vencedor", jogo: rodadaAnterior[i].jogo },
                lado2: { tipo: "vencedor", jogo: rodadaAnterior[i + 1].jogo },
                etapa,
            });
        }
        // Disputa 3º/4º na semifinal
        if (totalVagas === 2) {
            const semi1 = rodadaAnterior[0];
            const semi2 = rodadaAnterior[1];
            jogos.push({
                jogo: jogoNum++,
                lado1: { tipo: "perdedor", jogo: semi1.jogo },
                lado2: { tipo: "perdedor", jogo: semi2.jogo },
                etapa: "Decisão 3º e 4º lugar",
            });
            novosJogos[0].etapa = "Decisão 1º e 2º lugar";
        }
        jogos.push(...novosJogos);
        rodadaAnterior = novosJogos;
        totalVagas = totalVagas / 2;
    }

    return jogos;
}

function nomearEtapa(vagas) {
    if (vagas >= 64) return "Eliminatória";
    if (vagas >= 16) return "Eliminatória";
    if (vagas === 8) return "Oitavas de final";
    if (vagas === 4) return "Quartas de final";
    if (vagas === 2) return "Semifinal";
    return "Final";
}

function nomearEtapaElim(vagas) {
    if (vagas >= 8) return "Oitavas de final";
    if (vagas === 4) return "Quartas de final";
    if (vagas === 2) return "Semifinal";
    return "Final";
}
