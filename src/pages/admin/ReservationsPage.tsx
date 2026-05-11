import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservations, confirmReservation, cancelReservation } from '../../api/reservationsApi';
import { CheckCircle, XCircle } from 'lucide-react';

const statusBadge = (status: string) => {
  const map: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-gray-100 text-gray-500', EXPIRED: 'bg-red-100 text-red-700' };
  const labels: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada', EXPIRED: 'Expirada' };
  return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[status]}`}>{labels[status] ?? status}</span>;
};

export default function ReservationsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({ queryKey: ['reservations', statusFilter, page], queryFn: () => getReservations({ status: statusFilter || undefined, page, size: 10 }) });

  const confirmMutation = useMutation({ mutationFn: confirmReservation, onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }) });
  const cancelMutation = useMutation({ mutationFn: cancelReservation, onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }) });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Gestion de Reservas</h1>
      <div className="flex gap-3">
        {['', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${statusFilter === s ? 'bg-violet-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {s === '' ? 'Todas' : s === 'PENDING' ? 'Pendientes' : s === 'CONFIRMED' ? 'Confirmadas' : 'Canceladas'}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Usuario','Libro','Fecha Reserva','Vence','Estado','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.content.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{r.user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.book.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.reservationDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.expiryDate ?? '-'}</td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3">
                    {r.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button onClick={() => confirmMutation.mutate(r.id)} className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded">
                          <CheckCircle className="h-3 w-3" /> Confirmar
                        </button>
                        <button onClick={() => cancelMutation.mutate(r.id)} className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded">
                          <XCircle className="h-3 w-3" /> Cancelar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">{data.totalElements} reservas</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="px-3 py-1">{page + 1} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
