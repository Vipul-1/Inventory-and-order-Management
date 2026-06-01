from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services import product_service

router = APIRouter()


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(db, data)


@router.get("/products", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return product_service.get_all_products(db)


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product_by_id(db, product_id)


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    return product_service.update_product(db, product_id, data)


@router.delete("/products/{product_id}", response_model=ProductResponse)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.delete_product(db, product_id)
