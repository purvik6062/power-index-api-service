import { connectDB } from "@/lib/db/cpimongo";
import { NextRequest,NextResponse } from 'next/server';
import { apiKeyMiddleware } from "@/middleware/apiKeymiddleware";

// GET handler
export async function GET(request: NextRequest) {
    const keyData = await apiKeyMiddleware(request);
    // If middleware returned a response, it means there was an error
    if (keyData instanceof NextResponse) {
      return keyData;
    }
  
  let client;
  try {
    // Get the date from searchParams
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    client = await connectDB();
    const db = client.db();
    const collection = db.collection('historic_cpi');

    if (date) {
      // Convert string date to Date object
      const queryDate = new Date(date);
      
      const result = await collection.findOne({
        date: queryDate
      });

      if (!result) {
        return NextResponse.json(
          { message: 'No data found for the specified date' },
          { status: 404 }
        );
      }

      return NextResponse.json(result);
    } else {
      // If no date specified, return all records
      const results = await collection.find({}).sort({ date: -1 }).toArray();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Close the connection
    if (client) {
      await client.close();
    }
  }
}