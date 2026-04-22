'use client';

import GlobalDashboard from '../../components/GlobalDashboard';
import React from 'react';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Csak a GlobalDashboard marad. 
         Ez tartalmazza a fejlécet, az "Új bolt" gombot 
         és a boltok kártyáit is.
      */}
      <div className="w-full">
        <GlobalDashboard />
      </div>
    </div>
  );
}