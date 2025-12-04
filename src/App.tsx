import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LoadingIcon } from './components/LoadingIcon';

import { LoginPage } from './pages/Auth/Login';
import { EsqueciSenhaPage } from './pages/Auth/ForgotPassword';
import { MudarSenhaPage } from './pages/Auth/ChangePassword';

import { DownloadAppPage } from './pages/Download';

const DashboardPage = lazy(() =>
  import('./pages/Start').then((module) => ({ default: module.DashboardPage })),
);
const LivrosPage = lazy(() =>
  import('./pages/Books').then((module) => ({ default: module.LivrosPage })),
);
const AlunosPage = lazy(() =>
  import('./pages/Students').then((module) => ({ default: module.AlunosPage })),
);
const EmprestimosPage = lazy(() =>
  import('./pages/Loans').then((module) => ({
    default: module.EmprestimosPage,
  })),
);
const TccPage = lazy(() =>
  import('./pages/TCC').then((module) => ({ default: module.TccPage })),
);
const ClassificacaoPage = lazy(() =>
  import('./pages/Ranking').then((module) => ({
    default: module.ClassificacaoPage,
  })),
);
const RelatoriosPage = lazy(() =>
  import('./pages/Reports').then((module) => ({
    default: module.RelatoriosPage,
  })),
);
const ConfiguracoesPage = lazy(() =>
  import('./pages/Settings').then((module) => ({
    default: module.ConfiguracoesPage,
  })),
);

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <LoadingIcon />
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/esqueci-a-senha" element={<EsqueciSenhaPage />} />
      <Route path="/mudar-senha" element={<MudarSenhaPage />} />

      <Route path="/download" element={<DownloadAppPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/livros"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <LivrosPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/alunos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <AlunosPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/emprestimos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <EmprestimosPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tcc"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <TccPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/classificacao"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <ClassificacaoPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <RelatoriosPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <ConfiguracoesPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
