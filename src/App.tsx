import { Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<LoginPage />} /> 
    </Routes>
  );
}

export default App;