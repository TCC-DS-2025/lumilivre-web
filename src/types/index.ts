export interface Emprestimo {
    id: number;
    exemplar: { 
        livro: { 
        nome: string; 
        isbn: string; 
        imagem: string | null 
        } 
    };
    aluno: { 
        nome: string; 
        sobrenome: string; 
    };
    dataEmprestimo: string; 
    dataDevolucao: string;  
}

