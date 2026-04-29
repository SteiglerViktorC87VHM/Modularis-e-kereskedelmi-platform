'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PublicShopPage() {
  const { storeId } = useParams();
  const router = useRouter();
  const [storeData, setStoreData] = useState<any>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/store/${storeId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStoreData(data);
          if (data.config?.blocks && data.config.blocks.length > 0) {
            setCurrentPageId(data.config.blocks[0].id);
          }
        }
      })
      .catch(err => console.error("Hiba a bolt betöltésekor", err));

    setIsLogged(!!localStorage.getItem('token'));
  }, [storeId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPageId]);

  const handleNavClick = (targetPageId: string | null) => {
    if (targetPageId) {
      setCurrentPageId(targetPageId);
    }
  };

  const handleOrderClick = () => {
    if (!isLogged) {
      router.push(`/login?returnTo=/shop/${storeId}/checkout`);
    } else {
      router.push(`/shop/${storeId}/checkout`);
    }
  };

  if (!storeData) return (
    <div className="min-h-screen bg-[#000b1a] flex items-center justify-center text-blue-500 font-bold italic uppercase animate-pulse">
      Bolt betöltése...
    </div>
  );

  const config = storeData.config || {};
  const pages = config.blocks || [];
  const currentPage = pages.find((p: any) => p.id === currentPageId) || pages[0];
  const pageBlocks = currentPage?.blocks || [];
  const products = storeData.products || [];

  // --- LAPOZÓ LOGIKA (PAGINATION) ---
  const pagesPerPage = 5;
  const totalPages = pages.length;
  // Megkeressük, hanyadik oldalon állunk (0-tól indexelve)
  const currentIndex = pages.findIndex((p: any) => p.id === currentPageId);
  // Kiszámoljuk, melyik "ötös blokkban" (csoportban) vagyunk éppen
  const currentGroup = Math.floor(currentIndex / pagesPerPage);

  const renderBlock = (block: any, isNested = false) => {
    if (!block) return null;
    const bgStyle = block.styles?.backgroundColor === 'transparent' ? 'transparent' : block.styles?.backgroundColor;
    const alignClass = block.styles?.textAlign === 'left' ? 'justify-start items-start text-left' : block.styles?.textAlign === 'right' ? 'justify-end items-end text-right' : 'justify-center items-center text-center';
    const textColorStyle = block.styles?.textColor || '#d1d5db';
    const fontFamilyStyle = block.styles?.fontFamily || 'sans-serif';

    const blockStyle: React.CSSProperties = isNested ? {
      backgroundColor: bgStyle, overflow: 'hidden',
      width: block.styles?.width || 'auto', height: block.styles?.height || 'auto', 
      minHeight: '50px', position: block.styles?.position as any || 'relative', 
      left: block.styles?.left, top: block.styles?.top, margin: block.styles?.position === 'absolute' ? '0' : undefined
    } : {
      backgroundColor: bgStyle, overflow: 'hidden', width: '100%', maxWidth: '100%',
      height: block.styles?.height || 'auto', minHeight: '100px', position: 'relative', margin: '0'
    };

    return (
      <div key={block.id} style={blockStyle} className={`${isNested ? 'relative m-1 rounded-xl flex flex-col bg-white/5' : 'relative rounded-[2rem] flex flex-col w-full'}`}>
        {block.type === 'HERO' && (
          <header className={`relative py-24 px-12 rounded-[2rem] w-full flex flex-col h-full ${alignClass}`}>
            {block.styles?.backgroundColor === 'transparent' && <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${config.secondaryColor || '#001529'}, transparent)` }}></div>}
            <div className="absolute top-0 right-0 w-2/3 h-full blur-[120px] rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: config.primaryColor || '#3b82f6' }}></div>
            <div className="relative z-10 w-full h-full flex flex-col justify-inherit">
              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] w-full text-white" dangerouslySetInnerHTML={{ __html: block.content?.title?.replace(/\n/g, '<br/>') || '' }}></h1>
              <p className="text-xl whitespace-pre-wrap w-full" style={{ color: textColorStyle, fontFamily: fontFamilyStyle }}>{block.content?.subtitle}</p>
            </div>
          </header>
        )}

        {block.type === 'TEXT' && (
          <div className={`p-8 w-full flex flex-col h-full ${alignClass}`}>
            <p className="text-lg whitespace-pre-wrap w-full" style={{ fontWeight: block.styles?.fontWeight, fontStyle: block.styles?.fontStyle, color: textColorStyle, fontFamily: fontFamilyStyle }}>{block.content?.text}</p>
          </div>
        )}

        {block.type === 'LOGO' && (
          <div className={`p-4 w-full h-full flex cursor-pointer ${alignClass}`} onClick={() => setCurrentPageId(pages[0]?.id)}>
             {block.content?.url ? <img src={block.content.url} alt="Logo" className="h-full w-full object-contain" /> : <h2 className="font-black text-4xl tracking-tighter text-white">{block.content?.text}</h2>}
          </div>
        )}

        {block.type === 'BUTTON' && (
          <div className={`p-6 w-full h-full flex ${alignClass}`}>
            <button onClick={() => handleNavClick(block.content?.targetPageId)} className="px-8 py-4 text-white rounded-xl font-black shadow-lg hover:scale-105 transition w-auto" style={{ backgroundColor: config.primaryColor }}>
              {block.content?.text}
            </button>
          </div>
        )}

        {block.type === 'NAV' && (
          <nav className={`p-6 w-full flex flex-col md:flex-row gap-6 border-b border-white/5 flex-wrap h-full ${alignClass}`}>
            <div className={`flex gap-8 text-sm font-bold text-gray-400 w-full ${alignClass}`}>
               {(block.content?.links || []).map((link: any) => (
                 <button key={link.id} onClick={() => handleNavClick(link.targetPageId)} className="hover:text-white transition cursor-pointer">{link.text}</button>
               ))}
            </div>
          </nav>
        )}

        {block.type === 'PRODUCT_GRID' && (
          <div className={`p-8 w-full h-full ${alignClass}`}>
            <h3 className="text-4xl font-black mb-2 w-full text-white">{block.content?.title}</h3>
            <div className={`h-1.5 w-16 mb-8 rounded-full ${block.styles?.textAlign === 'center' ? 'mx-auto' : block.styles?.textAlign === 'right' ? 'ml-auto' : ''}`} style={{ backgroundColor: config.primaryColor }}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {products.filter((p:any) => block.content?.productIds?.includes(p.id)).map((p: any) => (
                <div key={p.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col h-full text-left">
                  <div className="aspect-[4/5] bg-black/40 rounded-xl mb-4 flex items-center justify-center text-5xl">📦</div>
                  <h4 className="font-bold text-lg mb-2 text-white">{p.name}</h4>
                  <p className="text-white text-xl font-black mb-6">{p.price} Ft</p>
                  <button onClick={handleOrderClick} className="w-full py-2 text-sm text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform" style={{ backgroundColor: config.primaryColor }}>Megrendelés</button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {block.type === 'EMPTY_BOX' && (
          <div className="w-full h-full p-6 rounded-[2rem] relative">
            {block.children?.map((child: any) => renderBlock(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: config.backgroundColor || '#000b1a' }}>
      {/* Vásárlói Fejléc */}
      <div className="bg-black/60 text-white backdrop-blur-md border-b border-white/5 px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
           <div className="cursor-pointer" onClick={() => setCurrentPageId(pages[0]?.id)}>
             {config.logoUrl ? <img src={config.logoUrl} className="h-8 object-contain" /> : <span className="text-xl font-black tracking-tighter uppercase">{storeData.name}</span>}
           </div>
        </div>
        
        <button 
          onClick={() => isLogged ? router.push('/customer/dashboard') : router.push(`/login?returnTo=/shop/${storeId}`)} 
          className="text-[10px] font-bold text-white hover:text-blue-400 uppercase border border-white/20 bg-white/5 px-5 py-2 rounded-full transition-all"
        >
          {isLogged ? 'Saját Fiókom' : 'Bejelentkezés'}
        </button>
      </div>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">
        {pageBlocks.length === 0 ? (
          <div className="py-40 text-center text-gray-500 border-2 border-dashed border-white/10 rounded-[3rem]">
            <p className="text-xl font-black text-white">Az oldal üres.</p>
          </div>
        ) : (
          pageBlocks.map((block: any) => renderBlock(block, false))
        )}
      </main>

      {/* --- ALSÓ LAPOZÓ SÁV (CSAK HA TÖBB MINT 1 OLDAL VAN) --- */}
      {totalPages > 1 && (
        <div className="w-full bg-[#001529]/80 backdrop-blur-md border-t border-white/10 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex justify-center items-center gap-2">
            
            {/* Előző gomb (Csak akkor aktív, ha nem az első lapon állunk) */}
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentPageId(pages[currentIndex - 1]?.id)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition"
            >
              ←
            </button>

            {/* Számok 5-ösével (csak az aktuális csoportot mutatjuk) */}
            {pages
              .slice(currentGroup * pagesPerPage, (currentGroup * pagesPerPage) + pagesPerPage)
              .map((p: any, idx: number) => {
                const actualIndex = (currentGroup * pagesPerPage) + idx;
                const isActive = currentPageId === p.id;
                
                return (
                  <button 
                    key={p.id}
                    onClick={() => setCurrentPageId(p.id)}
                    className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {actualIndex + 1}
                  </button>
                );
              })
            }

            {/* Ha van még több oldal, kiírjuk, hogy "..." */}
            {totalPages > (currentGroup * pagesPerPage) + pagesPerPage && (
               <span className="text-gray-500 font-bold px-2">...</span>
            )}

            {/* Következő gomb (Csak akkor aktív, ha nem az utolsó lapon állunk) */}
            <button 
              disabled={currentIndex === totalPages - 1}
              onClick={() => setCurrentPageId(pages[currentIndex + 1]?.id)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}