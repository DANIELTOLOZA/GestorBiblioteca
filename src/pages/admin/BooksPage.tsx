import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooks, createBook, updateBook, deleteBook } from '../../api/booksApi';
import { getCategories } from '../../api/categoriesApi';
import { getAuthors } from '../../api/authorsApi';
import type { Book } from '../../types';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';

const statusBadge = (copies: number) =>
  copies > 0
    ? <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">Disponible ({copies})</span>
    : <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Sin stock</span>;

export default function BooksPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState({ title: '', isbn: '', description: '', totalCopies: 1, publishedYear: '', coverUrl: '', categoryId: '', authorIds: [] as number[] });

  const { data, isLoading } = useQuery({ queryKey: ['books', search, categoryId, page], queryFn: () => getBooks({ search, categoryId, page, size: 10 }) });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: authors } = useQuery({ queryKey: ['authors'], queryFn: getAuthors });

  const saveMutation = useMutation({
    mutationFn: (payload: object) => editing ? updateBook(editing.id, payload) : createBook(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['books'] }); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] })
  });

  const openCreate = () => { setEditing(null); setForm({ title: '', isbn: '', description: '', totalCopies: 1, publishedYear: '', coverUrl: '', categoryId: '', authorIds: [] }); setShowModal(true); };
  const openEdit = (b: Book) => {
    setEditing(b);
    setForm({ title: b.title, isbn: b.isbn ?? '', description: b.description ?? '', totalCopies: b.totalCopies, publishedYear: String(b.publishedYear ?? ''), coverUrl: b.coverUrl ?? '', categoryId: String(b.category?.id ?? ''), authorIds: b.authors?.map(a => a.id) ?? [] });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, totalCopies: Number(form.totalCopies), publishedYear: form.publishedYear ? Number(form.publishedYear) : null, categoryId: form.categoryId ? Number(form.categoryId) : null });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Libros</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-violet-950 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Nuevo Libro
        </button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar por titulo o autor..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <select value={categoryId ?? ''} onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">Todas las categorias</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Titulo','ISBN','Categoria','Autores','Copias','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.content.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-violet-400 flex-shrink-0" /><span className="font-medium text-sm">{b.title}</span></div></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.isbn ?? '-'}</td>
                  <td className="px-4 py-3 text-sm">{b.category?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.authors?.map(a => a.name).join(', ') || '-'}</td>
                  <td className="px-4 py-3">{statusBadge(b.availableCopies)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(b)} className="p-1.5 text-violet-600 hover:bg-violet-50 rounded"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm('Eliminar libro?')) deleteMutation.mutate(b.id); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">{data.totalElements} libros</span>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Editar Libro' : 'Nuevo Libro'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-sm font-medium text-gray-700">Titulo *</label><input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700">ISBN</label><input value={form.isbn} onChange={e => setForm(f => ({...f, isbn: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
                <div><label className="text-sm font-medium text-gray-700">Año publicacion</label><input type="number" value={form.publishedYear} onChange={e => setForm(f => ({...f, publishedYear: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700">Descripcion</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700">Total copias *</label><input type="number" min={1} required value={form.totalCopies} onChange={e => setForm(f => ({...f, totalCopies: Number(e.target.value)}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
                <div><label className="text-sm font-medium text-gray-700">Categoria</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({...f, categoryId: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="">Sin categoria</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-sm font-medium text-gray-700">URL portada</label><input value={form.coverUrl} onChange={e => setForm(f => ({...f, coverUrl: e.target.value}))} placeholder="https://..." className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-2">Autores</label>
                <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {authors?.map(a => (
                    <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                      <input type="checkbox" checked={form.authorIds.includes(a.id)}
                        onChange={e => setForm(f => ({ ...f, authorIds: e.target.checked ? [...f.authorIds, a.id] : f.authorIds.filter(id => id !== a.id) }))} />
                      {a.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-violet-950 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
