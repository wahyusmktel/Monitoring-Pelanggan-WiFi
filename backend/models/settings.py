from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.sql import func
from core.database import Base


class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)

    # General
    company_name = Column(String(150), nullable=True)
    company_address = Column(Text, nullable=True)
    company_phone = Column(String(50), nullable=True)
    company_email = Column(String(100), nullable=True)
    website = Column(String(150), nullable=True)
    timezone = Column(String(50), nullable=True, default="Asia/Jakarta")

    # Notifications
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    payment_reminders = Column(Boolean, default=True)
    maintenance_alerts = Column(Boolean, default=True)
    new_customer_alerts = Column(Boolean, default=True)
    low_balance_alerts = Column(Boolean, default=True)

    # Security
    two_factor_auth = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=30)  # minutes
    password_expiry = Column(Integer, default=90)  # days
    login_attempts = Column(Integer, default=5)
    ip_whitelist = Column(Text, nullable=True)
    auto_logout = Column(Boolean, default=True)

    # Appearance
    theme = Column(String(20), default="light")
    primary_color = Column(String(20), default="#2563eb")
    sidebar_color = Column(String(20), default="#1e40af")
    font_size = Column(String(20), default="medium")
    language = Column(String(10), default="id")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

