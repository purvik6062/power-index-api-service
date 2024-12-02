import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiKeyMiddleware } from "./middleware/apiKeymiddleware";

const allowedOrigins = [process.env.NEXTAUTH_URL!];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply CORS headers
  const origin = request.headers.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]); // Set default origin
  }
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours

  if (request.method === "OPTIONS") {
    return response;
  }

  //   // Check if the request is for an API route
  //   if (request.nextUrl.pathname.startsWith("/api/")) {
  //     // Apply API key middleware for API routes
  //     return apiKeyMiddleware(request);
  //   }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/admin/api-keys/:path*",
    "/api/calculate-cpi/:path*",
    "/api/calculate-temp-cpi/:path*",
    "/api/usage/:path*",
  ],
};
