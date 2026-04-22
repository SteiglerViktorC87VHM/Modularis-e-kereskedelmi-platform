'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId; 

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#000b1a]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#001529] p-6 flex flex-col border-r border-blue-900/20 fixed h-full z-50 justify-between">
        <div>
          <div className="mb-10 font-bold text-blue-400 text-xl tracking-widest italic">MODULAR</div>
          
          <nav className="space-y-2">
            <Link href="/stores" className="block p-3 text-gray-400 hover:bg-slate-800 rounded-lg transition">
              🏠 Összes bolt
            </Link>

            {storeId && (
              <div className="mt-8 pt-8 border-t border-blue-900/30 animate-in slide-in-from-left duration-500">
                <p className="text-[10px] text-blue-500 font-bold uppercase px-3 mb-2 tracking-widest">Bolt kezelése</p>
                
                <Link href={`/stores/${storeId}`} className="block p-3 text-gray-300 hover:bg-blue-600 rounded-lg transition">
                  📊 Analitika
                </Link>
                
                <Link href={`/stores/${storeId}/builder`} className="block p-3 text-gray-300 hover:bg-blue-600 rounded-lg transition">
                  🎨 Store Builder
                </Link>

                <Link href={`/stores/${storeId}/products`} className="block p-3 text-gray-300 hover:bg-blue-600 rounded-lg transition">
                  📦 Termékek
                </Link>

                <Link href={`/stores/${storeId}/api-settings`} className="block p-3 text-gray-300 hover:bg-blue-600 rounded-lg transition">
                  🔌 API & Pluginok
                </Link>

                <Link href={`/stores/${storeId}/orders`} className="block p-3 text-gray-300 hover:bg-blue-600 rounded-lg transition">
                  🛒 Rendelések
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* KIJELENTKEZÉS GOMB A LEGALJÁN */}
        <div className="pt-6 border-t border-blue-900/30">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition font-medium"
          >
            🚪 Kijelentkezés
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}