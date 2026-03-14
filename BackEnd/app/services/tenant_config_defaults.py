from uuid import UUID

from app.models.tenant import TenantConfig


DEFAULT_TENANT_LANGUAGES = ["hindi", "english", "marathi"]
DEFAULT_TENANT_LANGUAGE = "en"


def build_default_tenant_config(tenant_id: UUID) -> TenantConfig:
    return TenantConfig(
        tenant_id=tenant_id,
        default_lang=DEFAULT_TENANT_LANGUAGE,
        available_lang=list(DEFAULT_TENANT_LANGUAGES),
    )
