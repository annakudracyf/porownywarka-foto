import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appKv6wNZURjEnver';
  const tableName = 'Produkty';

  // Logowanie BASE_ID dla celów debugowania (bez tokenu!)
  console.log("BASE_ID:", baseId);

  if (!token) {
    return NextResponse.json({ error: "Brak tokenu NEXT_PUBLIC_AIRTABLE_TOKEN w środowisku" }, { status: 500 });
  }

  try {
    let allRecords: any[] = [];
    let offset = '';

    // Loop until all records are fetched (Airtable limit is 100 per page)
    do {
      const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=300&pageSize=100${offset ? `&offset=${offset}` : ''}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Airtable API Error Detail:", errorData);
        return NextResponse.json({ 
          error: "Błąd Airtable API", 
          status: response.status,
          details: errorData 
        }, { status: response.status });
      }

      const data = await response.json();
      allRecords = [...allRecords, ...data.records];
      offset = data.offset;
      
    } while (offset);

    // Mapowanie danych na backendzie
    const mappedProducts = allRecords.map((record: any) => ({
      id: record.id,
      nazwa: record.fields.title || "Bez nazwy",
      brand: record.fields.brand || "Brak marki",
      marka: (record.fields.brand || "Brak marki").toUpperCase(),
      cena: record.fields.price ? `${record.fields.price} zł` : "Cena na zapytanie",
      dzial: record.fields.dzial || "Fotografia",
      podkategoria: record.fields.podkategoria || "Aparat",
      mocowanie: record.fields.mocowanie || "N/D",
      format: record.fields.format || "N/D",
      mpix: record.fields.mpix || "N/D",
      matryca: record.fields.matryca || "N/D",
      akumulator: record.fields.akumulator || "N/D",
      link: record.fields.link || "#",
      akcesoria: record.fields.akcesoria ? (typeof record.fields.akcesoria === 'string' ? JSON.parse(record.fields.akcesoria) : record.fields.akcesoria) : []
    }));

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error('Fatal API Error:', error);
    return NextResponse.json({ 
      error: "Wystąpił krytyczny błąd serwera", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}