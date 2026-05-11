import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import BooksPage from './pages/admin/BooksPage';
import UsersPage from './pages/admin/UsersPage';
import LoansPage from './pages/admin/LoansPage';
import ReservationsPage from './pages/admin/ReservationsPage';
import FinesPage from './pages/admin/FinesPage';
import CatalogPage from './pages/reader/CatalogPage';
import MyLoansPage from './pages/reader/MyLoansPage';
import MyReservationsPage from './pages/reader/MyReservationsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<ProtectedRoute roles={['ADMIN','LIBRARIAN']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/books" element={<ProtectedRoute roles={['ADMIN','LIBRARIAN']}><BooksPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
              <Route path="/loans" element={<ProtectedRoute roles={['ADMIN','LIBRARIAN']}><LoansPage /></ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute roles={['ADMIN','LIBRARIAN']}><ReservationsPage /></ProtectedRoute>} />
              <Route path="/fines" element={<ProtectedRoute roles={['ADMIN','LIBRARIAN']}><FinesPage /></ProtectedRoute>} />
              <Route path="/catalog" element={<ProtectedRoute roles={['READER','ADMIN','LIBRARIAN']}><CatalogPage /></ProtectedRoute>} />
              <Route path="/my-loans" element={<ProtectedRoute roles={['READER']}><MyLoansPage /></ProtectedRoute>} />
              <Route path="/my-reservations" element={<ProtectedRoute roles={['READER']}><MyReservationsPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
