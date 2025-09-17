import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout'; 

import { LoginPage } from './pages/Login';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { DashboardPage } from './pages/Dashboard';
import { MudarSenhaPage } from './pages/ChangePassword';
import { EmprestimosPage } from './pages/Loans';
import { AlunosPage } from './pages/Students';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} />
      <Route path="/mudar-senha" element={<MudarSenhaPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout> 
            <DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      }/>

      <Route path="/emprestimos" element={ 
        <ProtectedRoute>
          <MainLayout>
            <EmprestimosPage />
          </MainLayout>
        </ProtectedRoute> 
      }/>
      
      <Route path="/alunos" element={ 
        <ProtectedRoute>
          <MainLayout>
            <AlunosPage />
          </MainLayout>
        </ProtectedRoute> } />
      
      <Route path="/" element={
          <ProtectedRoute>
            <MainLayout> 
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
      }/>
    </Routes>
  );
}

export default App;