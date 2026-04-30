const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Replace fetchData
const fetchStart = content.indexOf('const fetchData = async () => {');
const fetchEnd = content.indexOf('};\n\n    fetchData();', fetchStart) + 2;
const fetchReplacement = `const fetchData = async () => {
      console.log('Fetching data...');
      try {
        const res = await fetch('/api/airtable');
        const data = await res.json();
        
        console.log('Dane odebrane na frontendzie:', data);
        
        // Zabezpieczenie: mapujemy surowe rekordy Airtable na bezpieczne obiekty
        const bezpieczneProdukty = (Array.isArray(data) ? data : []).map((record) => {
          const fields = record.fields || {};
          return {
            id: record.id || Math.random().toString(),
            nazwa: fields.title || fields.Nazwa || fields.Name || fields.nazwa || "Bez nazwy",
            brand: fields.brand || fields.Marka || fields.marka || "Brak marki",
            dzial: fields.dzial || fields.Dział || "Fotografia",
            podkategoria: fields.podkategoria || fields.Podkategoria || "Aparat"
          };
        });

        setProdukty(bezpieczneProdukty);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Airtable data:', err);
        setLoading(false);
      }
    }`;
content = content.substring(0, fetchStart) + fetchReplacement + content.substring(fetchEnd);

// Replace Filter
const filterStart = content.indexOf('const filteredProducts = produkty.filter(p => {');
const filterEnd = content.indexOf('  });', filterStart) + 5;
const filterReplacement = `const filteredProducts = produkty.filter(p => {
    if (!p) return false;
    const pDzial = p.dzial || "";
    const pPodkat = p.podkategoria || "";
    const pNazwa = p.nazwa || "";
    const pBrand = p.brand || "";
    
    const matchesDzial = pDzial === dzial;
    const matchesPodkategoria = pPodkat === podkategoria;
    const matchesSearch = pNazwa.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pBrand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDzial && matchesPodkategoria && matchesSearch;
  });`;
content = content.substring(0, filterStart) + filterReplacement + content.substring(filterEnd);

// Replace main
const mainStart = content.indexOf('<main>');
const mainEnd = content.indexOf('</main>', mainStart) + 7;
const mainReplacement = `<main>
            <div className={\`\${theme.card} p-6 border-2 \${theme.border} \${theme.shadow}\`}>
              <h2 className="text-xl font-bold mb-4 font-heading uppercase tracking-widest border-b-2 border-black pb-2 text-[#00B7D1]">Tryb testowy - tylko nazwy</h2>
              <ul className="space-y-2">
                {filteredProducts.map((p) => {
                  if (!p || !p.nazwa || p.nazwa === "Bez nazwy") return null; 
                  return (
                    <li key={p.id} className="p-3 border-b border-black/10 flex justify-between items-center text-sm md:text-base">
                      <span className="font-bold">{p.nazwa}</span>
                      <span className="text-xs text-gray-500 ml-4 shrink-0 uppercase">{p.brand} | {p.dzial}</span>
                    </li>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <li className="py-10 text-center opacity-50 font-medium uppercase font-heading tracking-widest">Brak produktów do wyświetlenia (Sprawdź konsolę)</li>
                )}
              </ul>
            </div>
          </main>`;
content = content.substring(0, mainStart) + mainReplacement + content.substring(mainEnd);

fs.writeFileSync('app/page.tsx', content);
