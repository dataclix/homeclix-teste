export function removeAccents(str: string): string {
    if (!str) {
        return '';
    }
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
export function pegarPrimeiroUltimoNome(nomeCompleto: string | null | undefined) {
    if (!nomeCompleto) {
        return "";  // Retorna uma string vazia se nomeCompleto for null ou undefined
    }

    const nomes = nomeCompleto.trim().split(" ");

    if (nomes.length === 1) {
        return nomes[0];  // Se tiver apenas um nome, retorna ele
    }

    const primeiroNome = nomes[0];
    const ultimoNome = nomes[nomes.length - 1];

    return `${primeiroNome} ${ultimoNome}`;
}