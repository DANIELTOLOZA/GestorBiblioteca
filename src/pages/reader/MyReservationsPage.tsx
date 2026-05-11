import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation } from '../../api/reservationsApi';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, XCircle, BookOpen, Clock, AlertTriangle } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Confirmada', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Cancelada',  cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  EXPIRED:   { label: 'Expirada',   cls: 'bg-red-100 text-red-600 border-red-200' },
};

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' }) : '—';

const daysLeft = (expiryDate?: string) => {
  if (!expiryDate) return null;
  const diff = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  return diff;
};

export default function MyReservationsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['my-reservations', page],
    queryFn: () => getMyReservations(page, 9)
  });

  const cancelMutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-reservations'] })
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg"><CalendarCheck className="h-5 w-5 text-amber-700" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Reservas</h1>
            <p className="text-sm text-gray-500">{data?.totalElements ?? 0} reservas en total</p>
          </div>
        </div>
        <button onClick={() => navigate('/catalog')}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
          <BookOpen className="h-4 w-4" /> Ir al Catalogo
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>
      ) : !data?.content.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
            <CalendarCheck className="h-8 w-8 text-violet-400" />
          </div>
          <p className="text-lg font-semibold text-gray-700">No tienes reservas activas</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Explora el catalogo y reserva los libros que te interesen</p>
          <button onClick={() => navigate('/catalog')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-violet-950 font-semibold rounded-lg text-sm transition-colors">
            Explorar Catalogo
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.content.map(r => {
              const days = daysLeft(r.expiryDate);
              const urgent = r.status === 'PENDING' && days !== null && days <= 1;
              return (
                <div key={r.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${urgent ? 'border-red-300' : 'border-gray-100'}`}>
                  {urgent && (
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 text-xs text-red-600 font-medium border-b border-red-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {days === 0 ? 'Vence hoy' : 'Vence manana'}
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{r.book.title}</h3>
                      <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-semibold border ${STATUS_MAP[r.status]?.cls}`}>
                        {STATUS_MAP[r.status]?.label ?? r.status}
                      </span>
                    </div>

                    {r.book.authors && r.book.authors.length > 0 && (
                      <p className="text-xs text-gray-400">{r.book.authors.map(a => a.name).join(', ')}</p>
                    )}

                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>Reservado el {fmt(r.reservationDate)}</span>
                      </div>
                      {r.expiryDate && (
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-3.5 w-3.5 text-gray-400" />
                          <span>Vence el {fmt(r.expiryDate)}
                            {days !== null && days > 0 && r.status === 'PENDING' && (
                              <span className="ml-1 text-amber-600 font-medium">({days}d)</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {r.status === 'CONFIRMED' && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                        Tu reserva esta confirmada. Acercate a la biblioteca para retirar el libro.
                      </div>
                    )}

                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => { if (confirm('Cancelar esta reserva?')) cancelMutation.mutate(r.id); }}
                        disabled={cancelMutation.isPending}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium disabled:opacity-50">
                        <XCircle className="h-3.5 w-3.5" /> Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 font-medium">Anterior</button>
              <span className="text-gray-500">{page + 1} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 font-medium">Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
