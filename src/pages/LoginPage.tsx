import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-violet-900 to-purple-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400/60 mb-4 shadow-2xl shadow-violet-950">
            <img src={`${import.meta.env.BASE_URL}lovely-labrynth.jpg`} alt="Lovely Labrynth" className="w-full h-full object-cover object-top" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Labrynth Book</h1>
          <p className="text-violet-300 mt-2 text-sm">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-violet-200 mb-1">Correo electronico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@biblioteca.com"
                className="w-full px-4 py-2.5 bg-white/10 border border-violet-600/50 text-white placeholder-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-violet-200 mb-1">Contrasena</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white/10 border border-violet-600/50 text-white placeholder-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm" />
            </div>
            {error && <p className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-violet-950 font-bold rounded-lg transition-colors disabled:opacity-60 shadow-lg shadow-amber-500/20">
              {loading ? 'Ingresando...' : 'Iniciar sesion'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-white/5 border border-violet-700/30 rounded-lg text-xs text-violet-300 space-y-1">
            <p className="font-semibold text-violet-200">Cuentas de prueba (password: password)</p>
            <p>Admin: admin@biblioteca.com</p>
            <p>Bibliotecario: librarian@biblioteca.com</p>
            <p>Lector: reader@biblioteca.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
