from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.types import DECIMAL as Decimal
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class OLT(Base):
    __tablename__ = "olts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    brand = Column(String(50), nullable=True)
    model = Column(String(100), nullable=True)
    total_ports = Column(Integer, nullable=False, default=0)
    used_ports = Column(Integer, nullable=False, default=0)
    ip_address = Column(String(50), nullable=True)
    status = Column(String(20), default="active")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    odcs = relationship("ODC", back_populates="olt")

class ODC(Base):
    __tablename__ = "odcs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    olt_id = Column(Integer, ForeignKey("olts.id"), nullable=False)
    total_ports = Column(Integer, nullable=False, default=0)
    used_ports = Column(Integer, nullable=False, default=0)
    type = Column(String(50), nullable=True)
    status = Column(String(20), default="active")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    olt = relationship("OLT", back_populates="odcs")
    odps = relationship("ODP", back_populates="odc")

class ODP(Base):
    __tablename__ = "odps"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    odc_id = Column(Integer, ForeignKey("odcs.id"), nullable=False)
    total_ports = Column(Integer, nullable=False, default=0)
    used_ports = Column(Integer, nullable=False, default=0)
    type = Column(String(50), nullable=True)
    status = Column(String(20), default="active")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    odc = relationship("ODC", back_populates="odps")
    customers = relationship("Customer", back_populates="odp")