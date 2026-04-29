/**
 * Faz o parse de um CSV/texto colado pelo usuário.
 * Formato esperado: id, nome, categoria, escola
 * Aceita separador vírgula ou ponto-e-vírgula.
 */
export function parseAtletas(texto) {
    if (!texto || !texto.trim()) return { atletas: [], erros: [] };

    const linhas = texto
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (linhas.length === 0) return { atletas: [], erros: [] };

    const atletas = [];
    const erros = [];

    // detectar separador
    const primeiraLinha = linhas[0];
    const sep = primeiraLinha.includes(";") ? ";" : ",";

    // verificar se primeira linha é cabeçalho
    const primeirosCampos = primeiraLinha
        .toLowerCase()
        .split(sep)
        .map((c) => c.trim());
    const ehCabecalho = primeirosCampos.some((c) =>
        ["id", "nome", "categoria", "escola"].includes(c),
    );

    const inicio = ehCabecalho ? 1 : 0;

    for (let i = inicio; i < linhas.length; i++) {
        const partes = linhas[i].split(sep).map((p) => p.trim());
        if (partes.length < 4) {
            erros.push(
                `Linha ${i + 1} ignorada (menos de 4 campos): "${linhas[i]}"`,
            );
            continue;
        }
        const [idRaw, nome, categoria, ...escolaParts] = partes;
        const id = parseInt(idRaw, 10);
        if (isNaN(id)) {
            erros.push(`Linha ${i + 1} ignorada (ID inválido): "${linhas[i]}"`);
            continue;
        }
        atletas.push({
            id,
            nome: nome || "",
            categoria: categoria || "",
            escola: escolaParts.join(sep).trim() || "",
        });
    }

    return { atletas, erros };
}

/** Retorna todas as categorias únicas presentes na lista de atletas */
export function extrairCategorias(atletas) {
    const cats = new Set(atletas.map((a) => a.categoria).filter(Boolean));
    return Array.from(cats).sort();
}
