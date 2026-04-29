'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{username: string, email: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ username: payload.username || 'Vásárló', email: payload.email });
    } catch (e) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) return <div className="min-h-screen bg-[#000b1a] flex items-center justify-center text-blue-400 font-bold italic">BETÖLTÉS...</div>;

  return (
    <div className="min-h-screen bg-[#000b1a] text-white">
      <nav className="bg-[#001529]/80 backdrop-blur-md border-b border-blue-900/30 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">M</div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-white">Irányítópult</h1>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="text-[10px] font-black text-gray-500 hover:text-red-400 uppercase transition-all">Kijelentkezés</button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        {/* KATTINTHATÓ PROFIL SZEKCIÓ */}
        <Link href="/customer/profile" className="block mb-12 group">
          <div className="flex items-center gap-4 p-4 rounded-3xl hover:bg-white/5 transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-800 rounded-2xl flex items-center justify-center text-3xl shadow-2xl group-hover:scale-110 transition-transform">
              👤
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic leading-none group-hover:text-blue-400 transition-colors">Szia, {user?.username}!</h2>
              <p className="text-blue-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 underline decoration-blue-500/30">Profil szerkesztése →</p>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#001529] p-8 rounded-[2rem] border border-blue-900/20 shadow-xl">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Rendelések</p>
            <p className="text-4xl font-black">0</p>
          </div>
          <div className="bg-[#001529] p-8 rounded-[2rem] border border-blue-900/20 shadow-xl">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Kedvencek</p>
            <p className="text-4xl font-black">0</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/10 to-transparent p-8 rounded-[2rem] border border-blue-500/20 shadow-xl">
            <p className="text-blue-400 text-[10px] font-black uppercase mb-2">Státusz</p>
            <p className="text-green-500 font-black text-lg">AKTÍV ✅</p>
          </div>
        </div>

        <section>
          <h3 className="text-xl font-black uppercase tracking-tight italic mb-6">Legutóbbi Vásárlások</h3>
          <div className="bg-[#001529]/50 rounded-[3rem] border border-blue-900/10 py-20 text-center">
            <span className="text-5xl mb-4 opacity-10 block">📦</span>
            <p className="text-gray-500 font-bold uppercase text-sm tracking-widest">Nincsenek rendelések.</p>
          </div>
        </section>
      </main>
    </div>
  );
}