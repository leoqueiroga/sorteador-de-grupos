/**
 * Determina o modo de competição e o número de grupos com base no número de atletas.
 */
export function calcularModo(n) {
    if (n < 2) return null;
    if (n === 2)
        return { modo: "jogo_unico", numGrupos: 1, label: "Jogo Único" };
    if (n <= 5)
        return {
            modo: "grupo_unico",
            numGrupos: 1,
            label: "Grupo Único (Rodízio)",
        };
    if (n <= 8) return { modo: "grupos", numGrupos: 2, label: "2 Grupos" };
    if (n <= 11) return { modo: "grupos", numGrupos: 3, label: "3 Grupos" };
    if (n <= 16) return { modo: "grupos", numGrupos: 4, label: "4 Grupos" };
    if (n === 17) return { modo: "grupos", numGrupos: 5, label: "5 Grupos" };
    if (n <= 23) return { modo: "grupos", numGrupos: 6, label: "6 Grupos" };
    if (n <= 32) return { modo: "grupos", numGrupos: 8, label: "8 Grupos" };
    if (n <= 35) return { modo: "grupos", numGrupos: 11, label: "11 Grupos" };
    if (n <= 48)
        return { modo: "grupos_12", numGrupos: 12, label: "12 Grupos" };
    return {
        modo: "eliminatoria_simples",
        numGrupos: 0,
        label: "Eliminatória Simples",
    };
}

/** Letras dos grupos */
export const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Retorna o bracket da 2ª Etapa baseado no número de grupos.
 * Cada jogo: { jogo, lado1, lado2, etapa }
 * Onde lado1/lado2 podem ser:
 *   { tipo: 'grupo', ordinal: '1º', grupo: 'A' }
 *   { tipo: 'sorteio', ordinal: 'Nº' }
 *   { tipo: 'vencedor', jogo: N }
 *   { tipo: 'perdedor', jogo: N }
 */
export function getBracket(numGrupos) {
    switch (numGrupos) {
        case 2:
            return bracket2grupos();
        case 3:
            return bracket3grupos();
        case 4:
            return bracket4grupos();
        case 5:
            return bracket5grupos();
        case 6:
            return bracket6grupos();
        case 8:
            return bracket8grupos();
        case 11:
            return bracket11grupos();
        case 12:
            return bracket12grupos();
        default:
            return [];
    }
}

function g(ordinal, letra) {
    return { tipo: "grupo", ordinal, grupo: letra };
}
function s(n) {
    return { tipo: "sorteio", num: n };
}
function v(n) {
    return { tipo: "vencedor", jogo: n };
}
function p(n) {
    return { tipo: "perdedor", jogo: n };
}

function bracket2grupos() {
    return [
        {
            jogo: 1,
            lado1: g("1º", "A"),
            lado2: g("2º", "B"),
            etapa: "Semifinal",
        },
        {
            jogo: 2,
            lado1: g("1º", "B"),
            lado2: g("2º", "A"),
            etapa: "Semifinal",
        },
        { jogo: 3, lado1: p(1), lado2: p(2), etapa: "Decisão 3º e 4º lugar" },
        { jogo: 4, lado1: v(1), lado2: v(2), etapa: "Decisão 1º e 2º lugar" },
    ];
}

function bracket3grupos() {
    return [
        {
            jogo: 1,
            lado1: g("2º", "C"),
            lado2: s(1),
            etapa: "Quartas de final",
        },
        {
            jogo: 2,
            lado1: g("1º", "C"),
            lado2: s(2),
            etapa: "Quartas de final",
        },
        { jogo: 3, lado1: v(1), lado2: g("1º", "A"), etapa: "Semifinal" },
        { jogo: 4, lado1: v(2), lado2: g("1º", "B"), etapa: "Semifinal" },
        { jogo: 5, lado1: p(3), lado2: p(4), etapa: "Decisão 3º e 4º lugar" },
        { jogo: 6, lado1: v(3), lado2: v(4), etapa: "Decisão 1º e 2º lugar" },
    ];
}

function bracket4grupos() {
    return [
        {
            jogo: 1,
            lado1: g("1º", "A"),
            lado2: s(1),
            etapa: "Quartas de final",
        },
        {
            jogo: 2,
            lado1: g("1º", "D"),
            lado2: s(2),
            etapa: "Quartas de final",
        },
        {
            jogo: 3,
            lado1: g("1º", "C"),
            lado2: s(3),
            etapa: "Quartas de final",
        },
        {
            jogo: 4,
            lado1: g("1º", "B"),
            lado2: s(4),
            etapa: "Quartas de final",
        },
        { jogo: 5, lado1: v(1), lado2: v(2), etapa: "Semifinal" },
        { jogo: 6, lado1: v(3), lado2: v(4), etapa: "Semifinal" },
        { jogo: 7, lado1: p(5), lado2: p(6), etapa: "Decisão 3º e 4º lugar" },
        { jogo: 8, lado1: v(5), lado2: v(6), etapa: "Decisão 1º e 2º lugar" },
    ];
}

function bracket5grupos() {
    return [
        { jogo: 1, lado1: s(1), lado2: s(2), etapa: "Oitavas de final" },
        { jogo: 2, lado1: s(4), lado2: s(5), etapa: "Oitavas de final" },
        {
            jogo: 3,
            lado1: g("1º", "D"),
            lado2: g("1º", "E"),
            etapa: "Quartas de final",
        },
        {
            jogo: 4,
            lado1: s(3),
            lado2: g("1º", "C"),
            etapa: "Quartas de final",
        },
        {
            jogo: 5,
            lado1: g("1º", "A"),
            lado2: v(1),
            etapa: "Quartas de final",
        },
        {
            jogo: 6,
            lado1: g("1º", "B"),
            lado2: v(2),
            etapa: "Quartas de final",
        },
        { jogo: 7, lado1: v(3), lado2: v(5), etapa: "Semifinal" },
        { jogo: 8, lado1: v(4), lado2: v(6), etapa: "Semifinal" },
        { jogo: 9, lado1: p(7), lado2: p(8), etapa: "Decisão 3º e 4º lugar" },
        { jogo: 10, lado1: v(7), lado2: v(8), etapa: "Decisão 1º e 2º lugar" },
    ];
}

function bracket6grupos() {
    return [
        { jogo: 1, lado1: s(1), lado2: s(2), etapa: "Oitavas de final" },
        {
            jogo: 2,
            lado1: g("1º", "E"),
            lado2: s(3),
            etapa: "Oitavas de final",
        },
        {
            jogo: 3,
            lado1: s(4),
            lado2: g("1º", "F"),
            etapa: "Oitavas de final",
        },
        { jogo: 4, lado1: s(5), lado2: s(6), etapa: "Oitavas de final" },
        {
            jogo: 5,
            lado1: g("1º", "A"),
            lado2: v(1),
            etapa: "Quartas de final",
        },
        {
            jogo: 6,
            lado1: g("1º", "D"),
            lado2: v(2),
            etapa: "Quartas de final",
        },
        {
            jogo: 7,
            lado1: g("1º", "C"),
            lado2: v(3),
            etapa: "Quartas de final",
        },
        {
            jogo: 8,
            lado1: g("1º", "B"),
            lado2: v(4),
            etapa: "Quartas de final",
        },
        { jogo: 9, lado1: v(5), lado2: v(6), etapa: "Semifinal" },
        { jogo: 10, lado1: v(7), lado2: v(8), etapa: "Semifinal" },
        { jogo: 11, lado1: p(9), lado2: p(10), etapa: "Decisão 3º e 4º lugar" },
        { jogo: 12, lado1: v(9), lado2: v(10), etapa: "Decisão 1º e 2º lugar" },
    ];
}

function bracket8grupos() {
    return [
        {
            jogo: 1,
            lado1: g("1º", "A"),
            lado2: s(1),
            etapa: "Oitavas de final",
        },
        {
            jogo: 2,
            lado1: s(2),
            lado2: g("1º", "H"),
            etapa: "Oitavas de final",
        },
        {
            jogo: 3,
            lado1: g("1º", "E"),
            lado2: s(3),
            etapa: "Oitavas de final",
        },
        {
            jogo: 4,
            lado1: s(4),
            lado2: g("1º", "D"),
            etapa: "Oitavas de final",
        },
        {
            jogo: 5,
            lado1: g("1º", "C"),
            lado2: s(5),
            etapa: "Oitavas de final",
        },
        {
            jogo: 6,
            lado1: g("1º", "F"),
            lado2: s(6),
            etapa: "Oitavas de final",
        },
        {
            jogo: 7,
            lado1: g("1º", "G"),
            lado2: s(7),
            etapa: "Oitavas de final",
        },
        {
            jogo: 8,
            lado1: s(8),
            lado2: g("1º", "B"),
            etapa: "Oitavas de final",
        },
        { jogo: 9, lado1: v(1), lado2: v(2), etapa: "Quartas de final" },
        { jogo: 10, lado1: v(3), lado2: v(4), etapa: "Quartas de final" },
        { jogo: 11, lado1: v(5), lado2: v(6), etapa: "Quartas de final" },
        { jogo: 12, lado1: v(7), lado2: v(8), etapa: "Quartas de final" },
        { jogo: 13, lado1: v(9), lado2: v(10), etapa: "Semifinal" },
        { jogo: 14, lado1: v(11), lado2: v(12), etapa: "Semifinal" },
        {
            jogo: 15,
            lado1: p(13),
            lado2: p(14),
            etapa: "Decisão 3º e 4º lugar",
        },
        {
            jogo: 16,
            lado1: v(13),
            lado2: v(14),
            etapa: "Decisão 1º e 2º lugar",
        },
    ];
}

function bracket11grupos() {
    return [
        { jogo: 1, lado1: s(1), lado2: s(2), etapa: "Eliminatória" },
        { jogo: 2, lado1: s(3), lado2: s(4), etapa: "Eliminatória" },
        { jogo: 3, lado1: s(5), lado2: s(6), etapa: "Eliminatória" },
        { jogo: 4, lado1: s(7), lado2: s(8), etapa: "Eliminatória" },
        { jogo: 5, lado1: s(9), lado2: g("1º", "K"), etapa: "Eliminatória" },
        { jogo: 6, lado1: s(10), lado2: s(11), etapa: "Eliminatória" },
        {
            jogo: 7,
            lado1: g("1º", "A"),
            lado2: v(1),
            etapa: "Oitavas de final",
        },
        {
            jogo: 8,
            lado1: g("1º", "I"),
            lado2: g("1º", "H"),
            etapa: "Oitavas de final",
        },
        {
            jogo: 9,
            lado1: g("1º", "E"),
            lado2: v(2),
            etapa: "Oitavas de final",
        },
        {
            jogo: 10,
            lado1: v(3),
            lado2: g("1º", "D"),
            etapa: "Oitavas de final",
        },
        {
            jogo: 11,
            lado1: g("1º", "C"),
            lado2: v(4),
            etapa: "Oitavas de final",
        },
        {
            jogo: 12,
            lado1: g("1º", "F"),
            lado2: v(5),
            etapa: "Oitavas de final",
        },
        {
            jogo: 13,
            lado1: g("1º", "G"),
            lado2: g("1º", "J"),
            etapa: "Oitavas de final",
        },
        {
            jogo: 14,
            lado1: v(6),
            lado2: g("1º", "B"),
            etapa: "Oitavas de final",
        },
        { jogo: 15, lado1: v(7), lado2: v(8), etapa: "Quartas de final" },
        { jogo: 16, lado1: v(9), lado2: v(10), etapa: "Quartas de final" },
        { jogo: 17, lado1: v(11), lado2: v(12), etapa: "Quartas de final" },
        { jogo: 18, lado1: v(13), lado2: v(14), etapa: "Quartas de final" },
        { jogo: 19, lado1: v(15), lado2: v(16), etapa: "Semifinal" },
        { jogo: 20, lado1: v(17), lado2: v(18), etapa: "Semifinal" },
        {
            jogo: 21,
            lado1: p(19),
            lado2: p(20),
            etapa: "Decisão 3º e 4º lugar",
        },
        {
            jogo: 22,
            lado1: v(19),
            lado2: v(20),
            etapa: "Decisão 1º e 2º lugar",
        },
    ];
}

function bracket12grupos() {
    // 12 primeiros + 4 melhores 2ºs = 16 → Só 1ºGrupoA e 1ºGrupoB são seededOs demais 14 são SORTEIOs
    return [
        {
            jogo: 1,
            lado1: g("1º", "A"),
            lado2: s(1),
            etapa: "Oitavas de final",
        },
        { jogo: 2, lado1: s(2), lado2: s(3), etapa: "Oitavas de final" },
        { jogo: 3, lado1: s(4), lado2: s(5), etapa: "Oitavas de final" },
        { jogo: 4, lado1: s(6), lado2: s(7), etapa: "Oitavas de final" },
        { jogo: 5, lado1: s(8), lado2: s(9), etapa: "Oitavas de final" },
        { jogo: 6, lado1: s(10), lado2: s(11), etapa: "Oitavas de final" },
        { jogo: 7, lado1: s(12), lado2: s(13), etapa: "Oitavas de final" },
        {
            jogo: 8,
            lado1: s(14),
            lado2: g("1º", "B"),
            etapa: "Oitavas de final",
        },
        { jogo: 9, lado1: v(1), lado2: v(2), etapa: "Quartas de final" },
        { jogo: 10, lado1: v(3), lado2: v(4), etapa: "Quartas de final" },
        { jogo: 11, lado1: v(5), lado2: v(6), etapa: "Quartas de final" },
        { jogo: 12, lado1: v(7), lado2: v(8), etapa: "Quartas de final" },
        { jogo: 13, lado1: v(9), lado2: v(10), etapa: "Semifinal" },
        { jogo: 14, lado1: v(11), lado2: v(12), etapa: "Semifinal" },
        {
            jogo: 15,
            lado1: p(13),
            lado2: p(14),
            etapa: "Decisão 3º e 4º lugar",
        },
        {
            jogo: 16,
            lado1: v(13),
            lado2: v(14),
            etapa: "Decisão 1º e 2º lugar",
        },
    ];
}
