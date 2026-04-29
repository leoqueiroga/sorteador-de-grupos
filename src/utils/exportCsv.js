/**
 * Serializa o resultado do sorteio para CSV e dispara download.
 */
export function exportarCSV(resultado, categoria) {
    if (!resultado) return;

    const linhas = [];
    const sep = ";";

    // Grupos
    if (resultado.grupos.length > 0) {
        linhas.push(`Categoria${sep}${categoria}`);
        linhas.push(`Modo${sep}${resultado.modo.label}`);
        linhas.push("");
        linhas.push(`Grupo${sep}ID${sep}Nome${sep}Escola`);
        for (const grupo of resultado.grupos) {
            for (const atleta of grupo.atletas) {
                linhas.push(
                    [grupo.nome, atleta.id, atleta.nome, atleta.escola].join(
                        sep,
                    ),
                );
            }
        }
    }

    // Bracket
    if (resultado.bracket && resultado.bracket.length > 0) {
        linhas.push("");
        linhas.push(`Jogo${sep}Lado 1${sep}Lado 2${sep}Etapa`);
        for (const jogo of resultado.bracket) {
            linhas.push(
                [
                    jogo.jogo,
                    formatarLado(jogo.lado1),
                    formatarLado(jogo.lado2),
                    jogo.etapa,
                ].join(sep),
            );
        }
    }

    const conteudo = linhas.join("\n");
    const blob = new Blob(["\uFEFF" + conteudo], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sorteio_${categoria.replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export function formatarLado(lado) {
    if (!lado) return "";
    switch (lado.tipo) {
        case "grupo":
            return `${lado.ordinal} Grupo ${lado.grupo}`;
        case "sorteio":
            return `${lado.num}º SORTEIO`;
        case "vencedor":
            return `Vencedor Jogo ${lado.jogo}`;
        case "perdedor":
            return `Perdedor Jogo ${lado.jogo}`;
        case "atleta":
            return lado.atleta
                ? `${lado.atleta.id} - ${lado.atleta.nome}`
                : "BYE";
        case "bye":
            return "BYE";
        default:
            return "";
    }
}
