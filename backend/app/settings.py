from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.settings import Settings as SettingsSchema, SettingsUpdate
from crud.settings import get_settings, update_settings

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=SettingsSchema)
def read_settings(db: Session = Depends(get_db)):
    return get_settings(db)


@router.put("/", response_model=SettingsSchema)
def put_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    return update_settings(db, payload)


@router.post("/notifications/test")
def test_notifications(db: Session = Depends(get_db)):
    settings = get_settings(db)
    message = {
        "email_enabled": settings.email_notifications,
        "sms_enabled": settings.sms_notifications,
        "detail": "Test notification executed",
    }
    return JSONResponse(content={"message": "Notifikasi tes dikirim", "config": message})


@router.get("/export")
def export_settings(db: Session = Depends(get_db)):
    settings = get_settings(db)
    data = {
        "general": {
            "company_name": settings.company_name,
            "company_address": settings.company_address,
            "company_phone": settings.company_phone,
            "company_email": settings.company_email,
            "website": settings.website,
            "timezone": settings.timezone,
        },
        "notifications": {
            "email_notifications": settings.email_notifications,
            "sms_notifications": settings.sms_notifications,
            "payment_reminders": settings.payment_reminders,
            "maintenance_alerts": settings.maintenance_alerts,
            "new_customer_alerts": settings.new_customer_alerts,
            "low_balance_alerts": settings.low_balance_alerts,
        },
        "security": {
            "two_factor_auth": settings.two_factor_auth,
            "session_timeout": settings.session_timeout,
            "password_expiry": settings.password_expiry,
            "login_attempts": settings.login_attempts,
            "ip_whitelist": settings.ip_whitelist,
            "auto_logout": settings.auto_logout,
        },
        "appearance": {
            "theme": settings.theme,
            "primary_color": settings.primary_color,
            "sidebar_color": settings.sidebar_color,
            "font_size": settings.font_size,
            "language": settings.language,
        },
        "exportDate": str(settings.created_at),
    }
    return JSONResponse(content=data)


@router.post("/import")
def import_settings(payload: dict, db: Session = Depends(get_db)):
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Flatten sections if provided
    flattened = {}
    for section in ("general", "notifications", "security", "appearance"):
        if section in payload and isinstance(payload[section], dict):
            flattened.update(payload[section])

    updated = update_settings(db, SettingsUpdate(**flattened))
    return JSONResponse(content={"message": "Pengaturan berhasil diimpor", "id": updated.id})

