export interface Emprestimo {
  id: number;
  exemplar: {
    livro: {
      nome: string;
      isbn: string;
      imagem: string | null;
    };
  };
  aluno: {
    nomeCompleto: string;
  };
  dataEmprestimo: string;
  dataDevolucao: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; 
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}