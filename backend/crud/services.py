from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from datetime import date, datetime, timedelta
from models.services import Package, Subscription, Payment
from schemas.services import PackageCreate, PackageUpdate, SubscriptionCreate, SubscriptionUpdate, PaymentCreate, PaymentUpdate

# Package CRUD Operations
def get_package(db: Session, package_id: int) -> Optional[Package]:
    return db.query(Package).filter(Package.id == package_id).first()

def get_packages(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, is_active: Optional[bool] = None) -> List[Package]:
    query = db.query(Package)
    
    if search:
        query = query.filter(
            or_(
                Package.name.ilike(f"%{search}%"),
                Package.description.ilike(f"%{search}%"),
                Package.speed.ilike(f"%{search}%")
            )
        )
    
    if is_active is not None:
        query = query.filter(Package.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

def create_package(db: Session, package: PackageCreate) -> Package:
    db_package = Package(**package.dict())
    db.add(db_package)
    db.commit()
    db.refresh(db_package)
    return db_package

def update_package(db: Session, package_id: int, package: PackageUpdate) -> Optional[Package]:
    db_package = get_package(db, package_id)
    if not db_package:
        return None
    
    update_data = package.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_package, field, value)
    
    db.commit()
    db.refresh(db_package)
    return db_package

def delete_package(db: Session, package_id: int) -> bool:
    db_package = get_package(db, package_id)
    if not db_package:
        return False
    
    db.delete(db_package)
    db.commit()
    return True

# Subscription CRUD Operations
def get_subscription(db: Session, subscription_id: int) -> Optional[Subscription]:
    return db.query(Subscription).filter(Subscription.id == subscription_id).first()

def get_subscriptions(db: Session, skip: int = 0, limit: int = 100, customer_id: Optional[int] = None, status: Optional[str] = None) -> List[Subscription]:
    query = db.query(Subscription)
    
    if customer_id:
        query = query.filter(Subscription.customer_id == customer_id)
    
    if status:
        query = query.filter(Subscription.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_subscription(db: Session, subscription: SubscriptionCreate) -> Subscription:
    db_subscription = Subscription(**subscription.dict())
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

def update_subscription(db: Session, subscription_id: int, subscription: SubscriptionUpdate) -> Optional[Subscription]:
    db_subscription = get_subscription(db, subscription_id)
    if not db_subscription:
        return None
    
    update_data = subscription.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_subscription, field, value)
    
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

def delete_subscription(db: Session, subscription_id: int) -> bool:
    db_subscription = get_subscription(db, subscription_id)
    if not db_subscription:
        return False
    
    db.delete(db_subscription)
    db.commit()
    return True

def get_active_subscriptions(db: Session) -> List[Subscription]:
    return db.query(Subscription).filter(Subscription.status == "active").all()

def get_expiring_subscriptions(db: Session, days_ahead: int = 7) -> List[Subscription]:
    future_date = date.today() + timedelta(days=days_ahead)
    return db.query(Subscription).filter(
        and_(
            Subscription.status == "active",
            Subscription.end_date <= future_date,
            Subscription.end_date >= date.today()
        )
    ).all()

# Payment CRUD Operations
def get_payment(db: Session, payment_id: int) -> Optional[Payment]:
    return db.query(Payment).filter(Payment.id == payment_id).first()

def get_payments(db: Session, skip: int = 0, limit: int = 100, customer_id: Optional[int] = None, subscription_id: Optional[int] = None, status: Optional[str] = None) -> List[Payment]:
    query = db.query(Payment)
    
    if customer_id:
        query = query.filter(Payment.customer_id == customer_id)
    
    if subscription_id:
        query = query.filter(Payment.subscription_id == subscription_id)
    
    if status:
        query = query.filter(Payment.status == status)
    
    return query.offset(skip).limit(limit).all()

def create_payment(db: Session, payment: PaymentCreate) -> Payment:
    db_payment = Payment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def update_payment(db: Session, payment_id: int, payment: PaymentUpdate) -> Optional[Payment]:
    db_payment = get_payment(db, payment_id)
    if not db_payment:
        return None
    
    update_data = payment.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_payment, field, value)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment

def delete_payment(db: Session, payment_id: int) -> bool:
    db_payment = get_payment(db, payment_id)
    if not db_payment:
        return False
    
    db.delete(db_payment)
    db.commit()
    return True

def get_overdue_payments(db: Session) -> List[Payment]:
    return db.query(Payment).filter(
        and_(
            Payment.status == "overdue",
            Payment.due_date < date.today()
        )
    ).all()

def get_payment_summary(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> dict:
    query = db.query(Payment)
    
    if start_date:
        query = query.filter(Payment.payment_date >= start_date)
    
    if end_date:
        query = query.filter(Payment.payment_date <= end_date)
    
    total_payments = query.count()
    total_amount = db.query(func.sum(Payment.amount)).filter(Payment.status == "paid").scalar() or 0
    
    status_summary = db.query(
        Payment.status,
        func.count(Payment.id).label('count'),
        func.sum(Payment.amount).label('total_amount')
    ).group_by(Payment.status).all()
    
    return {
        "total_payments": total_payments,
        "total_amount": float(total_amount),
        "status_breakdown": [
            {"status": status, "count": count, "total_amount": float(total_amount or 0)}
            for status, count, total_amount in status_summary
        ]
    }