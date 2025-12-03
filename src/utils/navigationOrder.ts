export const routeOrder = [
  '/dashboard',
  '/livros',
  '/alunos',
  '/emprestimos',
  '/tcc',
  '/classificacao',
  '/relatorios',
  '/configuracoes',
];

export const getRouteIndex = (path: string) => {
  const cleanPath = path.split('?')[0];

  if (cleanPath === '/') return 0;

  const index = routeOrder.indexOf(cleanPath);
  return index === -1 ? 0 : index;
};
