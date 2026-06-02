# Inventory & Order Management System

A production-ready, fully containerized full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, SQLAlchemy, Alembic |
| **Frontend** | React (Vite), Tailwind CSS, React Router |
| **Database** | PostgreSQL 16 |
| **Containerization** | Docker, Docker Compose |

## Features

- **Product Management** — Full CRUD with unique SKU enforcement
- **Customer Management** — Create, list, view, delete with unique email validation
- **Order Management** — Create orders with multiple items, auto stock reduction, auto total calculation
- **Dashboard** — Summary stats (total products, customers, orders) and low stock alerts
- **Inventory Tracking** — Stock validated before orders, auto-reduced on creation, restored on cancellation
- **Responsive UI** — Mobile-first design with sidebar navigation

## Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/Vipul-1/Inventory-and-order-Management.git
cd Inventory-and-order-Management

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/products` | Create a product |
| GET | `/api/v1/products` | List all products |
| GET | `/api/v1/products/{id}` | Get product by ID |
| PUT | `/api/v1/products/{id}` | Update a product |
| DELETE | `/api/v1/products/{id}` | Delete a product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/customers` | Create a customer |
| GET | `/api/v1/customers` | List all customers |
| GET | `/api/v1/customers/{id}` | Get customer by ID |
| DELETE | `/api/v1/customers/{id}` | Delete a customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/orders` | Create an order |
| GET | `/api/v1/orders` | List all orders |
| GET | `/api/v1/orders/{id}` | Get order details |
| DELETE | `/api/v1/orders/{id}` | Cancel/delete an order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/summary` | Dashboard summary |
| GET | `/api/v1/health` | Health check |

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders cannot be placed if inventory is insufficient
- Creating an order automatically reduces available stock
- Cancelling an order restores stock
- Total order amount is auto-calculated by the backend

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── routers/       # FastAPI route handlers
│   │   ├── services/      # Business logic layer
│   │   ├── config.py      # Environment configuration
│   │   ├── database.py    # Database connection
│   │   └── main.py        # FastAPI app entry point
│   ├── alembic/           # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   └── App.jsx        # App router
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | Database name | `inventory_db` |
| `DATABASE_URL` | Full database connection URL | Auto-composed |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `VITE_API_URL` | Backend API URL for frontend | `http://localhost:8000` |

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [inventory-and-order-management.vercel.app](https://inventory-and-order-management-ndn70ljbl-vipul-s-projects5.vercel.app) |
| **Backend API** | [inventory-and-order-management-49zl.onrender.com](https://inventory-and-order-management-49zl.onrender.com) |
| **API Docs** | [Swagger UI](https://inventory-and-order-management-49zl.onrender.com/docs) |
| **Docker Image** | [vipulparihar/inventory-backend](https://hub.docker.com/r/vipulparihar/inventory-backend) |

> **Note**: The backend runs on Render's free tier and may take 30-60 seconds to wake up on first request.

## Deployment

- **Backend**: Deployed on [Render](https://render.com) with PostgreSQL add-on
- **Frontend**: Deployed on [Vercel](https://vercel.com)
- **Docker Image**: Published on [Docker Hub](https://hub.docker.com/r/vipulparihar/inventory-backend)
