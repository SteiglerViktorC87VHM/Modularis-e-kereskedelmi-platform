'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerProfile() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    
    try {
      // 1. Kinyerjük a felhasználó ID-ját a tokenből (sub vagy id néven szokott lenni)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = payload.sub || payload.id;
      setUserId(currentUserId);
      
      // 2. Lekérjük a teljes profilt az adatbázisból, hogy lássuk a már elmentett adatokat
      fetch(`http://localhost:3000/user/${currentUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setFormData({
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          zip: data.zip || ''
        });
      })
      .catch(err => console.error('Nem sikerült betölteni a profilt', err));

    } catch (e) { 
      router.push('/login'); 
    }
  }, [router]);

  // Végleges mentés az adatbázisba
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`http://localhost:3000/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip
        }),
      });

      if (res.ok) {
        alert('✅ Profil adatok sikeresen frissítve az adatbázisban!');
      } else {
        const errorData = await res.json();
        alert(`Hiba történt: ${errorData.message || 'Sikertelen mentés'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Nem sikerült csatlakozni a szerverhez.');
    }
  };

  return (
    <div className="min-h-screen bg-[#000b1a] text-white">
      <nav className="bg-[#001529] border-b border-blue-900/30 px-8 py-4 flex justify-between items-center">
        <button onClick={() => router.push('/customer/dashboard')} className="text-xs font-black text-blue-400 hover:text-white transition-all uppercase">← Vissza</button>
        <h1 className="text-sm font-black tracking-[0.2em] uppercase">Profil Beállítások</h1>
        <div className="w-10"></div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 py-12">
        <form onSubmit={handleSave} className="space-y-12">
          
          <section className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-blue-600/30 flex items-center justify-center text-5xl overflow-hidden shadow-2xl transition-all group-hover:border-blue-500">
                👤
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 shadow-xl transition-all">
                📷
                <input type="file" className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Kattints az ikonra a kép módosításához</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-blue-900/30 pb-2">Személyes adatok</h3>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Felhasználónév</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Email cím</label>
                <input type="email" disabled value={formData.email} className="w-full bg-slate-900/50 border border-slate-800/50 p-3 rounded-xl text-gray-500 text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Telefonszám</label>
                <input type="tel" placeholder="+36 30 123 4567" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-blue-900/30 pb-2">Szállítási cím</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Irsz.</label>
                  <input type="text" placeholder="1234" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Város</label>
                  <input type="text" placeholder="Budapest" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Utca, házszám</label>
                <input type="text" placeholder="Példa utca 12." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-sm" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-blue-900/30 flex justify-end gap-4">
             <button type="button" onClick={() => router.push('/customer/dashboard')} className="px-8 py-3 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all">Mégse</button>
             <button type="submit" className="px-10 py-3 bg-blue-600 rounded-full text-[10px] font-black uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Változtatások mentése</button>
          </div>
        </form>
      </main>
    </div>
  );
}