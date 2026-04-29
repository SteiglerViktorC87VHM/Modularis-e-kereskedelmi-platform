'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Itt hívnád meg a backend API-t. Most csak szimuláljuk.
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000b1a] text-white p-4">
      <div className="max-w-md w-full bg-[#001529] border border-blue-900/30 p-8 rounded-2xl shadow-2xl text-center">
        <span className="text-5xl mb-4 block">🔑</span>
        <h2 className="text-3xl font-black mb-4 text-blue-400 uppercase tracking-tight">Jelszó emlékeztető</h2>
        
        {!sent ? (
          <>
            <p className="text-gray-400 text-sm mb-6">Add meg az e-mail címed, és küldünk egy linket a jelszó helyreállításához.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="email" required placeholder="Email címed" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 transition"
              />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition">Link küldése</button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl mb-6 text-sm font-bold">
              ✅ Az e-mailt elküldtük! Ellenőrizd a fiókodat.
            </div>
            <Link href="/login" className="text-blue-400 hover:underline font-bold">Vissza a bejelentkezéshez</Link>
          </div>
        )}
        
        {!sent && (
          <div className="mt-6">
            <Link href="/login" className="text-gray-500 hover:text-white text-sm transition">Mégis eszembe jutott</Link>
          </div>
        )}
      </div>
    </div>
  );
}