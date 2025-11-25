from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.services import Package as PackageSchema, PackageCreate, PackageUpdate, Subscription as SubscriptionSchema, SubscriptionCreate, SubscriptionUpdate, Payment as PaymentSchema, PaymentCreate, PaymentUpdate
from crud import services as crud_services

router = APIRouter(prefix="/services", tags=["services"])

# Package Endpoints
@router.get("/packages", response_model=List[PackageSchema])
def read_packages(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    search: Optional[str] = Query(None, description="Search term for package name, description, or speed"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """Get list of packages with optional search and filtering."""
    packages = crud_services.get_packages(db, skip=skip, limit=limit, search=search, is_active=is_active)
    return packages

@router.get("/packages/{package_id}", response_model=PackageSchema)
def read_package(package_id: int, db: Session = Depends(get_db)):
    """Get a specific package by ID."""
    db_package = crud_services.get_package(db, package_id=package_id)
    if db_package is None:
        raise HTTPException(status_code=404, detail="Package not found")
    return db_package

@router.post("/packages", response_model=PackageSchema)
def create_package(package: PackageCreate, db: Session = Depends(get_db)):
    """Create a new package."""
    return crud_services.create_package(db=db, package=package)

@router.put("/packages/{package_id}", response_model=PackageSchema)
def update_package(package_id: int, package: PackageUpdate, db: Session = Depends(get_db)):
    """Update an existing package."""
    db_package = crud_services.get_package(db, package_id=package_id)
    if db_package is None:
        raise HTTPException(status_code=404, detail="Package not found")
    
    updated_package = crud_services.update_package(db=db, package_id=package_id, package=package)
    return updated_package

@router.delete("/packages/{package_id}")
def delete_package(package_id: int, db: Session = Depends(get_db)):
    """Delete a package."""
    db_package = crud_services.get_package(db, package_id=package_id)
    if db_package is None:
        raise HTTPException(status_code=404, detail="Package not found")
    
    success = crud_services.delete_package(db=db, package_id=package_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete package")
    
    return {"message": "Package deleted successfully"}

# Subscription Endpoints
@router.get("/subscriptions", response_model=List[SubscriptionSchema])
def read_subscriptions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    status: Optional[str] = Query(None, description="Filter by subscription status", pattern="^(active|inactive|suspended|expired)$"),
    db: Session = Depends(get_db)
):
    """Get list of subscriptions with optional filtering."""
    subscriptions = crud_services.get_subscriptions(db, skip=skip, limit=limit, customer_id=customer_id, status=status)
    return subscriptions

@router.get("/subscriptions/{subscription_id}", response_model=SubscriptionSchema)
def read_subscription(subscription_id: int, db: Session = Depends(get_db)):
    """Get a specific subscription by ID."""
    db_subscription = crud_services.get_subscription(db, subscription_id=subscription_id)
    if db_subscription is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return db_subscription

@router.post("/subscriptions", response_model=SubscriptionSchema)
def create_subscription(subscription: SubscriptionCreate, db: Session = Depends(get_db)):
    """Create a new subscription."""
    # Check if customer exists
    from crud.customer import get_customer
    customer = get_customer(db, subscription.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if package exists
    from crud.services import get_package
    package = get_package(db, subscription.package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    return crud_services.create_subscription(db=db, subscription=subscription)

@router.put("/subscriptions/{subscription_id}", response_model=SubscriptionSchema)
def update_subscription(subscription_id: int, subscription: SubscriptionUpdate, db: Session = Depends(get_db)):
    """Update an existing subscription."""
    db_subscription = crud_services.get_subscription(db, subscription_id=subscription_id)
    if db_subscription is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check if new customer exists if customer_id is being updated
    if subscription.customer_id:
        from crud.customer import get_customer
        customer = get_customer(db, subscription.customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if new package exists if package_id is being updated
    if subscription.package_id:
        from crud.services import get_package
        package = get_package(db, subscription.package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
    
    updated_subscription = crud_services.update_subscription(db=db, subscription_id=subscription_id, subscription=subscription)
    return updated_subscription

@router.delete("/subscriptions/{subscription_id}")
def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    """Delete a subscription."""
    db_subscription = crud_services.get_subscription(db, subscription_id=subscription_id)
    if db_subscription is None:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    success = crud_services.delete_subscription(db=db, subscription_id=subscription_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete subscription")
    
    return {"message": "Subscription deleted successfully"}

@router.get("/subscriptions/active", response_model=List[SubscriptionSchema])
def read_active_subscriptions(db: Session = Depends(get_db)):
    """Get all active subscriptions."""
    subscriptions = crud_services.get_active_subscriptions(db)
    return subscriptions

@router.get("/subscriptions/expiring")
def read_expiring_subscriptions(days_ahead: int = Query(7, ge=1, description="Number of days ahead to check for expiring subscriptions"), db: Session = Depends(get_db)):
    """Get subscriptions that will expire within the specified number of days."""
    subscriptions = crud_services.get_expiring_subscriptions(db, days_ahead=days_ahead)
    return subscriptions

# Payment Endpoints
@router.get("/payments", response_model=List[PaymentSchema])
def read_payments(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    subscription_id: Optional[int] = Query(None, description="Filter by subscription ID"),
    status: Optional[str] = Query(None, description="Filter by payment status", pattern="^(pending|paid|overdue|cancelled)$"),
    db: Session = Depends(get_db)
):
    """Get list of payments with optional filtering."""
    payments = crud_services.get_payments(db, skip=skip, limit=limit, customer_id=customer_id, subscription_id=subscription_id, status=status)
    return payments

@router.get("/payments/{payment_id}", response_model=PaymentSchema)
def read_payment(payment_id: int, db: Session = Depends(get_db)):
    """Get a specific payment by ID."""
    db_payment = crud_services.get_payment(db, payment_id=payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

@router.post("/payments", response_model=PaymentSchema)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """Create a new payment."""
    # Check if customer exists
    from crud.customer import get_customer
    customer = get_customer(db, payment.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if subscription exists
    from crud.services import get_subscription
    subscription = get_subscription(db, payment.subscription_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    return crud_services.create_payment(db=db, payment=payment)

@router.put("/payments/{payment_id}", response_model=PaymentSchema)
def update_payment(payment_id: int, payment: PaymentUpdate, db: Session = Depends(get_db)):
    """Update an existing payment."""
    db_payment = crud_services.get_payment(db, payment_id=payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Check if new customer exists if customer_id is being updated
    if payment.customer_id:
        from crud.customer import get_customer
        customer = get_customer(db, payment.customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
    
    # Check if new subscription exists if subscription_id is being updated
    if payment.subscription_id:
        from crud.services import get_subscription
        subscription = get_subscription(db, payment.subscription_id)
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
    
    updated_payment = crud_services.update_payment(db=db, payment_id=payment_id, payment=payment)
    return updated_payment

@router.delete("/payments/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    """Delete a payment."""
    db_payment = crud_services.get_payment(db, payment_id=payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    success = crud_services.delete_payment(db=db, payment_id=payment_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete payment")
    
    return {"message": "Payment deleted successfully"}

@router.get("/payments/overdue", response_model=List[PaymentSchema])
def read_overdue_payments(db: Session = Depends(get_db)):
    """Get all overdue payments."""
    payments = crud_services.get_overdue_payments(db)
    return payments

@router.get("/payments/summary")
def read_payment_summary(
    start_date: Optional[date] = Query(None, description="Start date for summary (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date for summary (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Get payment summary with optional date range filtering."""
    summary = crud_services.get_payment_summary(db, start_date=start_date, end_date=end_date)
    return summary