'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 

    const endpoint = isLogin ? '/auth/login' : '/user';
    const payload = isLogin 
      ? { email, password } 
      : { email, password, username, role: 'store_owner' };

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.access_token);
          router.push('/stores'); 
        } else {
          // SIKERES REGISZTRÁCIÓ:
          alert('Sikeres regisztráció!');
          
          // Itt a trükk: Az email marad, a többit ürítjük, és átváltunk Login-ra
          setIsLogin(true); 
          setPassword('');
          setUsername('');
          setError('');
        }
      } else {
        // --- JAVÍTOTT HIBAKEZELÉS ---
        if (res.status === 500 || res.status === 409 || (data.message && data.message.includes('unique'))) {
           // Ha regisztráció közben jön 500-as hiba, az szinte fixen a duplikáció miatt van
           setError(!isLogin 
             ? 'Ez az e-mail cím vagy felhasználónév már foglalt!' 
             : 'Hiba a bejelentkezés során!');
        } else if (res.status === 401) {
           setError('Hibás e-mail cím vagy jelszó!');
        } else {
           setError(data.message || 'Valami hiba történt. Próbáld újra!');
        }
      }
    } catch (err) {
      setError('A szerver nem elérhető. Indítsd el a backendet!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#001f3f] text-white p-4">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-2xl border border-blue-900">
        
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-400">
          {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Felhasználónév</label>
              <input 
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="pl. Teszt Elek"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Jelszó</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition disabled:opacity-50 mt-4 shadow-lg shadow-blue-900/30"
          >
            {loading ? 'Folyamatban...' : (isLogin ? 'Bejelentkezés' : 'Fiók létrehozása')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); }}
            className="text-blue-400 hover:text-blue-300 font-bold underline transition"
          >
            {isLogin ? 'Nincs még fiókod? Regisztrálj!' : 'Már van fiókod? Jelentkezz be!'}
          </button>
        </div>

      </div>
    </div>
  );
}