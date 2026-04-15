// RoomType domain entity — matches room_types table in code.sql

export interface RoomType {
    id: string;
    tenantId: string;
    name: string;
    code: string;
    description?: string;
    basePrice: number;        // mapped from base_price
    currency: string;         // default: 'INR'
    maxAdults: number;        // mapped from max_adults
    maxChildren: number;      // mapped from max_children
    maxOccupancy: number;     // mapped from max_occupancy
    amenities: string[];      // JSONB array
    images: string[];         // JSONB array of URLs
    isActive: boolean;        // mapped from is_active
    displayOrder: number;     // mapped from display_order
    createdAt?: string;
    updatedAt?: string;
}
