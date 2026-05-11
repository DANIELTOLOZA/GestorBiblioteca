import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from '../../api/authorsApi';
import type { Author } from '../../types';
import { Plus, Edit, Trash2, Search, User } from 'lucide-react';

export default function AuthorsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState({ name: '', bio: '' });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['authors'], queryFn: getAuthors });

  const saveMutation = useMutation({
    mutationFn: (payload: object) => editing ? updateAuthor(editing.id, payload) : createAuthor(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['authors'] }); setShowModal(false); }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authors'] })
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', bio: '' }); setShowModal(true); };
  const openEdit = (a: Author) => { setEditing(a); setForm({ name: a.name, bio: a.bio ?? '' }); setShowModal(true); };

  const filtered = data?.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  const initials = (name: string) => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg"><User className="h-5 w-5 text-amber-700" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Autores</h1>
            <p className="text-sm text-gray-500">{data?.length ?? 0} autores registrados</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo Autor
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : filtered?.length ? filtered.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                {initials(a.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{a.name}</h3>
                {a.bio ? (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3">{a.bio}</p>
                ) : (
                  <p className="text-xs text-gray-300 mt-1 italic">Sin biografia</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => openEdit(a)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-violet-600 hover:bg-violet-50 rounded-lg transition-colors font-medium">
                <Edit className="h-3.5 w-3.5" /> Editar
              </button>
              <button onClick={() => { if (confirm(`Eliminar "${a.name}"?`)) deleteMutation.mutate(a.id); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-3 py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
            No se encontraron autores
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-amber-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Editar Autor' : 'Nuevo Autor'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre completo <span className="text-red-500">*</span></label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Gabriel Garcia Marquez"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Biografia</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4}
                  placeholder="Breve descripcion del autor, su obra o epoca..."
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
              {saveMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {(saveMutation.error as {code?:string})?.code === 'ERR_NETWORK'
                    ? 'Modo demo: backend no disponible. Los autores son de solo lectura en este entorno.'
                    : 'Error al guardar. Verifica los datos e intenta de nuevo.'}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
                  {saveMutation.isPending ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Autor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
