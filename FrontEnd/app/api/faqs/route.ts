import { NextRequest, NextResponse } from "next/server";

import {
  BACKEND_API_URL,
  getAuthenticatedHotelContext,
  routeErrorResponse,
  toNextResponse,
} from "./_lib";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { authHeader, hotelId } = await getAuthenticatedHotelContext(request);
    const response = await fetch(`${BACKEND_API_URL}/api/hotels/${hotelId}/faqs`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    return toNextResponse(response);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { authHeader, hotelId } = await getAuthenticatedHotelContext(request);
    const body = await request.json();

    const payload = {
      question: typeof body.question === "string" ? body.question.trim() : "",
      answer: typeof body.answer === "string" ? body.answer.trim() : "",
      is_active: typeof body.is_active === "boolean" ? body.is_active : true,
    };

    if (!payload.question || !payload.answer) {
      return NextResponse.json(
        { detail: "question and answer are required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/api/hotels/${hotelId}/faqs`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    return toNextResponse(response);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
