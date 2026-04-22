// src/app/page.tsx
'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#001f3f] text-white font-sans">
      <div className="text-center space-y-8 p-10 bg-slate-800/50 rounded-3xl border border-blue-900/30 shadow-2xl backdrop-blur-md">
        <h1 className="text-5xl font-black tracking-tighter italic text-blue-400">
          MODULAR <span className="text-white">ECOMMERCE</span>
        </h1>
        <p className="text-gray-400 max-w-md mx-auto text-lg">
          Építsd fel álmaid webáruházát technikai tudás nélkül, 
          moduláris alapon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-900/40"
          >
            Bejelentkezés
          </Link>
          <button className="border border-blue-900/50 hover:bg-slate-700 text-gray-300 px-10 py-4 rounded-xl font-bold transition-all">
            Regisztráció
          </button>
        </div>
      </div>
    </div>
  );
}
