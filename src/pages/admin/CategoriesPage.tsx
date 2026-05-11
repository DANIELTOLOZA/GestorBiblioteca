import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoriesApi';
import type { Category } from '../../types';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', deweyCode: '' });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const saveMutation = useMutation({
    mutationFn: (payload: object) => editing ? updateCategory(editing.id, payload) : createCategory(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setShowModal(false); }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] })
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', deweyCode: '' }); setShowModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, description: c.description ?? '', deweyCode: c.deweyCode ?? '' }); setShowModal(true); };

  const filtered = data?.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.deweyCode ?? '').includes(search));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg"><Tag className="h-5 w-5 text-violet-700" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
            <p className="text-sm text-gray-500">{data?.length ?? 0} categorias registradas</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nueva Categoria
        </button>
      </div>

      <div className="relative max-w-sm">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o codigo..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-violet-50">
              <tr>
                {['Nombre', 'Descripcion', 'Codigo Dewey', 'Acciones'].map(h =>
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-violet-700 uppercase tracking-wider">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered?.map(c => (
                <tr key={c.id} className="hover:bg-violet-50/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-bold flex-shrink-0">
                        {c.name[0].toUpperCase()}
                      </span>
                      <span className="font-semibold text-sm text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs">
                    <span className="line-clamp-2">{c.description || <span className="italic text-gray-300">Sin descripcion</span>}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.deweyCode
                      ? <span className="px-2.5 py-1 text-xs bg-amber-100 text-amber-800 rounded-md font-mono font-semibold">{c.deweyCode}</span>
                      : <span className="text-gray-300 text-sm">—</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} title="Editar"
                        className="p-1.5 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => { if (confirm(`Eliminar "${c.name}"?`)) deleteMutation.mutate(c.id); }} title="Eliminar"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered?.length && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">No se encontraron categorias</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-violet-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Editar Categoria' : 'Nueva Categoria'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Literatura, Ciencias, Historia..."
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descripcion</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  placeholder="Describe brevemente esta categoria..."
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Codigo Dewey</label>
                <input value={form.deweyCode} onChange={e => setForm(f => ({ ...f, deweyCode: e.target.value }))}
                  placeholder="Ej: 800, 500.1, 823.914"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <p className="text-xs text-gray-400 mt-1">Sistema decimal de clasificacion bibliografica</p>
              </div>
              {saveMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">Error al guardar. Verifica los datos.</p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
                  {saveMutation.isPending ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
