from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# OLT Schemas
class OLTBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    brand: Optional[str] = Field(None, max_length=50)
    model: Optional[str] = Field(None, max_length=100)
    total_ports: int = Field(..., ge=0)
    used_ports: int = Field(default=0, ge=0)
    ip_address: Optional[str] = Field(None, max_length=50)
    status: str = Field(default="active", pattern="^(active|inactive|maintenance)$")
    description: Optional[str] = None

class OLTPortStatus(BaseModel):
    port_number: int
    status: str  # "used" or "available"
    customer_name: Optional[str] = None
    customer_id: Optional[int] = None

class OLTCreate(OLTBase):
    pass

class OLTUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    brand: Optional[str] = Field(None, max_length=50)
    model: Optional[str] = Field(None, max_length=100)
    total_ports: Optional[int] = Field(None, ge=0)
    used_ports: Optional[int] = Field(None, ge=0)
    ip_address: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, pattern="^(active|inactive|maintenance)$")
    description: Optional[str] = None

class OLT(OLTBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ODC Schemas
class ODCBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    olt_id: int
    total_ports: int = Field(..., ge=0)
    used_ports: int = Field(default=0, ge=0)
    type: Optional[str] = Field(None, max_length=50)
    status: str = Field(default="active", pattern="^(active|inactive|maintenance)$")
    description: Optional[str] = None

class ODCCreate(ODCBase):
    pass

class ODCUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    olt_id: Optional[int] = None
    total_ports: Optional[int] = Field(None, ge=0)
    used_ports: Optional[int] = Field(None, ge=0)
    type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, pattern="^(active|inactive|maintenance)$")
    description: Optional[str] = None

class ODC(ODCBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    olt_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# ODP Schemas
class ODPBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    odc_id: int
    total_ports: int = Field(..., ge=0)
    used_ports: int = Field(default=0, ge=0)
    type: Optional[str] = Field(None, max_length=50)
    status: str = Field(default="active", pattern="^(active|inactive|maintenance)$")
    description: Optional[str] = None

class ODPCreate(ODPBase):
    pass

class ODPUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    odc_id: Optional[int] = None
    total_ports: Optional[int] = Field(None, ge=0)
    used_ports: Optional[int] = Field(None, ge=0)
    type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, pattern="^(active|inactive|maintenance)$")
    description: Optional[str] = None

class ODP(ODPBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    odc_name: Optional[str] = None
    
    class Config:
        from_attributes = True