from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.infrastructure import OLT as OLTSchema, OLTCreate, OLTUpdate, ODC as ODCSchema, ODCCreate, ODCUpdate, ODP as ODPSchema, ODPCreate, ODPUpdate
from crud import infrastructure as crud_infrastructure

router = APIRouter(prefix="/infrastructure", tags=["infrastructure"])

# OLT Endpoints
@router.get("/olts", response_model=List[OLTSchema])
def read_olts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    search: Optional[str] = Query(None, description="Search term for OLT name, location, brand, or model"),
    status: Optional[str] = Query(None, description="Filter by OLT status", pattern="^(active|inactive|maintenance)$"),
    db: Session = Depends(get_db)
):
    """Get list of OLTs with optional search and filtering."""
    olts = crud_infrastructure.get_olts(db, skip=skip, limit=limit, search=search, status=status)
    return olts

@router.get("/olts/{olt_id}", response_model=OLTSchema)
def read_olt(olt_id: int, db: Session = Depends(get_db)):
    """Get a specific OLT by ID."""
    db_olt = crud_infrastructure.get_olt(db, olt_id=olt_id)
    if db_olt is None:
        raise HTTPException(status_code=404, detail="OLT not found")
    return db_olt

@router.post("/olts", response_model=OLTSchema)
def create_olt(olt: OLTCreate, db: Session = Depends(get_db)):
    """Create a new OLT."""
    return crud_infrastructure.create_olt(db=db, olt=olt)

@router.put("/olts/{olt_id}", response_model=OLTSchema)
def update_olt(olt_id: int, olt: OLTUpdate, db: Session = Depends(get_db)):
    """Update an existing OLT."""
    db_olt = crud_infrastructure.get_olt(db, olt_id=olt_id)
    if db_olt is None:
        raise HTTPException(status_code=404, detail="OLT not found")
    
    updated_olt = crud_infrastructure.update_olt(db=db, olt_id=olt_id, olt=olt)
    return updated_olt

@router.delete("/olts/{olt_id}")
def delete_olt(olt_id: int, db: Session = Depends(get_db)):
    """Delete an OLT."""
    db_olt = crud_infrastructure.get_olt(db, olt_id=olt_id)
    if db_olt is None:
        raise HTTPException(status_code=404, detail="OLT not found")
    
    success = crud_infrastructure.delete_olt(db=db, olt_id=olt_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete OLT")
    
    return {"message": "OLT deleted successfully"}

# ODC Endpoints
@router.get("/odcs", response_model=List[ODCSchema])
def read_odcs(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    search: Optional[str] = Query(None, description="Search term for ODC name, location, or type"),
    olt_id: Optional[int] = Query(None, description="Filter by OLT ID"),
    status: Optional[str] = Query(None, description="Filter by ODC status", pattern="^(active|inactive|maintenance)$"),
    db: Session = Depends(get_db)
):
    """Get list of ODCs with optional search and filtering."""
    odcs = crud_infrastructure.get_odcs(db, skip=skip, limit=limit, search=search, olt_id=olt_id, status=status)
    return odcs

@router.get("/odcs/{odc_id}", response_model=ODCSchema)
def read_odc(odc_id: int, db: Session = Depends(get_db)):
    """Get a specific ODC by ID."""
    db_odc = crud_infrastructure.get_odc(db, odc_id=odc_id)
    if db_odc is None:
        raise HTTPException(status_code=404, detail="ODC not found")
    return db_odc

@router.post("/odcs", response_model=ODCSchema)
def create_odc(odc: ODCCreate, db: Session = Depends(get_db)):
    """Create a new ODC."""
    # Check if OLT exists
    from crud.infrastructure import get_olt
    olt = get_olt(db, odc.olt_id)
    if not olt:
        raise HTTPException(status_code=404, detail="OLT not found")
    
    return crud_infrastructure.create_odc(db=db, odc=odc)

@router.put("/odcs/{odc_id}", response_model=ODCSchema)
def update_odc(odc_id: int, odc: ODCUpdate, db: Session = Depends(get_db)):
    """Update an existing ODC."""
    db_odc = crud_infrastructure.get_odc(db, odc_id=odc_id)
    if db_odc is None:
        raise HTTPException(status_code=404, detail="ODC not found")
    
    # Check if new OLT exists if olt_id is being updated
    if odc.olt_id:
        from crud.infrastructure import get_olt
        olt = get_olt(db, odc.olt_id)
        if not olt:
            raise HTTPException(status_code=404, detail="OLT not found")
    
    updated_odc = crud_infrastructure.update_odc(db=db, odc_id=odc_id, odc=odc)
    return updated_odc

@router.delete("/odcs/{odc_id}")
def delete_odc(odc_id: int, db: Session = Depends(get_db)):
    """Delete an ODC."""
    db_odc = crud_infrastructure.get_odc(db, odc_id=odc_id)
    if db_odc is None:
        raise HTTPException(status_code=404, detail="ODC not found")
    
    success = crud_infrastructure.delete_odc(db=db, odc_id=odc_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete ODC")
    
    return {"message": "ODC deleted successfully"}

# ODP Endpoints
@router.get("/odps", response_model=List[ODPSchema])
def read_odps(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    search: Optional[str] = Query(None, description="Search term for ODP name, location, or type"),
    odc_id: Optional[int] = Query(None, description="Filter by ODC ID"),
    status: Optional[str] = Query(None, description="Filter by ODP status", pattern="^(active|inactive|maintenance)$"),
    db: Session = Depends(get_db)
):
    """Get list of ODPs with optional search and filtering."""
    odps = crud_infrastructure.get_odps(db, skip=skip, limit=limit, search=search, odc_id=odc_id, status=status)
    return odps

@router.get("/odps/{odp_id}", response_model=ODPSchema)
def read_odp(odp_id: int, db: Session = Depends(get_db)):
    """Get a specific ODP by ID."""
    db_odp = crud_infrastructure.get_odp(db, odp_id=odp_id)
    if db_odp is None:
        raise HTTPException(status_code=404, detail="ODP not found")
    return db_odp

@router.post("/odps", response_model=ODPSchema)
def create_odp(odp: ODPCreate, db: Session = Depends(get_db)):
    """Create a new ODP."""
    # Check if ODC exists
    from crud.infrastructure import get_odc
    odc = get_odc(db, odp.odc_id)
    if not odc:
        raise HTTPException(status_code=404, detail="ODC not found")
    
    return crud_infrastructure.create_odp(db=db, odp=odp)

@router.put("/odps/{odp_id}", response_model=ODPSchema)
def update_odp(odp_id: int, odp: ODPUpdate, db: Session = Depends(get_db)):
    """Update an existing ODP."""
    db_odp = crud_infrastructure.get_odp(db, odp_id=odp_id)
    if db_odp is None:
        raise HTTPException(status_code=404, detail="ODP not found")
    
    # Check if new ODC exists if odc_id is being updated
    if odp.odc_id:
        from crud.infrastructure import get_odc
        odc = get_odc(db, odp.odc_id)
        if not odc:
            raise HTTPException(status_code=404, detail="ODC not found")
    
    updated_odp = crud_infrastructure.update_odp(db=db, odp_id=odp_id, odp=odp)
    return updated_odp

@router.delete("/odps/{odp_id}")
def delete_odp(odp_id: int, db: Session = Depends(get_db)):
    """Delete an ODP."""
    db_odp = crud_infrastructure.get_odp(db, odp_id=odp_id)
    if db_odp is None:
        raise HTTPException(status_code=404, detail="ODP not found")
    
    success = crud_infrastructure.delete_odp(db=db, odp_id=odp_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete ODP")
    
    return {"message": "ODP deleted successfully"}

# Infrastructure Hierarchy Endpoint
@router.get("/hierarchy")
def get_infrastructure_hierarchy(db: Session = Depends(get_db)):
    """Get the complete infrastructure hierarchy (OLT -> ODC -> ODP)."""
    hierarchy = crud_infrastructure.get_infrastructure_hierarchy(db)
    return {"hierarchy": hierarchy}