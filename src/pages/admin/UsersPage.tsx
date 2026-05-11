import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, toggleUserActive, deleteUser } from '../../api/usersApi';
import type { User } from '../../types';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const roleBadge = (role: string) => {
  const map: Record<string, string> = { ADMIN: 'bg-red-100 text-red-700', LIBRARIAN: 'bg-sky-100 text-sky-700', READER: 'bg-emerald-100 text-emerald-700' };
  return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[role] ?? ''}`}>{role}</span>;
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
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

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); saveMutation.mutate(form); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Usuarios</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Nombre','Email','Rol','Estado','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.content.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">{roleBadge(u.role)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => toggleMutation.mutate(u.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded">{u.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button>
                      <button onClick={() => { if (confirm('Eliminar usuario?')) deleteMutation.mutate(u.id); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">{data.totalElements} usuarios</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="px-3 py-1">{page + 1} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-sm font-medium text-gray-700">Nombre *</label><input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" /></div>
              <div><label className="text-sm font-medium text-gray-700">Email *</label><input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" /></div>
              <div><label className="text-sm font-medium text-gray-700">{editing ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena *'}</label><input type="password" required={!editing} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" /></div>
              <div><label className="text-sm font-medium text-gray-700">Rol *</label>
                <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="READER">Lector</option>
                  <option value="LIBRARIAN">Bibliotecario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">{saveMutation.isPending ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
