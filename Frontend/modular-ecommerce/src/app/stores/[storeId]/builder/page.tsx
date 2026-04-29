'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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

interface Page {
  id: string;
  name: string;
  blocks: PageBlock[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export default function StoreBuilderPage() {
  const params = useParams();
  const currentStoreId = params.storeId as string;

  const [activeTab, setActiveTab] = useState<'blocks' | 'navigation' | 'settings'>('blocks');
  const [storeId, setStoreId] = useState<string | null>(currentStoreId);

  const [config, setConfig] = useState<StoreConfig>({
    primaryColor: '#3b82f6',
    secondaryColor: '#001529',
    backgroundColor: '#000b1a', // Alapértelmezett sötétkék téma
    logoUrl: '',
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);
  const [toastState, setToastState] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const [pages, setPages] = useState<Page[]>([
    { 
      id: 'page-home', 
      name: 'Főoldal', 
      blocks: [
        { 
          id: 'default-hero', 
          type: 'HERO', 
          content: { title: 'Építse fel álmai boltját.', subtitle: 'Moduláris rendszerünkkel.' },
          styles: { backgroundColor: 'transparent', textAlign: 'center' }
        }
      ] 
    }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const pageBlocks = pages[currentPageIndex]?.blocks || [];

  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);
  const [navSourceId, setNavSourceId] = useState<string | null>(null);

  // --- LAPOZÓ LOGIKA (PAGINATION) ---
  const pagesPerPage = 5;
  const totalPages = pages.length;
  const currentGroup = Math.floor(currentPageIndex / pagesPerPage);

  // Okosított State Frissítő: Megakadályozza a méretvesztést
  const setPageBlocks = (updater: PageBlock[] | ((prev: PageBlock[]) => PageBlock[])) => {
    setPages(prevPages => {
      const updatedPages = [...prevPages];
      if (!updatedPages[currentPageIndex]) return prevPages;
      const currentBlocks = updatedPages[currentPageIndex].blocks || [];
      updatedPages[currentPageIndex].blocks = typeof updater === 'function' ? updater(currentBlocks) : updater;
      return updatedPages;
    });
  };

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
            const activeStore = stores.find((s: any) => s.id === currentStoreId);
            if (!activeStore) {
              console.error("Nem található ez a bolt!");
              setIsLoading(false);
              return;
            }

            setStoreId(activeStore.id);
            
            if (activeStore.config) {
              let dbBgColor = activeStore.config.backgroundColor;
              if (!dbBgColor || dbBgColor === '#ffffff') dbBgColor = '#000b1a'; 

              setConfig({
                primaryColor: activeStore.config.primaryColor || '#3b82f6',
                secondaryColor: activeStore.config.secondaryColor || '#001529',
                backgroundColor: dbBgColor, 
                logoUrl: activeStore.config.logoUrl || '',
              });

              const migrateBlocks = (blocks: PageBlock[]): PageBlock[] => blocks.map(b => {
                if (b.type === 'NAV' && !b.content.links) {
                  b.content.links = [];
                  if (b.content.link1) b.content.links.push({ id: `link-${Date.now()}-1`, text: b.content.link1, targetPageId: null });
                  if (b.content.link2) b.content.links.push({ id: `link-${Date.now()}-2`, text: b.content.link2, targetPageId: null });
                  if (b.content.link3) b.content.links.push({ id: `link-${Date.now()}-3`, text: b.content.link3, targetPageId: null });
                }
                if (b.children) b.children = migrateBlocks(b.children);
                return b;
              });

              if (activeStore.config.blocks && Array.isArray(activeStore.config.blocks)) {
                if (activeStore.config.blocks.length > 0 && activeStore.config.blocks[0].name !== undefined) {
                  const migratedPages = activeStore.config.blocks.map((p: any) => ({ ...p, blocks: migrateBlocks(p.blocks || []) }));
                  setPages(migratedPages);
                } else {
                  setPages([{ id: 'page-home', name: 'Főoldal', blocks: migrateBlocks(activeStore.config.blocks) }]);
                }
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
  }, [currentStoreId]);

  // --- ÚJ: Bolt megosztása függvény (Kikerült a handleSave-ből a helyére) ---
  const handleShareStore = () => {
    // Generáljuk a publikus linket (a jelenlegi domain + /shop/ + storeId)
    const publicUrl = `${window.location.origin}/shop/${storeId}`;
    
    // Vágólapra másoljuk
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert(`✅ A bolt linkje sikeresen másolva a vágólapra!\n\nEzt a linket küldheted a vásárlóknak:\n${publicUrl}`);
    }).catch(err => {
      // Biztonsági tartalék, ha a böngésző blokkolná a másolást
      alert(`A te publikus boltod linkje:\n${publicUrl}`);
    });
  };

  // --- A VÉGSŐ DOM SZKENNER MENTÉSHEZ ---
  const handleSave = async () => {
    if (!storeId) return;

    // Végigszkenneli a HTML-t, és kiolvassa az összes aktuális képernyőméretet mentés előtt!
    const forceSyncDOMToState = (): Page[] => {
      const syncBlocks = (blocks: PageBlock[]): PageBlock[] => blocks.map(b => {
        const el = document.getElementById(b.id);
        const newStyles = { ...b.styles };
        if (el) {
          if (el.style.width) newStyles.width = el.style.width;
          if (el.style.height) newStyles.height = el.style.height;
        }
        return { ...b, styles: newStyles, children: b.children ? syncBlocks(b.children) : undefined };
      });
      return pages.map(p => {
        if (p.id === pages[currentPageIndex].id) return { ...p, blocks: syncBlocks(p.blocks) };
        return p;
      });
    };

    const pagesToSave = forceSyncDOMToState();
    setPages(pagesToSave); // Frissítjük a látható állapotot is

    try {
      const response = await fetch(`http://localhost:3000/store/${storeId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ config: { ...config, blocks: pagesToSave } }) 
      });

      if (response.ok) {
        setToastState({ msg: '🎉 A teljes bolt sikeresen mentve az adatbázisba!', type: 'success' });
        setTimeout(() => setToastState(null), 3000);
      } else {
        const errorData = await response.json();
        const errorMsg = Array.isArray(errorData.message) ? errorData.message[0] : (errorData.message || 'Hiba történt a mentés során!');
        setToastState({ msg: `❌ ${errorMsg}`, type: 'error' });
        setTimeout(() => setToastState(null), 5000);
      }
    } catch (error) {
      console.error(error);
      setToastState({ msg: '❌ Szerver hiba', type: 'error' });
      setTimeout(() => setToastState(null), 5000);
    }
  };

  const addNewPage = () => {
    const newPage: Page = { id: `page-${Date.now()}`, name: `Új lap ${pages.length + 1}`, blocks: [] };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
    setSelectedBlockId(null);
  };

  const updatePageName = (newName: string) => {
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].name = newName;
    setPages(updatedPages);
  };

  const handleDragStart = (e: React.DragEvent, blockType: BlockType) => e.dataTransfer.setData('blockType', blockType);
  const handleDragOverCanvas = (e: React.DragEvent) => { e.preventDefault(); setIsHoveringCanvas(true); };
  const handleDragLeaveCanvas = () => setIsHoveringCanvas(false);

  // --- DROP LOGIKA BEÉPÍTETT DOM SZKENNERREL ---
  const handleDrop = (e: React.DragEvent, parentId: string | null = null) => {
    e.preventDefault(); e.stopPropagation(); 
    setIsHoveringCanvas(false); setHoveredBoxId(null);
    const blockType = e.dataTransfer.getData('blockType') as BlockType;
    const existingBlockId = e.dataTransfer.getData('existingBlockId');

    // 1. Azonnal rögzítjük a dobozok méreteit, ahogy elengeded az egeret!
    const forceSyncBlocks = (blocks: PageBlock[]): PageBlock[] => blocks.map(b => {
      const domEl = document.getElementById(b.id);
      const newStyles = { ...b.styles };
      if (domEl) {
        if (domEl.style.width) newStyles.width = domEl.style.width;
        if (domEl.style.height) newStyles.height = domEl.style.height;
      }
      return { ...b, styles: newStyles, children: b.children ? forceSyncBlocks(b.children) : undefined };
    });
    
    let syncedBlocks = forceSyncBlocks(pageBlocks);
    let dropLeft = 0; let dropTop = 0;

    if (parentId) {
      const el = document.getElementById(parentId);
      if (el) {
        const rect = el.getBoundingClientRect();
        const offsetX = parseFloat(e.dataTransfer.getData('offsetX') || '0');
        const offsetY = parseFloat(e.dataTransfer.getData('offsetY') || '0');
        dropLeft = e.clientX - rect.left - offsetX; dropTop = e.clientY - rect.top - offsetY;
        if (dropLeft < 0) dropLeft = 0; if (dropTop < 0) dropTop = 0;
      }
    }

    if (existingBlockId) {
      let foundBlock: PageBlock | undefined = undefined;
      const removeRecursive = (blocks: PageBlock[]): PageBlock[] => blocks.filter(b => {
        if (b.id === existingBlockId) { foundBlock = b; return false; }
        if (b.children) b.children = removeRecursive(b.children);
        return true;
      });
      let newBlocks = removeRecursive(syncedBlocks);
      
      if (foundBlock && parentId) {
        const blockToMove = foundBlock as PageBlock;
        blockToMove.styles = { ...blockToMove.styles, position: 'absolute', left: `${dropLeft}px`, top: `${dropTop}px`, margin: '0' };
        const addRecursive = (blocks: PageBlock[]): PageBlock[] => blocks.map(b => {
          if (b.id === parentId) return { ...b, children: [...(b.children || []), blockToMove] };
          if (b.children) return { ...b, children: addRecursive(b.children) };
          return b;
        });
        newBlocks = addRecursive(newBlocks);
      }
      setPageBlocks(newBlocks);
      return;
    }
    
    if (blockType) {
      const newId = `block-${Date.now()}`;
      let newBlock: PageBlock = { 
        id: newId, type: blockType, content: { targetPageId: null },
        styles: { backgroundColor: 'transparent', textAlign: 'center', fontWeight: 'normal', fontStyle: 'normal', textColor: '#d1d5db', fontFamily: 'sans-serif', ...(parentId ? { position: 'absolute', left: `${dropLeft}px`, top: `${dropTop}px`, margin: '0' } : {}) },
        children: blockType === 'EMPTY_BOX' ? [] : undefined
      };
      
      switch (blockType) {
        case 'HERO': newBlock.content = { title: 'Új Főcím', subtitle: 'Ide jön a leírás...' }; break;
        case 'TEXT': newBlock.content = { text: 'Szabadon formázható szöveg.' }; break;
        case 'PRODUCT_GRID': newBlock.content = { title: 'Kiemelt Termékek', productIds: [] }; break;
        case 'NAV': newBlock.content = { links: [{ id: `link-${Date.now()}-1`, text: 'Főoldal', targetPageId: null }, { id: `link-${Date.now()}-2`, text: 'Termékek', targetPageId: null }] }; break;
        case 'IMAGE': newBlock.content = { url: '', caption: 'Kép' }; break;
        case 'LOGO': newBlock.content = { url: '', text: 'MYSTORE' }; break;
        case 'BUTTON': newBlock.content = { text: 'Kattints Rám' }; break;
        case 'VIDEO': newBlock.content = { title: 'Videó címe' }; break;
        case 'REVIEWS': newBlock.content = { title: 'Értékelések' }; break;
        case 'EMPTY_BOX': 
          newBlock.content = { placeholder: '' }; 
          newBlock.styles.height = '300px'; 
          break;
      }

      if (parentId) {
         setPageBlocks(syncedBlocks.map(b => {
            if (b.id === parentId && b.type === 'EMPTY_BOX') {
              return { ...b, children: [...(b.children || []), newBlock] };
            }
            return b;
         }));
      } else {
         setPageBlocks([...syncedBlocks, newBlock]);
      }
      
      setSelectedBlockId(newId);
      setActiveTab('settings');
    }
  };

  const selectBlock = (e: React.MouseEvent, id: string) => { e.stopPropagation(); setSelectedBlockId(id); setActiveTab('settings'); };
  const deselectAll = () => setSelectedBlockId(null);

  const removeBlock = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    let newBlocks = pageBlocks.filter(block => block.id !== id);
    newBlocks = newBlocks.map(block => (block.children ? { ...block, children: block.children.filter(child => child.id !== id) } : block));
    setPageBlocks(newBlocks);
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (e: React.MouseEvent, id: string, direction: 'UP' | 'DOWN') => {
    e.preventDefault(); e.stopPropagation();
    const topIndex = pageBlocks.findIndex(b => b.id === id);
    if (topIndex !== -1) {
      const newBlocks = [...pageBlocks];
      if (direction === 'UP' && topIndex > 0) { [newBlocks[topIndex - 1], newBlocks[topIndex]] = [newBlocks[topIndex], newBlocks[topIndex - 1]]; } 
      else if (direction === 'DOWN' && topIndex < newBlocks.length - 1) { [newBlocks[topIndex + 1], newBlocks[topIndex]] = [newBlocks[topIndex], newBlocks[topIndex + 1]]; }
      setPageBlocks(newBlocks);
      return;
    }
    const newBlocks = pageBlocks.map(block => {
      if (block.children) {
        const childIndex = block.children.findIndex(c => c.id === id);
        if (childIndex !== -1) {
          const newChildren = [...block.children];
          if (direction === 'UP' && childIndex > 0) { [newChildren[childIndex - 1], newChildren[childIndex]] = [newChildren[childIndex], newChildren[childIndex - 1]]; } 
          else if (direction === 'DOWN' && childIndex < newChildren.length - 1) { [newChildren[childIndex + 1], newChildren[childIndex]] = [newChildren[childIndex], newChildren[childIndex + 1]]; }
          return { ...block, children: newChildren };
        }
      }
      return block;
    });
    setPageBlocks(newBlocks);
  };

  const updateSelectedBlock = (key: string, value: any, isStyle = false) => {
    setPageBlocks(prevBlocks => prevBlocks.map(b => {
      if (b.id === selectedBlockId) return isStyle ? { ...b, styles: { ...b.styles, [key]: value } } : { ...b, content: { ...b.content, [key]: value } };
      if (b.children) {
        const updateRecursive = (children: PageBlock[]): PageBlock[] => children.map(c => {
          if (c.id === selectedBlockId) return isStyle ? { ...c, styles: { ...c.styles, [key]: value } } : { ...c, content: { ...c.content, [key]: value } };
          if (c.children) return { ...c, children: updateRecursive(c.children) };
          return c;
        });
        return { ...b, children: updateRecursive(b.children) };
      }
      return b;
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
    const findRecursive = (blocks: PageBlock[]): PageBlock | undefined => {
      for (const b of blocks) {
        if (b.id === selectedBlockId) return b;
        if (b.children) { const found = findRecursive(b.children); if (found) return found; }
      }
      return undefined;
    };
    return findRecursive(pageBlocks);
  };
  const selectedBlock = findSelectedBlock();

  // Eszköz a méret valós idejű szinkronizálására egerészés után
  const handleResizeEnd = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const newWidth = el.style.width;
    const newHeight = el.style.height;

    if (!newWidth && !newHeight) return;

    setPageBlocks(prevBlocks => {
      let changed = false;
      const updateRecursive = (blocks: PageBlock[]): PageBlock[] => blocks.map(b => {
        if (b.id === id) {
          if (b.styles.width !== newWidth || b.styles.height !== newHeight) {
            changed = true;
            return { ...b, styles: { ...b.styles, width: newWidth, height: newHeight } };
          }
        }
        if (b.children) return { ...b, children: updateRecursive(b.children) };
        return b;
      });
      const nextBlocks = updateRecursive(prevBlocks);
      return changed ? nextBlocks : prevBlocks;
    });
  };

  const getRouteableItems = () => {
    const items: { id: string, type: string, label: string, target: string | null }[] = [];
    pageBlocks.flatMap(b => [b, ...(b.children || [])]).forEach(b => {
      if (b.type === 'BUTTON') items.push({ id: b.id, type: 'BUTTON', label: b.content.text || 'Gomb', target: b.content.targetPageId });
      else if (b.type === 'IMAGE') items.push({ id: b.id, type: 'IMAGE', label: b.content.caption || 'Kép', target: b.content.targetPageId });
      else if (b.type === 'NAV' && b.content.links) {
        b.content.links.forEach((link: any) => {
          items.push({ id: link.id, type: 'NAV_LINK', label: link.text || 'Link', target: link.targetPageId });
        });
      }
    });
    return items;
  };
  const routeableItems = getRouteableItems();

  const renderBlock = (block: PageBlock, isNested = false) => {
    const isSelected = block.id === selectedBlockId;
    const isHoveringThisBox = hoveredBoxId === block.id;
    const bgStyle = block.styles.backgroundColor === 'transparent' ? 'transparent' : block.styles.backgroundColor;
    const alignClass = block.styles.textAlign === 'left' ? 'justify-start items-start text-left' : block.styles.textAlign === 'right' ? 'justify-end items-end text-right' : 'justify-center items-center text-center';
    
    const textColorStyle = block.styles.textColor || '#d1d5db';
    const fontFamilyStyle = block.styles.fontFamily || 'sans-serif';

    return (
      <div 
        id={block.id} // FONTOS: A DOM szkenner ez alapján találja meg!
        key={block.id} 
        draggable={isNested}
        onDragStart={(e) => {
          if (isNested) {
            e.stopPropagation(); e.dataTransfer.setData('existingBlockId', block.id);
            const rect = e.currentTarget.getBoundingClientRect();
            e.dataTransfer.setData('offsetX', (e.clientX - rect.left).toString());
            e.dataTransfer.setData('offsetY', (e.clientY - rect.top).toString());
          }
        }}
        onClick={(e) => selectBlock(e, block.id)} 
        // Ezek a hookok gondoskodnak az azonnali állapotmentésről
        onPointerUp={(e) => { e.stopPropagation(); handleResizeEnd(block.id); }}
        onPointerLeave={(e) => { e.stopPropagation(); handleResizeEnd(block.id); }}
        className={`${isNested ? 'relative m-1 group cursor-pointer transition-colors duration-300 rounded-xl border-2 flex flex-col bg-white/5' : 'relative group cursor-pointer transition-colors duration-300 rounded-[2rem] border-2 flex flex-col w-full'} ${isSelected ? 'ring-4 ring-blue-500 shadow-2xl z-20' : 'border-transparent hover:border-white/10'}`} 
        style={{ 
          backgroundColor: bgStyle, resize: isNested ? 'both' : 'vertical', overflow: 'hidden', 
          width: block.styles.width || (isNested ? 'auto' : '100%'), height: block.styles.height || 'auto', minHeight: isNested ? '50px' : '100px',
          position: block.styles.position as any || 'relative', left: block.styles.left, top: block.styles.top, margin: block.styles.position === 'absolute' ? '0' : undefined
        }}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 z-[100] flex gap-1 bg-slate-900/95 p-1.5 rounded-lg border border-white/10 shadow-xl backdrop-blur-md">
            {!isNested && (
              <>
                <button onClick={(e) => moveBlock(e, block.id, 'UP')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition cursor-pointer">↑</button>
                <button onClick={(e) => moveBlock(e, block.id, 'DOWN')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition cursor-pointer">↓</button>
                <div className="w-px bg-white/10 mx-1"></div>
              </>
            )}
            <button onClick={(e) => removeBlock(e, block.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition cursor-pointer text-xs font-bold">🗑️</button>
          </div>
        )}

        {block.type === 'HERO' && (
          <header className={`relative py-24 px-12 rounded-[2rem] w-full flex flex-col h-full ${alignClass}`}>
            {block.styles.backgroundColor === 'transparent' && <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${config.secondaryColor}, transparent)` }}></div>}
            <div className="absolute top-0 right-0 w-2/3 h-full blur-[120px] rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: config.primaryColor }}></div>
            <div className="relative z-10 w-full h-full flex flex-col justify-inherit">
              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] w-full" dangerouslySetInnerHTML={{ __html: block.content.title.replace(/\n/g, '<br/>') }}></h1>
              <p className="text-xl whitespace-pre-wrap w-full" style={{ color: textColorStyle, fontFamily: fontFamilyStyle }}>{block.content.subtitle}</p>
            </div>
          </header>
        )}

        {block.type === 'TEXT' && (
          <div className={`p-8 w-full flex flex-col h-full ${alignClass}`}>
            <p className="text-lg whitespace-pre-wrap w-full" style={{ fontWeight: block.styles.fontWeight, fontStyle: block.styles.fontStyle, color: textColorStyle, fontFamily: fontFamilyStyle }}>{block.content.text}</p>
          </div>
        )}

        {block.type === 'LOGO' && (
          <div className={`p-4 w-full h-full flex ${alignClass}`}>
             {block.content.url ? (
               <img src={block.content.url} alt="Logo" className="h-full w-full object-contain pointer-events-none" />
             ) : (
               <h2 className="font-black text-4xl tracking-tighter text-white">{block.content.text}</h2>
             )}
          </div>
        )}

        {block.type === 'BUTTON' && (
          <div className={`p-6 w-full h-full flex ${alignClass}`}>
            <button className="px-8 py-4 text-white rounded-xl font-black shadow-lg hover:scale-105 transition w-auto pointer-events-none" style={{ backgroundColor: config.primaryColor }}>{block.content.text}</button>
          </div>
        )}

        {block.type === 'NAV' && (
          <nav className={`p-6 w-full flex flex-col md:flex-row gap-6 border-b border-white/5 flex-wrap h-full ${alignClass}`}>
            <div className={`flex gap-8 text-sm font-bold text-gray-400 w-full ${alignClass}`}>
               {(block.content.links || []).map((link: any, index: number) => (
                 <span key={link.id} className={index === 0 ? "text-white transition" : "hover:text-white transition"}>{link.text}</span>
               ))}
            </div>
          </nav>
        )}

        {block.type === 'EMPTY_BOX' && (
          <div 
            className={`w-full h-full p-6 rounded-[2rem] transition-all relative ${isHoveringThisBox ? 'bg-blue-500/20 border-2 border-dashed border-blue-400' : 'border border-dashed border-white/20'}`}
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
                if (selectedIds.length === 0) return <p className="text-gray-500 col-span-4 text-center py-10 border border-dashed border-white/10 rounded-2xl">Még nem adtál hozzá terméket ehhez a rácshoz. Válaszd ki őket a Beállításoknál!</p>;
                
                let displayProducts = products.filter(p => selectedIds.includes(p.id));
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
              <img src={block.content.url} alt="User Upload" className={`w-full h-full object-cover rounded-xl mb-3 pointer-events-none ${block.styles.textAlign === 'center' ? 'mx-auto' : block.styles.textAlign === 'right' ? 'ml-auto' : ''}`} />
            ) : (
               <div className="w-full min-h-[200px] h-full bg-white/5 border border-dashed border-white/20 rounded-xl flex items-center justify-center text-gray-500 pointer-events-none">Tölts fel egy képet!</div>
            )}
            <p className="text-gray-500 text-sm w-full pointer-events-none">{block.content.caption}</p>
          </div>
        )}

      </div>
    );
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center text-white bg-[#000b1a]">Bolt betöltése...</div>;

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-[#000b1a] text-white overflow-hidden rounded-xl border border-blue-900/30 relative">
      
      {toastState && (
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[200] backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl font-bold animate-in slide-in-from-top-4 flex items-center gap-2 border ${toastState.type === 'success' ? 'bg-green-600/90 shadow-green-500/20 border-green-400/30' : 'bg-red-600/90 shadow-red-500/20 border-red-400/30'}`}>
          {toastState.msg}
        </div>
      )}

      <aside className="w-80 bg-[#001529] border-r border-blue-900/40 flex flex-col z-20 shadow-2xl shrink-0 relative">
        <div className="flex border-b border-blue-900/30 bg-[#000b1a]/50 shrink-0">
          <button onClick={() => setActiveTab('blocks')} className={`flex-1 py-3 text-[9px] font-bold uppercase transition ${activeTab === 'blocks' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-500'}`}>🧱 Blokkok</button>
          <button onClick={() => setActiveTab('navigation')} className={`flex-1 py-3 text-[9px] font-bold uppercase transition ${activeTab === 'navigation' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-500'}`}>🧭 Navigáció</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-3 text-[9px] font-bold uppercase transition ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-gray-500'}`}>⚙️ Beállítás</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar pb-24">
          
          {activeTab === 'blocks' && (
             <div className="space-y-6">
               <div>
                 <p className="text-[10px] text-blue-500 font-black mb-3 tracking-[0.2em]">ALAP ELEMEK (HÚZD BE!)</p>
                 <div className="grid grid-cols-2 gap-2">
                   <div draggable onDragStart={(e) => handleDragStart(e, 'EMPTY_BOX')} className="col-span-2 p-3 bg-blue-600/20 border border-dashed border-blue-500/50 rounded-lg text-[10px] font-bold text-center cursor-grab hover:bg-blue-600/40 transition">📦 Üres Doboz (Konténer)</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'LOGO')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">👑 Logó</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'NAV')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">🧭 Menü Linkek</div>
                   <div draggable onDragStart={(e) => handleDragStart(e, 'HERO')} className="p-3 bg-slate-800/40 border border-white/5 rounded-lg text-[10px] text-center cursor-grab hover:border-blue-500/50 transition">🚀 Főcím (Hero)</div>
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

          {activeTab === 'navigation' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6">
                <span className="text-xl block mb-2">🗺️</span>
                <p className="text-[10px] text-blue-200 uppercase leading-relaxed font-bold tracking-widest">Köss össze gombokat oldalakkal!</p>
              </div>

              <div>
                <p className="text-[10px] text-blue-500 font-black mb-3 tracking-[0.2em]">1. VÁLASSZ FORRÁST</p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {routeableItems.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Nincs gomb vagy menü link az oldalon.</p>
                  ) : (
                    routeableItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => setNavSourceId(item.id)} 
                        className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center transition ${navSourceId === item.id ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-slate-800/50 hover:bg-white/5'}`}
                      >
                        <span className="text-xs font-bold truncate pr-2">
                          {item.type === 'BUTTON' ? '🔘' : item.type === 'IMAGE' ? '🖼️' : '🧭'} {item.label}
                        </span>
                        {item.target && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">🔗 {pages.find(p => p.id === item.target)?.name || 'Csatolva'}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {navSourceId && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-center mb-2"><div className="w-px h-8 border-l-2 border-dashed border-white/40"></div></div>
                  <p className="text-[10px] text-blue-500 font-black mb-3 tracking-[0.2em]">2. VÁLASZD KI A CÉLOLDALT</p>
                  <div className="space-y-2">
                    {pages.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => {
                          const updateTargetRecursive = (blocks: PageBlock[]): PageBlock[] => blocks.map(b => {
                            if (b.id === navSourceId) return { ...b, content: { ...b.content, targetPageId: p.id } };
                            if (b.type === 'NAV' && b.content.links) {
                              const hasLink = b.content.links.some((l: any) => l.id === navSourceId);
                              if (hasLink) return { ...b, content: { ...b.content, links: b.content.links.map((l: any) => l.id === navSourceId ? { ...l, targetPageId: p.id } : l) } };
                            }
                            if (b.children) return { ...b, children: updateTargetRecursive(b.children) };
                            return b;
                          });
                          setPageBlocks(updateTargetRecursive(pageBlocks));
                          setNavSourceId(null);
                        }} 
                        className="p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-blue-600 transition-all font-bold text-xs flex justify-between group border border-white/10"
                      >
                        <span>📄 {p.name}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Összekötés 🔗</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {!selectedBlockId ? (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                     <p className="text-xs font-black text-blue-400 uppercase tracking-widest">BOLT BEÁLLÍTÁSAI</p>
                  </div>
                  <div className="space-y-4 bg-white/5 p-5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] mb-4">GLOBÁLIS SZÍNEK</p>
                    <div><label className="text-[10px] text-gray-500 block mb-2 font-bold uppercase">Főszín (Gombok)</label><input type="color" value={config.primaryColor} onChange={(e) => setConfig({...config, primaryColor: e.target.value})} className="w-full h-10 rounded cursor-pointer bg-transparent" /></div>
                    <div><label className="text-[10px] text-gray-500 block mb-2 font-bold uppercase">Másodlagos Szín</label><input type="color" value={config.secondaryColor} onChange={(e) => setConfig({...config, secondaryColor: e.target.value})} className="w-full h-10 rounded cursor-pointer bg-transparent" /></div>
                    <div><label className="text-[10px] text-gray-500 block mb-2 font-bold uppercase">Háttérszín</label><input type="color" value={config.backgroundColor} onChange={(e) => setConfig({...config, backgroundColor: e.target.value})} className="w-full h-10 rounded cursor-pointer bg-transparent" /></div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
                    <span className="text-xl">ℹ️</span>
                    <p className="text-xs text-blue-200">Kattints egy elemre a vásznon, hogy itt megjelenjenek a saját beállításai!</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                     <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{selectedBlock?.type} BEÁLLÍTÁSOK</p>
                     <button onClick={deselectAll} className="text-xs text-gray-500 hover:text-white">✕ Vissza</button>
                  </div>

                  <div className="mb-6 space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase">Pozíció / Igazítás</label>
                      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg">
                        <button onClick={() => updateSelectedBlock('textAlign', 'left', true)} className={`flex-1 py-2 text-xs rounded ${selectedBlock?.styles.textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>Bal</button>
                        <button onClick={() => updateSelectedBlock('textAlign', 'center', true)} className={`flex-1 py-2 text-xs rounded ${selectedBlock?.styles.textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>Közép</button>
                        <button onClick={() => updateSelectedBlock('textAlign', 'right', true)} className={`flex-1 py-2 text-xs rounded ${selectedBlock?.styles.textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>Jobb</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase mt-4">Háttérszín</label>
                      <div className="flex gap-2">
                        <input type="color" value={selectedBlock?.styles.backgroundColor === 'transparent' ? '#000000' : selectedBlock?.styles.backgroundColor} onChange={(e) => updateSelectedBlock('backgroundColor', e.target.value, true)} className="w-10 h-10 rounded cursor-pointer bg-transparent" />
                        <button onClick={() => updateSelectedBlock('backgroundColor', 'transparent', true)} className="flex-1 bg-slate-900 border border-white/5 rounded-lg text-xs hover:bg-white/10 transition text-gray-400">Átlátszó</button>
                      </div>
                    </div>
                  </div>

                  {selectedBlock?.type === 'HERO' && (
                    <div className="space-y-4">
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">FŐCÍM</label><textarea value={selectedBlock.content.title} onChange={(e) => updateSelectedBlock('title', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white h-20" /></div>
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">ALCÍM</label><textarea value={selectedBlock.content.subtitle} onChange={(e) => updateSelectedBlock('subtitle', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white h-16" /></div>
                    </div>
                  )}

                  {selectedBlock?.type === 'TEXT' && (
                    <div className="space-y-4">
                         <div>
                           <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase">Betűtípus</label>
                           <select 
                             value={selectedBlock.styles.fontFamily || 'sans-serif'} 
                             onChange={(e) => updateSelectedBlock('fontFamily', e.target.value, true)}
                             className="w-full bg-slate-900 border border-white/10 rounded p-2 text-xs text-white"
                           >
                             <option value="sans-serif">Sans-Serif (Modern)</option>
                             <option value="serif">Serif (Elegáns)</option>
                             <option value="monospace">Mono (Kód)</option>
                           </select>
                         </div>
                         <div className="flex gap-4">
                           <div className="flex-1">
                             <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase">Szövegszín</label>
                             <input type="color" value={selectedBlock.styles.textColor || '#d1d5db'} onChange={(e) => updateSelectedBlock('textColor', e.target.value, true)} className="w-full h-10 rounded cursor-pointer bg-transparent" />
                           </div>
                           <div>
                             <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase">Stílus</label>
                             <div className="flex gap-2">
                                <button onClick={() => updateSelectedBlock('fontWeight', selectedBlock.styles.fontWeight === 'bold' ? 'normal' : 'bold', true)} className={`w-10 h-10 flex items-center justify-center font-black border border-white/10 rounded hover:bg-white/10 ${selectedBlock.styles.fontWeight === 'bold' ? 'bg-blue-600 border-blue-500' : ''}`}>B</button>
                                <button onClick={() => updateSelectedBlock('fontStyle', selectedBlock.styles.fontStyle === 'italic' ? 'normal' : 'italic', true)} className={`w-10 h-10 flex items-center justify-center italic font-serif border border-white/10 rounded hover:bg-white/10 ${selectedBlock.styles.fontStyle === 'italic' ? 'bg-blue-600 border-blue-500' : ''}`}>I</button>
                             </div>
                           </div>
                         </div>
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">SZÖVEG TARTALMA</label><textarea value={selectedBlock.content.text} onChange={(e) => updateSelectedBlock('text', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white h-48" /></div>
                    </div>
                  )}

                  {selectedBlock?.type === 'BUTTON' && (
                    <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">GOMB SZÖVEG</label><input type="text" value={selectedBlock.content.text} onChange={(e) => updateSelectedBlock('text', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                  )}

                  {selectedBlock?.type === 'LOGO' && (
                    <div className="space-y-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                        <label className="text-[10px] text-blue-400 block mb-2 font-bold uppercase">Logó feltöltése</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'url')} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer" />
                      </div>
                      <div className="text-center text-xs text-gray-600 font-bold">VAGY</div>
                      <div><label className="text-[10px] text-gray-500 block mb-2 font-bold">LOGÓ SZÖVEG</label><input type="text" value={selectedBlock.content.text} onChange={(e) => updateSelectedBlock('text', e.target.value)} className="w-full bg-slate-800/40 border-white/5 rounded-lg p-3 text-xs text-white" /></div>
                    </div>
                  )}

                  {selectedBlock?.type === 'IMAGE' && (
                    <div className="space-y-4">
                       <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                        <label className="text-[10px] text-blue-400 block mb-2 font-bold uppercase">Kép feltöltése</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'url')} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer" />
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
                          {products.length === 0 ? (
                            <p className="text-xs text-gray-500 py-4 text-center border border-dashed border-white/10 rounded-lg">Még nincs termék a boltodban.</p>
                          ) : (
                            products.map(p => (
                              <label key={p.id} className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                                <input type="checkbox" checked={(selectedBlock.content.productIds || []).includes(p.id)} onChange={(e) => {
                                  const current = selectedBlock.content.productIds || [];
                                  updateSelectedBlock('productIds', e.target.checked ? [...current, p.id] : current.filter((id: string) => id !== p.id));
                                }} className="rounded bg-slate-900 w-4 h-4 cursor-pointer" />
                                <span className="text-xs text-white truncate flex-1">{p.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedBlock?.type === 'NAV' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Menü Linkek</label>
                        <button 
                          onClick={() => {
                            const newLinks = [...(selectedBlock.content.links || []), { id: `link-${Date.now()}`, text: 'Új Link', targetPageId: null }];
                            updateSelectedBlock('links', newLinks);
                          }}
                          className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition"
                        >+ HOZZÁAD</button>
                      </div>
                      
                      <div className="space-y-2">
                        {(selectedBlock.content.links || []).map((link: any, index: number) => (
                          <div key={link.id} className="flex gap-2 items-center bg-slate-800/40 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] text-gray-500 w-4 text-center">{index + 1}.</span>
                            <input 
                              type="text" 
                              value={link.text} 
                              onChange={(e) => {
                                const newLinks = [...selectedBlock.content.links];
                                newLinks[index].text = e.target.value;
                                updateSelectedBlock('links', newLinks);
                              }} 
                              className="flex-1 bg-transparent border-none focus:outline-none text-xs text-white" 
                            />
                            <button 
                              onClick={() => {
                                const newLinks = selectedBlock.content.links.filter((l: any) => l.id !== link.id);
                                updateSelectedBlock('links', newLinks);
                              }}
                              className="text-gray-500 hover:text-red-500 px-2 text-xs transition"
                              title="Törlés"
                            >✕</button>
                          </div>
                        ))}
                        {(selectedBlock.content.links || []).length === 0 && (
                          <p className="text-xs text-gray-500 italic text-center py-2">Nincsenek linkek a menüben.</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-5 border-t border-blue-900/30 bg-[#000b1a]/95 z-30 shrink-0">
          <button onClick={handleSave} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">MENTÉS ADATBÁZISBA</button>
        </div>
      </aside>

      <section 
        className="flex-1 flex flex-col overflow-y-auto relative transition-colors duration-500" 
        style={{ backgroundColor: config.backgroundColor }}
        onClick={deselectAll}
      >
        <div className="h-12 bg-[#001529]/95 border-b border-white/5 flex justify-between items-center px-6 sticky top-0 z-30 shadow-md">
           <div className="flex items-center gap-2">
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Szerkesztés:</span>
             <input 
               value={pages[currentPageIndex]?.name || ''} 
               onChange={(e) => updatePageName(e.target.value)} 
               className="bg-transparent border-none text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:bg-white/5 px-2 py-1 rounded w-40 focus:outline-none"
             />
           </div>
           
           <button 
             onClick={handleShareStore}
             className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-black uppercase hover:bg-blue-600/40 hover:scale-105 transition-all shadow-lg shadow-blue-900/20"
           >
             <span className="text-sm">🔗</span> Link Másolása
           </button>
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
              <h2 className="text-2xl font-black text-white mb-2">Az {pages[currentPageIndex]?.name} oldal üres.</h2>
              <p>Húzz be egy Üres Dobozt, és pakold tele!</p>
            </div>
          ) : (
            pageBlocks.map((block) => renderBlock(block, false))
          )}
        </div>
        
        {/* --- ÚJ LAPOZÓ SÁV A BUILDERBEN --- */}
        <div className="fixed bottom-6 left-1/2 flex items-center gap-2 bg-[#001529]/95 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl z-50 transform ml-40">
           <span className="text-[9px] text-gray-500 font-bold px-3 border-r border-white/10 uppercase">OLDALAK:</span>

           {/* Előző gomb */}
           <button 
             disabled={currentPageIndex === 0}
             onClick={(e) => { e.stopPropagation(); setCurrentPageIndex(currentPageIndex - 1); setSelectedBlockId(null); }}
             className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition"
           >
             ←
           </button>

           {/* Oldalszámok csoportosítva */}
           {pages
             .slice(currentGroup * pagesPerPage, (currentGroup * pagesPerPage) + pagesPerPage)
             .map((p, idx) => {
                const actualIndex = (currentGroup * pagesPerPage) + idx;
                const isActive = currentPageIndex === actualIndex;
                
                return (
                  <button 
                    key={p.id} 
                    onClick={(e) => { e.stopPropagation(); setCurrentPageIndex(actualIndex); setSelectedBlockId(null); }} 
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                    }`}
                    title={p.name}
                  >
                    {actualIndex + 1}
                  </button>
                );
             })
           }

           {/* Ha van még több csoport */}
           {totalPages > (currentGroup * pagesPerPage) + pagesPerPage && (
             <span className="text-gray-500 font-bold px-1 text-xs">...</span>
           )}

           {/* Következő gomb */}
           <button 
             disabled={currentPageIndex === totalPages - 1}
             onClick={(e) => { e.stopPropagation(); setCurrentPageIndex(currentPageIndex + 1); setSelectedBlockId(null); }}
             className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition"
           >
             →
           </button>

           <div className="w-px h-6 bg-white/10 mx-1"></div>

           {/* Új lap hozzáadása */}
           <button 
             onClick={(e) => { e.stopPropagation(); addNewPage(); }} 
             className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-600/40 transition flex items-center justify-center text-lg"
             title="Új oldal hozzáadása"
           >
             +
           </button>
        </div>

      </section>
    </div>
  );
}