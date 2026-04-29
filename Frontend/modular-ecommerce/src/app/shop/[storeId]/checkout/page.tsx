'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { storeId } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zip: '',
    city: '',
    address: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // ADATOK AUTOMATIKUS BEILLESZTÉSE A PROFILBÓL
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub || payload.id;

      fetch(`http://localhost:3000/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(user => {
        setFormData({
          name: user.username || '',
          phone: user.phone || '',
          zip: user.zip || '',
          city: user.city || '',
          address: user.address || ''
        });
      });
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("🚀 Rendelés elküldve! Köszönjük!");
    router.push('/customer/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-black p-8">
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <h2 className="text-4xl font-black uppercase italic mb-8 border-b pb-4">Pénztár</h2>
        
        <form onSubmit={placeOrder} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Név</label>
              <input type="text" value={formData.name} readOnly className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Telefon</label>
              <input type="text" value={formData.phone} required onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-slate-100 border-none rounded-2xl font-bold focus:ring-2 ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="space-y-6 bg-blue-50/50 p-8 rounded-[2rem]">
            <h3 className="font-black uppercase text-xs text-blue-600 tracking-widest">Szállítási adatok</h3>
            <div className="grid grid-cols-3 gap-4">
              <input type="text" placeholder="Irsz." value={formData.zip} required onChange={e => setFormData({...formData, zip: e.target.value})} className="p-4 rounded-xl border-none font-bold" />
              <input type="text" placeholder="Város" value={formData.city} required onChange={e => setFormData({...formData, city: e.target.value})} className="col-span-2 p-4 rounded-xl border-none font-bold" />
            </div>
            <input type="text" placeholder="Utca, házszám" value={formData.address} required onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 rounded-xl border-none font-bold" />
          </div>

          <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-full font-black uppercase shadow-xl hover:bg-blue-500 hover:scale-[1.02] transition-all">
            Rendelés véglegesítése
          </button>
        </form>
      </div>
    </div>
  );
}