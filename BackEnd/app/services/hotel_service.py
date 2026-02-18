from sqlalchemy.orm import Session
from uuid import UUID
import random
import string
from typing import List, Optional

from app.repositories.hotel_repository import HotelRepository
from app.schemas.hotel import HotelCreate, HotelUpdate
from app.models.hotel import Hotel
from app.models.plan import Plan
from app.models.role import Role, UserRole, Permission, RolePermission
from app.models.user import User
from app.core.auth.security import get_password_hash


class HotelService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = HotelRepository(db)

    def _ensure_hotel_permissions(self) -> dict[str, Permission]:
        """Ensure baseline hotel permissions exist and return all hotel-scope permissions."""
        baseline = {
            # read permissions used by hotel pages
            "hotel:dashboard:read": "View hotel dashboard",
            "hotel:guests:read": "View guest registry",
            "hotel:rooms:read": "View rooms",
            "hotel:incidents:read": "View incidents",
            "hotel:users:read": "View hotel staff",
            "hotel:reports:read": "View hotel reports",
            "hotel:settings:read": "View hotel settings",
            "hotel:rates:read": "View rates",
            "hotel:bookings:read": "View bookings",
            "hotel:billing:read": "View billing",
            # write permissions needed for common actions
            "hotel:rooms:write": "Manage rooms",
            "hotel:users:write": "Manage hotel staff",
            "hotel:settings:write": "Manage hotel settings",
        }

        existing = {
            p.permission_key: p
            for p in self.db.query(Permission)
            .filter(Permission.permission_key.in_(list(baseline.keys())))
            .all()
        }

        for key, desc in baseline.items():
            if key not in existing:
                perm = Permission(permission_key=key, description=desc)
                self.db.add(perm)
                self.db.flush()
                existing[key] = perm

        all_hotel_permissions = (
            self.db.query(Permission)
            .filter(Permission.permission_key.like("hotel:%"))
            .all()
        )
        return {perm.permission_key: perm for perm in all_hotel_permissions}

    def get_all(self, skip: int = 0, limit: int = 100, q: Optional[str] = None) -> List[Hotel]:
        return self.repository.get_all(skip, limit, q)

    def get_by_id(self, hotel_id: UUID) -> Optional[Hotel]:
        return self.repository.get_by_id(hotel_id)

    def create_hotel_with_defaults(self, hotel_in: HotelCreate) -> Hotel:
        try:
            hotel_data = hotel_in.model_dump()

            # Hard prerequisite: at least one active pricing tier must exist.
            active_plan_exists = (
                self.db.query(Plan.id).filter(Plan.is_archived.isnot(True)).first()
            )
            if not active_plan_exists:
                raise ValueError(
                    "At least one active pricing tier must exist before onboarding a hotel."
                )

            plan_name = (hotel_data.pop("plan", "") or "").strip()
            if not plan_name:
                raise ValueError("A pricing tier is required to onboard a hotel.")

            plan = (
                self.db.query(Plan)
                .filter(Plan.name == plan_name, Plan.is_archived.isnot(True))
                .first()
            )
            if not plan:
                raise ValueError(
                    f"Plan '{plan_name}' was not found or is archived."
                )

            hotel_data["plan_id"] = plan.id

            kiosks_data = hotel_data.pop("kiosks_details", []) or []
            if kiosks_data and not hotel_data.get("kiosks"):
                hotel_data["kiosks"] = len(kiosks_data)

            if "tenant_key" not in hotel_data:
                base_slug = hotel_data.get("name", "hotel").lower().replace(" ", "-")
                base_slug = "".join(c for c in base_slug if c.isalnum() or c == "-")
                suffix = "".join(
                    random.choices(string.ascii_lowercase + string.digits, k=6)
                )
                hotel_data["tenant_key"] = f"{base_slug}-{suffix}"

            if "tenant_type" not in hotel_data:
                hotel_data["tenant_type"] = "hotel"

            db_hotel = Hotel(**hotel_data)
            new_hotel = self.repository.create(db_hotel)
            self.db.flush()

            if kiosks_data:
                new_hotel.kiosks = len(kiosks_data)
                self.db.add(new_hotel)

            gm_role = Role(
                name="General Manager",
                description="Full hotel management access",
                color="purple",
                status="Active",
                tenant_id=new_hotel.id,
            )
            fd_role = Role(
                name="Front Desk Manager",
                description="Front desk operations and guest services",
                color="blue",
                status="Active",
                tenant_id=new_hotel.id,
            )
            self.db.add(gm_role)
            self.db.add(fd_role)
            self.db.flush()

            # Grant GM all hotel permissions by default
            perms = self._ensure_hotel_permissions()
            for perm in perms.values():
                self.db.add(RolePermission(role_id=gm_role.id, permission_id=perm.id))

            tenant_key = getattr(new_hotel, "tenant_key", "hotel")
            gm_email = f"gm@{tenant_key}.hotel"
            gm_user = User(
                tenant_id=new_hotel.id,
                email=gm_email,
                username=gm_email,
                name=f"{new_hotel.name} Manager",
                employee_id="EMP-001",
                department="Management",
                password_hash=get_password_hash("changeme123"),
                user_type="hotel",
                must_reset_password=True,
            )
            self.db.add(gm_user)
            self.db.flush()

            self.db.add(
                UserRole(
                    tenant_id=new_hotel.id,
                    user_id=gm_user.id,
                    role_id=gm_role.id,
                )
            )

            self.db.commit()
            self.db.refresh(new_hotel)
            return new_hotel
        except Exception:
            self.db.rollback()
            raise

    def update(self, hotel_id: UUID, hotel_in: HotelUpdate) -> Optional[Hotel]:
        # Logic for plan update if needed
        hotel_data = hotel_in.model_dump(exclude_unset=True)
        # Handle plan update logic from Repo
        if "plan" in hotel_data:
            plan_name = hotel_data.pop("plan")
            if plan_name:
                plan = self.db.query(Plan).filter(Plan.name == plan_name).first()
                if plan:
                    hotel_data["plan_id"] = plan.id

        db_hotel = self.repository.update(hotel_id, hotel_data)
        if not db_hotel:
            return None
        self.db.commit()
        self.db.refresh(db_hotel)
        return db_hotel

    def delete(self, hotel_id: UUID) -> bool:
        deleted = self.repository.delete(hotel_id)
        if not deleted:
            return False
        self.db.commit()
        return True
