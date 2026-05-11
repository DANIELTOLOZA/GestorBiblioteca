import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Users, BookMarked,
  CalendarCheck, AlertCircle, Library, BookCopy,
  Tag, UserCheck
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/books',        icon: BookOpen,         label: 'Libros' },
  { to: '/categories',   icon: Tag,              label: 'Categorias' },
  { to: '/authors',      icon: UserCheck,        label: 'Autores' },
  { to: '/users',        icon: Users,            label: 'Usuarios' },
  { to: '/loans',        icon: BookMarked,       label: 'Prestamos' },
  { to: '/reservations', icon: CalendarCheck,    label: 'Reservas' },
  { to: '/fines',        icon: AlertCircle,      label: 'Multas' },
];

const librarianLinks = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/books',        icon: BookOpen,         label: 'Libros' },
  { to: '/categories',   icon: Tag,              label: 'Categorias' },
  { to: '/authors',      icon: UserCheck,        label: 'Autores' },
  { to: '/loans',        icon: BookMarked,       label: 'Prestamos' },
  { to: '/reservations', icon: CalendarCheck,    label: 'Reservas' },
  { to: '/fines',        icon: AlertCircle,      label: 'Multas' },
];

const readerLinks = [
  { to: '/catalog',          icon: Library,      label: 'Catalogo' },
  { to: '/my-loans',         icon: BookCopy,     label: 'Mis Prestamos' },
  { to: '/my-reservations',  icon: CalendarCheck, label: 'Mis Reservas' },
];

export default function Sidebar() {
  const { user, hasRole } = useAuth();

  const links = hasRole('ADMIN') ? adminLinks : hasRole('LIBRARIAN') ? librarianLinks : readerLinks;

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-violet-950 text-white border-r border-violet-800/40">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-violet-800/50">
        <div className="relative">
          <img
            src={`${import.meta.env.BASE_URL}lovely-labrynth.jpg`}
            alt="Lovely Labrynth"
            className="h-11 w-11 rounded-full object-cover object-top border-2 border-amber-400/70 shadow-lg shadow-amber-400/20"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-amber-400/20" />
        </div>
        <span className="text-lg font-bold tracking-tight text-amber-200">Labrynth Book</span>
      </div>

      <div className="px-4 py-4 border-b border-violet-800/50">
        <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Bienvenido</p>
        <p className="font-semibold text-white truncate">{user?.name}</p>
        <span className="inline-block text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full mt-1">
          {user?.role}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border-l-2 border-amber-400 pl-[10px]'
                  : 'text-violet-300 hover:bg-violet-800/60 hover:text-white border-l-2 border-transparent'
              }`
            }>
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
