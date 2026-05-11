import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoans, createLoan, returnBook } from '../../api/loansApi';
import { getUsers } from '../../api/usersApi';
import { getBooks } from '../../api/booksApi';
import { Plus, RotateCcw } from 'lucide-react';

const statusBadge = (status: string) => {
  const map: Record<string, string> = { ACTIVE: 'bg-sky-100 text-sky-700', RETURNED: 'bg-emerald-100 text-emerald-700', OVERDUE: 'bg-red-100 text-red-700' };
  const labels: Record<string, string> = { ACTIVE: 'Activo', RETURNED: 'Devuelto', OVERDUE: 'Vencido' };
  return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[status]}`}>{labels[status] ?? status}</span>;
};

export default function LoansPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '', bookId: '', dueDate: '' });

  const { data, isLoading } = useQuery({ queryKey: ['loans', status, page], queryFn: () => getLoans({ status: status || undefined, page, size: 10 }) });
  const { data: users } = useQuery({ queryKey: ['users-list'], queryFn: () => getUsers(0, 100) });
  const { data: books } = useQuery({ queryKey: ['books-list'], queryFn: () => getBooks({ size: 100 }) });

  const createMutation = useMutation({
    mutationFn: createLoan,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loans'] }); qc.invalidateQueries({ queryKey: ['books'] }); setShowModal(false); }
  });

  const returnMutation = useMutation({
    mutationFn: returnBook,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loans'] }); qc.invalidateQueries({ queryKey: ['books'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); }
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createMutation.mutate({ userId: Number(form.userId), bookId: Number(form.bookId), dueDate: form.dueDate }); };

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Prestamos</h1>
        <button onClick={() => { setForm({ userId: '', bookId: '', dueDate: '' }); setShowModal(true); }}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Nuevo Prestamo
        </button>
      </div>
      <div className="flex gap-3">
        {['', 'ACTIVE', 'RETURNED', 'OVERDUE'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(0); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${status === s ? 'bg-sky-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {s === '' ? 'Todos' : s === 'ACTIVE' ? 'Activos' : s === 'RETURNED' ? 'Devueltos' : 'Vencidos'}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Usuario','Libro','Fecha Prestamo','Fecha Limite','Devolucion','Estado','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.content.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{l.user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{l.book.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.loanDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.dueDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.returnDate ?? '-'}</td>
                  <td className="px-4 py-3">{statusBadge(l.status)}</td>
                  <td className="px-4 py-3">
                    {(l.status === 'ACTIVE' || l.status === 'OVERDUE') && (
                      <button onClick={() => { if (confirm('Registrar devolucion?')) returnMutation.mutate(l.id); }}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors">
                        <RotateCcw className="h-3 w-3" /> Devolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">{data.totalElements} prestamos</span>
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
              <h2 className="text-lg font-semibold">Nuevo Prestamo</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="text-sm font-medium text-gray-700">Usuario *</label>
                <select required value={form.userId} onChange={e => setForm(f => ({...f, userId: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">Seleccionar usuario...</option>
                  {users?.content.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-700">Libro *</label>
                <select required value={form.bookId} onChange={e => setForm(f => ({...f, bookId: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">Seleccionar libro...</option>
                  {books?.content.filter(b => b.availableCopies > 0).map(b => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} disponibles)</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-700">Fecha limite *</label>
                <input type="date" required min={minDate.toISOString().split('T')[0]} value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              {createMutation.isError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">Error al crear el prestamo. Verifica que el libro este disponible.</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">{createMutation.isPending ? 'Guardando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
