from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Date, Enum
from sqlalchemy.types import DECIMAL as Decimal
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum

class SubscriptionStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    expired = "expired"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"

class Package(Base):
    __tablename__ = "packages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    speed = Column(String(50), nullable=True)  # e.g., "20Mbps", "50Mbps"
    price = Column(Decimal(10, 2), nullable=False)
    features = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customers = relationship("Customer", back_populates="package")
    subscriptions = relationship("Subscription", back_populates="package")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    monthly_fee = Column(Decimal(10, 2), nullable=False)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.active)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="subscriptions")
    package = relationship("Package", back_populates="subscriptions")
    payments = relationship("Payment", back_populates="subscription")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    amount = Column(Decimal(10, 2), nullable=False)
    payment_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    payment_method = Column(String(50), nullable=True)
    reference_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="payments")
    subscription = relationship("Subscription", back_populates="payments")