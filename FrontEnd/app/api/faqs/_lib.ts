import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

class RouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function normalizeBearerToken(raw: string): string {
  const decoded = decodeURIComponent(String(raw ?? "").trim());
  const unquoted = decoded.replace(/^"+|"+$/g, "").trim();
  const stripped = unquoted.replace(/^Bearer\s+/i, "").trim();
  if (!stripped) {
    throw new RouteError(401, "Authentication required");
  }
  return `Bearer ${stripped}`;
}

function extractAuthHeader(request: NextRequest): string {
  const requestAuth = request.headers.get("authorization");
  if (requestAuth) {
    return normalizeBearerToken(requestAuth);
  }

  const cookieToken = request.cookies.get("access_token")?.value;
  if (!cookieToken) {
    throw new RouteError(401, "Authentication required");
  }

  return normalizeBearerToken(cookieToken);
}

export async function getAuthenticatedHotelContext(request: NextRequest): Promise<{
  authHeader: string;
  hotelId: string;
}> {
  const authHeader = extractAuthHeader(request);
  const incomingCookie = request.headers.get("cookie");
  const headers: Record<string, string> = {
    Authorization: authHeader,
  };
  if (incomingCookie) {
    headers.Cookie = incomingCookie;
  }

  const response = await fetch(`${BACKEND_API_URL}/auth/me`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new RouteError(401, "Invalid authentication token");
  }

  const me = (await response.json()) as { tenant_id?: string | null };
  if (!me.tenant_id) {
    throw new RouteError(403, "Authenticated user is not a hotel user");
  }

  return {
    authHeader,
    hotelId: String(me.tenant_id),
  };
}

export async function toNextResponse(response: Response): Promise<NextResponse> {
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await response.json();
    return NextResponse.json(json, { status: response.status });
  }

  const text = await response.text();
  return NextResponse.json(
    { detail: text || "Unexpected backend response" },
    { status: response.status },
  );
}

export function routeErrorResponse(error: unknown): NextResponse {
  if (error instanceof RouteError) {
    return NextResponse.json({ detail: error.message }, { status: error.status });
  }
  return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
}

export { BACKEND_API_URL };
