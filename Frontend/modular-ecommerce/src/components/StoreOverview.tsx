'use client';
import { useParams } from 'next/navigation';

export default function StoreOverview() {
  const { storeId } = useParams();

  // Ezek most még DUMMY adatok, de így kell majd kinéznie:
  const stats = [
    { label: 'Havi bevétel', value: '1.250.000 Ft', change: '+12%', color: 'text-green-400' },
    { label: 'Aktív rendelések', value: '42 db', change: '+5%', color: 'text-blue-400' },
    { label: 'Termékek száma', value: '18 db', change: '0%', color: 'text-purple-400' },
    { label: 'Látogatók', value: '1,204', change: '+18%', color: 'text-orange-400' },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white">Bolt Analitika (ID: {storeId})</h1>

      {/* STATISZTIKAI KÁRTYÁK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            <div className="flex items-baseline justify-between mt-2">
              <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
              <span className={`text-xs font-bold ${stat.color}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* HELYETTESÍTŐ GRAFIKON HELYE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl h-64 flex items-center justify-center">
          <p className="text-gray-500 italic">[ Eladási grafikon helye - Fejlesztés alatt ]</p>
        </div>
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl h-64 flex items-center justify-center">
          <p className="text-gray-500 italic">[ Legnépszerűbb kategóriák - Fejlesztés alatt ]</p>
        </div>
      </div>
    </div>
  );
}