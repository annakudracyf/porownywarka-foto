import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appKv6wNZURjEnver';
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Produkty';

  // Logowanie BASE_ID dla celów debugowania (bez tokenu!)
  console.log("BASE_ID:", baseId);

  if (!token) {
    return NextResponse.json({ error: "Brak tokenu NEXT_PUBLIC_AIRTABLE_TOKEN w środowisku" }, { status: 500 });
  }

  try {
    let allRecords: any[] = [];
    let offset = '';

    // Logowanie przed zapytaniem
    console.log("Próba połączenia z tabelą Produkty...");

    // Loop until all records are fetched (Airtable limit is 100 per page)
    do {
      const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}${offset ? `?offset=${offset}` : ''}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        let errorMsg = "Błąd Airtable API";
        let errorDetail = {};
        
        try {
          const errorData = await response.json();
          errorDetail = errorData;
          // Airtable zazwyczaj zwraca błąd w formacie { error: { message: "...", type: "..." } }
          if (errorData.error && errorData.error.message) {
            errorMsg = `Airtable Error: ${errorData.error.message}`;
          } else if (errorData.message) {
            errorMsg = `Airtable Error: ${errorData.message}`;
          }
        } catch (e) {
          errorMsg = `Błąd Airtable (${response.status}): ${response.statusText}`;
        }

        console.error("Airtable API Error Detail:", errorDetail);
        
        return NextResponse.json({ 
          error: errorMsg, 
          status: response.status,
          details: errorDetail 
        }, { status: response.status });
      }

      const data = await response.json();
      if (data.records) {
        allRecords = [...allRecords, ...data.records];
      }
      offset = data.offset;
      
    } while (offset);

    console.log("Pobrano rekordy:", allRecords.length);

    return NextResponse.json(allRecords);
  } catch (error: any) {
    console.error('Fatal API Error:', error);
    return NextResponse.json({ 
      error: "Wystąpił krytyczny błąd serwera", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}