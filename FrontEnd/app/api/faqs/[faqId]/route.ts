import { NextRequest, NextResponse } from "next/server";

import {
  BACKEND_API_URL,
  getAuthenticatedHotelContext,
  routeErrorResponse,
  toNextResponse,
} from "../_lib";

interface RouteParams {
  params: { faqId: string } | Promise<{ faqId: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { faqId } = await Promise.resolve(params);
    const { authHeader, hotelId } = await getAuthenticatedHotelContext(request);
    const body = await request.json();

    const payload: Record<string, unknown> = {};
    if (typeof body.question === "string") payload.question = body.question.trim();
    if (typeof body.answer === "string") payload.answer = body.answer.trim();
    if (typeof body.is_active === "boolean") payload.is_active = body.is_active;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { detail: "At least one field is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_API_URL}/api/hotels/${hotelId}/faqs/${faqId}`,
      {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    return toNextResponse(response);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  try {
    const { faqId } = await Promise.resolve(params);
    const { authHeader, hotelId } = await getAuthenticatedHotelContext(request);

    const response = await fetch(
      `${BACKEND_API_URL}/api/hotels/${hotelId}/faqs/${faqId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
        cache: "no-store",
      },
    );

    return toNextResponse(response);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
