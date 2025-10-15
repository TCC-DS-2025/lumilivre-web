import axios from 'axios';

interface GoogleBookImageLinks {
  thumbnail?: string;
  smallThumbnail?: string;
}

interface GoogleBookVolumeInfo {
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string; // formato 'YYYY-MM-DD' ou 'YYYY'
  description: string;
  pageCount: number;
  categories: string[];
  imageLinks?: GoogleBookImageLinks;
}

interface GoogleBookItem {
  volumeInfo: GoogleBookVolumeInfo;
}

interface GoogleBooksResponse {
  items: GoogleBookItem[];
}

export interface LivroGoogle {
  nome: string;
  autor: string;
  editora: string;
  data_lancamento: string;
  numero_paginas: number;
  generos: string[];
  sinopse: string;
  imagem: string;
}

const API_URL = 'https://www.googleapis.com/books/v1/volumes';

const traduzirGenero = (generoEmIngles: string): string => {
  const mapaGeneros: { [key: string]: string } = {
    Fiction: 'Ficção',
    'Science Fiction': 'Ficção Científica',
    Fantasy: 'Fantasia',
    Mystery: 'Mistério',
    Thriller: 'Suspense',
    Horror: 'Terror',
    Romance: 'Romance',
    History: 'História',
    'Biography & Autobiography': 'Biografia',
    Computers: 'Informática',
    'Business & Economics': 'Negócios',
    'Self-Help': 'Autoajuda',
    'Juvenile Fiction': 'Ficção Juvenil',
  };

  return mapaGeneros[generoEmIngles] || generoEmIngles;
};

export const buscarLivroPorIsbn = async (
  isbn: string,
): Promise<LivroGoogle | null> => {
  try {
    const response = await axios.get<GoogleBooksResponse>(API_URL, {
      params: { q: `isbn:${isbn}` },
    });

    if (!response.data.items || response.data.items.length === 0) {
      console.warn('Nenhum livro encontrado para o ISBN:', isbn);
      return null;
    }

    const bookData = response.data.items[0].volumeInfo;

    const generosTraduzidos = bookData.categories
      ? bookData.categories.map(traduzirGenero)
      : [];

    // transforma para 'YYYY' ou 'YYYY-MM-DD'
    let dataFormatada = '';
    if (bookData.publishedDate) {
      if (bookData.publishedDate.length === 4) {
        dataFormatada = `${bookData.publishedDate}-01-01`;
      } else {
        dataFormatada = bookData.publishedDate;
      }
    }

    const livro: LivroGoogle = {
      nome: bookData.title || '',
      autor: bookData.authors ? bookData.authors.join(', ') : '',
      editora: bookData.publisher || '',
      data_lancamento: dataFormatada,
      numero_paginas: bookData.pageCount || 0,
      generos: generosTraduzidos,
      sinopse: bookData.description || '',
      imagem: bookData.imageLinks?.thumbnail || '',
    };

    return livro;
  } catch (error) {
    console.error('Erro ao buscar livro na API do Google Books:', error);
    return null;
  }
};
