'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../../../lib/api';

export default function EditStore() {
  const { storeId } = useParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Betöltjük a jelenlegi adatokat
  useEffect(() => {
    fetchWithAuth(`/store/${storeId}`)
      .then((data) => {
        setName(data.name);
        setSlug(data.slug);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [storeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`/store/${storeId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, slug }),
      });
      router.push('/stores'); // Vissza a listához
    } catch (err) {
      alert('Hiba a mentés során!');
    }
  };

  if (loading) return <div className="p-10 text-blue-400">Betöltés...</div>;

  return (
    <div className="max-w-2xl mx-auto p-10 bg-slate-900 rounded-3xl border border-blue-900/20 mt-10">
      <h1 className="text-3xl font-bold text-white mb-6">Bolt szerkesztése</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">Bolt neve</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-blue-900/30 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Egyedi URL (Slug)</label>
          <input 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-slate-800 border border-blue-900/30 p-4 rounded-xl text-white focus:border-blue-500 outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-2 italic">Hagyd üresen, ha a név alapján akarod újragenerálni.</p>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20">
            Módosítások mentése
          </button>
          <button type="button" onClick={() => router.back()} className="px-8 py-4 text-gray-400 hover:text-white transition">
            Mégse
          </button>
        </div>
      </form>
    </div>
  );
}