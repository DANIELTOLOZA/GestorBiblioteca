import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, toggleUserActive, deleteUser } from '../../api/usersApi';
import type { User } from '../../types';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Users } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Administrador', LIBRARIAN: 'Bibliotecario', READER: 'Lector' };
const roleBadge = (role: string) => {
  const map: Record<string, string> = { ADMIN: 'bg-red-100 text-red-700', LIBRARIAN: 'bg-violet-100 text-violet-700', READER: 'bg-emerald-100 text-emerald-700' };
  return <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${map[role] ?? ''}`}>{ROLE_LABELS[role] ?? role}</span>;
};

const initials = (name: string) => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
const avatarColor = (role: string) => ({ ADMIN: 'from-red-400 to-rose-600', LIBRARIAN: 'from-violet-400 to-purple-600', READER: 'from-emerald-400 to-teal-600' }[role] ?? 'from-gray-400 to-gray-600');

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'READER' });

  const { data, isLoading } = useQuery({ queryKey: ['users', page], queryFn: () => getUsers(page) });

  const saveMutation = useMutation({
    mutationFn: (payload: object) => editing ? updateUser(editing.id, payload) : createUser(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowModal(false); }
  });

  const toggleMutation = useMutation({ mutationFn: toggleUserActive, onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });
  const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'READER' }); setShowModal(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setShowModal(true); };

  const filtered = data?.content.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg"><Users className="h-5 w-5 text-violet-700" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de Usuarios</h1>
            <p className="text-sm text-gray-500">{data?.totalElements ?? 0} usuarios registrados</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">Todos los roles</option>
          <option value="ADMIN">Administrador</option>
          <option value="LIBRARIAN">Bibliotecario</option>
          <option value="READER">Lector</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-violet-50">
              <tr>{['Usuario', 'Email', 'Rol', 'Estado', 'Registrado', 'Acciones'].map(h =>
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-violet-700 uppercase tracking-wider">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered?.map(u => (
                <tr key={u.id} className="hover:bg-violet-50/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(u.role)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {initials(u.name)}
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5">{roleBadge(u.role)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} title="Editar" className="p-1.5 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => toggleMutation.mutate(u.id)} title={u.active ? 'Desactivar' : 'Activar'} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        {u.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button onClick={() => { if (confirm(`Eliminar a "${u.name}"?`)) deleteMutation.mutate(u.id); }} title="Eliminar" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered?.length && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No se encontraron usuarios</td></tr>
              )}
            </tbody>
          </table>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-5 py-3 border-t flex items-center justify-between text-sm bg-gray-50">
            <span className="text-gray-500">{data.totalElements} usuarios en total</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100">Anterior</button>
              <span className="text-gray-600 font-medium">{page + 1} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-violet-50 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre completo <span className="text-red-500">*</span></label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {editing ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena *'}
                </label>
                <input type="password" required={!editing} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Rol <span className="text-red-500">*</span></label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="READER">Lector</option>
                  <option value="LIBRARIAN">Bibliotecario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {form.role === 'READER' && 'Solo puede explorar el catalogo y gestionar sus prestamos'}
                  {form.role === 'LIBRARIAN' && 'Puede gestionar libros, prestamos, reservas y multas'}
                  {form.role === 'ADMIN' && 'Acceso completo al sistema, incluyendo gestion de usuarios'}
                </p>
              </div>
              {saveMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">Error al guardar. Verifica los datos.</p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold rounded-lg text-sm disabled:opacity-60">
                  {saveMutation.isPending ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
