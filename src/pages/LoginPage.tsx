import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, X, Mail } from 'lucide-react';

type View = 'login' | 'register';

export default function LoginPage() {
  const [view, setView] = useState<View>('login');
  const [showForgot, setShowForgot] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [showPwd, setShowPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  if (user) navigate(user.role === 'READER' ? '/catalog' : '/dashboard', { replace: true });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(stored.role === 'READER' ? '/catalog' : '/dashboard', { replace: true });
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contrasena.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirm) { setError('Las contrasenas no coinciden.'); return; }
    if (regForm.password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      await register(regForm.name, regForm.email, regForm.password);
      navigate('/catalog', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || 'No se pudo completar el registro. Intenta de nuevo.');
    } finally { setLoading(false); }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-violet-900 to-purple-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400/60 mb-4 shadow-2xl shadow-violet-950">
            <img src={`${import.meta.env.BASE_URL}lovely-labrynth.jpg`} alt="Lovely Labrynth" className="w-full h-full object-cover object-top" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Labrynth Book</h1>
          <p className="text-violet-300 mt-2 text-sm">Sistema de gestion de biblioteca</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-white/10">
            <button onClick={() => { setView('login'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${view === 'login' ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400' : 'text-violet-300 hover:text-white'}`}>
              Iniciar Sesion
            </button>
            <button onClick={() => { setView('register'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${view === 'register' ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400' : 'text-violet-300 hover:text-white'}`}>
              Registrarse
            </button>
          </div>

          <div className="p-7">
            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-violet-200 mb-1">Correo electronico</label>
                  <input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} required
                    placeholder="admin@biblioteca.com"
                    className="w-full px-4 py-2.5 bg-white/10 border border-violet-600/50 text-white placeholder-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-violet-200 mb-1">Contrasena</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 bg-white/10 border border-violet-600/50 text-white placeholder-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm" />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-200">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-violet-950 font-bold rounded-lg transition-colors disabled:opacity-60 shadow-lg shadow-amber-500/20">
                  {loading ? 'Ingresando...' : 'Iniciar Sesion'}
                </button>
                <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(loginForm.email); setForgotSent(false); }}
                  className="w-full text-center text-xs text-violet-400 hover:text-amber-300 transition-colors py-1">
                  Olvidaste tu contrasena?
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2.5 text-xs text-amber-200 flex items-start gap-2">
                  <span className="mt-0.5">ℹ️</span>
                  <span>El registro publico crea una cuenta de <strong>Lector</strong>. Para otros roles, contacta al administrador.</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-violet-200 mb-1">Nombre completo <span className="text-red-400">*</span></label>
                  <input value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} required
                    placeholder="Tu nombre completo"
                    className="w-full px-4 py-2.5 bg-white/10 border border-violet-600/50 text-white placeholder-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-violet-200 mb-1">Correo electronico <span className="text-red-400">*</span></label>
                  <input type="email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 bg-white/10 border border-violet-600/50 text-white placeholder-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-violet-200 mb-1">Contrasena <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type={showRegPwd ? 'text' : 'password'} value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} required minLength={6}
                      placeholder="Minimo 6 caracteres"
                      className="w-full px-4 py-2.5 pr-10 bg-white/10 border border-violet-600/50 text-white placeholder-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                    <button type="button" onClick={() => setShowRegPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-200">
                      {showRegPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-violet-200 mb-1">Confirmar contrasena <span className="text-red-400">*</span></label>
                  <input type="password" value={regForm.confirm} onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))} required
                    placeholder="Repite tu contrasena"
                    className="w-full px-4 py-2.5 bg-white/10 border border-violet-600/50 text-white placeholder-violet-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
                {error && <p className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-violet-950 font-bold rounded-lg transition-colors disabled:opacity-60 shadow-lg shadow-amber-500/20">
                  {loading ? 'Registrando...' : 'Crear Cuenta de Lector'}
                </button>
              </form>
            )}

            {view === 'login' && (
              <div className="mt-5 p-3.5 bg-white/5 border border-violet-700/30 rounded-lg text-xs text-violet-300 space-y-0.5">
                <p className="font-semibold text-violet-200 mb-1">Cuentas de prueba (password: password)</p>
                <p>Admin: admin@biblioteca.com</p>
                <p>Bibliotecario: librarian@biblioteca.com</p>
                <p>Lector: reader@biblioteca.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-violet-600" />
                <h2 className="text-base font-semibold text-gray-900">Recuperar contrasena</h2>
              </div>
              <button onClick={() => setShowForgot(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {!forgotSent ? (
                <form onSubmit={handleForgot} className="space-y-4">
                  <p className="text-sm text-gray-500">Ingresa tu email y te enviaremos instrucciones para restablecer tu contrasena.</p>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Correo electronico</label>
                    <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <button type="submit"
                    className="w-full py-2.5 bg-violet-700 hover:bg-violet-800 text-white font-semibold rounded-lg text-sm transition-colors">
                    Enviar instrucciones
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Solicitud enviada</p>
                    <p className="text-sm text-gray-500 mt-1">Si <strong>{forgotEmail}</strong> esta registrado, recibiras instrucciones en tu correo.</p>
                    <p className="text-xs text-gray-400 mt-3">Si no recibes el correo, contacta al administrador: <span className="text-violet-600">admin@biblioteca.com</span></p>
                  </div>
                  <button onClick={() => setShowForgot(false)}
                    className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
