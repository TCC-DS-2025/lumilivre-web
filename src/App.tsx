import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';

import { LoginPage } from './pages/Auth/Login';
import { EsqueciSenhaPage } from './pages/Auth/ForgotPassword';
import { MudarSenhaPage } from './pages/Auth/ChangePassword';

import { DashboardPage } from './pages/Start';
import { EmprestimosPage } from './pages/Loans';
import { LivrosPage } from './pages/Books';
import { AlunosPage } from './pages/Students';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/esqueci-a-senha" element={<EsqueciSenhaPage />} />
      <Route path="/mudar-senha" element={<MudarSenhaPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/emprestimos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EmprestimosPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/livros"
        element={
          <ProtectedRoute>
            <MainLayout>
              <LivrosPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/alunos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AlunosPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
