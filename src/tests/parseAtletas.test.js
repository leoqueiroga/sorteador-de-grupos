import { describe, it, expect } from 'vitest';
import { parseAtletas, extrairCategorias } from '../logic/parseAtletas.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const csv = (...linhas) => linhas.join('\n');

// ─── parseAtletas ─────────────────────────────────────────────────────────────
describe('parseAtletas', () => {
  // ── Entradas inválidas / vazias ────────────────────────────────────────────
  it('retorna atletas e erros vazios para string vazia', () => {
    const r = parseAtletas('');
    expect(r).toEqual({ atletas: [], erros: [] });
  });

  it('retorna atletas e erros vazios para null', () => {
    const r = parseAtletas(null);
    expect(r).toEqual({ atletas: [], erros: [] });
  });

  it('retorna atletas e erros vazios para undefined', () => {
    const r = parseAtletas(undefined);
    expect(r).toEqual({ atletas: [], erros: [] });
  });

  it('retorna atletas e erros vazios para string só de espaços', () => {
    const r = parseAtletas('   \n   \n   ');
    expect(r).toEqual({ atletas: [], erros: [] });
  });

  // ── Separadores ───────────────────────────────────────────────────────────
  it('detecta separador vírgula', () => {
    const { atletas } = parseAtletas('1,João,Sub-13,Escola A');
    expect(atletas).toHaveLength(1);
    expect(atletas[0].nome).toBe('João');
  });

  it('detecta separador ponto-e-vírgula', () => {
    const { atletas } = parseAtletas('1;João;Sub-13;Escola A');
    expect(atletas).toHaveLength(1);
    expect(atletas[0].escola).toBe('Escola A');
  });

  // ── Cabeçalho ────────────────────────────────────────────────────────────
  it('ignora cabeçalho com campo "id"', () => {
    const { atletas } = parseAtletas(csv('id,nome,categoria,escola', '1,Maria,Sub-13,E.A'));
    expect(atletas).toHaveLength(1);
    expect(atletas[0].id).toBe(1);
  });

  it('ignora cabeçalho com campo "nome"', () => {
    const { atletas } = parseAtletas(csv('ID,Nome,Cat,Escola', '2,Pedro,Sub-15,E.B'));
    expect(atletas).toHaveLength(1);
    expect(atletas[0].nome).toBe('Pedro');
  });

  it('não descarta linha de dados quando não há cabeçalho', () => {
    const { atletas } = parseAtletas('1,Ana,Sub-13,Escola X');
    expect(atletas).toHaveLength(1);
  });

  // ── Campos ───────────────────────────────────────────────────────────────
  it('mapeia corretamente id, nome, categoria, escola', () => {
    const { atletas } = parseAtletas('42,José Silva,Sub-17 Masculino,Escola Estadual Alfa');
    expect(atletas[0]).toMatchObject({
      id: 42,
      nome: 'José Silva',
      categoria: 'Sub-17 Masculino',
      escola: 'Escola Estadual Alfa',
    });
  });

  it('escola com vírgula no nome é preservada (campos extras juntos)', () => {
    // "Escola A, Turma 3" → 5 campos, os dois últimos se juntam como escola
    const { atletas } = parseAtletas('1,Ana,Sub-13,Escola A, Turma 3');
    expect(atletas[0].escola).toContain('Escola A');
  });

  it('trim nos campos — espaços extras são removidos', () => {
    const { atletas } = parseAtletas('  1  ,  Ana  ,  Sub-13  ,  Escola A  ');
    expect(atletas[0]).toMatchObject({ id: 1, nome: 'Ana', categoria: 'Sub-13', escola: 'Escola A' });
  });

  it('quebra de linha CRLF (\\r\\n) é tratada corretamente', () => {
    const { atletas } = parseAtletas('1,Ana,Sub-13,Escola A\r\n2,Pedro,Sub-13,Escola B');
    expect(atletas).toHaveLength(2);
  });

  // ── Erros ────────────────────────────────────────────────────────────────
  it('linha com menos de 4 campos gera erro e não cria atleta', () => {
    const { atletas, erros } = parseAtletas('1,Ana,Sub-13');
    expect(atletas).toHaveLength(0);
    expect(erros).toHaveLength(1);
    expect(erros[0]).toMatch(/menos de 4 campos/);
  });

  it('linha com ID não numérico gera erro e não cria atleta', () => {
    const { atletas, erros } = parseAtletas('abc,Ana,Sub-13,Escola A');
    expect(atletas).toHaveLength(0);
    expect(erros).toHaveLength(1);
    expect(erros[0]).toMatch(/ID inválido/);
  });

  it('mistura de linhas válidas e inválidas: válidas são incluídas', () => {
    const { atletas, erros } = parseAtletas(csv(
      '1,Ana,Sub-13,Escola A',
      'xxx,Inválido,Sub-13,Escola B',
      '3,Pedro,Sub-13,Escola C',
    ));
    expect(atletas).toHaveLength(2);
    expect(erros).toHaveLength(1);
  });

  it('linhas em branco no meio do CSV são ignoradas silenciosamente', () => {
    const { atletas, erros } = parseAtletas(csv(
      '1,Ana,Sub-13,Escola A',
      '',
      '2,Pedro,Sub-13,Escola B',
    ));
    expect(atletas).toHaveLength(2);
    expect(erros).toHaveLength(0);
  });

  // ── Múltiplos atletas ────────────────────────────────────────────────────
  it('processa múltiplos atletas corretamente', () => {
    const texto = csv(
      '1,Ana,Sub-13,Escola A',
      '2,Pedro,Sub-13,Escola B',
      '3,Maria,Sub-15,Escola A',
    );
    const { atletas } = parseAtletas(texto);
    expect(atletas).toHaveLength(3);
    expect(atletas.map((a) => a.id)).toEqual([1, 2, 3]);
  });
});

// ─── extrairCategorias ────────────────────────────────────────────────────────
describe('extrairCategorias', () => {
  it('retorna array vazio para lista vazia', () => {
    expect(extrairCategorias([])).toEqual([]);
  });

  it('retorna categorias únicas em ordem alfabética', () => {
    const atletas = [
      { categoria: 'Sub-17' },
      { categoria: 'Sub-13' },
      { categoria: 'Sub-17' },
      { categoria: 'Sub-15' },
    ];
    expect(extrairCategorias(atletas)).toEqual(['Sub-13', 'Sub-15', 'Sub-17']);
  });

  it('ignora categorias vazias', () => {
    const atletas = [
      { categoria: 'Sub-13' },
      { categoria: '' },
      { categoria: null },
    ];
    expect(extrairCategorias(atletas)).toEqual(['Sub-13']);
  });
});
