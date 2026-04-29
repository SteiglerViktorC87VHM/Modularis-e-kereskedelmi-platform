'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'payment' | 'analytics' | 'marketing';
  enabled: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export default function PluginsAndApiPage() {
  const { storeId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'plugins' | 'api'>('plugins');
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock adatok - később backendről jönnek
  const [plugins, setPlugins] = useState<Plugin[]>([
    { id: 'stripe', name: 'Stripe Payments', description: 'Bankkártyás fizetés integrálása globálisan.', icon: '💳', category: 'payment', enabled: true },
    { id: 'ga4', name: 'Google Analytics 4', description: 'Látogatói statisztikák és konverziókövetés.', icon: '📊', category: 'analytics', enabled: false },
    { id: 'fb-pixel', name: 'Facebook Pixel', description: 'Hirdetések optimalizálása és remarketing.', icon: '🔵', category: 'marketing', enabled: true },
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Mobil App Key', key: 'sk_live_51M...', createdAt: '2024-03-20' },
  ]);

  useEffect(() => {
    // Itt ellenőrizzük a tokent és a jogosultságot
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    setIsLoading(false);
  }, [router]);

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Másolva a vágólapra!');
  };

  if (isLoading) return <div className="min-h-screen bg-[#000b1a] flex items-center justify-center text-blue-500 font-black italic">BETÖLTÉS...</div>;

  return (
    <div className="min-h-screen bg-[#000b1a] text-white">
      {/* Navigációs fejléc */}
      <nav className="bg-[#001529]/80 backdrop-blur-md border-b border-blue-900/30 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/stores')} className="text-gray-500 hover:text-white transition">←</button>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Integrációk & API</h1>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('plugins')} 
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'plugins' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >Pluginok</button>
          <button 
            onClick={() => setActiveTab('api')} 
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'api' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >API Access</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {activeTab === 'plugins' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {plugins.map(plugin => (
              <div key={plugin.id} className="bg-[#001529] border border-blue-900/20 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                    {plugin.icon}
                  </div>
                  <div 
                    onClick={() => togglePlugin(plugin.id)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${plugin.enabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${plugin.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
                <h3 className="font-black uppercase tracking-tight text-lg mb-2">{plugin.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-6">{plugin.description}</p>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                  Konfigurálás
                </button>
              </div>
            ))}
            
            {/* Új plugin hozzáadása kártya */}
            <div className="border-2 border-dashed border-blue-900/20 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-3xl mb-2">+</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Plugin Marketplace</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* API KULCSOK SZERKEZETE */}
            <section className="bg-[#001529] border border-blue-900/20 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="font-black uppercase italic text-xl">Saját API kulcsok</h3>
                  <p className="text-gray-500 text-[10px] uppercase font-bold mt-1">Használd ezeket a külső alkalmazások összekötéséhez</p>
                </div>
                <button className="px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                  + Új kulcs generálása
                </button>
              </div>
              <div className="p-8 space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className="flex items-center justify-between p-5 bg-[#000b1a] rounded-2xl border border-white/5">
                    <div>
                      <p className="text-xs font-black uppercase text-blue-400">{key.name}</p>
                      <p className="text-[10px] text-gray-600 font-bold mt-1">Létrehozva: {key.createdAt}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <code className="bg-slate-900 px-4 py-2 rounded-lg text-xs text-gray-400 font-mono">
                        {key.key}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(key.key)}
                        className="p-2 hover:text-blue-400 transition"
                      >📋</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* WEBHOOKS SZAKASZ */}
            <section className="bg-[#001529] border border-blue-900/20 rounded-[2.5rem] p-8">
              <h3 className="font-black uppercase italic text-xl mb-6">Webhooks</h3>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Webhook URL (Pl. rendelés értesítés)</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="https://sajatappod.com/api/webhook"
                    className="flex-1 bg-[#000b1a] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-sm font-bold"
                  />
                  <button className="px-8 py-4 bg-slate-800 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all">Mentés</button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}