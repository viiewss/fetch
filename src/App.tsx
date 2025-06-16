import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Search from './pages/Search';
import './index.css';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-center py-4">Fetch Dog Adoption</h1>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;