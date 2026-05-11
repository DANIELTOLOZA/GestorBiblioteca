import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Users, BookMarked,
  CalendarCheck, AlertCircle, Library, LogOut, BookCopy
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/books', icon: BookOpen, label: 'Libros' },
  { to: '/users', icon: Users, label: 'Usuarios' },
  { to: '/loans', icon: BookMarked, label: 'Prestamos' },
  { to: '/reservations', icon: CalendarCheck, label: 'Reservas' },
  { to: '/fines', icon: AlertCircle, label: 'Multas' },
];

const librarianLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/books', icon: BookOpen, label: 'Libros' },
  { to: '/loans', icon: BookMarked, label: 'Prestamos' },
  { to: '/reservations', icon: CalendarCheck, label: 'Reservas' },
  { to: '/fines', icon: AlertCircle, label: 'Multas' },
];

const readerLinks = [
  { to: '/catalog', icon: Library, label: 'Catalogo' },
  { to: '/my-loans', icon: BookCopy, label: 'Mis Prestamos' },
  { to: '/my-reservations', icon: CalendarCheck, label: 'Mis Reservas' },
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const links = hasRole('ADMIN') ? adminLinks : hasRole('LIBRARIAN') ? librarianLinks : readerLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sky-900 text-white">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sky-800">
        <img src="/lady-labrynth.jpg" alt="Labrynth Book" className="h-10 w-10 rounded-full object-cover object-top border-2 border-sky-400" />
        <span className="text-xl font-bold tracking-tight">Labrynth Book</span>
      </div>
      <div className="px-4 py-4 border-b border-sky-800">
        <p className="text-xs text-sky-400 uppercase tracking-wider">Bienvenido</p>
        <p className="font-semibold truncate">{user?.name}</p>
        <span className="text-xs bg-sky-700 text-sky-200 px-2 py-0.5 rounded-full">{user?.role}</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-sky-700 text-white' : 'text-sky-200 hover:bg-sky-800 hover:text-white'
              }`
            }>
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-sky-800">
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sky-200 hover:text-white hover:bg-sky-800 rounded-lg transition-colors">
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
