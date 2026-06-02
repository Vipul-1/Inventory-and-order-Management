from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.routers import products, customers, orders, dashboard

app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    description="Production-ready API for managing products, customers, orders and inventory",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/v1", tags=["Products"])
app.include_router(customers.router, prefix="/api/v1", tags=["Customers"])
app.include_router(orders.router, prefix="/api/v1", tags=["Orders"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])


@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
