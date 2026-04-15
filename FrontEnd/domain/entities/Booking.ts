// Guest & Booking domain entities — matches guests and bookings tables in code.sql

export type GuestIdType = 'passport' | 'aadhar' | 'driving_license';
export type BookingStatus = 'draft' | 'confirmed' | 'cancelled';

export interface Guest {
    id: string;
    tenantId: string;
    fullName: string;              // mapped from full_name
    email?: string;
    phone?: string;
    idType?: GuestIdType | string; // mapped from id_type
    idNumber?: string;             // mapped from id_number
    nationality?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Booking {
    id: string;
    tenantId: string;
    sessionId?: string;            // mapped from session_id
    deviceId?: string;             // mapped from device_id
    guestId?: string;              // mapped from guest_id
    roomTypeId: string;            // mapped from room_type_id
    status: BookingStatus | string; // default: 'draft'
    adults: number;                // default: 1
    children: number;              // default: 0
    checkInDate: string;           // mapped from check_in_date (ISO date)
    checkOutDate: string;          // mapped from check_out_date
    nights: number;
    totalPrice?: number;           // mapped from total_price
    currency: string;              // default: 'INR'
    guestName?: string;            // mapped from guest_name
    specialRequests?: string;      // mapped from special_requests
    idempotencyKey?: string;       // mapped from idempotency_key (unique)
    confirmedAt?: string;
    cancelledAt?: string;
    createdAt?: string;
    updatedAt?: string;
}
