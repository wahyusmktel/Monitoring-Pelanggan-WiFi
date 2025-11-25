from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

# Package Schemas
class PackageBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    speed: Optional[str] = Field(None, max_length=50)  # e.g., "20Mbps", "50Mbps"
    price: Decimal = Field(..., ge=0)
    features: Optional[str] = None

class PackageCreate(PackageBase):
    pass

class PackageUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    speed: Optional[str] = Field(None, max_length=50)
    price: Optional[Decimal] = Field(None, ge=0)
    features: Optional[str] = None

class Package(PackageBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Subscription Schemas
class SubscriptionBase(BaseModel):
    customer_id: int
    package_id: int
    start_date: date
    end_date: Optional[date] = None
    monthly_fee: Decimal = Field(..., ge=0)
    status: str = Field(default="active", pattern="^(active|inactive|suspended|expired)$")
    notes: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    customer_id: Optional[int] = None
    package_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_fee: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = Field(None, pattern="^(active|inactive|suspended|expired)$")
    notes: Optional[str] = None

class Subscription(SubscriptionBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer_name: Optional[str] = None
    package_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    customer_id: int
    subscription_id: int
    amount: Decimal = Field(..., ge=0)
    payment_date: date
    due_date: date
    status: str = Field(default="pending", pattern="^(pending|paid|overdue|cancelled)$")
    payment_method: Optional[str] = Field(None, max_length=50)
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    customer_id: Optional[int] = None
    subscription_id: Optional[int] = None
    amount: Optional[Decimal] = Field(None, ge=0)
    payment_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(pending|paid|overdue|cancelled)$")
    payment_method: Optional[str] = Field(None, max_length=50)
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class Payment(PaymentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer_name: Optional[str] = None
    subscription_id_info: Optional[int] = None
    
    class Config:
        from_attributes = True