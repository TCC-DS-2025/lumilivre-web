import { Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { ForgotPasswordPage } from './pages/ForgotPassword'; 

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/esqueci-a-senha" element={<ForgotPasswordPage />} /> 
      <Route path="/" element={<LoginPage />} /> 
    </Routes>
  );
}

export default App;