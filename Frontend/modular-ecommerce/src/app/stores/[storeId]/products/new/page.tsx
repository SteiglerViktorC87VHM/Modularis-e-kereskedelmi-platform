'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '../../../../../lib/api';

export default function CreateProductPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '1',
    categoryName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryName: formData.categoryName.trim(),
      };

      await fetchWithAuth(`/product/store/${storeId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      alert('Sikeres mentés!');
      window.location.href = `/stores/${storeId}`;

    } catch (err: any) {
      alert('Hiba a mentés során! Ellenőrizd a konzolt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000b1a] flex items-center justify-center p-4 text-white">
      <form onSubmit={handleSubmit} className="bg-[#001529] p-8 rounded-3xl border border-blue-900/30 w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-black italic text-blue-400 mb-8 uppercase text-center tracking-tighter">ÚJ TERMÉK</h1>
        
        <div className="space-y-4">
          <input required className="w-full bg-[#000b1a] border border-blue-900/40 rounded-xl p-4 outline-none focus:border-blue-500 font-semibold" placeholder="Termék neve" onChange={(e) => setFormData({...formData, name: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" className="w-full bg-[#000b1a] border border-blue-900/40 rounded-xl p-4 outline-none focus:border-blue-500 font-semibold" placeholder="Ár (Ft)" onChange={(e) => setFormData({...formData, price: e.target.value})} />
            <input required type="number" className="w-full bg-[#000b1a] border border-blue-900/40 rounded-xl p-4 outline-none focus:border-blue-500 font-semibold" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
          </div>

          <input required className="w-full bg-[#000b1a] border border-blue-900/40 rounded-xl p-4 outline-none focus:border-blue-500 font-semibold" placeholder="Kategória" onChange={(e) => setFormData({...formData, categoryName: e.target.value})} />
        </div>

        <div className="flex gap-4 mt-10">
          <button type="button" onClick={() => window.location.href = `/stores/${storeId}`} className="flex-1 py-4 text-gray-500 border border-gray-800 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all">Mégse</button>
          <button disabled={loading} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'KÜLDÉS...' : 'MENTÉS'}
          </button>
        </div>
      </form>
    </div>
  );
}
