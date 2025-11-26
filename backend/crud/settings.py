from sqlalchemy.orm import Session
from models.settings import SystemSettings
from schemas.settings import SettingsUpdate


def get_settings(db: Session) -> SystemSettings:
    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, payload: SettingsUpdate) -> SystemSettings:
    settings = get_settings(db)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(settings, key, value)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

