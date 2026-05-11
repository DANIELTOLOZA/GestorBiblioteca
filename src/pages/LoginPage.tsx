import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Library } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    const dest = user.role === 'READER' ? '/catalog' : '/dashboard';
    navigate(dest, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(stored.role === 'READER' ? '/catalog' : '/dashboard', { replace: true });
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contrasena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 to-sky-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 mb-4 shadow-xl">
            <img src="/lady-labrynth.jpg" alt="Labrynth Book" className="w-full h-full object-cover object-top" />
          </div>
          <h1 className="text-3xl font-bold text-white">Labrynth Book</h1>
          <p className="text-sky-200 mt-1">Ingresa tus credenciales para continuar</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@biblioteca.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'Ingresando...' : 'Iniciar sesion'}
            </button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600">Cuentas de prueba (password: password)</p>
            <p>Admin: admin@biblioteca.com</p>
            <p>Bibliotecario: librarian@biblioteca.com</p>
            <p>Lector: reader@biblioteca.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
