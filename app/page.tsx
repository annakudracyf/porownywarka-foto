"use client";
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Camera, Video, Lamp, ShoppingCart, Plus, X, LayoutGrid, Table, ExternalLink, Search } from 'lucide-react';

export default function KatalogCyfroweUltraFix() {
  const [darkMode, setDarkMode] = useState(false);
  const [dzial, setDzial] = useState("Fotografia");
  const [podkategoria, setPodkategoria] = useState("Aparat");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"karty" | "tabela">("karty");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [licznik, setLicznik] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [produkty, setProdukty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pobieranie danych z Airtable
    const fetchData = async () => {
      try {
        const res = await fetch('/api/airtable');
        const data = await res.json();
        
        // Dane są już zmapowane na backendzie (route.ts)
        setProdukty(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Airtable data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const niebieski = "#00B7D1";
  const zolty = "#EEE800";

  const theme = {
    bg: darkMode ? "bg-[#171E19]" : "bg-[#F3F4F6]",
    card: darkMode ? "bg-[#1f2922]" : "bg-white",
    text: darkMode ? "text-slate-200" : "text-black",
    border: darkMode ? "border-slate-800" : "border-black",
    nav: darkMode ? "bg-[#171E19]" : "bg-white",
    shadow: darkMode ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    price: darkMode ? "text-white" : "text-[#003547]"
  };

  const handleTogglePorownaj = (p: any) => {
    const isRemoving = selectedProducts.some(x => x.id === p.id);
    setSelectedProducts(prev => isRemoving ? prev.filter(x => x.id !== p.id) : (prev.length < 3 ? [...prev, p] : prev));
    
    if (!isRemoving) {
      setLicznik(prev => prev + 1);
      console.log('Wysyłam dane do Airtable...');
      fetch('/api/airtable', { method: 'PATCH' })
        .catch(err => console.error(`Błąd Airtable: ${err}`));
    }
  };

  // Logika filtrowania
  const filteredProducts = produkty.filter(p => {
    const matchesDzial = p.dzial === dzial;
    const matchesPodkategoria = p.podkategoria === podkategoria;
    const matchesSearch = p.nazwa.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDzial && matchesPodkategoria && matchesSearch;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.bg} ${theme.text} font-sans antialiased`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00B7D1] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium uppercase italic tracking-widest text-[12px] font-heading">Ładowanie katalogu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg} ${theme.text} font-sans antialiased`}>

      {/* NAV BAR */}
      <nav className={`h-20 ${theme.nav} border-b-2 ${theme.border} flex items-center px-6 justify-between sticky top-0 z-50`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-white/20">
            <span className="font-black text-xl italic font-heading" style={{ color: niebieski }}>C</span>
          </div>
          <h1 className={`text-xl font-black uppercase tracking-widest ${theme.text} font-heading`}>
            Cyfrowe<span style={{ color: niebieski }}>.pl</span> KATALOG
          </h1>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 ${darkMode ? "bg-black" : "bg-white"} border-2 ${theme.border} ${theme.shadow} transition-all`}
        >
          {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-700" />}
        </button>
      </nav>

      <div className="max-w-[95%] mx-auto p-6 space-y-8 pb-32">

        {/* TOOLBAR */}
        <div className={`${theme.card} p-4 border-2 ${theme.border} ${theme.shadow} flex flex-col md:flex-row gap-4 justify-between items-center`}>
          <div className="flex bg-black border-2 border-black overflow-hidden">
            {[
              { name: "Fotografia", icon: Camera },
              { name: "Video", icon: Video },
              { name: "Studio", icon: Lamp },
            ].map((d) => {
              const Icon = d.icon;
              const isActive = dzial === d.name;
              return (
                <button
                  key={d.name}
                  onClick={() => { setDzial(d.name); setPodkategoria(d.name === "Studio" ? "Lampy" : "Aparat"); }}
                  className={`px-8 py-4 uppercase text-[14px] font-medium tracking-widest transition-all flex items-center gap-3 border-r-2 border-white/10 last:border-r-0 font-heading
                    ${isActive ? "bg-white text-black" : "bg-black text-white hover:bg-white/10"}`}
                >
                  <Icon size={22} strokeWidth={3} />
                  {d.name}
                </button>
              );
            })}
          </div>

          <div className={`flex border-2 ${theme.border} ${darkMode ? "bg-black" : "bg-white"} overflow-hidden`}>
            <button onClick={() => setViewMode("karty")} className={`p-3 flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest font-heading ${viewMode === "karty" ? (darkMode ? "bg-white text-black" : "bg-black text-white") : theme.text}`}>
              <LayoutGrid size={18} strokeWidth={2.5} /> Karty
            </button>
            <button onClick={() => setViewMode("tabela")} className={`p-3 flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest font-heading ${viewMode === "tabela" ? (darkMode ? "bg-white text-black" : "bg-black text-white") : theme.text}`}>
              <Table size={18} strokeWidth={2.5} /> Tabela
            </button>
          </div>
        </div>

        {/* WYSZUKIWARKA (SZYBKI FILTR) */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Szybkie wyszukiwanie aparatu (np. marka, model)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-5 pl-12 pr-6 bg-black text-slate-200 border-2 border-black focus:border-[#00B7D1] outline-none transition-all font-sans text-sm tracking-wide ${theme.shadow}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className={`bg-[#171E19] p-5 border-2 ${theme.border} ${theme.shadow}`}>
              <h3 className="font-medium uppercase text-[10px] mb-4 border-b border-[#00B7D1] pb-1 italic text-[#00B7D1] font-heading tracking-widest">Podkategorie</h3>
              <div className="space-y-1">
                {(dzial === "Studio" ? ["Lampy", "Tła", "Modyfikatory"] : ["Aparat", "Obiektyw", "Akcesoria"]).map(cat => (
                  <button key={cat} onClick={() => setPodkategoria(cat)}
                    className={`w-full text-left px-3 py-2 transition-all uppercase text-[11px] font-medium font-heading tracking-wider ${podkategoria === cat ? "text-black" : "text-white/70 hover:text-[#00B7D1]"}`}
                    style={{ backgroundColor: podkategoria === cat ? zolty : 'transparent' }}>{cat}</button>
                ))}
              </div>
            </div>

            {/* LICZNIK OSZCZĘDNOŚCI (SIDEBAR) */}
            <div className={`bg-black p-5 border-2 border-[#00B7D1] shadow-[4px_4px_0px_0px_#00B7D1] transition-all duration-300`}>
              <p className="text-[10px] font-medium uppercase tracking-widest font-heading text-[#00B7D1]">Oszczędność czasu:</p>
              <p className="text-2xl font-medium text-white mt-1 font-sans">
                {((licznik * 5) / 60).toFixed(1)} h
              </p>
              <p className="text-[8px] text-slate-500 uppercase mt-2 font-medium tracking-tighter">Dzięki porównaniom Cyfrowe.pl</p>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main>
            {viewMode === "karty" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProducts.some(x => x.id === p.id);
                  return (
                    <div key={p.id} className={`${theme.card} border-2 ${theme.border} ${theme.shadow} flex flex-col h-full overflow-hidden`}>
                      <div className={`h-40 ${darkMode ? "bg-black/40" : "bg-gray-100"} border-b-2 ${theme.border} flex items-center justify-center relative shrink-0`}>
                        <Camera size={40} className="opacity-10" />
                        <div className="absolute bottom-0 right-0 px-1.5 py-1 font-semibold text-[8px] uppercase border-l-2 border-t-2 border-black bg-[#EEE800] text-black font-heading tracking-widest leading-none">{p.marka}</div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex-grow">
                          <div className="mb-4">
                            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1 font-heading">{p.marka}</p>
                            <h3 className={`text-[18px] font-semibold uppercase leading-relaxed tracking-tight ${theme.text} font-heading min-h-[3.5rem] line-clamp-3`}>{p.nazwa}</h3>
                            <span className={`font-medium text-2xl mt-1 block ${theme.price} font-sans`}>{p.cena}</span>
                          </div>

                          <div className="space-y-0 text-[14px] border-t border-black/10 pt-2 mb-6">
                            {[
                              { label: "Marka", value: p.marka },
                              { label: "Mocowanie", value: p.mocowanie },
                              { label: "Rozmiar matrycy", value: p.matryca },
                              { label: "Akumulator", value: p.akumulator, highlight: p.akumulator !== "N/D" }
                            ].map((spec, idx) => (
                              <div key={idx} className={`flex justify-between py-2 border-b border-black/5 last:border-0 ${spec.highlight ? (darkMode ? "bg-[#00B7D1]/10 px-1 -mx-1" : "bg-[#00B7D1]/5 px-1 -mx-1") : ""}`}>
                                <span className={`font-bold uppercase ${darkMode ? "text-slate-400" : "text-slate-900"} text-[11px]`}>{spec.label}:</span>
                                <span className={`font-medium ${darkMode ? "text-white" : "text-black"} ${spec.highlight ? "text-[#00B7D1]" : ""}`}>{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          {/* PRZYCISK LINK */}
                          <a 
                            href={p.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 py-3 border border-white/20 bg-black text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-[10px] font-medium uppercase font-heading tracking-wider"
                          >
                            <ExternalLink size={14} /> LINK
                          </a>

                          <button onClick={() => handleTogglePorownaj(p)}
                            className={`flex-[2] py-3 border-2 ${theme.border} flex items-center justify-center gap-2 text-[10px] font-medium uppercase transition-all font-heading tracking-widest
                            ${isSelected ? "bg-[#EEE800] text-black" : "text-white bg-[#00B7D1]"}`}>
                            {isSelected ? <X size={16} /> : <Plus size={16} />} {isSelected ? "Usuń" : "Porównaj"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-20 text-center opacity-50 font-medium uppercase font-heading tracking-widest">Nie znaleziono produktów</div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`w-full text-left border-collapse border-2 ${theme.border} ${theme.card}`}>
                  <thead className={`${darkMode ? "bg-black/50" : "bg-gray-100"} border-b-2 ${theme.border}`}>
                    <tr>
                      <th className="p-5 text-[11px] uppercase font-bold font-heading tracking-widest text-slate-400 w-[80px]">Marka</th>
                      <th className="p-5 text-[11px] uppercase font-bold font-heading tracking-widest text-slate-400 min-w-[250px]">Nazwa</th>
                      <th className="p-5 text-[11px] uppercase font-bold font-heading tracking-widest text-slate-400 min-w-[120px]">Mocowanie</th>
                      <th className="p-5 text-[11px] uppercase font-bold font-heading tracking-widest text-slate-400 min-w-[140px]">Rozmiar matrycy</th>
                      <th className="p-5 text-[11px] uppercase font-bold font-heading tracking-widest text-slate-400 min-w-[140px]">Akumulator</th>
                      <th className="p-5 text-[11px] uppercase font-bold font-heading tracking-widest text-slate-400 min-w-[120px]">Cena</th>
                      <th className="p-5 text-[11px] uppercase font-bold font-heading tracking-widest text-slate-400 w-[180px] text-center">Akcja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const isSelected = selectedProducts.some(x => x.id === p.id);
                      return (
                        <tr key={p.id} className={`border-b ${theme.border} hover:${darkMode ? "bg-white/5" : "bg-black/5"} transition-colors`}>
                          <td className="p-5 text-[12px] font-bold text-slate-500 uppercase tracking-wider font-sans">{p.marka}</td>
                          <td className={`p-5 text-[18px] font-semibold font-heading tracking-tight leading-relaxed min-w-[250px] ${theme.text}`}>{p.nazwa}</td>
                          <td className={`p-5 text-[14px] font-bold font-sans min-w-[120px] ${darkMode ? "text-slate-100" : "text-slate-700"}`}>{p.mocowanie}</td>
                          <td className={`p-5 text-[14px] font-bold font-sans min-w-[140px] ${darkMode ? "text-white" : "text-black"}`}>{p.matryca}</td>
                          <td className={`p-5 text-[14px] font-bold font-sans min-w-[140px] ${darkMode ? "text-white" : "text-black"}`}>{p.akumulator}</td>
                          <td className={`p-5 text-[16px] font-bold ${theme.price} font-sans whitespace-nowrap min-w-[120px]`}>{p.cena}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <a 
                                href={p.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-2 border border-white/20 bg-black text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-[10px] font-medium uppercase font-heading tracking-wider"
                              >
                                <ExternalLink size={14} /> LINK
                              </a>
                              <button onClick={() => handleTogglePorownaj(p)}
                                className={`px-4 py-2 border-2 ${theme.border} text-[10px] font-medium uppercase transition-all font-heading tracking-widest
                                ${isSelected ? "bg-[#EEE800] text-black" : "text-white bg-[#00B7D1]"}`}>
                                {isSelected ? "Usuń" : "Porównaj"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* STICKY COMPARISON BAR */}
      {selectedProducts.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${theme.nav} border-t-4 border-[#00B7D1] shadow-[0_-10px_20px_rgba(0,0,0,0.2)] transition-all animate-in slide-in-from-bottom duration-300`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-medium uppercase italic text-[#00B7D1] font-heading tracking-widest">Wybrane ({selectedProducts.length}/3):</p>
              <div className="flex gap-2">
                {selectedProducts.map(p => (
                  <div key={p.id} className="bg-black text-slate-200 px-3 py-1 text-[10px] font-medium border border-white/20 flex items-center gap-2 font-sans tracking-widest">
                    {p.nazwa}
                    <button onClick={() => handleTogglePorownaj(p)} className="hover:text-[#00B7D1] transition-colors"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setSelectedProducts([])} className={`px-4 py-2 text-[10px] font-medium uppercase border-2 ${theme.border} hover:bg-red-500 hover:text-white transition-all font-heading tracking-widest`}>
                Wyczyść
              </button>
              <button onClick={() => setShowComparison(true)} className="px-6 py-2 bg-[#00B7D1] text-black text-[12px] font-medium uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-heading tracking-widest">
                Porównaj teraz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON MODAL */}
      {showComparison && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${darkMode ? "bg-[#1f2922]" : "bg-white"} border-4 ${theme.border} shadow-[10px_10px_0px_0px_#00B7D1] w-[98vw] max-w-none max-h-[98vh] overflow-y-auto p-4 md:p-8 relative`}>
            <button onClick={() => setShowComparison(false)} className="absolute top-4 right-4 z-10 p-2 bg-black text-slate-200 hover:bg-[#00B7D1] transition-all border-2 border-black">
              <X size={20} />
            </button>
            
            <div className="flex flex-row justify-between items-center gap-6 mb-8 border-b-4 border-[#00B7D1] pb-4 pr-12">
              <h2 className={`text-2xl md:text-3xl font-black uppercase italic font-heading tracking-widest ${darkMode ? "text-white" : "text-black"}`}>Porównanie Sprzętu</h2>
              <div className={`flex ${darkMode ? "bg-black/40" : "bg-gray-100"} p-1 border-2 ${theme.border} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0`}>
                <button 
                  onClick={() => setViewMode("karty")}
                  className={`px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold uppercase transition-all ${viewMode === "karty" ? "bg-black text-white" : "text-black hover:bg-black/5"}`}
                >
                  <LayoutGrid size={14} /> Karty
                </button>
                <button 
                  onClick={() => setViewMode("tabela")}
                  className={`px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold uppercase transition-all ${viewMode === "tabela" ? "bg-black text-white" : "text-black hover:bg-black/5"}`}
                >
                  <Table size={14} /> Tabela
                </button>
              </div>
            </div>
            
            {viewMode === "karty" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {selectedProducts.map(p => (
                  <div key={p.id} className="bg-white border-2 border-black p-6 space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] opacity-100 flex flex-col h-full">
                    <div className="h-40 bg-gray-100 flex items-center justify-center border-b-2 border-black/10 relative shrink-0">
                      <Camera size={48} className="opacity-10 text-black" />
                      <div className="absolute bottom-0 right-0 px-1.5 py-1 font-semibold text-[8px] uppercase border-l-2 border-t-2 border-black bg-[#EEE800] text-black font-heading tracking-widest leading-none">{p.marka}</div>
                    </div>
                    <div className="flex-grow flex flex-col">
                      <div className="mb-4">
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1 font-heading">{p.marka}</p>
                        <h3 className="text-[18px] font-semibold uppercase leading-relaxed tracking-tighter text-black font-heading min-h-[60px] line-clamp-3">{p.nazwa}</h3>
                        <span className="font-bold text-3xl mt-1 block text-black font-sans">{p.cena}</span>
                      </div>
                      
                      <div className="space-y-0 pt-2 border-t-2 border-black/10 mb-6">
                        {[
                          { label: "Marka", value: p.marka },
                          { label: "Kategoria", value: `${p.dzial} / ${p.podkategoria}` },
                          { label: "Mocowanie", value: p.mocowanie },
                          { label: "Rozmiar matrycy", value: p.matryca },
                          { label: "Rozdzielczość", value: p.mpix },
                          { label: "Akumulator", value: p.akumulator }
                        ].map((spec, idx) => {
                          const isND = spec.value === "N/D" || !spec.value;
                          return (
                            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-200 last:border-0">
                              <span className="text-gray-500 font-bold text-[11px] uppercase tracking-widest">{spec.label}:</span>
                              <span className={`text-[14px] font-bold uppercase ${isND ? "text-gray-300" : "text-black"}`}>
                                {spec.value || "N/D"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-auto w-full py-3 border-2 border-black bg-[#00B7D1] text-black text-[12px] font-bold uppercase flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all font-heading tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <ExternalLink size={16} /> Zobacz w sklepie
                      </a>
                    </div>
                  </div>
                ))}
                {selectedProducts.length < 3 && Array.from({ length: 3 - selectedProducts.length }).map((_, i) => (
                  <div key={i} className="bg-white border-2 border-black border-dashed opacity-30 p-6 flex items-center justify-center">
                    <p className="font-bold uppercase italic text-[10px] font-heading tracking-widest">Miejsce na produkt</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="py-6 px-5 text-[11px] uppercase font-bold tracking-widest text-slate-400 w-[100px]">Marka</th>
                      <th className="py-6 px-5 text-[11px] uppercase font-bold tracking-widest text-slate-400 min-w-[300px]">Nazwa</th>
                      <th className="py-6 px-5 text-[11px] uppercase font-bold tracking-widest text-slate-400 min-w-[120px]">Mocowanie</th>
                      <th className="py-6 px-5 text-[11px] uppercase font-bold tracking-widest text-slate-400 min-w-[140px]">Rozmiar matrycy</th>
                      <th className="py-6 px-5 text-[11px] uppercase font-bold tracking-widest text-slate-400 min-w-[140px]">Akumulator</th>
                      <th className="py-6 px-5 text-[11px] uppercase font-bold tracking-widest text-slate-400 min-w-[120px]">Cena</th>
                      <th className="py-6 px-5 text-[11px] uppercase font-bold tracking-widest text-slate-400 text-center w-[200px]">Akcja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts?.map((p) => {
                      if (!p) return null;
                      const isND_aku = p.akumulator === "N/D" || !p.akumulator;
                      return (
                        <tr key={p.id} className={`border-b ${darkMode ? "border-slate-800" : "border-gray-100"} hover:${darkMode ? "bg-white/5" : "bg-gray-50"} transition-colors`}>
                          <td className="py-8 px-5 text-[12px] font-bold text-slate-500 uppercase tracking-widest">{p.marka}</td>
                          <td className={`py-8 px-5 text-[18px] font-bold uppercase leading-relaxed tracking-tight min-w-[300px] ${darkMode ? "text-white" : "text-black"}`}>{p.nazwa}</td>
                          <td className={`py-8 px-5 text-[14px] font-bold uppercase min-w-[120px] ${darkMode ? "text-slate-100" : "text-black"}`}>{p.mocowanie || "N/D"}</td>
                          <td className={`py-8 px-5 text-[14px] font-bold uppercase min-w-[140px] ${darkMode ? "text-white" : "text-black"}`}>{p.matryca || "N/D"}</td>
                          <td className={`py-8 px-5 text-[14px] font-bold uppercase min-w-[140px] ${isND_aku ? (darkMode ? "text-slate-600" : "text-slate-300") : (darkMode ? "text-white" : "text-black")}`}>
                            {p.akumulator || "N/D"}
                          </td>
                          <td className={`py-8 px-5 text-[18px] font-black whitespace-nowrap min-w-[120px] ${darkMode ? "text-white" : "text-black"}`}>{p.cena}</td>
                          <td className="py-8 px-5">
                            <div className="flex justify-center gap-2">
                              <a 
                                href={p.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all"
                              >
                                Sklep
                              </a>
                              <button 
                                onClick={() => handleTogglePorownaj(p)}
                                className="px-4 py-2 bg-[#EEE800] text-black text-[10px] font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all"
                              >
                                Usuń
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-12 flex justify-center">
              <button onClick={() => setShowComparison(false)} className="px-12 py-4 bg-[#EEE800] text-black text-[14px] font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-heading tracking-widest">
                Zamknij porównanie
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}