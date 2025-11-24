export function formatarNome(nome: string | null | undefined): string {
  if (!nome) return '-';

  const preposicoes = ['da', 'de', 'do', 'das', 'dos', 'e'];

  return nome
    .toLowerCase()
    .split(' ')
    .filter((palavra) => palavra.trim() !== '')
    .map((palavra) => {
      if (preposicoes.includes(palavra)) {
        return palavra;
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}
