from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.customer import Customer as CustomerSchema, CustomerCreate, CustomerUpdate, CustomerWithDetails
from crud import customer as crud_customer

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("/", response_model=List[CustomerSchema])
def read_customers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    search: Optional[str] = Query(None, description="Search term for customer name, email, phone, address, or customer ID"),
    status: Optional[str] = Query(None, description="Filter by customer status", pattern="^(active|inactive|suspended|pending)$"),
    db: Session = Depends(get_db)
):
    """Get list of customers with optional search and filtering."""
    customers = crud_customer.get_customers(db, skip=skip, limit=limit, search=search, status=status)
    return customers

@router.get("/{customer_id}", response_model=CustomerSchema)
def read_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a specific customer by ID."""
    db_customer = crud_customer.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.get("/by-customer-id/{customer_id}", response_model=CustomerSchema)
def read_customer_by_customer_id(customer_id: str, db: Session = Depends(get_db)):
    """Get a specific customer by customer ID."""
    db_customer = crud_customer.get_customer_by_customer_id(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.post("/", response_model=CustomerSchema)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer."""
    # Check if customer ID already exists
    db_customer = crud_customer.get_customer_by_customer_id(db, customer_id=customer.customer_id)
    if db_customer:
        raise HTTPException(status_code=400, detail="Customer ID already registered")
    
    # Check if email already exists
    db_customer = crud_customer.get_customer_by_email(db, email=customer.email)
    if db_customer:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud_customer.create_customer(db=db, customer=customer)

@router.put("/{customer_id}", response_model=CustomerSchema)
def update_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    """Update an existing customer."""
    db_customer = crud_customer.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if new customer ID conflicts with existing ones
    if customer.customer_id and customer.customer_id != db_customer.customer_id:
        existing_customer = crud_customer.get_customer_by_customer_id(db, customer_id=customer.customer_id)
        if existing_customer:
            raise HTTPException(status_code=400, detail="Customer ID already in use")
    
    # Check if new email conflicts with existing ones
    if customer.email and customer.email != db_customer.email:
        existing_customer = crud_customer.get_customer_by_email(db, email=customer.email)
        if existing_customer:
            raise HTTPException(status_code=400, detail="Email already in use")
    
    updated_customer = crud_customer.update_customer(db=db, customer_id=customer_id, customer=customer)
    return updated_customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer."""
    db_customer = crud_customer.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    success = crud_customer.delete_customer(db=db, customer_id=customer_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete customer")
    
    return {"message": "Customer deleted successfully"}

@router.get("/stats/status-summary")
def get_customer_status_summary(db: Session = Depends(get_db)):
    """Get customer count grouped by status."""
    summary = crud_customer.get_customer_count_by_status(db)
    return summary

@router.get("/stats/active-count")
def get_active_customer_count(db: Session = Depends(get_db)):
    """Get count of active customers."""
    active_customers = crud_customer.get_active_customers(db)
    return {"count": len(active_customers)}

@router.get("/by-package/{package_id}", response_model=List[CustomerSchema])
def get_customers_by_package(package_id: int, db: Session = Depends(get_db)):
    """Get customers by package ID."""
    customers = crud_customer.get_customers_by_package(db, package_id=package_id)
    return customers

@router.get("/by-odp/{odp_id}", response_model=List[CustomerSchema])
def get_customers_by_odp(odp_id: int, db: Session = Depends(get_db)):
    """Get customers by ODP ID."""
    customers = crud_customer.get_customers_by_odp(db, odp_id=odp_id)
    return customers