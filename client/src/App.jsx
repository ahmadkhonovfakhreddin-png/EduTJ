import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { CenterDetail } from './pages/CenterDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardStudent } from './pages/DashboardStudent';
import { DashboardCenter } from './pages/DashboardCenter';
import { Admin } from './pages/Admin';
import { ForCenters } from './pages/ForCenters';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/centers/:slug" element={<CenterDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<DashboardStudent />} />
      <Route path="/dashboard/center" element={<DashboardCenter />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/for-centers" element={<ForCenters />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
