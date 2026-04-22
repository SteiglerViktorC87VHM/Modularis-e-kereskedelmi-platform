'use client';
import React, { useState, useEffect } from 'react';

interface StoreConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  logoUrl: string;
}

type BlockType = 'HERO' | 'PRODUCT_GRID' | 'TEXT' | 'NAV' | 'IMAGE' | 'BUTTON' | 'VIDEO' | 'REVIEWS' | 'LOGO' | 'EMPTY_BOX';

interface PageBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>; 
  styles: Record<string, any>;
  children?: PageBlock[]; 
}

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export default function StoreBuilderPage() {
  const [activeTab, setActiveTab] = useState<'blocks' | 'style' | 'pages' | 'settings'>('blocks');
  const [storeId, setStoreId] = useState<string | null>(null);

  const [config, setConfig] = useState<StoreConfig>({
    primaryColor: '#3b82f6',
    secondaryColor: '#001529',
    backgroundColor: '#0a0f1a',
    logoUrl: '',
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

  const [pageBlocks, setPageBlocks] = useState<PageBlock[]>([
    { 
      id: 'default-hero', 
      type: 'HERO', 
      content: { title: 'Építse fel álmai boltját.', subtitle: 'Moduláris rendszerünkkel.' },
      styles: { backgroundColor: 'transparent', textAlign: 'center' }
    }
  ]);
  
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

  // --- ADATOK BETÖLTÉSE ---
  useEffect(() => {
    const loadActiveStore = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setIsLoading(false); return; }

        const response = await fetch('http://localhost:3000/store/my-stores', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const stores = await response.json();
          if (stores.length > 0) {
            const activeStore = stores[0];
            setStoreId(activeStore.id);
            
            if (activeStore.config) {
              setConfig({
                primaryColor: activeStore.config.primaryColor,
                secondaryColor: activeStore.config.secondaryColor,
                backgroundColor: activeStore.config.backgroundColor,
                logoUrl: activeStore.config.logoUrl || '',
              });
              if (activeStore.config.blocks && Array.isArray(activeStore.config.blocks)) {
                setPageBlocks(activeStore.config.blocks);
              }
            }
            if (activeStore.products && Array.isArray(activeStore.products)) setProducts(activeStore.products);
          }
        }
      } catch (error) {
        console.error("Hiba a betöltéskor:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadActiveStore();
  }, []);

  // --- MENTÉS ---
  const handleSave = async () => {
    if (!storeId) return alert("Hiba: Nincs azonosítható bolt!");
    try {
      const response = await fetch(`http://localhost:3000/store/${storeId}/config`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...config, blocks: pageBlocks })
      });
      if (response.ok) alert('Sikeres mentés!');
    } catch (error) {
      console.error(error);
    }
  };

  // --- DRAG & DROP LOGIKA ---
  const handleDragStart = (e: React.DragEvent, blockType: BlockType) => e.dataTransfer.setData('blockType', blockType);
  const handleDragOverCanvas = (e: React.DragEvent) => { e.preventDefault(); setIsHoveringCanvas(true); };
  const handleDragLeaveCanvas = () => setIsHoveringCanvas(false);

  const handleDrop = (e: React.DragEvent, parentId: string | null = null) => {
    e.preventDefault();
    e.stopPropagation(); 
    setIsHoveringCanvas(false);
    setHoveredBoxId(null);
    const blockType = e.dataTransfer.getData('blockType') as BlockType;
    
    if (blockType) {
      const newId = `block-${Date.now()}`;
      let newBlock: PageBlock = { 
        id: newId, 
        type: blockType, 
        content: {}, 
        styles: { backgroundColor: 'transparent', textAlign: 'center', fontWeight: 'normal', fontStyle: 'normal' },
        children: blockType === 'EMPTY_BOX' ? [] : undefined
      };
      
      switch (blockType) {
        case 'HERO': newBlock.content = { title: 'Új Főcím', subtitle: 'Ide jön a leírás...' }; break;
        case 'TEXT': newBlock.content = { text: 'Szabadon formázható és igazítható szöveg.' }; break;
        case 'PRODUCT_GRID': newBlock.content = { title: 'Kiemelt Termékek', productIds: [] }; break;
        case 'NAV': newBlock.content = { link1: 'Főoldal', link2: 'Termékek', link3: 'Kapcsolat' }; break;
        case 'IMAGE': newBlock.content = { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000', caption: 'Kép' }; break;
        case 'LOGO': newBlock.content = { url: '', text: 'MYSTORE' }; break;
        case 'BUTTON': newBlock.content = { text: 'Kattints Rám' }; break;
        case 'VIDEO': newBlock.content = { title: 'Videó címe' }; break;
        case 'REVIEWS': newBlock.content = { title: 'Értékelések' }; break;
        case 'EMPTY_BOX': newBlock.content = { placeholder: '' }; break;
      }

      if (parentId) {
        setPageBlocks(pageBlocks.map(b => {
          if (b.id === parentId && b.type === 'EMPTY_BOX') {
            return { ...b, children: [...(b.children || []), newBlock] };
          }
          return b;
        }));
      } else {
        setPageBlocks([...pageBlocks, newBlock]);
      }
      
      setSelectedBlockId(newId);
      setActiveTab('settings');
    }
  };

  const selectBlock = (e: React.MouseEvent, id: string) => { e.stopPropagation(); setSelectedBlockId(id); setActiveTab('settings'); };
  const deselectAll = () => setSelectedBlockId(null);

  // --- BLOKKOK TÖRLÉSE ÉS MOZGATÁSA (Golyóálló verzió) ---
  const removeBlock = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Megakadályozza a kijelölés elvesztését
    e.stopPropagation();
    
    let newBlocks = pageBlocks.filter(block => block.id !== id);
    newBlocks = newBlocks.map(block => {
      if (block.children) {
        return { ...block, children: block.children.filter(child => child.id !== id) };
      }
      return block;
    });
    setPageBlocks(newBlocks);
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (e: React.MouseEvent, id: string, direction: 'UP' | 'DOWN') => {
    e.preventDefault(); // Extra védelem a React eseménykezelőnek
    e.stopPropagation();

    const topIndex = pageBlocks.findIndex(b => b.id === id);
    if (topIndex !== -1) {
      const newBlocks = [...pageBlocks];
      if (direction === 'UP' && topIndex > 0) {
        [newBlocks[topIndex - 1], newBlocks[topIndex]] = [newBlocks[topIndex], newBlocks[topIndex - 1]];
      } else if (direction === 'DOWN' && topIndex < newBlocks.length - 1) {
        [newBlocks[topIndex + 1], newBlocks[topIndex]] = [newBlocks[topIndex], newBlocks[topIndex + 1]];
      }
      setPageBlocks(newBlocks);
      return;
    }

    const newBlocks = pageBlocks.map(block => {
      if (block.children) {
        const childIndex = block.children.findIndex(c => c.id === id);
        if (childIndex !== -1) {
          const newChildren = [...block.children];
          if (direction === 'UP' && childIndex > 0) {
            [newChildren[childIndex - 1], newChildren[childIndex]] = [newChildren[childIndex], newChildren[childIndex - 1]];
          } else if (direction === 'DOWN' && childIndex < newChildren.length - 1) {
            [newChildren[childIndex + 1], newChildren[childIndex]] = [newChildren[childIndex], newChildren[childIndex + 1]];
          }
          return { ...block, children: newChildren };
        }
      }
      return block;
    });
    setPageBlocks(newBlocks);
  };

  const updateSelectedBlock = (key: string, value: any, isStyle = false) => {
    setPageBlocks(pageBlocks.map(block => {
      if (block.id === selectedBlockId) {
        return isStyle ? { ...block, styles: { ...block.styles, [key]: value } } : { ...block, content: { ...block.content, [key]: value } };
      }
      if (block.children) {
        return {
          ...block,
          children: block.children.map(child => {
            if (child.id === selectedBlockId) {
              return isStyle ? { ...child, styles: { ...child.styles, [key]: value } } : { ...child, content: { ...child.content, [key]: value } };
            }
            return child;
          })
        };
      }
      return block;
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { updateSelectedBlock(key, reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const findSelectedBlock = () => {
    for (const b of pageBlocks) {
      if (b.id === selectedBlockId) return b;
      if (b.children) {
        const child = b.children.find(c => c.id === selectedBlockId);
        if (child) return child;
      }
    }
    return undefined;
  };
  const selectedBlock = findSelectedBlock();

  const handleResizeEnd = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const el = e.currentTarget;
    if (selectedBlockId === id) {
      if (el.style.width) updateSelectedBlock('width', el.style.width, true);
      if (el.style.height) updateSelectedBlock('height', el.style.height, true);
    }
  };

  // --- BLOKKOK KIRAJZOLÁSA ---
  const renderBlock = (block: PageBlock, isNested = false) => {
    const isSelected = block.id === selectedBlockId;
    const isHoveringThisBox = hoveredBoxId === block.id;
    
    const selectionClasses = isSelected ? 'ring-4 ring-blue-500 shadow-2xl z-20' : 'border-transparent hover:border-white/10';
    const bgStyle = block.styles.backgroundColor === 'transparent' ? 'transparent' : block.styles.backgroundColor;
    const alignClass = block.styles.textAlign === 'left' ? 'justify-start items-start text-left' : block.styles.textAlign === 'right' ? 'justify-end items-end text-right' : 'justify-center items-center text-center';

    const containerClasses = isNested 
      ? `relative group cursor-pointer transition-colors duration-300 rounded-xl border-2 ${selectionClasses} flex flex-col m-1 bg-white/5`
      : `relative group cursor-pointer transition-colors duration-300 rounded-[2rem] border-2 flex flex-col w-full ${selectionClasses}`;

    return (
      <div 
        key={block.id} 
        onClick={(e) => selectBlock(e, block.id)} 
        onMouseUp={(e) => handleResizeEnd(e, block.id)}
        className={containerClasses} 
        style={{ 
          backgroundColor: bgStyle, 
          resize: isNested ? 'both' : 'vertical', 
          overflow: 'hidden', 
          width: block.styles.width || (isNested ? 'auto' : '100%'),
          height: block.styles.height || 'auto',
          minHeight: isNested ? '50px' : '100px'
        }}
      >
        {/* JAVÍTVA: Közvetlenül ide került a gomb-sor a biztonságos DOM renderelés miatt */}
        {isSelected && (
          <div className="absolute top-2 right-2 z-[100] flex gap-1 bg-slate-900/95 p-1.5 rounded-lg border border-white/10 shadow-xl backdrop-blur-md">
            <button onClick={(e) => moveBlock(e, block.id, 'UP')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition cursor-pointer" title="Mozgatás Fel">↑</button>
            <button onClick={(e) => moveBlock(e, block.id, 'DOWN')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition cursor-pointer" title="Mozgatás Le">↓</button>
            <div className="w-px bg-white/10 mx-1"></div>
            <button onClick={(e) => removeBlock(e, block.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition cursor-pointer" title="Törlés">🗑️</button>
          </div>
        )}

        {block.type === 'HERO' && (
          <header className={`relative py-24 px-12 rounded-[2rem] w-full flex flex-col h-full ${alignClass}`}>
            {block.styles.backgroundColor === 'transparent' && <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${config.secondaryColor}, transparent)` }}></div>}
            <div className="absolute top-0 right-0 w-2/3 h-full blur-[120px] rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: config.primaryColor }}></div>
            <div className="relative z-10 w-full h-full flex flex-col justify-inherit">
              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] w-full" dangerouslySetInnerHTML={{ __html: block.content.title.replace(/\n/g, '<br/>') }}></h1>
              <p className="text-gray-400 text-xl whitespace-pre-wrap w-full">{block.content.subtitle}</p>
            </div>
          </header>
        )}

        {block.type === 'TEXT' && (
          <div className={`p-8 w-full flex flex-col h-full ${alignClass}`}>
            <p className="text-gray-300 text-lg whitespace-pre-wrap w-full" style={{ fontWeight: block.styles.fontWeight, fontStyle: block.styles.fontStyle }}>{block.content.text}</p>
          </div>
        )}

        {block.type === 'LOGO' && (
          <div className={`p-4 w-full h-full flex ${alignClass}`}>
             {block.content.url ? (
               <img src={block.content.url} alt="Logo" className="h-full w-full object-contain" />
             ) : (
               <h2 className="font-black text-4xl tracking-tighter text-white">{block.content.text}</h2>
             )}
          </div>
        )}

        {block.type === 'BUTTON' && (
          <div className={`p-6 w-full h-full flex ${alignClass}`}>
            <button className="px-8 py-4 text-white rounded-xl font-black shadow-lg hover:scale-105 transition w-auto" style={{ backgroundColor: config.primaryColor }}>{block.content.text}</button>
          </div>
        )}

        {block.type === 'NAV' && (
          <nav className={`p-6 w-full flex flex-col md:flex-row gap-6 border-b border-white/5 flex-wrap h-full ${alignClass}`}>
            <div className={`flex gap-8 text-sm font-bold text-gray-400 w-full ${alignClass}`}>
              <span className="text-white hover:text-blue-400 transition cursor-pointer">{block.content.link1}</span>
              <span className="hover:text-blue-400 transition cursor-pointer">{block.content.link2}</span>
              <span className="hover:text-blue-400 transition cursor-pointer">{block.content.link3}</span>
            </div>
          </nav>
        )}

        {block.type === 'EMPTY_BOX' && (
          <div 
            className={`w-full h-full flex flex-wrap content-start gap-4 p-6 rounded-[2rem] transition-all ${isHoveringThisBox ? 'bg-blue-500/20 border-2 border-dashed border-blue-400' : 'border border-dashed border-white/20'} ${alignClass}`}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setHoveredBoxId(block.id); }}
            onDragLeave={(e) => { e.stopPropagation(); setHoveredBoxId(null); }}
            onDrop={(e) => handleDrop(e, block.id)}
          >
            {(!block.children || block.children.length === 0) && (
              <p className="text-blue-500 font-mono text-sm opacity-50 w-full text-center mt-10 pointer-events-none">Húzz ide Képet, Szöveget vagy Gombot!</p>
            )}
            {block.children?.map(child => renderBlock(child, true))}
          </div>
        )}

        {block.type === 'PRODUCT_GRID' && (
          <div className={`p-8 w-full h-full ${alignClass}`}>
            <h3 className="text-4xl font-black mb-2 w-full">{block.content.title}</h3>
            <div className={`h-1.5 w-16 mb-8 rounded-full ${block.styles.textAlign === 'center' ? 'mx-auto' : block.styles.textAlign === 'right' ? 'ml-auto' : ''}`} style={{ backgroundColor: config.primaryColor }}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-none w-full">
              {(() => {
                const selectedIds = block.content.productIds || [];
                let displayProducts = selectedIds.length > 0 ? products.filter(p => selectedIds.includes(p.id)) : products.slice(0, 4);
                if (displayProducts.length === 0) return <p className="text-gray-500 col-span-4 text-center py-10">Még nincsenek feltöltött termékek.</p>;
                return displayProducts.map((p) => (
                  <div key={p.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col h-full text-left">
                    <div className="aspect-[4/5] bg-black/40 rounded-xl mb-4 flex items-center justify-center text-5xl">📦</div>
                    <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase mb-1">{p.category || 'ÁLTALÁNOS'}</p>
                    <h4 className="font-bold text-lg mb-2 text-white">{p.name}</h4>
                    <p className="text-white text-xl font-black mb-6">{p.price} Ft</p>
                    <div className="mt-auto space-y-2">
                      <button className="w-full py-2 text-sm text-gray-300 border border-white/10 rounded-lg">Részletek</button>
                      <button className="w-full py-2 text-sm text-white rounded-lg font-bold" style={{ backgroundColor: config.primaryColor }}>Kosárba</button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
        
        {block.type === 'IMAGE' && (
          <div className={`p-4 w-full h-full flex flex-col ${alignClass}`}>
            {block.content.url ? (
              <img src={block.content.url} alt="User Upload" className={`w-full h-full object-cover rounded-xl mb-3 ${block.styles.textAlign === 'center' ? 'mx-auto' : block.styles.textAlign === 'right' ? 'ml-auto' : ''}`} />
            ) : (
               <div className="w-full min-h-[200px] h-full bg-white/5 border border-dashed border-white/20 rounded-xl flex items-center justify-center text-gray-500">Tölts fel egy képet!</div>
            )}
            <p className="text-gray-500 text-sm w-full">{block.content.caption}</p>
          </div>
        )}

      </div>
    );
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center text-white bg-[#000b1a]">Bolt betöltése...</div>;

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-[#000b1a] text-white overflow-hidden rounded-xl border border-blue-900/30">
      
      {/* --- BAL OLDALI TOOLBOX --- */}
      <aside className="w-80 bg-[#001529] border-r border-blue-900/40 flex flex-col z-20 shadow-2xl shrink-0 relative">
        
        <div className="flex border-b border-blue-900/30 bg-[#000b1a]/50 shrink-0">
          <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-3 text-[9px] font-bold uppercase transition ${activeTab === 'blocks' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-500'}`}>🧱 Blokkok</button>
          <button onClick={() => setActiveTab('style')} className={`flex-1 py-3 text-[9px] font-bold uppercase transition ${activeTab === 'style' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-500'}`}>🎨 Design</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-3 text-[9px] font-bold uppercase transition ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-500'}`}>⚙️ Beállítás</button>
        </div>

        {/* Itt a pb-24 biztosítja, hogy le tudj görgetni a Mentés gomb alá is */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar pb-24">
          
          {/* BLOKKOK TAB */}
          {activeTab === 'blocks' && (
             <div className="space-y-6">
               <div>
                 <p className="text-[10px] text-blue-500 font-black mb-3 tracking-[0.2em]">ALAP ELEMEK (HÚZD BE!)</p>
                 <div className="grid grid-cols-2 gap-2">
                   <div draggable onDragStart={(e) => handleDragStart(e, 'EMPTY_BOX')} className="col-span-2 p-3 bg-blue-600/20 border border-dashed border-blue-500/50 rounded-lg text-[10px] font-bold text-center cursor-grab hover:bg-blue-600/40 transition">📦 Üres Doboz (Konténer)</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'LOGO')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">👑 Logó</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'NAV')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">🧭 Menü Linkek</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'HERO')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">🚀 Hero Szöveg</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'TEXT')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">📝 Szöveg</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'BUTTON')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">🔘 Gomb</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'IMAGE')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">🖼️ Kép</div>
                 </div>
               </div>
               <div>
                 <p className="text-[10px] text-blue-500 font-black mb-3 tracking-[0.2em]">WEBÁRUHÁZ MODULOK</p>
                 <div className="space-y-2">
                   <div draggable onDragStart={(e) => handleDragStart(e, 'PRODUCT_GRID')} className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg flex justify-between items-center cursor-grab hover:bg-blue-600/20 transition">
                     <span className="text-[11px] font-bold text-blue-400">🔥 Termék Rács</span>
                   </div>
                 </div>
               </div>
             </div>
          )}

          {/* DESIGN TAB */}
          {activeTab === 'style' && (
             <div className="space-y-6">
               <p className="text-[10px] text-blue-500 font-black mb-3 tracking-[0.2em]">GLOBÁLIS STÍLUSOK</p>
               <div><label className="text-[10px] text-gray-500 block mb-2 font-bold uppercase">Főszín (Gombok)</label><input type="color" value={config.primaryColor} onChange={(e) => setConfig({...config, primaryColor: e.target.value})} className="w-full h-10 rounded cursor-pointer bg-transparent" /></div>
               <div><label className="text-[10px] text-gray-500 block mb-2 font-bold uppercase">Másodlagos Szín</label><input type="color" value={config.secondaryColor} onChange={(e) => setConfig({...config, secondaryColor: e.target.value})} className="w-full h-10 rounded cursor-pointer bg-transparent" /></div>
               <div><label className="text-[10px] text-gray-500 block mb-2 font-bold uppercase">Háttérszín</label><input type="color" value={config.backgroundColor} onChange={(e) => setConfig({...config, backgroundColor: e.target.value})} className="w-full h-10 rounded cursor-pointer bg-transparent" /></div>
             </div>
          )}

          {/* BEÁLLÍTÁSOK TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {!selectedBlockId ? (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6 flex items-start gap-3"><span className="text-xl">ℹ️</span><p className="text-xs text-blue-200">Kattints egy elemre a jobb oldali vásznon a szerkesztéshez!</p></div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                     <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{selectedBlock?.type} BEÁLLÍTÁSOK</p>
                     <button onClick={deselectAll} className="text-xs text-gray-500 hover:text-white">✕ Bezárás</button>
                  </div>

                  <div className="mb-6 space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase">Pozíció / Igazítás</label>
                      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg">
                        <button onClick={() => updateSelectedBlock('textAlign', 'left', true)} className={`flex-1 py-2 text-xs rounded ${selectedBlock?.styles.textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>Balra</button>
                        <button onClick={() => updateSelectedBlock('textAlign', 'center', true)} className={`flex-1 py-2 text-xs rounded ${selectedBlock?.styles.textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>Középre</button>
                        <button onClick={() => updateSelectedBlock('textAlign', 'right', true)} className={`flex-1 py-2 text-xs rounded ${selectedBlock?.styles.textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>Jobbra</button>
                      </div>
                    </div>

                    {selectedBlock?.type === 'TEXT' && (
                       <div>
                         <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase mt-4">Szöveg Formázás</label>
                         <div className="flex gap-2">
                            <button onClick={() => updateSelectedBlock('fontWeight', selectedBlock.styles.fontWeight === 'bold' ? 'normal' : 'bold', true)} className={`w-10 h-10 flex items-center justify-center font-black border border-white/10 rounded hover:bg-white/10 ${selectedBlock.styles.fontWeight === 'bold' ? 'bg-blue-600 border-blue-500' : ''}`}>B</button>
                            <button onClick={() => updateSelectedBlock('fontStyle', selectedBlock.styles.fontStyle === 'italic' ? 'normal' : 'italic', true)} className={`w-10 h-10 flex items-center justify-center italic font-serif border border-white/10 rounded hover:bg-white/10 ${selectedBlock.styles.fontStyle === 'italic' ? 'bg-blue-600 border-blue-500' : ''}`}>I</button>
                         </div>
                       </div>
                    )}

                    <div>
                      <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase mt-4">Háttérszín</label>
                      <div className="flex gap-2">
                        <input type="color" value={selectedBlock?.styles.backgroundColor === 'transparent' ? '#000000' : selectedBlock?.styles.backgroundColor} onChange={(e) => updateSelectedBlock('backgroundColor', e.target.value, true)} className="w-10 h-10 rounded cursor-pointer bg-transparent" />
                        <button onClick={() => updateSelectedBlock('backgroundColor', 'transparent', true)} className="flex-1 bg-slate-900 border border-white/5 rounded-lg text-xs hover:bg-white/10 transition text-gray-400">Átlátszó (Alap)</button>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5 my-6" />
                  
                  {selectedBlock?.type === 'HERO' && (
                    <div className="space-y-4">
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">FŐCÍM</label><textarea value={selectedBlock.content.title} onChange={(e) => updateSelectedBlock('title', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white h-20 resize-none" /></div>
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">ALCÍM</label><textarea value={selectedBlock.content.subtitle} onChange={(e) => updateSelectedBlock('subtitle', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white h-16 resize-none" /></div>
                    </div>
                  )}

                  {selectedBlock?.type === 'TEXT' && (
                    <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">SZÖVEG TARTALMA</label><textarea value={selectedBlock.content.text} onChange={(e) => updateSelectedBlock('text', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white h-48 resize-none" /></div>
                  )}

                  {selectedBlock?.type === 'LOGO' && (
                    <div className="space-y-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                        <label className="text-[10px] text-blue-400 block mb-2 font-bold uppercase">Logó feltöltése gépről</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'url')} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                      </div>
                      <div className="text-center text-xs text-gray-600 font-bold">VAGY</div>
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">LOGÓ SZÖVEG (Ha nincs kép)</label><input type="text" value={selectedBlock.content.text} onChange={(e) => updateSelectedBlock('text', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                    </div>
                  )}

                  {selectedBlock?.type === 'BUTTON' && (
                    <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">GOMB SZÖVEG</label><input type="text" value={selectedBlock.content.text} onChange={(e) => updateSelectedBlock('text', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                  )}

                  {selectedBlock?.type === 'NAV' && (
                    <div className="space-y-4">
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">LINK 1</label><input type="text" value={selectedBlock.content.link1} onChange={(e) => updateSelectedBlock('link1', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">LINK 2</label><input type="text" value={selectedBlock.content.link2} onChange={(e) => updateSelectedBlock('link2', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">LINK 3</label><input type="text" value={selectedBlock.content.link3} onChange={(e) => updateSelectedBlock('link3', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                    </div>
                  )}

                  {selectedBlock?.type === 'IMAGE' && (
                    <div className="space-y-4">
                       <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                        <label className="text-[10px] text-blue-400 block mb-2 font-bold uppercase">Kép feltöltése gépről</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'url')} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                      </div>
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">KÉP ALÁÍRÁS</label><input type="text" value={selectedBlock.content.caption} onChange={(e) => updateSelectedBlock('caption', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                    </div>
                  )}

                  {selectedBlock?.type === 'PRODUCT_GRID' && (
                    <div className="space-y-4">
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">SZEKCIÓ CÍME</label><input type="text" value={selectedBlock.content.title} onChange={(e) => updateSelectedBlock('title', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-2 font-bold uppercase">Megjelenítendő termékek</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {products.map(p => (
                            <label key={p.id} className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                              <input type="checkbox" checked={(selectedBlock.content.productIds || []).includes(p.id)} onChange={(e) => {
                                const current = selectedBlock.content.productIds || [];
                                updateSelectedBlock('productIds', e.target.checked ? [...current, p.id] : current.filter((id: string) => id !== p.id));
                              }} className="rounded bg-slate-900 w-4 h-4 cursor-pointer" />
                              <span className="text-xs text-white truncate flex-1">{p.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* JAVÍTVA: Fixen az aljára igazított Mentés gomb */}
        <div className="absolute bottom-0 left-0 w-full p-5 border-t border-blue-900/30 bg-[#000b1a]/95 z-30 shrink-0">
          <button onClick={handleSave} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 transition-transform active:scale-95">MENTÉS</button>
        </div>
      </aside>

      {/* --- KÖZÉP: AZ ELŐNÉZET (DROPZONE) --- */}
      <section 
        className="flex-1 flex flex-col overflow-y-auto relative transition-colors duration-500" 
        style={{ backgroundColor: config.backgroundColor }}
        onClick={deselectAll}
      >
        <div className="h-12 bg-[#001529]/95 border-b border-white/5 flex justify-between items-center px-6 sticky top-0 z-30 shadow-md">
           <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">Építő Vászon - Húzd be a dobozokat!</span>
           <span className="text-[10px] text-gray-500 font-mono hidden md:inline">Vidd az egeret a jobb alsó sarokra a méretezéshez!</span>
        </div>

        <div 
          className={`flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-4 transition-all duration-300 pb-32 ${isHoveringCanvas && !hoveredBoxId ? 'bg-blue-500/10 border-4 border-dashed border-blue-500/50' : 'border-4 border-transparent'}`}
          onDragOver={handleDragOverCanvas}
          onDragLeave={handleDragLeaveCanvas}
          onDrop={(e) => handleDrop(e, null)}
          style={{ minHeight: '800px' }}
        >
          {pageBlocks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-[3rem] p-20 mt-10 pointer-events-none">
              <span className="text-6xl mb-4 opacity-50">🏗️</span>
              <h2 className="text-2xl font-black text-white mb-2">A boltod jelenleg üres.</h2>
              <p>Húzz be egy Üres Dobozt, és pakold tele!</p>
            </div>
          ) : (
            pageBlocks.map((block) => renderBlock(block, false))
          )}
        </div>
      </section>
    </div>
  );
}