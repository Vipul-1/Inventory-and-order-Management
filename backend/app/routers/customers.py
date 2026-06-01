from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.services import customer_service

router = APIRouter()


@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    return customer_service.create_customer(db, data)


@router.get("/customers", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return customer_service.get_all_customers(db)


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.get_customer_by_id(db, customer_id)


@router.delete("/customers/{customer_id}", response_model=CustomerResponse)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.delete_customer(db, customer_id)
