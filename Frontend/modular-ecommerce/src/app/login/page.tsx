'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  // Választható szerepkör (alapból customer)
  const [selectedRole, setSelectedRole] = useState<'store_owner' | 'customer'>('customer'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 

    const endpoint = isLogin ? '/auth/login' : '/user';
    // Beküldjük a választott szerepkört regisztrációnál
    const payload = isLogin 
      ? { email, password } 
      : { email, password, username, role: selectedRole };

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
          
          // --- ÚJ FUNKCIÓ: Visszairányítás figyelése ---
          // Megnézzük, hogy a link tartalmaz-e visszatérési címet (pl. ?returnTo=/shop/123)
          const searchParams = new URLSearchParams(window.location.search);
          const returnTo = searchParams.get('returnTo');

          if (returnTo) {
            router.push(returnTo); // Ha egy boltból jött, visszavisszük a boltba/pénztárhoz!
          } else {
            // Dekódoljuk a tokent a hagyományos belépéshez, hogy tudjuk, hova irányítsunk
            try {
              const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
              if (tokenPayload.role === 'store_owner' || tokenPayload.role === 'admin') {
                router.push('/stores');
              } else {
                router.push('/customer/dashboard');
              }
            } catch (e) {
              router.push('/');
            }
          }
        } else {
          alert('Sikeres regisztráció! Most jelentkezz be.');
          setIsLogin(true);
          setPassword('');
        }
      } else {
        setError(data.message || 'Hiba történt a művelet során.');
      }
    } catch (err) {
      setError('Nem sikerült csatlakozni a szerverhez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000b1a] text-white p-4">
      <div className="max-w-md w-full bg-[#001529] border border-blue-900/30 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-black mb-6 text-center text-blue-400">
          {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Felhasználónév</label>
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Fiók típusa regisztrációkor */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Fiók típusa</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedRole('customer')}
                    className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${selectedRole === 'customer' ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-slate-700 bg-slate-900 text-gray-500'}`}
                  >🛍️ Vásárló</button>
                  <button 
                    type="button"
                    onClick={() => setSelectedRole('store_owner')}
                    className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${selectedRole === 'store_owner' ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-slate-700 bg-slate-900 text-gray-500'}`}
                  >🏪 Eladó</button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-400 uppercase">Jelszó</label>
              {/* Elfelejtett jelszó link */}
              {isLogin && (
                <Link href="/forgot-password" size="sm" className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tighter transition">
                  Elfelejtette?
                </Link>
              )}
            </div>
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
            className="text-blue-400 hover:text-blue-300 font-bold underline decoration-blue-400/30"
          >
            {isLogin ? 'Nincs még fiókod? Regisztrálj!' : 'Már van fiókod? Jelentkezz be!'}
          </button>
        </div>
      </div>
    </div>
  );
}