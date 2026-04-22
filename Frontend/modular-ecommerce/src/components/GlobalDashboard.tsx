'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../lib/api'; 
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function GlobalDashboard() {
  const [stores, setStores] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadStores = () => {
    setLoading(true);
    fetchWithAuth('/store/my-stores')
      .then((data) => {
        setStores(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserName(decoded.username || decoded.email?.split('@')[0] || 'Tulajdonos');
      } catch (e) {
        console.error("Token hiba");
      }
    }
    loadStores();
  }, []);

  const handleDeleteStore = async (e: React.MouseEvent, storeId: string, storeName: string) => {
    e.stopPropagation();
    if (confirm(`Biztosan törölni szeretnéd a(z) "${storeName}" nevű boltot?`)) {
      try {
        await fetchWithAuth(`/store/${storeId}`, { method: 'DELETE' });
        loadStores();
      } catch (err) {
        alert('Hiba történt a törlés során.');
      }
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gray-900 text-white">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold">Üdv, <span className="text-blue-400">{userName}</span>!</h1>
          <p className="text-gray-400 mt-2">Kezeld a boltjaidat.</p>
        </div>
        <button onClick={() => router.push('/stores/new')} className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition">
          + Új bolt
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse font-bold text-xl">Betöltés...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store: any) => (
            <div key={store.id} className="group bg-slate-800/40 border border-blue-900/30 rounded-3xl p-8 hover:border-blue-500/50 transition relative">
              
              {/* TÖRLÉS ÉS SZERKESZTÉS GOMBOK A SAROKBAN */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* SZERKESZTÉS (UPDATE) GOMB */}
                <button 
                  onClick={() => router.push(`/stores/${store.id}/edit`)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition"
                  title="Bolt szerkesztése"
                >
                  ✎
                </button>
                <button 
                  onClick={(e) => handleDeleteStore(e, store.id, store.name)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition"
                  title="Törlés"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-xl mb-4 text-blue-400">🏬</div>
                <h2 className="text-2xl font-bold mb-1">{store.name}</h2>
                <p className="text-gray-500 text-xs font-mono italic italic">slug: /{store.slug}</p>
              </div>

              <button 
                onClick={() => router.push(`/stores/${store.id}`)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-900/20"
              >
                Kezelés
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
