import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../api/dashboardApi';
import { BookOpen, Users, BookMarked, AlertCircle, Clock, CalendarCheck } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats, refetchInterval: 30000 });

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Resumen general del sistema de biblioteca</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Libros" value={stats?.totalBooks ?? 0} icon={BookOpen} color="bg-sky-500" />
        <StatCard label="Disponibles" value={stats?.availableBooks ?? 0} icon={BookOpen} color="bg-emerald-500" />
        <StatCard label="Usuarios" value={stats?.totalUsers ?? 0} icon={Users} color="bg-violet-500" />
        <StatCard label="Prestamos Activos" value={stats?.activeLoans ?? 0} icon={BookMarked} color="bg-amber-500" />
        <StatCard label="Prestamos Vencidos" value={stats?.overdueLoans ?? 0} icon={Clock} color="bg-red-500" />
        <StatCard label="Reservas Pendientes" value={stats?.pendingReservations ?? 0} icon={CalendarCheck} color="bg-blue-500" />
        <StatCard label="Multas Sin Pagar" value={`$${Number(stats?.totalUnpaidFines ?? 0).toFixed(2)}`} icon={AlertCircle} color="bg-orange-500" />
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado del sistema</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-600 font-medium">Ocupacion de la coleccion</p>
            <div className="mt-2 bg-emerald-200 rounded-full h-3">
              <div className="bg-emerald-500 h-3 rounded-full transition-all"
                style={{ width: stats && stats.totalBooks > 0 ? `${Math.round(((stats.totalBooks - stats.availableBooks) / stats.totalBooks) * 100)}%` : '0%' }} />
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              {stats ? `${stats.totalBooks - stats.availableBooks} de ${stats.totalBooks} libros prestados` : '-'}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Prestamos en mora</p>
            <div className="mt-2 bg-red-200 rounded-full h-3">
              <div className="bg-red-500 h-3 rounded-full transition-all"
                style={{ width: stats && stats.activeLoans + stats.overdueLoans > 0 ? `${Math.round((stats.overdueLoans / (stats.activeLoans + stats.overdueLoans)) * 100)}%` : '0%' }} />
            </div>
            <p className="text-xs text-red-600 mt-1">
              {stats ? `${stats.overdueLoans} de ${stats.activeLoans + stats.overdueLoans} prestamos` : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
