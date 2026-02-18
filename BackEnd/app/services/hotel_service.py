from sqlalchemy.orm import Session
from uuid import UUID
import random
import string
from typing import List, Optional

from app.repositories.hotel_repository import HotelRepository
from app.schemas.hotel import HotelCreate, HotelUpdate
from app.models.hotel import Hotel
from app.models.plan import Plan
from app.models.kiosk import Kiosk
from app.models.auth import Role, User, UserRole
from app.core.auth.security import get_password_hash


class HotelService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = HotelRepository(db)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Hotel]:
        return self.repository.get_all(skip, limit)

    def get_by_id(self, hotel_id: UUID) -> Optional[Hotel]:
        return self.repository.get_by_id(hotel_id)

    def create_hotel_with_defaults(self, hotel_in: HotelCreate) -> Hotel:
        # 1. Prepare Data
        hotel_data = hotel_in.model_dump()

        # Plan Resolution
        plan_name = hotel_data.pop("plan", "Starter")
        plan = self.db.query(Plan).filter(Plan.name == plan_name).first()
        if not plan:
            plan = self.db.query(Plan).filter(Plan.name == "Starter").first()

        if not plan:
            # Fallback if even starter is missing (should not happen if seeded)
            raise ValueError(f"Plan '{plan_name}' (or default 'Starter') not found.")

        hotel_data["plan_id"] = plan.id

        # Kiosks separation
        kiosks_data = []
        if "kiosks_details" in hotel_data:
            kiosks_data = hotel_data.pop("kiosks_details")

        # Tenant Key Generation
        if "tenant_key" not in hotel_data:
            base_slug = hotel_data.get("name", "hotel").lower().replace(" ", "-")
            base_slug = "".join(c for c in base_slug if c.isalnum() or c == "-")
            suffix = "".join(
                random.choices(string.ascii_lowercase + string.digits, k=6)
            )
            hotel_data["tenant_key"] = f"{base_slug}-{suffix}"

        if "tenant_type" not in hotel_data:
            hotel_data["tenant_type"] = "hotel"

        # 2. Create Hotel via Repository
        db_hotel = Hotel(**hotel_data)
        new_hotel = self.repository.create(db_hotel)

        # 3. Create Kiosks
        if kiosks_data:
            for k_data in kiosks_data:
                new_kiosk = Kiosk(
                    serial_number=k_data.serial_number,
                    location=k_data.location,
                    hotel_id=new_hotel.id,
                )
                self.db.add(new_kiosk)

            # Update count logic could be here, but simpler to just add kiosks.
            # In original router code, it updated hotel.kiosks = len(kiosks_data)
            new_hotel.kiosks = len(kiosks_data)
            self.db.add(new_hotel)

        # 4. Auto-provision Roles
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

        # 5. Auto-provision GM User
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

        # 6. Bind GM to Role
        user_role = UserRole(
            tenant_id=new_hotel.id,
            user_id=gm_user.id,
            role_id=gm_role.id,
        )
        self.db.add(user_role)

        self.db.commit()
        self.db.refresh(new_hotel)
        return new_hotel

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

        return self.repository.update(hotel_id, hotel_data)

    def delete(self, hotel_id: UUID) -> bool:
        return self.repository.delete(hotel_id)
