import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import LogoIcon from '../../assets/icons/logo.svg?react';
import DownloadIcon from '../../assets/icons/upload.svg?react';

export function DownloadAppPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/lumilivre.apk';
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="bg-gray-50 dark:bg-dark-background min-h-screen flex items-center justify-center p-6 relative select-none">
      <div className="w-full max-w-sm mx-auto flex flex-col justify-center text-center">
        <div className="mb-8 animate-bounce">
          <LogoIcon className="h-[150px] w-auto mx-auto text-lumi-primary" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Baixando LumiLivre
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-6 mt-3">
          O aplicativo deve começar baixar em instantes.
        </p>

        <div className="space-y-4">
          <a
            href="/lumilivre.apk"
            download="LumiLivre.apk"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-4 px-4 rounded-lg shadow-md transform active:scale-95"
          >
            <DownloadIcon className="w-5 h-5" />
            CLIQUE SE NÃO INICIOU
          </a>

          <Link
            to="/login"
            className="block text-lumi-primary dark:text-lumi-label font-bold hover:underline mt-4"
          >
            Ir para o site administrativo
          </Link>
        </div>
      </div>
    </main>
  );
}
