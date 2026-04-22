'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '../lib/api';

export default function ProductList() {
  const { storeId } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Termékek betöltése
  const loadProducts = async () => {
    if (storeId) {
      try {
        const data = await fetchWithAuth(`/product/store/${storeId}`);
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProducts();
  }, [storeId]);

  // --- TÖRLÉS FÜGGVÉNY ---
  const handleDelete = async (e: React.MouseEvent, productId: string, productName: string) => {
    e.stopPropagation(); // Megakadályozza, hogy a kártyára való kattintás is lefusson
    if (!confirm(`Biztosan törölni szeretnéd a(z) "${productName}" terméket?`)) return;

    try {
      await fetchWithAuth(`/product/${productId}`, {
        method: 'DELETE',
      });
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Termék törölve!');
    } catch (err) {
      alert('Hiba történt a törlés során.');
    }
  };

  if (loading) return <div className="p-10 text-blue-400 font-bold animate-pulse">Termékek betöltése...</div>;

  return (
    <div className="p-8">
      {/* FEJLÉC */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-blue-900/20">
        <div>
          <h1 className="text-3xl font-bold text-white">Termékek</h1>
          <p className="text-gray-400 text-sm mt-1">A boltod kínálatának kezelése</p>
        </div>
        
        <button
          onClick={() => router.push(`/stores/${storeId}/products/new`)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Új termék hozzáadása
        </button>
      </div>

      {/* TERMÉK RÁCS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="group bg-slate-800/50 p-6 rounded-2xl border border-blue-900/20 flex flex-col justify-between hover:border-blue-500/30 transition-all relative">
              
              {/* MŰVELETI GOMBOK (Hoverre jelennek meg) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {/* SZERKESZTÉS GOMB */}
                <button 
                  onClick={() => router.push(`/stores/${storeId}/products/${p.id}/edit`)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                  title="Termék szerkesztése"
                >
                  ✎
                </button>

                {/* TÖRLÉS GOMB */}
                <button 
                  onClick={(e) => handleDelete(e, p.id, p.name)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                  title="Termék törlése"
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{p.name}</h3>
                
                {/* KATEGÓRIA */}
                {p.category || (p.categories && p.categories.length > 0) ? (
                  <p className="text-xs text-blue-500 mt-1 uppercase tracking-widest font-black">
                    {p.category?.name || p.categories[0]?.name}
                  </p>
                ) : (
                  <p className="text-xs text-gray-700 mt-1 italic">Nincs kategória</p>
                )}

                <p className="text-blue-400 mt-5 font-mono text-lg font-bold">{p.price?.toLocaleString()} Ft</p>
              </div>
              
              {/* ALSÓ RÉSZ */}
              <div className="mt-6 pt-4 border-t border-slate-700/30 flex justify-between items-center">
                 <span className="text-[10px] text-gray-600 font-mono">#{p.id.substring(0,8)}</span>
                 <button 
                    onClick={() => router.push(`/stores/${storeId}/products/${p.id}/edit`)}
                    className="text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-bold"
                 >
                    Részletek / Szerkesztés
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <p className="text-gray-500 italic">Még nincsenek termékek ebben a boltban.</p>
            <button 
              onClick={() => router.push(`/stores/${storeId}/products/new`)}
              className="mt-4 text-blue-500 hover:underline font-bold"
            >
              Hozd létre az elsőt!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}