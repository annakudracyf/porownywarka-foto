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
    console.log('API ZAKOŃCZYŁO PRACĘ. Pobrano rekordów:', data.records?.length || 0);

    // Zwracamy surowe dane bezpośrednio z Airtable (tablicę rekordów)
    return NextResponse.json(data.records || []);

  } catch (error: any) {
    console.error('Krytyczny wyjątek w bloku try/catch:', error);
    return NextResponse.json({ 
      error: 'Wystąpił krytyczny błąd w API', 
      message: error.message 
    }, { status: 500 });
  }
}