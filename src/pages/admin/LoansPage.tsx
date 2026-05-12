import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoans, createLoan, returnBook } from '../../api/loansApi';
import { getUsers } from '../../api/usersApi';
import { getBooks } from '../../api/booksApi';
import { Plus, RotateCcw, BookOpen, Search } from 'lucide-react';

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusBadge = (status: string) => {
  const cfg: Record<string, { cls: string; label: string }> = {
    ACTIVE:   { cls: 'bg-violet-100 text-violet-700', label: 'Activo' },
    RETURNED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Devuelto' },
    OVERDUE:  { cls: 'bg-red-100 text-red-700', label: 'Vencido' },
  };
  const { cls, label } = cfg[status] ?? { cls: 'bg-gray-100 text-gray-600', label: status };
  return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${cls}`}>{label}</span>;
};

export default function LoansPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', bookId: '', dueDate: '' });
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['loans', statusFilter, page],
    queryFn: () => getLoans({ status: statusFilter || undefined, page, size: 15 }),
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => getUsers(0, 200),
    staleTime: 60000,
  });

  const { data: booksData, isLoading: loadingBooks } = useQuery({
    queryKey: ['books-all'],
    queryFn: () => getBooks({ size: 200 }),
    staleTime: 60000,
  });

  const filteredUsers = useMemo(() =>
    (usersData?.content ?? []).filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    ), [usersData, userSearch]);

  const filteredBooks = useMemo(() =>
    (booksData?.content ?? [])
      .filter(b => b.availableCopies > 0)
      .filter(b => b.title.toLowerCase().includes(bookSearch.toLowerCase())),
    [booksData, bookSearch]);

  const visibleLoans = useMemo(() => {
    if (!search) return data?.content ?? [];
    const q = search.toLowerCase();
    return (data?.content ?? []).filter(l =>
      l.user.name.toLowerCase().includes(q) || l.book.title.toLowerCase().includes(q)
    );
  }, [data, search]);

  const createMutation = useMutation({
    mutationFn: createLoan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['books-all'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowModal(false);
    },
  });

  const returnMutation = useMutation({
    mutationFn: returnBook,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['books-all'] });
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const openModal = () => {
    createMutation.reset();
    setForm({ userId: '', bookId: '', dueDate: '' });
    setUserSearch('');
    setBookSearch('');
    setShowModal(true);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  const selectedUser = usersData?.content.find(u => String(u.id) === form.userId);
  const selectedBook = booksData?.content.find(b => String(b.id) === form.bookId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ userId: Number(form.userId), bookId: Number(form.bookId), dueDate: form.dueDate });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-violet-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prestamos</h1>
            <p className="text-sm text-gray-500">{data?.totalElements ?? 0} prestamos registrados</p>
          </div>
        </div>
        <button onClick={openModal}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo Prestamo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuario o libro..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-56" />
        </div>
        <div className="flex gap-2">
          {[['', 'Todos'], ['ACTIVE', 'Activos'], ['OVERDUE', 'Vencidos'], ['RETURNED', 'Devueltos']].map(([val, lbl]) => (
            <button key={val} onClick={() => { setStatusFilter(val); setPage(0); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${statusFilter === val ? 'bg-violet-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-violet-50">
              <tr>
                {['Usuario', 'Libro', 'Prestado', 'Vence', 'Devuelto', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-violet-700 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleLoans.map(l => (
                <tr key={l.id} className={`hover:bg-violet-50/30 transition-colors ${l.status === 'OVERDUE' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{l.user.name}</div>
                    <div className="text-xs text-gray-400">{l.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800 font-medium max-w-[180px] truncate">{l.book.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{fmt(l.loanDate)}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <span className={l.status === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-gray-500'}>{fmt(l.dueDate)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{fmt(l.returnDate)}</td>
                  <td className="px-4 py-3">{statusBadge(l.status)}</td>
                  <td className="px-4 py-3">
                    {(l.status === 'ACTIVE' || l.status === 'OVERDUE') && (
                      <button
                        onClick={() => { if (confirm(`Registrar devolucion de "${l.book.title}"?`)) returnMutation.mutate(l.id); }}
                        disabled={returnMutation.isPending}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-60">
                        <RotateCcw className="h-3 w-3" /> Devolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!visibleLoans.length && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No se encontraron prestamos</td></tr>
              )}
            </tbody>
          </table>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">{data.totalElements} prestamos</span>
            <div className="flex gap-2 items-center">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Anterior</button>
              <span className="text-gray-600">{page + 1} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-violet-50 rounded-t-2xl sticky top-0">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-gray-900">Nuevo Prestamo</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Usuario */}
              <div>
                <label className="text-sm font-medium text-gray-700">Usuario <span className="text-red-500">*</span></label>
                <div className="mt-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input value={userSearch} onChange={e => { setUserSearch(e.target.value); setForm(f => ({ ...f, userId: '' })); }}
                    placeholder="Buscar usuario..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                {selectedUser ? (
                  <div className="mt-2 px-3 py-2 bg-violet-50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-violet-800">{selectedUser.name}</span>
                      <span className="text-xs text-violet-500 ml-2">{selectedUser.email}</span>
                    </div>
                    <button type="button" onClick={() => { setForm(f => ({ ...f, userId: '' })); setUserSearch(''); }}
                      className="text-violet-400 hover:text-violet-600 text-lg leading-none">&times;</button>
                  </div>
                ) : (
                  userSearch && (
                    <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                      {loadingUsers ? (
                        <div className="px-3 py-2 text-sm text-gray-400">Cargando...</div>
                      ) : filteredUsers.length ? filteredUsers.map(u => (
                        <button type="button" key={u.id}
                          onClick={() => { setForm(f => ({ ...f, userId: String(u.id) })); setUserSearch(u.name); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 transition-colors border-b last:border-0">
                          <span className="font-medium">{u.name}</span>
                          <span className="text-gray-400 text-xs ml-2">{u.email}</span>
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${u.role === 'READER' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>{u.role}</span>
                        </button>
                      )) : (
                        <div className="px-3 py-2 text-sm text-gray-400">No se encontraron usuarios</div>
                      )}
                    </div>
                  )
                )}
                <input type="hidden" required value={form.userId} />
              </div>

              {/* Libro */}
              <div>
                <label className="text-sm font-medium text-gray-700">Libro <span className="text-red-500">*</span></label>
                <div className="mt-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input value={bookSearch} onChange={e => { setBookSearch(e.target.value); setForm(f => ({ ...f, bookId: '' })); }}
                    placeholder="Buscar libro disponible..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                {selectedBook ? (
                  <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-amber-800">{selectedBook.title}</span>
                      <span className="text-xs text-amber-500 ml-2">{selectedBook.availableCopies} disponibles</span>
                    </div>
                    <button type="button" onClick={() => { setForm(f => ({ ...f, bookId: '' })); setBookSearch(''); }}
                      className="text-amber-400 hover:text-amber-600 text-lg leading-none">&times;</button>
                  </div>
                ) : (
                  bookSearch && (
                    <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                      {loadingBooks ? (
                        <div className="px-3 py-2 text-sm text-gray-400">Cargando...</div>
                      ) : filteredBooks.length ? filteredBooks.map(b => (
                        <button type="button" key={b.id}
                          onClick={() => { setForm(f => ({ ...f, bookId: String(b.id) })); setBookSearch(b.title); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 transition-colors border-b last:border-0">
                          <span className="font-medium">{b.title}</span>
                          <span className="text-xs ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">{b.availableCopies} disp.</span>
                        </button>
                      )) : (
                        <div className="px-3 py-2 text-sm text-gray-400">Sin resultados o sin copias disponibles</div>
                      )}
                    </div>
                  )
                )}
                <input type="hidden" required value={form.bookId} />
              </div>

              {/* Fecha límite */}
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha limite <span className="text-red-500">*</span></label>
                <input type="date" required
                  min={minDate.toISOString().split('T')[0]}
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>

              {createMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {(createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message
                    ?? 'Error al crear el prestamo. Verifica que el libro este disponible.'}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  disabled={createMutation.isPending || !form.userId || !form.bookId || !form.dueDate}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors">
                  {createMutation.isPending ? 'Registrando...' : 'Registrar Prestamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
