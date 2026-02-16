from __future__ import annotations

import hmac
import secrets

import bcrypt


MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_BYTES = 72
TEMP_PASSWORD_LENGTH = 24

_DUMMY_PASSWORD = "dummy-password-never-used-for-auth"
DUMMY_HASH = bcrypt.hashpw(_DUMMY_PASSWORD.encode("utf-8"), bcrypt.gensalt(rounds=12))


class PasswordValidationError(ValueError):
    pass


def validate_password_rules(password: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise PasswordValidationError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long.")

    password_bytes = password.encode("utf-8")
    if len(password_bytes) > MAX_PASSWORD_BYTES:
        raise PasswordValidationError(
            f"Password is too long for bcrypt. Max length is {MAX_PASSWORD_BYTES} bytes."
        )


def hash_password(password: str) -> str:
    validate_password_rules(password)
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12))
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        candidate_hash = bcrypt.hashpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False
    return hmac.compare_digest(candidate_hash, password_hash.encode("utf-8"))


def verify_password_constant_time(password: str, password_hash: str | None) -> bool:
    """
    Verify in constant-time style for both existent and non-existent users.
    """
    if password_hash is None:
        candidate_hash = bcrypt.hashpw(password.encode("utf-8"), DUMMY_HASH)
        hmac.compare_digest(candidate_hash, DUMMY_HASH)
        return False

    return verify_password(password, password_hash)


def generate_temporary_password() -> str:
    return secrets.token_urlsafe(TEMP_PASSWORD_LENGTH)
