from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

# Base Customer Schema
class CustomerBase(BaseModel):
    customer_id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., max_length=20)
    address: str = Field(..., min_length=1)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    odp_id: Optional[int] = None
    odc_port: Optional[int] = None
    package_id: Optional[int] = None
    monthly_fee: Decimal = Field(..., ge=0)
    status: str = Field(default="pending", pattern="^(active|inactive|suspended|pending)$")
    registration_date: date
    notes: Optional[str] = None

# Customer Create Schema
class CustomerCreate(CustomerBase):
    pass

# Customer Update Schema
class CustomerUpdate(BaseModel):
    customer_id: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, min_length=1)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    odp_id: Optional[int] = None
    odc_port: Optional[int] = None
    package_id: Optional[int] = None
    monthly_fee: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = Field(None, pattern="^(active|inactive|suspended|pending)$")
    registration_date: Optional[date] = None
    notes: Optional[str] = None

# Customer Response Schema
class Customer(CustomerBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Customer with relationships
class CustomerWithDetails(Customer):
    odp_name: Optional[str] = None
    package_name: Optional[str] = None
    olt_name: Optional[str] = None
    odc_name: Optional[str] = None