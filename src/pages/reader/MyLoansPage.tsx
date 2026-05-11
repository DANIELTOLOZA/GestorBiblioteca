import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyLoans } from '../../api/loansApi';

const statusBadge = (status: string) => {
  const map: Record<string, string> = { ACTIVE: 'bg-violet-100 text-violet-700', RETURNED: 'bg-emerald-100 text-emerald-700', OVERDUE: 'bg-red-100 text-red-700' };
  const labels: Record<string, string> = { ACTIVE: 'Activo', RETURNED: 'Devuelto', OVERDUE: 'Vencido' };
  return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[status]}`}>{labels[status] ?? status}</span>;
};

export default function MyLoansPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useQuery({ queryKey: ['my-loans', page], queryFn: () => getMyLoans(page) });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Mis Prestamos</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div> :
          data?.content.length === 0 ? <div className="text-center py-16 text-gray-400"><p className="text-lg">No tienes prestamos activos</p></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Libro','Autores','Prestado','Limite','Devolucion','Estado'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.content.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{l.book.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.book.authors?.map(a => a.name).join(', ') || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.loanDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.dueDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.returnDate ?? '-'}</td>
                  <td className="px-4 py-3">{statusBadge(l.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && data.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
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
