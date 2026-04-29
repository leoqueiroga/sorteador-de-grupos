import { describe, it, expect } from 'vitest';
import { formatarLado } from '../utils/exportCsv.js';

// exportarCSV depende de APIs do browser (Blob, URL, document) e não é testável
// em ambiente Node. Os testes cobrem formatarLado que é a lógica central.

describe('formatarLado', () => {
  it('null/undefined → string vazia', () => {
    expect(formatarLado(null)).toBe('');
    expect(formatarLado(undefined)).toBe('');
  });

  it('tipo "grupo" → "1º Grupo A"', () => {
    expect(formatarLado({ tipo: 'grupo', ordinal: '1º', grupo: 'A' })).toBe('1º Grupo A');
  });

  it('tipo "grupo" 2º → "2º Grupo B"', () => {
    expect(formatarLado({ tipo: 'grupo', ordinal: '2º', grupo: 'B' })).toBe('2º Grupo B');
  });

  it('tipo "sorteio" → "3º SORTEIO"', () => {
    expect(formatarLado({ tipo: 'sorteio', num: 3 })).toBe('3º SORTEIO');
  });

  it('tipo "vencedor" → "Vencedor Jogo 5"', () => {
    expect(formatarLado({ tipo: 'vencedor', jogo: 5 })).toBe('Vencedor Jogo 5');
  });

  it('tipo "perdedor" → "Perdedor Jogo 7"', () => {
    expect(formatarLado({ tipo: 'perdedor', jogo: 7 })).toBe('Perdedor Jogo 7');
  });

  it('tipo "atleta" com atleta → "42 - João Silva"', () => {
    expect(formatarLado({ tipo: 'atleta', atleta: { id: 42, nome: 'João Silva' } })).toBe(
      '42 - João Silva',
    );
  });

  it('tipo "atleta" com atleta null → "BYE"', () => {
    expect(formatarLado({ tipo: 'atleta', atleta: null })).toBe('BYE');
  });

  it('tipo "bye" → "BYE"', () => {
    expect(formatarLado({ tipo: 'bye' })).toBe('BYE');
  });

  it('tipo desconhecido → string vazia', () => {
    expect(formatarLado({ tipo: 'xyz' })).toBe('');
  });
});
