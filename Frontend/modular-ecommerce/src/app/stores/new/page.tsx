'use client';
import { useState } from 'react';
import { fetchWithAuth } from '../../../lib/api';

export default function CreateStorePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Összeállítjuk a küldendő adatot
      const payload: any = { name: formData.name };
      
      // CSAK AKKOR küldjük a slug-ot, ha írtál bele valamit
      if (formData.slug.trim() !== '') {
        payload.slug = formData.slug.trim();
      }

      // Végpont javítva /store-ra (ahogy a Swaggered mutatta)
      await fetchWithAuth('/store', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccess(true);

      // Várunk 1.5 másodpercet, hogy lásd a sikert, aztán irány a lista
      setTimeout(() => {
        window.location.href = '/stores';
      }, 1500);

    } catch (err: any) {
      alert('Hiba: Ez a név vagy URL már foglalt!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000b1a] flex items-center justify-center p-8 text-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Új áruház indítása</h1>
        
        {success ? (
          <div className="bg-green-500/20 border border-green-500 text-green-400 p-8 rounded-2xl text-center shadow-lg">
            <p className="text-2xl font-bold">✅ SIKERES LÉTREHOZÁS!</p>
            <p className="text-sm mt-2 opacity-80">Visszairányítunk a boltjaidhoz...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-[#001529] p-8 rounded-2xl border border-blue-900/20 shadow-2xl">
            <div>
              <label className="block text-blue-400 text-xs font-bold mb-2 uppercase tracking-widest">Áruház neve *</label>
              <input
                required
                placeholder="Pl. Kedvenc Boltom"
                className="w-full bg-[#000b1a] border border-blue-900/40 rounded-xl p-4 outline-none focus:border-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-blue-400 text-xs font-bold mb-2 uppercase tracking-widest">Egyedi URL (Opcionális)</label>
              <input
                placeholder="Hagyd üresen az automata generáláshoz"
                className="w-full bg-[#000b1a] border border-blue-900/40 rounded-xl p-4 outline-none focus:border-blue-500 transition-all text-gray-400"
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
              />
              <p className="text-[10px] text-blue-900 mt-2 italic px-1">
                Példa: ha a név "Teszt Bolt", a URL "teszt-bolt" lesz.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => window.location.href = '/stores'}
                className="flex-1 py-4 text-gray-500 border border-gray-800 rounded-xl font-bold hover:bg-gray-800 transition-all uppercase text-xs"
              >
                Mégse
              </button> 
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all uppercase text-xs"
              >
                {loading ? 'Mentés...' : 'Bolt létrehozása'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
