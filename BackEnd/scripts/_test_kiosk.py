"""
Quick smoke test using FastAPI TestClient (no requests dep needed).
"""

import sys

sys.path.append("/app")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
SLUG = "grand-bay-hotel"
PASS = True


def test(label, r, expected_status):
    global PASS
    ok = r.status_code == expected_status
    if not ok:
        PASS = False
    symbol = "✓" if ok else "✗"
    print(f"{symbol} {label}: HTTP {r.status_code}")
    data = r.json()
    if isinstance(data, list):
        print(f"  → {len(data)} item(s)")
        for item in data[:3]:
            print(
                f"     • {item.get('name', '?')} — {item.get('base_price', '')} {item.get('currency', '')}"
            )
    elif isinstance(data, dict):
        for k in ("hotel_name", "id", "status", "detail", "nights", "total_price"):
            if k in data:
                print(f"  → {k}: {data[k]}")
    if not ok:
        print(f"  !! Expected {expected_status}, got {r.status_code}: {r.text[:150]}")


# ── 1. Hotel info ──────────────────────────────────────────────────────
r = client.get(f"/api/kiosk/{SLUG}")
test("GET hotel info", r, 200)

# ── 2. Room types ──────────────────────────────────────────────────────
r = client.get(f"/api/kiosk/{SLUG}/room-types")
test("GET room types", r, 200)
room_types = r.json() if r.ok else []

# ── 3. Unknown slug → 404 ─────────────────────────────────────────────
r = client.get("/api/kiosk/does-not-exist")
test("GET unknown slug → 404", r, 404)

# ── 4. Booking (requires room types to exist) ─────────────────────────
if room_types:
    payload = {
        "guest_name": "Arjun Verma",
        "guest_email": "arjun.test@example.com",
        "guest_phone": "9876543210",
        "id_type": "aadhar",
        "id_number": "1234-5678-9012",
        "nationality": "Indian",
        "room_type_id": room_types[0]["id"],
        "check_in_date": "2026-03-10",
        "check_out_date": "2026-03-14",
        "adults": 2,
        "children": 0,
        "special_requests": "High floor",
        "idempotency_key": "smoke-test-001",
    }

    r = client.post(f"/api/kiosk/{SLUG}/bookings", json=payload)
    test("POST create booking", r, 201)
    booking_id = r.json().get("id") if r.ok else None

    # ── 5. Idempotency ─────────────────────────────────────────────────
    r2 = client.post(f"/api/kiosk/{SLUG}/bookings", json=payload)
    test("POST booking (idempotent repeat → same 201)", r2, 201)
    if r.ok and r2.ok:
        same_id = r.json()["id"] == r2.json()["id"]
        print(f"  → Same booking ID returned: {same_id}")
        if not same_id:
            PASS = False

    # ── 6. Get booking ─────────────────────────────────────────────────
    if booking_id:
        r3 = client.get(f"/api/kiosk/{SLUG}/bookings/{booking_id}")
        test("GET booking confirmation", r3, 200)

    # ── 7. Get booking from wrong hotel → 404 ─────────────────────────
    if booking_id:
        r4 = client.get(f"/api/kiosk/does-not-exist/bookings/{booking_id}")
        test("GET booking wrong hotel → 404", r4, 404)

else:
    print("⚠  No room types found — booking tests skipped. Run seed_02_rooms first.")

print(f"\n{'✅  ALL PASSED' if PASS else '❌  SOME TESTS FAILED'}")
