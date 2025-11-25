from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Date, Enum
from sqlalchemy.types import DECIMAL as Decimal
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum

class CustomerStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    pending = "pending"

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    odp_id = Column(Integer, ForeignKey("odps.id"), nullable=True)
    odc_port = Column(Integer, nullable=True)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=True)
    monthly_fee = Column(Decimal(10, 2), nullable=False, default=0.00)
    status = Column(Enum(CustomerStatus), default=CustomerStatus.pending)
    registration_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    odp = relationship("ODP", back_populates="customers")
    package = relationship("Package", back_populates="customers")
    subscriptions = relationship("Subscription", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")