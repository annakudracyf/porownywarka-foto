import sys

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def replace_between(start_str, end_str, new_lines, occurrence=1):
    start_idx = -1
    count = 0
    for i, line in enumerate(lines):
        if start_str in line:
            count += 1
            if count == occurrence:
                start_idx = i
                break
    
    if start_idx == -1: return
    
    end_idx = -1
    for i in range(start_idx + 1, len(lines)):
        if end_str in lines[i]:
            end_idx = i
            break
            
    if end_idx == -1: return
    
    lines[start_idx:end_idx+1] = [l + '\n' for l in new_lines]

# 1. Fetch
fetch_lines = [
"    // Pobieranie danych z Airtable",
"    const fetchData = async () => {",
"      console.log('Fetching data...');",
"      try {",
"        const res = await fetch('/api/airtable');",
"        const data = await res.json();",
"        ",
"        console.log('Dane odebrane na frontendzie:', data);",
"        ",
"        // Zabezpieczenie: mapujemy surowe rekordy Airtable na bezpieczne obiekty",
"        const bezpieczneProdukty = (Array.isArray(data) ? data : []).map((record: any) => {",
"          const fields = record.fields || {};",
"          return {",
"            id: record.id || Math.random().toString(),",
"            nazwa: fields.title || fields.Nazwa || fields.Name || fields.nazwa || 'Bez nazwy',",
"            brand: fields.brand || fields.Marka || fields.marka || 'Brak marki',",
"            dzial: fields.dzial || fields.Dział || 'Fotografia',",
"            podkategoria: fields.podkategoria || fields.Podkategoria || 'Aparat'",
"          };",
"        });",
"",
"        setProdukty(bezpieczneProdukty);",
"        setLoading(false);",
"      } catch (err) {",
"        console.error('Error fetching Airtable data:', err);",
"        setLoading(false);",
"      }",
"    };",
"",
"    fetchData();"
]
replace_between('const fetchData = async () => {', 'fetchData();', fetch_lines)

# 2. Filter
filter_lines = [
"  // Logika filtrowania z zabezpieczeniem",
"  const filteredProducts = produkty.filter(p => {",
"    if (!p) return false;",
"    const pDzial = p.dzial || '';",
"    const pPodkat = p.podkategoria || '';",
"    const pNazwa = p.nazwa || '';",
"    const pBrand = p.brand || '';",
"    ",
"    const matchesDzial = pDzial === dzial;",
"    const matchesPodkategoria = pPodkat === podkategoria;",
"    const matchesSearch = pNazwa.toLowerCase().includes(searchQuery.toLowerCase()) || ",
"                          pBrand.toLowerCase().includes(searchQuery.toLowerCase());",
"    return matchesDzial && matchesPodkategoria && matchesSearch;",
"  });"
]
replace_between('const filteredProducts = produkty.filter(p => {', '  });', filter_lines)

# 3. Main
main_lines = [
"          {/* MAIN CONTENT */}",
"          <main>",
"            <div className={`\\${theme.card} p-6 border-2 \\${theme.border} \\${theme.shadow}`}>",
"              <h2 className=\"text-xl font-bold mb-4 font-heading uppercase tracking-widest border-b-2 border-black pb-2 text-[#00B7D1]\">Tryb testowy - tylko nazwy</h2>",
"              <ul className=\"space-y-2\">",
"                {filteredProducts.map((p) => {",
"                  if (!p || !p.nazwa || p.nazwa === 'Bez nazwy') return null; ",
"                  return (",
"                    <li key={p.id} className=\"p-3 border-b border-black/10 flex justify-between items-center text-sm md:text-base\">",
"                      <span className=\"font-bold\">{p.nazwa}</span>",
"                      <span className=\"text-xs text-gray-500 ml-4 shrink-0 uppercase\">{p.brand} | {p.dzial}</span>",
"                    </li>",
"                  );",
"                })}",
"                {filteredProducts.length === 0 && (",
"                  <li className=\"py-10 text-center opacity-50 font-medium uppercase font-heading tracking-widest\">Brak produktów do wyświetlenia (Sprawdź konsolę)</li>",
"                )}",
"              </ul>",
"            </div>",
"          </main>"
]
replace_between('{/* MAIN CONTENT */}', '</main>', main_lines)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
