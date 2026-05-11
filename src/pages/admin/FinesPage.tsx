import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFines, markFinePaid } from '../../api/finesApi';
import { CheckCircle } from 'lucide-react';

export default function FinesPage() {
  const qc = useQueryClient();
  const [paidFilter, setPaidFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({ queryKey: ['fines', paidFilter, page], queryFn: () => getFines({ paid: paidFilter, page, size: 10 }) });
  const payMutation = useMutation({ mutationFn: markFinePaid, onSuccess: () => { qc.invalidateQueries({ queryKey: ['fines'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); } });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Gestion de Multas</h1>
      <div className="flex gap-3">
        {[undefined, false, true].map(v => (
          <button key={String(v)} onClick={() => { setPaidFilter(v); setPage(0); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${paidFilter === v ? 'bg-violet-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {v === undefined ? 'Todas' : v ? 'Pagadas' : 'Sin pagar'}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Usuario','Libro','Monto','Razon','Estado','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.content.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{f.user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{f.loan.book.title}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">${Number(f.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{f.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${f.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {f.paid ? 'Pagada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!f.paid && (
                      <button onClick={() => payMutation.mutate(f.id)} className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded">
                        <CheckCircle className="h-3 w-3" /> Marcar pagada
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
            <span className="text-gray-500">{data.totalElements} multas</span>
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
