from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from models.customer import Customer
from schemas.customer import CustomerCreate, CustomerUpdate

def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.id == customer_id).first()

def get_customer_by_customer_id(db: Session, customer_id: str) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.customer_id == customer_id).first()

def get_customer_by_email(db: Session, email: str) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, status: Optional[str] = None) -> List[Customer]:
    query = db.query(Customer)
    
    if search:
        query = query.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
                Customer.phone.ilike(f"%{search}%"),
                Customer.address.ilike(f"%{search}%"),
                Customer.customer_id.ilike(f"%{search}%")
            )
        )
    
    if status:
        query = query.filter(Customer.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_customer(db: Session, customer: CustomerCreate) -> Customer:
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, customer: CustomerUpdate) -> Optional[Customer]:
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    
    update_data = customer.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_customer, field, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int) -> bool:
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return False
    
    db.delete(db_customer)
    db.commit()
    return True

def get_active_customers(db: Session) -> List[Customer]:
    return db.query(Customer).filter(Customer.is_active == True).all()

def get_customers_by_package(db: Session, package_id: int) -> List[Customer]:
    return db.query(Customer).filter(Customer.package_id == package_id).all()

def get_customers_by_odp(db: Session, odp_id: int) -> List[Customer]:
    return db.query(Customer).filter(Customer.odp_id == odp_id).all()

def get_customer_count_by_status(db: Session) -> dict:
    from sqlalchemy import func
    
    result = db.query(
        Customer.status,
        func.count(Customer.id).label('count')
    ).group_by(Customer.status).all()
    
    return {status: count for status, count in result}