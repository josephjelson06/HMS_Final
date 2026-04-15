from __future__ import annotations

from typing import List
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

from app.core.config import get_settings


class CloudinaryUploadError(Exception):
    pass


def _configure_cloudinary() -> None:
    settings = get_settings()
    if (
        not settings.cloudinary_cloud_name
        or not settings.cloudinary_api_key
        or not settings.cloudinary_api_secret
    ):
        raise CloudinaryUploadError(
            "Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, "
            "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
        )

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def _upload_images(images: List[UploadFile], folder: str) -> List[str]:
    _configure_cloudinary()

    uploaded_public_ids: List[str] = []
    uploaded_urls: List[str] = []

    try:
        for image in images:
            result = cloudinary.uploader.upload(
                image.file,
                folder=folder,
                resource_type="image",
            )
            uploaded_public_ids.append(result["public_id"])
            uploaded_urls.append(result["secure_url"])
    except Exception as exc:
        for public_id in uploaded_public_ids:
            try:
                cloudinary.uploader.destroy(public_id, resource_type="image")
            except Exception:
                pass
        raise CloudinaryUploadError("Failed to upload room images to Cloudinary.") from exc

    return uploaded_urls


def upload_room_images(images: List[UploadFile], tenant_id: str) -> List[str]:
    folder = f"hms/tenants/{tenant_id}/rooms"
    return _upload_images(images, folder)


def upload_room_category_images(images: List[UploadFile], tenant_id: str) -> List[str]:
    folder = f"hms/tenants/{tenant_id}/room-categories"
    return _upload_images(images, folder)


def _extract_public_id_from_cloudinary_url(image_url: str) -> str:
    parsed = urlparse(image_url)
    path = parsed.path
    marker = "/upload/"
    marker_idx = path.find(marker)
    if marker_idx == -1:
        raise CloudinaryUploadError("Invalid Cloudinary image URL.")

    remainder = path[marker_idx + len(marker):]
    parts = remainder.split("/")
    if not parts:
        raise CloudinaryUploadError("Invalid Cloudinary image URL.")

    # Strip optional transformation and version segments.
    start_idx = 0
    if parts[0] in {"image", "video", "raw"}:
        start_idx = 1
    if start_idx < len(parts) and parts[start_idx].startswith("v") and parts[start_idx][1:].isdigit():
        start_idx += 1

    public_path = "/".join(parts[start_idx:])
    if "." in public_path:
        public_path = public_path.rsplit(".", 1)[0]
    if not public_path:
        raise CloudinaryUploadError("Could not determine Cloudinary public_id.")
    return public_path


def delete_room_image(image_url: str) -> None:
    _configure_cloudinary()
    try:
        public_id = _extract_public_id_from_cloudinary_url(image_url)
        result = cloudinary.uploader.destroy(public_id, resource_type="image")
        if result.get("result") not in {"ok", "not found"}:
            raise CloudinaryUploadError("Cloudinary image deletion failed.")
    except CloudinaryUploadError:
        raise
    except Exception as exc:
        raise CloudinaryUploadError("Failed to delete room image from Cloudinary.") from exc
