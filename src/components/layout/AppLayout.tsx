import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
              <User className="h-4 w-4 text-violet-600" />
            </div>
            <span className="font-medium">{user?.name}</span>
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-medium">{user?.role}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-gray-200 hover:border-red-200">
            <LogOut className="h-4 w-4" />
            Cerrar Sesion
          </button>
        </header>
        <main className="flex-1 overflow-auto bg-violet-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
