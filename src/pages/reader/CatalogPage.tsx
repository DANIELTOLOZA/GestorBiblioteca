import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooks } from '../../api/booksApi';
import { getCategories } from '../../api/categoriesApi';
import { createReservation } from '../../api/reservationsApi';
import { Search, BookOpen, CalendarCheck } from 'lucide-react';

export default function CatalogPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({ queryKey: ['catalog', search, categoryId, page], queryFn: () => getBooks({ search, categoryId, page, size: 12 }) });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const reserveMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalog'] }); alert('Reserva creada exitosamente'); }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Catalogo de Libros</h1>
        <p className="text-gray-500">Explora nuestra coleccion y reserva libros</p>
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
      {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.content.map(book => (
            <div key={book.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                {book.coverUrl ? <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  : <BookOpen className="h-12 w-12 text-violet-400" />}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{book.authors?.map(a => a.name).join(', ') || 'Autor desconocido'}</p>
                <p className="text-xs text-violet-600 mt-1">{book.category?.name ?? ''}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-medium ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} disponible(s)` : 'Sin stock'}
                  </span>
                  {book.availableCopies > 0 && (
                    <button onClick={() => { if (confirm(`Reservar "${book.title}"?`)) reserveMutation.mutate(book.id); }}
                      disabled={reserveMutation.isPending}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-violet-950 text-white rounded transition-colors disabled:opacity-60">
                      <CalendarCheck className="h-3 w-3" /> Reservar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Anterior</button>
          <span className="text-sm text-gray-500">Pagina {page + 1} de {data.totalPages}</span>
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
        </div>
      )}
    </div>
  );
}
