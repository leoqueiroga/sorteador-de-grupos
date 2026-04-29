import { describe, it, expect } from 'vitest';
import { sortear } from '../logic/sortearGrupos.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Gera N atletas com escola única a menos que explicitado */
function mkAtletas(n, escolaFn = (i) => `Escola ${i}`) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    nome: `Atleta ${i + 1}`,
    categoria: 'Sub-13',
    escola: escolaFn(i),
  }));
}

/** Coleta todos os atletas de grupos em um array flat */
function todasAtletas(resultado) {
  return resultado.grupos.flatMap((g) => g.atletas);
}

/** Conta conflitos (atletas da mesma escola no mesmo grupo) */
function contarConflitos(grupos) {
  let conflitos = 0;
  for (const grupo of grupos) {
    const escolas = grupo.atletas.map((a) => (a.escola || '').toLowerCase());
    const vistas = new Set();
    for (const e of escolas) {
      if (e && vistas.has(e)) conflitos++;
      vistas.add(e);
    }
  }
  return conflitos;
}

// ─── sortear ──────────────────────────────────────────────────────────────────
describe('sortear', () => {
  // ── Entradas inválidas ────────────────────────────────────────────────────
  it('retorna null para 0 atletas', () => {
    expect(sortear([])).toBeNull();
  });

  it('retorna null para 1 atleta', () => {
    expect(sortear(mkAtletas(1))).toBeNull();
  });

  // ── Jogo único (2 atletas) ────────────────────────────────────────────────
  it('2 atletas → modo jogo_unico', () => {
    const r = sortear(mkAtletas(2));
    expect(r.modo.modo).toBe('jogo_unico');
    expect(r.grupos).toHaveLength(1);
    expect(r.grupos[0].atletas).toHaveLength(2);
    expect(r.bracket).toBeNull();
  });

  it('2 atletas → todos os atletas presentes no resultado', () => {
    const atletas = mkAtletas(2);
    const r = sortear(atletas);
    const ids = r.grupos[0].atletas.map((a) => a.id).sort();
    expect(ids).toEqual([1, 2]);
  });

  // ── Grupo único (3–5) ─────────────────────────────────────────────────────
  it.each([3, 4, 5])('%i atletas → modo grupo_unico, 1 grupo, sem bracket', (n) => {
    const r = sortear(mkAtletas(n));
    expect(r.modo.modo).toBe('grupo_unico');
    expect(r.grupos).toHaveLength(1);
    expect(r.grupos[0].atletas).toHaveLength(n);
    expect(r.bracket).toBeNull();
  });

  // ── Todos os atletas presentes (invariante fundamental) ──────────────────
  it.each([6, 9, 12, 17, 18, 24, 33, 36])(
    '%i atletas → todos presentes exatamente uma vez',
    (n) => {
      const atletas = mkAtletas(n);
      const r = sortear(atletas);
      const ids = todasAtletas(r).map((a) => a.id).sort((a, b) => a - b);
      expect(ids).toEqual(atletas.map((a) => a.id).sort((a, b) => a - b));
    },
  );

  // ── Nenhum atleta duplicado ───────────────────────────────────────────────
  it.each([8, 11, 16, 32])('%i atletas → sem duplicatas', (n) => {
    const r = sortear(mkAtletas(n));
    const ids = todasAtletas(r).map((a) => a.id);
    expect(new Set(ids).size).toBe(n);
  });

  // ── Número de grupos ─────────────────────────────────────────────────────
  const GRUPOS_ESPERADOS = [
    [6, 2], [8, 2], [9, 3], [11, 3], [12, 4], [16, 4],
    [17, 5], [18, 6], [23, 6], [24, 8], [32, 8],
    [33, 11], [35, 11], [36, 12], [48, 12],
  ];
  it.each(GRUPOS_ESPERADOS)('%i atletas → %i grupos', (n, esperado) => {
    const r = sortear(mkAtletas(n));
    expect(r.grupos).toHaveLength(esperado);
  });

  // ── Tamanho total dos grupos bate com n ───────────────────────────────────
  it.each([6, 7, 10, 13, 19, 27])('%i atletas → soma dos grupos = n', (n) => {
    const r = sortear(mkAtletas(n));
    const total = r.grupos.reduce((s, g) => s + g.atletas.length, 0);
    expect(total).toBe(n);
  });

  // ── Grupos identificados com letras A, B, C... ───────────────────────────
  it('grupos têm nomes Grupo A, B, C... em ordem', () => {
    const r = sortear(mkAtletas(12));
    expect(r.grupos[0].nome).toBe('Grupo A');
    expect(r.grupos[1].nome).toBe('Grupo B');
    expect(r.grupos[3].nome).toBe('Grupo D');
  });

  // ── Bracket presente quando deve ────────────────────────────────────────
  it.each([6, 9, 12, 17, 18, 24, 33, 36])('%i atletas → tem bracket', (n) => {
    const r = sortear(mkAtletas(n));
    expect(r.bracket).not.toBeNull();
    expect(r.bracket.length).toBeGreaterThan(0);
  });

  // ── Nenhum grupo maior que 4 atletas ─────────────────────────────────────
  it.each([6, 10, 14, 20, 30, 35])('nenhum grupo > 4 atletas para %i atletas', (n) => {
    const r = sortear(mkAtletas(n));
    for (const grupo of r.grupos) {
      expect(grupo.atletas.length).toBeLessThanOrEqual(4);
    }
  });

  // ── Grupos equilibrados (dif máxima entre maior e menor grupo = 1) ────────
  it.each([7, 10, 13, 22, 27])('grupos equilibrados para %i atletas', (n) => {
    const r = sortear(mkAtletas(n));
    const tamanhos = r.grupos.map((g) => g.atletas.length);
    const max = Math.max(...tamanhos);
    const min = Math.min(...tamanhos);
    expect(max - min).toBeLessThanOrEqual(1);
  });

  // ── Eliminatória simples (49+) ────────────────────────────────────────────
  it('49 atletas → eliminatoria_simples sem grupos, com bracket', () => {
    const r = sortear(mkAtletas(49));
    expect(r.modo.modo).toBe('eliminatoria_simples');
    expect(r.grupos).toHaveLength(0);
    expect(r.bracket.length).toBeGreaterThan(0);
  });

  it('bracket de eliminatória simples tem jogo "Decisão 1º e 2º lugar"', () => {
    const r = sortear(mkAtletas(49));
    expect(r.bracket.some((j) => j.etapa.includes('1º e 2º'))).toBe(true);
  });

  it('bracket de eliminatória simples tem jogo de 3º e 4º lugar', () => {
    const r = sortear(mkAtletas(50));
    expect(r.bracket.some((j) => j.etapa.includes('3º e 4º'))).toBe(true);
  });

  it('64 atletas (potência de 2) → eliminatória sem byes na rodada 1', () => {
    const r = sortear(mkAtletas(64));
    const rodada1 = r.bracket.filter((j) => j.lado1.tipo === 'atleta' || j.lado1.tipo === 'bye');
    const byes = rodada1.filter(
      (j) => j.lado1.tipo === 'bye' || j.lado2.tipo === 'bye',
    );
    expect(byes).toHaveLength(0);
  });
});

// ─── Restrição de escola ──────────────────────────────────────────────────────
describe('sortear – restrição de escola', () => {
  it('atletas de escolas diferentes: 0 conflitos esperados', () => {
    // 8 atletas, 8 escolas diferentes → 2 grupos de 4 com escolas distintas
    const atletas = mkAtletas(8, (i) => `Escola ${i}`);
    const r = sortear(atletas);
    expect(contarConflitos(r.grupos)).toBe(0);
  });

  it('4 atletas mesma escola, 4 grupos → 0 conflitos (1 por grupo)', () => {
    // 16 atletas, 4 grupos: 4 da mesma escola
    const atletas = [
      ...Array.from({ length: 4 }, (_, i) => ({ id: i + 1, nome: `A${i}`, categoria: 'X', escola: 'Escola Z' })),
      ...Array.from({ length: 12 }, (_, i) => ({ id: i + 5, nome: `B${i}`, categoria: 'X', escola: `Escola ${i}` })),
    ];
    const r = sortear(atletas);
    expect(contarConflitos(r.grupos)).toBe(0);
  });

  it('escola maior que número de grupos gera mínimo de conflitos', () => {
    // 10 atletas da mesma escola, 3 grupos → conflito inevitável mas mínimo
    const atletas = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1, nome: `A${i}`, categoria: 'X', escola: 'Escola Única',
    }));
    const r = sortear(atletas); // 3 grupos de 3/4
    // Com 10 atletas mesma escola e 3 grupos, conflitos mínimos = 10 - 3 = 7
    // mas a realidade é que cada grupo terá ~3-4, conflitos por grupo = tamanho-1
    // Total mínimo de conflitos = n - numGrupos = 10 - 3 = 7
    // Nosso algoritmo deve atingir esse mínimo (distribuição ótima)
    const conflitos = contarConflitos(r.grupos);
    expect(conflitos).toBeLessThanOrEqual(10 - 3 + 1); // tolerância de 1
  });

  it('atletas com escola vazia não causam falhas', () => {
    const atletas = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1, nome: `A${i}`, categoria: 'X', escola: '',
    }));
    expect(() => sortear(atletas)).not.toThrow();
  });

  it('atletas com escola null não causam falhas', () => {
    const atletas = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1, nome: `A${i}`, categoria: 'X', escola: null,
    }));
    expect(() => sortear(atletas)).not.toThrow();
  });

  it('mistura de atletas com e sem escola: todos aparecem no resultado', () => {
    const atletas = [
      { id: 1, nome: 'A', categoria: 'X', escola: 'Escola A' },
      { id: 2, nome: 'B', categoria: 'X', escola: '' },
      { id: 3, nome: 'C', categoria: 'X', escola: null },
      { id: 4, nome: 'D', categoria: 'X', escola: 'Escola B' },
      { id: 5, nome: 'E', categoria: 'X', escola: 'Escola A' },
      { id: 6, nome: 'F', categoria: 'X', escola: 'Escola C' },
    ];
    const r = sortear(atletas);
    const ids = todasAtletas(r).map((a) => a.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('atletas da mesma escola não ficam no mesmo grupo quando possível (execução repetida)', () => {
    // Executar 20 vezes para ter confiança estatística
    let totalConflitos = 0;
    for (let i = 0; i < 20; i++) {
      // 12 atletas, 4 grupos: 3 atletas de cada uma das 4 escolas → 0 conflitos possíveis
      const atletas = Array.from({ length: 12 }, (_, idx) => ({
        id: idx + 1,
        nome: `A${idx}`,
        categoria: 'X',
        escola: `Escola ${idx % 4}`,
      }));
      const r = sortear(atletas);
      totalConflitos += contarConflitos(r.grupos);
    }
    // Em 20 execuções, com distribuição ótima possível, esperamos 0 conflitos sempre
    expect(totalConflitos).toBe(0);
  });
});
