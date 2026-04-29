'use client';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname(); // Ezzel figyeljük, melyik oldalon vagyunk éppen
  const storeId = params.storeId; 

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Segéd függvény az aktív linkek kiemeléséhez
  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-[#000b1a]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#001529] p-6 flex flex-col border-r border-blue-900/20 fixed h-full z-50 justify-between shadow-2xl">
        <div>
          <div className="mb-10 font-black text-blue-400 text-2xl tracking-[0.3em] italic uppercase">
            MODULAR
          </div>
          
          <nav className="space-y-1">
            <Link href="/stores" className={`group flex items-center gap-3 p-3 rounded-xl transition-all ${isActive('/stores') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-slate-800 hover:text-white'}`}>
              <span className="text-lg">🏠</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Összes bolt</span>
            </Link>

            {storeId && (
              <div className="mt-8 pt-8 border-t border-blue-900/30 animate-in slide-in-from-left duration-500">
                <p className="text-[10px] text-blue-500/50 font-black uppercase px-3 mb-4 tracking-[0.2em]">Bolt kezelése</p>
                
                {[
                  { name: 'Analitika', icon: '📊', path: `/stores/${storeId}` },
                  { name: 'Store Builder', icon: '🎨', path: `/stores/${storeId}/builder` },
                  { name: 'Termékek', icon: '📦', path: `/stores/${storeId}/products` },
                  { name: 'API & Pluginok', icon: '🔌', path: `/stores/${storeId}/plugins` }, // JAVÍTVA: plugins
                  { name: 'Rendelések', icon: '🛒', path: `/stores/${storeId}/orders` },
                ].map((item) => (
                  <Link 
                    key={item.path}
                    href={item.path} 
                    className={`group flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-400 hover:bg-blue-600/10 hover:text-blue-400'}`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </div>

        {/* KIJELENTKEZÉS GOMB A LEGALJÁN */}
        <div className="pt-6 border-t border-blue-900/30">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
          >
            🚪 Kijelentkezés
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 bg-gradient-to-br from-[#000b1a] to-[#001529]">
        {children}
      </main>
    </div>
  );
}