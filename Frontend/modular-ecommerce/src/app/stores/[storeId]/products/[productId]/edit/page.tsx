'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../../../../../lib/api';

export default function EditProductPage() {
  const { storeId, productId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    price: '' as any,
    stock: '' as any,
    categoryName: '' // ID helyett NEVET küldünk és fogadunk
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWithAuth(`/product/${productId}`)
      .then((product) => {
        setFormData({
          name: product.name,
          price: product.price,
          stock: product.stock,
          categoryName: product.category?.name || ''
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetchWithAuth(`/product/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          stock: Number(formData.stock),
          categoryName: formData.categoryName // A backend majd elrendezi
        }),
      });
      alert('Sikeres mentés!');
      router.push(`/stores/${storeId}/products`);
    } catch (err) {
      alert('Hiba! A backend nem fogadta el az adatokat.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-white font-bold">Betöltés...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-slate-900 rounded-3xl border border-blue-900/30 text-white">
      <h1 className="text-2xl font-bold mb-6">Termék módosítása</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm">Termék neve</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-slate-800 p-4 rounded-xl outline-none border border-blue-900/20"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Ár</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-slate-800 p-4 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">Készlet</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              className="w-full bg-slate-800 p-4 rounded-xl outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm">Kategória neve</label>
          <input
            type="text"
            value={formData.categoryName}
            onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
            className="w-full bg-slate-800 p-4 rounded-xl outline-none border border-blue-900/20"
            placeholder="Pl. Cipők, Elektronika..."
          />
          <p className="text-[10px] text-gray-500 mt-1 italic">
            Ha beírsz egy új nevet, a rendszer automatikusan létrehozza a kategóriát.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-500 transition disabled:opacity-50 mt-4"
        >
          {saving ? 'Mentés...' : 'Módosítások mentése'}
        </button>
      </form>
    </div>
  );
}
