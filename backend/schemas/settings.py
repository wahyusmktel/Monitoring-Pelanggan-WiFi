from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SettingsBase(BaseModel):
    # General
    company_name: Optional[str] = Field(None, max_length=150)
    company_address: Optional[str] = None
    company_phone: Optional[str] = Field(None, max_length=50)
    company_email: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=150)
    timezone: Optional[str] = Field("Asia/Jakarta", max_length=50)

    # Notifications
    email_notifications: Optional[bool] = True
    sms_notifications: Optional[bool] = False
    payment_reminders: Optional[bool] = True
    maintenance_alerts: Optional[bool] = True
    new_customer_alerts: Optional[bool] = True
    low_balance_alerts: Optional[bool] = True

    # Security
    two_factor_auth: Optional[bool] = False
    session_timeout: Optional[int] = Field(30, ge=5, le=1440)
    password_expiry: Optional[int] = Field(90, ge=1, le=365)
    login_attempts: Optional[int] = Field(5, ge=1, le=10)
    ip_whitelist: Optional[str] = None
    auto_logout: Optional[bool] = True

    # Appearance
    theme: Optional[str] = Field("light", pattern="^(light|dark|auto)$")
    primary_color: Optional[str] = Field("#2563eb", max_length=20)
    sidebar_color: Optional[str] = Field("#1e40af", max_length=20)
    font_size: Optional[str] = Field("medium", pattern="^(small|medium|large)$")
    language: Optional[str] = Field("id", pattern="^(id|en)$")


class SettingsUpdate(SettingsBase):
    pass


class Settings(SettingsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

