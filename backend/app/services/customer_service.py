from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def create_customer(db: Session, data: CustomerCreate) -> Customer:
    customer = Customer(**data.model_dump())
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with email '{data.email}' already exists",
        )
    return customer


def get_all_customers(db: Session) -> list[Customer]:
    return db.query(Customer).order_by(Customer.id).all()


def get_customer_by_id(db: Session, customer_id: int) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {customer_id} not found",
        )
    return customer


def delete_customer(db: Session, customer_id: int) -> Customer:
    customer = get_customer_by_id(db, customer_id)
    db.delete(customer)
    db.commit()
    return customer
