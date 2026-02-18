"""
Smoke test for FrontEnd repository <-> BackEnd API contracts.

Usage (inside backend container or any env that can reach API):

  SMOKE_EMAIL=... SMOKE_PASSWORD=... python scripts/smoke_frontend_backend_contracts.py

Optional:
  API_BASE_URL=http://localhost:8000
  SMOKE_HOTEL_ID=<uuid>          # fallback: inferred from /auth/me.tenant_id
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass
from typing import Any
from urllib import error, request


API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")
SMOKE_EMAIL = os.getenv("SMOKE_EMAIL")
SMOKE_PASSWORD = os.getenv("SMOKE_PASSWORD")
SMOKE_HOTEL_ID = os.getenv("SMOKE_HOTEL_ID")


@dataclass
class HttpResult:
    status: int
    body: Any


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str


def fail(msg: str) -> None:
    print(f"[FAIL] {msg}")
    sys.exit(1)


def _json_load(raw: bytes) -> Any:
    if not raw:
        return None
    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return raw.decode("utf-8", errors="replace")


def http_call(
    method: str,
    path: str,
    token: str | None = None,
    payload: dict[str, Any] | None = None,
) -> HttpResult:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = request.Request(f"{API_BASE_URL}{path}", data=data, headers=headers, method=method)

    try:
        with request.urlopen(req, timeout=20) as resp:
            return HttpResult(status=resp.status, body=_json_load(resp.read()))
    except error.HTTPError as exc:
        return HttpResult(status=exc.code, body=_json_load(exc.read()))


def check_list_shape(name: str, body: Any, required_keys: set[str]) -> CheckResult:
    if not isinstance(body, list):
        return CheckResult(name=name, ok=False, detail=f"Expected list, got {type(body).__name__}")
    if not body:
        return CheckResult(name=name, ok=True, detail="OK (empty list)")

    first = body[0]
    if not isinstance(first, dict):
        return CheckResult(name=name, ok=False, detail=f"Expected object rows, got {type(first).__name__}")

    missing = sorted(required_keys - set(first.keys()))
    if missing:
        return CheckResult(name=name, ok=False, detail=f"Missing keys in first row: {missing}")
    return CheckResult(name=name, ok=True, detail="OK")


def check_object_shape(name: str, body: Any, required_keys: set[str]) -> CheckResult:
    if not isinstance(body, dict):
        return CheckResult(name=name, ok=False, detail=f"Expected object, got {type(body).__name__}")
    missing = sorted(required_keys - set(body.keys()))
    if missing:
        return CheckResult(name=name, ok=False, detail=f"Missing keys: {missing}")
    return CheckResult(name=name, ok=True, detail="OK")


def run_endpoint_check(
    name: str,
    method: str,
    path: str,
    token: str,
    expected_status: int = 200,
    list_keys: set[str] | None = None,
    object_keys: set[str] | None = None,
) -> CheckResult:
    result = http_call(method=method, path=path, token=token)
    if result.status != expected_status:
        return CheckResult(
            name=name,
            ok=False,
            detail=f"HTTP {result.status} (expected {expected_status}) body={result.body}",
        )

    if list_keys is not None:
        return check_list_shape(name=name, body=result.body, required_keys=list_keys)
    if object_keys is not None:
        return check_object_shape(name=name, body=result.body, required_keys=object_keys)
    return CheckResult(name=name, ok=True, detail="OK")


def main() -> None:
    if not SMOKE_EMAIL or not SMOKE_PASSWORD:
        fail("Set SMOKE_EMAIL and SMOKE_PASSWORD env vars.")

    print(f"[INFO] API_BASE_URL={API_BASE_URL}")
    login = http_call(
        method="POST",
        path="/auth/login",
        payload={"email": SMOKE_EMAIL, "password": SMOKE_PASSWORD},
    )
    if login.status != 200 or not isinstance(login.body, dict):
        fail(f"Login failed: HTTP {login.status} body={login.body}")

    token = login.body.get("access_token")
    if not token:
        fail("Login response missing access_token.")

    me = http_call(method="GET", path="/auth/me", token=token)
    if me.status != 200 or not isinstance(me.body, dict):
        fail(f"/auth/me failed: HTTP {me.status} body={me.body}")

    user_type = (me.body.get("user_type") or "").lower()
    hotel_id = SMOKE_HOTEL_ID or me.body.get("tenant_id")

    print(f"[INFO] Authenticated user_type={user_type} tenant_id={hotel_id}")

    checks: list[CheckResult] = []

    checks.append(
        check_object_shape(
            name="auth.me.shape",
            body=me.body,
            required_keys={"id", "email", "user_type", "permissions", "is_admin", "is_orphan"},
        )
    )

    if user_type == "platform":
        checks.extend(
            [
                run_endpoint_check(
                    name="platform.hotels.list",
                    method="GET",
                    path="/api/hotels/",
                    token=token,
                    list_keys={"id", "name", "kiosks", "status", "mrr"},
                ),
                run_endpoint_check(
                    name="platform.plans.list",
                    method="GET",
                    path="/api/plans/",
                    token=token,
                    list_keys={"id", "name", "price", "rooms", "kiosks"},
                ),
                run_endpoint_check(
                    name="platform.users.list",
                    method="GET",
                    path="/api/users/",
                    token=token,
                    list_keys={"id", "email", "status"},
                ),
                run_endpoint_check(
                    name="platform.roles.list",
                    method="GET",
                    path="/api/roles/",
                    token=token,
                    list_keys={"id", "name", "status"},
                ),
                run_endpoint_check(
                    name="platform.subscriptions.list",
                    method="GET",
                    path="/api/subscriptions/",
                    token=token,
                    list_keys={"id", "hotel_id", "hotel", "plan", "status", "autoRenew", "price"},
                ),
                run_endpoint_check(
                    name="platform.invoices.list",
                    method="GET",
                    path="/api/subscriptions/invoices",
                    token=token,
                    list_keys={"id", "hotel_id", "amount", "status", "period_start", "period_end", "due_date"},
                ),
                run_endpoint_check(
                    name="platform.settings.get",
                    method="GET",
                    path="/api/settings/",
                    token=token,
                    object_keys={"id", "name", "status"},
                ),
            ]
        )
    elif user_type == "hotel":
        if not hotel_id:
            fail("Hotel user detected but tenant_id/hotel_id not available.")

        checks.extend(
            [
                run_endpoint_check(
                    name="hotel.users.list",
                    method="GET",
                    path=f"/api/hotels/{hotel_id}/users",
                    token=token,
                    list_keys={"id", "email", "status"},
                ),
                run_endpoint_check(
                    name="hotel.roles.list",
                    method="GET",
                    path=f"/api/hotels/{hotel_id}/roles",
                    token=token,
                    list_keys={"id", "name", "status"},
                ),
                run_endpoint_check(
                    name="hotel.permissions.list",
                    method="GET",
                    path=f"/api/hotels/{hotel_id}/permissions/",
                    token=token,
                    list_keys={"id", "permission_key"},
                ),
                run_endpoint_check(
                    name="hotel.buildings.list",
                    method="GET",
                    path=f"/api/hotels/{hotel_id}/buildings",
                    token=token,
                    list_keys={"id", "name", "hotel_id"},
                ),
                run_endpoint_check(
                    name="hotel.categories.list",
                    method="GET",
                    path=f"/api/hotels/{hotel_id}/categories",
                    token=token,
                    list_keys={"id", "name", "rate", "occupancy", "amenities", "hotel_id"},
                ),
                run_endpoint_check(
                    name="hotel.rooms.list",
                    method="GET",
                    path=f"/api/hotels/{hotel_id}/rooms",
                    token=token,
                    list_keys={"id", "floor", "status", "type", "building_id", "category_id", "hotel_id"},
                ),
                run_endpoint_check(
                    name="hotel.settings.get",
                    method="GET",
                    path=f"/api/hotels/{hotel_id}/settings",
                    token=token,
                    object_keys={"id", "name", "status"},
                ),
                run_endpoint_check(
                    name="hotel.invoices.list",
                    method="GET",
                    path=f"/api/subscriptions/invoices/{hotel_id}",
                    token=token,
                    list_keys={"id", "hotel_id", "amount", "status", "period_start", "period_end", "due_date"},
                ),
            ]
        )
    else:
        fail(f"Unsupported user_type '{user_type}'.")

    failed = [c for c in checks if not c.ok]
    passed = [c for c in checks if c.ok]

    print("\n[RESULTS]")
    for check in checks:
        marker = "PASS" if check.ok else "FAIL"
        print(f" - [{marker}] {check.name}: {check.detail}")

    print(f"\n[SUMMARY] passed={len(passed)} failed={len(failed)}")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
