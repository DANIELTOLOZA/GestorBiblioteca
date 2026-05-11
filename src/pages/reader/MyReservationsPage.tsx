import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation } from '../../api/reservationsApi';
import { XCircle } from 'lucide-react';

const statusBadge = (status: string) => {
  const map: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-gray-100 text-gray-500', EXPIRED: 'bg-red-100 text-red-700' };
  const labels: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada', EXPIRED: 'Expirada' };
  return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[status]}`}>{labels[status] ?? status}</span>;
};

export default function MyReservationsPage() {
  const qc = useQueryClient();
  const [page] = useState(0);
  const { data, isLoading } = useQuery({ queryKey: ['my-reservations', page], queryFn: () => getMyReservations(page) });
  const cancelMutation = useMutation({ mutationFn: cancelReservation, onSuccess: () => qc.invalidateQueries({ queryKey: ['my-reservations'] }) });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Mis Reservas</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div> :
          data?.content.length === 0 ? <div className="text-center py-16 text-gray-400"><p className="text-lg">No tienes reservas activas</p></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Libro','Fecha Reserva','Vence','Estado','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.content.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{r.book.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.reservationDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.expiryDate ?? '-'}</td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3">
                    {r.status === 'PENDING' && (
                      <button onClick={() => { if (confirm('Cancelar reserva?')) cancelMutation.mutate(r.id); }}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded">
                        <XCircle className="h-3 w-3" /> Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
