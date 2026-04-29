import { describe, it, expect } from 'vitest';
import { calcularModo, getBracket } from '../logic/regras.js';

// ─── calcularModo ─────────────────────────────────────────────────────────────
describe('calcularModo', () => {
  // ── Casos inválidos ───────────────────────────────────────────────────────
  it('retorna null para 0 atletas', () => expect(calcularModo(0)).toBeNull());
  it('retorna null para 1 atleta', () => expect(calcularModo(1)).toBeNull());
  it('retorna null para número negativo', () => expect(calcularModo(-5)).toBeNull());

  // ── Jogo único ───────────────────────────────────────────────────────────
  it('2 atletas → jogo_unico', () => {
    const m = calcularModo(2);
    expect(m.modo).toBe('jogo_unico');
    expect(m.numGrupos).toBe(1);
  });

  // ── Grupo único ──────────────────────────────────────────────────────────
  it.each([3, 4, 5])('%i atletas → grupo_unico', (n) => {
    expect(calcularModo(n).modo).toBe('grupo_unico');
  });

  // ── 2 grupos (6–8) ───────────────────────────────────────────────────────
  it.each([6, 7, 8])('%i atletas → 2 grupos', (n) => {
    const m = calcularModo(n);
    expect(m.modo).toBe('grupos');
    expect(m.numGrupos).toBe(2);
  });

  // ── 3 grupos (9–11) ──────────────────────────────────────────────────────
  it.each([9, 10, 11])('%i atletas → 3 grupos', (n) => {
    expect(calcularModo(n).numGrupos).toBe(3);
  });

  // ── 4 grupos (12–16) ─────────────────────────────────────────────────────
  it.each([12, 16])('%i atletas → 4 grupos', (n) => {
    expect(calcularModo(n).numGrupos).toBe(4);
  });

  // ── 5 grupos (exato: 17) ─────────────────────────────────────────────────
  it('17 atletas → 5 grupos', () => {
    expect(calcularModo(17).numGrupos).toBe(5);
  });

  // ── 6 grupos (18–23) ─────────────────────────────────────────────────────
  it.each([18, 23])('%i atletas → 6 grupos', (n) => {
    expect(calcularModo(n).numGrupos).toBe(6);
  });

  // ── 8 grupos (24–32) ─────────────────────────────────────────────────────
  it.each([24, 32])('%i atletas → 8 grupos', (n) => {
    expect(calcularModo(n).numGrupos).toBe(8);
  });

  // ── 11 grupos (33–35) ────────────────────────────────────────────────────
  it.each([33, 35])('%i atletas → 11 grupos', (n) => {
    expect(calcularModo(n).numGrupos).toBe(11);
  });

  // ── 12 grupos / grupos_12 (36–48) ───────────────────────────────────────
  it.each([36, 48])('%i atletas → grupos_12', (n) => {
    const m = calcularModo(n);
    expect(m.modo).toBe('grupos_12');
    expect(m.numGrupos).toBe(12);
  });

  // ── Eliminatória simples (49+) ────────────────────────────────────────────
  it.each([49, 50, 100])('%i atletas → eliminatoria_simples', (n) => {
    expect(calcularModo(n).modo).toBe('eliminatoria_simples');
  });

  // ── Fronteiras críticas ───────────────────────────────────────────────────
  it('fronteira 5→6: 5 = grupo_unico, 6 = grupos', () => {
    expect(calcularModo(5).modo).toBe('grupo_unico');
    expect(calcularModo(6).modo).toBe('grupos');
  });

  it('fronteira 8→9: 8 = 2 grupos, 9 = 3 grupos', () => {
    expect(calcularModo(8).numGrupos).toBe(2);
    expect(calcularModo(9).numGrupos).toBe(3);
  });

  it('fronteira 11→12: 11 = 3 grupos, 12 = 4 grupos', () => {
    expect(calcularModo(11).numGrupos).toBe(3);
    expect(calcularModo(12).numGrupos).toBe(4);
  });

  it('fronteira 16→17: 16 = 4 grupos, 17 = 5 grupos', () => {
    expect(calcularModo(16).numGrupos).toBe(4);
    expect(calcularModo(17).numGrupos).toBe(5);
  });

  it('fronteira 17→18: 17 = 5 grupos, 18 = 6 grupos', () => {
    expect(calcularModo(17).numGrupos).toBe(5);
    expect(calcularModo(18).numGrupos).toBe(6);
  });

  it('fronteira 23→24: 23 = 6 grupos, 24 = 8 grupos', () => {
    expect(calcularModo(23).numGrupos).toBe(6);
    expect(calcularModo(24).numGrupos).toBe(8);
  });

  it('fronteira 32→33: 32 = 8 grupos, 33 = 11 grupos', () => {
    expect(calcularModo(32).numGrupos).toBe(8);
    expect(calcularModo(33).numGrupos).toBe(11);
  });

  it('fronteira 35→36: 35 = 11 grupos, 36 = grupos_12', () => {
    expect(calcularModo(35).numGrupos).toBe(11);
    expect(calcularModo(36).modo).toBe('grupos_12');
  });

  it('fronteira 48→49: 48 = grupos_12, 49 = eliminatoria_simples', () => {
    expect(calcularModo(48).modo).toBe('grupos_12');
    expect(calcularModo(49).modo).toBe('eliminatoria_simples');
  });
});

// ─── getBracket ───────────────────────────────────────────────────────────────
describe('getBracket', () => {
  // Contagens de jogos esperadas por bracket
  const CASOS = [
    { numGrupos: 2, jogosEsperados: 4 },
    { numGrupos: 3, jogosEsperados: 6 },
    { numGrupos: 4, jogosEsperados: 8 },
    { numGrupos: 5, jogosEsperados: 10 },
    { numGrupos: 6, jogosEsperados: 12 },
    { numGrupos: 8, jogosEsperados: 16 },
    { numGrupos: 11, jogosEsperados: 22 },
    { numGrupos: 12, jogosEsperados: 16 },
  ];

  it('retorna array vazio para numGrupos desconhecido', () => {
    expect(getBracket(0)).toEqual([]);
    expect(getBracket(7)).toEqual([]);
    expect(getBracket(99)).toEqual([]);
  });

  for (const { numGrupos, jogosEsperados } of CASOS) {
    describe(`bracket com ${numGrupos} grupos`, () => {
      const bracket = getBracket(numGrupos);

      it(`tem exatamente ${jogosEsperados} jogos`, () => {
        expect(bracket).toHaveLength(jogosEsperados);
      });

      it('numeração de jogos é sequencial começando em 1', () => {
        const nums = bracket.map((j) => j.jogo);
        expect(nums).toEqual(Array.from({ length: jogosEsperados }, (_, i) => i + 1));
      });

      it('todos os jogos têm lado1, lado2 e etapa definidos', () => {
        for (const jogo of bracket) {
          expect(jogo.lado1).toBeTruthy();
          expect(jogo.lado2).toBeTruthy();
          expect(typeof jogo.etapa).toBe('string');
          expect(jogo.etapa.length).toBeGreaterThan(0);
        }
      });

      it('último jogo é "Decisão 1º e 2º lugar"', () => {
        const ultimo = bracket[bracket.length - 1];
        expect(ultimo.etapa).toContain('1º e 2º');
      });

      it('existe jogo de "Decisão 3º e 4º lugar"', () => {
        expect(bracket.some((j) => j.etapa.includes('3º e 4º'))).toBe(true);
      });

      it('decisão de 3º/4º precede a final', () => {
        const idx3 = bracket.findIndex((j) => j.etapa.includes('3º e 4º'));
        const idxFinal = bracket.findIndex((j) => j.etapa.includes('1º e 2º'));
        expect(idx3).toBeLessThan(idxFinal);
      });

      it('lado1 e lado2 de cada jogo têm campo "tipo"', () => {
        for (const jogo of bracket) {
          expect(typeof jogo.lado1.tipo).toBe('string');
          expect(typeof jogo.lado2.tipo).toBe('string');
        }
      });

      it('lados do tipo "vencedor" referenciam jogos existentes anteriores', () => {
        const jogoNums = new Set(bracket.map((j) => j.jogo));
        for (const jogo of bracket) {
          for (const lado of [jogo.lado1, jogo.lado2]) {
            if (lado.tipo === 'vencedor' || lado.tipo === 'perdedor') {
              expect(jogoNums.has(lado.jogo)).toBe(true);
              expect(lado.jogo).toBeLessThan(jogo.jogo);
            }
          }
        }
      });
    });
  }
});
