from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from models.infrastructure import OLT, ODC, ODP
from schemas.infrastructure import OLTCreate, OLTUpdate, ODCCreate, ODCUpdate, ODPCreate, ODPUpdate

# OLT CRUD Operations
def get_olt(db: Session, olt_id: int) -> Optional[OLT]:
    return db.query(OLT).filter(OLT.id == olt_id).first()

def get_olts(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, status: Optional[str] = None) -> List[OLT]:
    query = db.query(OLT)
    
    if search:
        query = query.filter(
            or_(
                OLT.name.ilike(f"%{search}%"),
                OLT.location.ilike(f"%{search}%"),
                OLT.brand.ilike(f"%{search}%"),
                OLT.model.ilike(f"%{search}%")
            )
        )
    
    if status:
        query = query.filter(OLT.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_olt(db: Session, olt: OLTCreate) -> OLT:
    db_olt = OLT(**olt.dict())
    db.add(db_olt)
    db.commit()
    db.refresh(db_olt)
    return db_olt

def update_olt(db: Session, olt_id: int, olt: OLTUpdate) -> Optional[OLT]:
    db_olt = get_olt(db, olt_id)
    if not db_olt:
        return None
    
    update_data = olt.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_olt, field, value)
    
    db.commit()
    db.refresh(db_olt)
    return db_olt

def delete_olt(db: Session, olt_id: int) -> bool:
    db_olt = get_olt(db, olt_id)
    if not db_olt:
        return False
    
    db.delete(db_olt)
    db.commit()
    return True

# ODC CRUD Operations
def get_odc(db: Session, odc_id: int) -> Optional[ODC]:
    return db.query(ODC).filter(ODC.id == odc_id).first()

def get_odcs(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, olt_id: Optional[int] = None, status: Optional[str] = None) -> List[ODC]:
    query = db.query(ODC)
    
    if search:
        query = query.filter(
            or_(
                ODC.name.ilike(f"%{search}%"),
                ODC.location.ilike(f"%{search}%"),
                ODC.type.ilike(f"%{search}%")
            )
        )
    
    if olt_id:
        query = query.filter(ODC.olt_id == olt_id)
    
    if status:
        query = query.filter(ODC.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_odc(db: Session, odc: ODCCreate) -> ODC:
    db_odc = ODC(**odc.dict())
    db.add(db_odc)
    db.commit()
    db.refresh(db_odc)
    return db_odc

def update_odc(db: Session, odc_id: int, odc: ODCUpdate) -> Optional[ODC]:
    db_odc = get_odc(db, odc_id)
    if not db_odc:
        return None
    
    update_data = odc.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_odc, field, value)
    
    db.commit()
    db.refresh(db_odc)
    return db_odc

def delete_odc(db: Session, odc_id: int) -> bool:
    db_odc = get_odc(db, odc_id)
    if not db_odc:
        return False
    
    db.delete(db_odc)
    db.commit()
    return True

# ODP CRUD Operations
def get_odp(db: Session, odp_id: int) -> Optional[ODP]:
    return db.query(ODP).filter(ODP.id == odp_id).first()

def get_odps(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, odc_id: Optional[int] = None, status: Optional[str] = None) -> List[ODP]:
    query = db.query(ODP)
    
    if search:
        query = query.filter(
            or_(
                ODP.name.ilike(f"%{search}%"),
                ODP.location.ilike(f"%{search}%"),
                ODP.type.ilike(f"%{search}%")
            )
        )
    
    if odc_id:
        query = query.filter(ODP.odc_id == odc_id)
    
    if status:
        query = query.filter(ODP.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_odp(db: Session, odp: ODPCreate) -> ODP:
    db_odp = ODP(**odp.dict())
    db.add(db_odp)
    db.commit()
    db.refresh(db_odp)
    return db_odp

def update_odp(db: Session, odp_id: int, odp: ODPUpdate) -> Optional[ODP]:
    db_odp = get_odp(db, odp_id)
    if not db_odp:
        return None
    
    update_data = odp.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_odp, field, value)
    
    db.commit()
    db.refresh(db_odp)
    return db_odp

def delete_odp(db: Session, odp_id: int) -> bool:
    db_odp = get_odp(db, odp_id)
    if not db_odp:
        return False
    
    db.delete(db_odp)
    db.commit()
    return True

# Get infrastructure hierarchy
def get_infrastructure_hierarchy(db: Session):
    olts = db.query(OLT).filter(OLT.is_active == True).all()
    
    hierarchy = []
    for olt in olts:
        olt_data = {
            "id": olt.id,
            "name": olt.name,
            "location": olt.location,
            "total_ports": olt.total_ports,
            "used_ports": olt.used_ports,
            "status": olt.status,
            "odcs": []
        }
        
        for odc in olt.odcs:
            if odc.is_active:
                odc_data = {
                    "id": odc.id,
                    "name": odc.name,
                    "location": odc.location,
                    "total_ports": odc.total_ports,
                    "used_ports": odc.used_ports,
                    "status": odc.status,
                    "odps": []
                }
                
                for odp in odc.odps:
                    if odp.is_active:
                        odp_data = {
                            "id": odp.id,
                            "name": odp.name,
                            "location": odp.location,
                            "total_ports": odp.total_ports,
                            "used_ports": odp.used_ports,
                            "status": odp.status,
                            "customers": len(odp.customers)
                        }
                        odc_data["odps"].append(odp_data)
                
                olt_data["odcs"].append(odc_data)
        
        hierarchy.append(olt_data)
    
    return hierarchy