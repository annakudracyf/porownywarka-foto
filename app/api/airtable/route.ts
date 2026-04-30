import { NextResponse } from 'next/server';

export async function GET() {
  console.log('API ZACZYNA PRACĘ');

  try {
    // Vercel może mieć ustawione różne zmienne, sprawdzamy obie
    const token = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_TOKEN || '';
    
    // Sprawdzenie, czy klucz zaczyna się od pat i czy ma kropkę
    if (!token.startsWith('pat') || !token.includes('.')) {
      console.error('BŁĄD: Zły format klucza Airtable. Token:', token.substring(0, 5) + '...');
      return NextResponse.json({ error: 'ZŁY FORMAT KLUCZA' }, { status: 500 });
    }

    const baseId = process.env.AIRTABLE_BASE_ID || 'appKv6wNZURjEnver';
    const tableName = 'Produkty'; // Zgodnie z prośbą, użyto dokładnie nazwy "Produkty"

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    
    console.log(`Rozpoczynam zapytanie do: ${url}`);

    // Prosty fetch (standardowe zapytanie HTTP)
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      // Wymuszamy brak cachowania na poziomie Vercela
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Błąd HTTP od Airtable:', response.status, errorText);
      return NextResponse.json({ 
        error: 'Błąd HTTP od Airtable', 
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    const records = data.records || [];
    console.log('API ZAKOŃCZYŁO PRACĘ. Pobrano rekordów:', records.length);

    // Zabezpieczone mapowanie wspierające polskie i angielskie nazwy kolumn
    const mappedProducts = records.map((record: any) => {
      const fields = record.fields || {};
      
      // Obsługa zdjęć (Airtable zwraca tablicę obiektów attachment)
      let zdjecieUrl = '';
      const zdjecia = fields['Zdjęcie'] || fields['Zdjecie'] || fields['zdjęcie'] || fields['image'] || fields['Photo'];
      if (Array.isArray(zdjecia) && zdjecia.length > 0 && zdjecia[0].url) {
        zdjecieUrl = zdjecia[0].url;
      } else if (typeof zdjecia === 'string') {
        zdjecieUrl = zdjecia; 
      }

      const getField = (...keys: string[]) => {
        for (const k of keys) {
          if (fields[k] !== undefined && fields[k] !== null && fields[k] !== '') return fields[k];
        }
        return null;
      };

      const cenaVal = getField('Cena', 'cena', 'price', 'Price');

      return {
        id: record.id,
        nazwa: getField('Nazwa', 'nazwa', 'title', 'Name', 'name') || "Bez nazwy",
        brand: getField('Marka', 'marka', 'brand', 'Brand') || "Brak marki",
        marka: (getField('Marka', 'marka', 'brand', 'Brand') || "Brak marki").toUpperCase(),
        cena: cenaVal ? `${cenaVal} zł` : "Cena na zapytanie",
        dzial: getField('Dział', 'Dzial', 'dzial', 'Category') || "Fotografia",
        podkategoria: getField('Podkategoria', 'podkategoria', 'Subcategory') || "Aparat",
        mocowanie: getField('Mocowanie', 'mocowanie', 'Mount') || "N/D",
        format: getField('Format', 'format') || "N/D",
        mpix: getField('Mpix', 'mpix', 'Megapixels') || "N/D",
        matryca: getField('Matryca', 'matryca', 'Sensor') || "N/D",
        akumulator: getField('Akumulator', 'akumulator', 'Battery') || "N/D",
        link: getField('Link', 'link', 'url', 'URL') || "#",
        zdjecie: zdjecieUrl,
        akcesoria: getField('Akcesoria', 'akcesoria') || []
      };
    });

    return NextResponse.json(mappedProducts);

  } catch (error: any) {
    console.error('Krytyczny wyjątek w bloku try/catch:', error);
    return NextResponse.json({ 
      error: 'Wystąpił krytyczny błąd w API', 
      message: error.message 
    }, { status: 500 });
  }
}