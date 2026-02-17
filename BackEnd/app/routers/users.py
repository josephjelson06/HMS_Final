from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.modules.rbac import require_permission
from app.modules.limits import check_user_limit
from app.core.auth.security import get_password_hash

router = APIRouter(prefix="/api", tags=["users"])


# ── Platform-scoped: admin sees only platform users ───────────────


@router.get(
    "/users/",
    response_model=List[UserSchema],
    dependencies=[Depends(require_permission("platform:users:read"))],
)
def get_platform_users(db: Session = Depends(get_db)):
    """Platform admin: returns only platform-type users with their role names."""
    from app.models.auth import UserRole
    from app.models.role import Role

    users = db.query(User).filter(User.user_type == "platform").all()

    # Simple way to attach role names
    for user in users:
        role_entry = (
            db.query(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .filter(UserRole.user_id == user.id)
            .first()
        )
        if role_entry:
            user.role = role_entry[0]
        else:
            user.role = "No Role"

    return users


@router.post(
    "/users/",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def create_platform_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Find or create Platform Tenant
        from app.models.auth import Tenant

        platform_tenant = (
            db.query(Tenant).filter(Tenant.tenant_type == "platform").first()
        )
        if not platform_tenant:
            # Create a default platform tenant if it doesn't exist
            # We need a dummy plan ID, but wait, Tenant has foreign key to Plan.
            # We must assume a plan exists or creation will fail.
            # Let's try to find a plan first.
            from app.models.plan import Plan

            enterprise_plan = db.query(Plan).filter(Plan.name == "Enterprise").first()
            if not enterprise_plan:
                # Fallback to any plan
                enterprise_plan = db.query(Plan).first()

            if not enterprise_plan:
                raise HTTPException(
                    status_code=500,
                    detail="No plans available to create Platform Tenant",
                )

            platform_tenant = Tenant(
                name="Platform Admin",
                tenant_type="platform",
                tenant_key="platform_admin",  # Unique key
                plan_id=enterprise_plan.id,
            )
            db.add(platform_tenant)
            db.flush()  # flush to get ID
            db.refresh(platform_tenant)

        user_count = db.query(User).count()
        employee_id = f"ATC-EMP-{(user_count + 1):03d}"

        user_data = user.model_dump(exclude={"password", "role", "hotel_id"})

        # Generate default password if not provided
        raw_password = user.password or "Temppass@123"
        user_data["password_hash"] = get_password_hash(raw_password)

        # Generate username from email if not provided
        if not user_data.get("username"):
            user_data["username"] = user.email.split("@")[0]

        new_user = User(
            **user_data,
            employee_id=employee_id,
            user_type="platform",
            tenant_id=platform_tenant.id,
        )
        db.add(new_user)
        db.flush()

        # Assign role if requested
        if user.role:
            from app.models.role import Role
            from app.models.auth import UserRole

            # Find the role by name or ID
            role_obj = None
            try:
                # Try as UUID
                from uuid import UUID

                role_id = UUID(user.role)
                role_obj = db.query(Role).filter(Role.id == role_id).first()
            except (ValueError, TypeError):
                # Fallback to name match for platform roles
                role_obj = (
                    db.query(Role)
                    .filter(Role.name == user.role, Role.tenant_id.is_(None))
                    .first()
                )

            if role_obj:
                db.add(
                    UserRole(
                        tenant_id=platform_tenant.id,
                        user_id=new_user.id,
                        role_id=role_obj.id,
                    )
                )
            else:
                print(
                    f"WARNING: Role '{user.role}' not found. User created without role."
                )

        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        import traceback

        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=400, detail=f"User creation failed: {str(e)}")


@router.patch(
    "/users/{user_id}",
    response_model=UserSchema,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def update_platform_user(
    user_id: UUID,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
):
    db_user = (
        db.query(User).filter(User.id == user_id, User.user_type == "platform").first()
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True)
    if "password" in update_data:
        password = update_data.pop("password")
        update_data["password_hash"] = get_password_hash(password)

    if "status" in update_data:
        status_val = update_data.pop("status")
        update_data["is_active"] = status_val == "Active"

    role_to_assign = update_data.pop("role", None)

    for key, value in update_data.items():
        setattr(db_user, key, value)

    if role_to_assign:
        from app.models.role import Role
        from app.models.auth import UserRole

        # Find role
        role_obj = None
        try:
            from uuid import UUID

            role_id = UUID(role_to_assign)
            role_obj = db.query(Role).filter(Role.id == role_id).first()
        except (ValueError, TypeError):
            role_obj = (
                db.query(Role)
                .filter(Role.name == role_to_assign, Role.tenant_id.is_(None))
                .first()
            )

        if role_obj:
            # Remove existing platform roles for this user
            db.query(UserRole).filter(
                UserRole.user_id == db_user.id, UserRole.tenant_id == db_user.tenant_id
            ).delete()

            # Add new role
            db.add(
                UserRole(
                    tenant_id=db_user.tenant_id, user_id=db_user.id, role_id=role_obj.id
                )
            )
        else:
            print(f"WARNING: Role '{role_to_assign}' not found. Role not updated.")

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def delete_platform_user(user_id: UUID, db: Session = Depends(get_db)):
    db_user = (
        db.query(User).filter(User.id == user_id, User.user_type == "platform").first()
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return None


# ── Hotel-scoped: each hotel manages its own users ────────────────


@router.get(
    "/hotels/{hotel_id}/users",
    response_model=List[UserSchema],
    dependencies=[Depends(require_permission("hotel:users:read"))],
)
def get_hotel_users(hotel_id: UUID, db: Session = Depends(get_db)):
    """Hotel admin: returns only users belonging to this hotel."""
    from app.models.auth import UserRole
    from app.models.role import Role

    users = db.query(User).filter(User.tenant_id == hotel_id).all()

    for user in users:
        role_entry = (
            db.query(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .filter(UserRole.user_id == user.id, UserRole.tenant_id == hotel_id)
            .first()
        )
        if role_entry:
            user.role = role_entry[0]
        else:
            user.role = "No Role"

    return users


@router.post(
    "/hotels/{hotel_id}/users",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def create_hotel_user(hotel_id: UUID, user: UserCreate, db: Session = Depends(get_db)):
    # ── Plan limit enforcement ──
    check_user_limit(db, hotel_id)

    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_count = db.query(User).filter(User.tenant_id == hotel_id).count()
    employee_id = f"EMP-{(user_count + 1):03d}"

    user_data = user.model_dump(exclude={"password", "role", "hotel_id"})
    if user.password:
        user_data["password_hash"] = get_password_hash(user.password)

    new_user = User(
        **user_data,
        employee_id=employee_id,
        tenant_id=hotel_id,
        user_type="hotel",
    )
    db.add(new_user)
    db.flush()

    # Assign role if requested
    if user.role:
        from app.models.role import Role
        from app.models.auth import UserRole

        role_obj = None
        try:
            from uuid import UUID

            role_id = UUID(user.role)
            role_obj = (
                db.query(Role)
                .filter(Role.id == role_id, Role.tenant_id == hotel_id)
                .first()
            )
        except (ValueError, TypeError):
            role_obj = (
                db.query(Role)
                .filter(Role.name == user.role, Role.tenant_id == hotel_id)
                .first()
            )

        if role_obj:
            db.add(
                UserRole(tenant_id=hotel_id, user_id=new_user.id, role_id=role_obj.id)
            )
        else:
            print(f"WARNING: Role '{user.role}' not found for hotel {hotel_id}.")

    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch(
    "/hotels/{hotel_id}/users/{user_id}",
    response_model=UserSchema,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def update_hotel_user(
    hotel_id: UUID,
    user_id: UUID,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
):
    db_user = (
        db.query(User).filter(User.id == user_id, User.tenant_id == hotel_id).first()
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found in this hotel")

    update_data = user_update.model_dump(exclude_unset=True)
    if "password" in update_data:
        password = update_data.pop("password")
        update_data["password_hash"] = get_password_hash(password)

    if "status" in update_data:
        status_val = update_data.pop("status")
        update_data["is_active"] = status_val == "Active"

    role_to_assign = update_data.pop("role", None)

    for key, value in update_data.items():
        setattr(db_user, key, value)

    if role_to_assign:
        from app.models.role import Role
        from app.models.auth import UserRole

        # Find role
        role_obj = None
        try:
            from uuid import UUID

            role_id = UUID(role_to_assign)
            role_obj = (
                db.query(Role)
                .filter(Role.id == role_id, Role.tenant_id == hotel_id)
                .first()
            )
        except (ValueError, TypeError):
            role_obj = (
                db.query(Role)
                .filter(Role.name == role_to_assign, Role.tenant_id == hotel_id)
                .first()
            )

        if role_obj:
            # Remove existing hotel roles for this user
            db.query(UserRole).filter(
                UserRole.user_id == db_user.id, UserRole.tenant_id == hotel_id
            ).delete()

            # Add new role
            db.add(
                UserRole(tenant_id=hotel_id, user_id=db_user.id, role_id=role_obj.id)
            )
        else:
            print(
                f"WARNING: Role '{role_to_assign}' not found for hotel {hotel_id}. Role not updated."
            )

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete(
    "/hotels/{hotel_id}/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def delete_hotel_user(hotel_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    db_user = (
        db.query(User).filter(User.id == user_id, User.tenant_id == hotel_id).first()
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found in this hotel")

    db.delete(db_user)
    db.commit()
    return None
