import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservations, confirmReservation, cancelReservation } from '../../api/reservationsApi';
import { createLoan } from '../../api/loansApi';
import type { Reservation } from '../../types';
import { CheckCircle, XCircle, BookMarked, Search, CalendarCheck, Clock, X } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Confirmada', cls: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelada',  cls: 'bg-gray-100 text-gray-500' },
  EXPIRED:   { label: 'Expirada',   cls: 'bg-red-100 text-red-700' },
};

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const isExpired = (date?: string) => date ? new Date(date) < new Date() : false;

export default function ReservationsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loanModal, setLoanModal] = useState<Reservation | null>(null);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', statusFilter, page],
    queryFn: () => getReservations({ status: statusFilter || undefined, page, size: 20 })
  });

  const confirmMutation = useMutation({ mutationFn: confirmReservation, onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }) });
  const cancelMutation  = useMutation({ mutationFn: cancelReservation,  onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }) });
  const loanMutation    = useMutation({
    mutationFn: ({ userId, bookId, dueDate }: { userId: number; bookId: number; dueDate: string }) =>
      createLoan({ userId, bookId, dueDate }),
    onSuccess: () => {
      if (loanModal) cancelReservation(loanModal.id).catch(() => {});
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['loans'] });
      setLoanModal(null);
    }
  });

  const filtered = data?.content.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.user.name.toLowerCase().includes(q) || r.book.title.toLowerCase().includes(q);
  });

  const tabs = [
    { key: '',          label: 'Todas' },
    { key: 'PENDING',   label: 'Pendientes' },
    { key: 'CONFIRMED', label: 'Confirmadas' },
    { key: 'CANCELLED', label: 'Canceladas' },
    { key: 'EXPIRED',   label: 'Expiradas' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg"><CalendarCheck className="h-5 w-5 text-violet-700" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de Reservas</h1>
            <p className="text-sm text-gray-500">{data?.totalElements ?? 0} reservas registradas</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario o libro..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setStatusFilter(t.key); setPage(0); }}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === t.key ? 'bg-violet-700 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-violet-50">
              <tr>{['Usuario', 'Libro', 'Reservado', 'Vence', 'Estado', 'Acciones'].map(h =>
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-violet-700 uppercase tracking-wider">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered?.map(r => (
                <tr key={r.id} className="hover:bg-violet-50/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                        {r.user.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{r.user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-700 font-medium line-clamp-2 max-w-[180px]">{r.book.title}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3.5 w-3.5" />{fmt(r.reservationDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-medium ${isExpired(r.expiryDate) && r.status === 'PENDING' ? 'text-red-600' : 'text-gray-500'}`}>
                      {fmt(r.expiryDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${STATUS_MAP[r.status]?.cls}`}>
                      {STATUS_MAP[r.status]?.label ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {r.status === 'PENDING' && (
                        <>
                          <button onClick={() => confirmMutation.mutate(r.id)} disabled={confirmMutation.isPending}
                            title="Confirmar reserva"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                            <CheckCircle className="h-3.5 w-3.5" /> Confirmar
                          </button>
                          <button onClick={() => cancelMutation.mutate(r.id)} disabled={cancelMutation.isPending}
                            title="Cancelar reserva"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                            <XCircle className="h-3.5 w-3.5" /> Cancelar
                          </button>
                        </>
                      )}
                      {r.status === 'CONFIRMED' && (
                        <button onClick={() => setLoanModal(r)}
                          title="Convertir en prestamo activo"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-violet-950 rounded-lg font-semibold transition-colors">
                          <BookMarked className="h-3.5 w-3.5" /> Prestar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered?.length && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No se encontraron reservas</td></tr>
              )}
            </tbody>
          </table>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm bg-gray-50">
            <span className="text-gray-500">{data.totalElements} reservas en total</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-100">Anterior</button>
              <span className="font-medium text-gray-600">{page + 1} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-100">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {loanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-amber-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-amber-600" />
                <h2 className="text-base font-semibold text-gray-900">Convertir a Prestamo</h2>
              </div>
              <button onClick={() => setLoanModal(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-violet-50 rounded-lg p-3 text-sm space-y-1">
                <p><span className="text-gray-500">Lector:</span> <span className="font-semibold">{loanModal.user.name}</span></p>
                <p><span className="text-gray-500">Libro:</span> <span className="font-semibold">{loanModal.book.title}</span></p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Fecha de devolucion <span className="text-red-500">*</span></label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              {loanMutation.isError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {(loanMutation.error as {code?:string})?.code === 'ERR_NETWORK' ? 'Backend no disponible.' : 'Error al crear el prestamo.'}
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setLoanModal(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
                <button onClick={() => loanMutation.mutate({ userId: loanModal.user.id, bookId: loanModal.book.id, dueDate })}
                  disabled={loanMutation.isPending}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold rounded-lg text-sm disabled:opacity-60">
                  {loanMutation.isPending ? 'Procesando...' : 'Confirmar Prestamo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
