# Implementation Plan: Inventory & Order Management System

## 1. Assessment Summary

Build a full-stack **Inventory & Order Management System** with:
- **Backend**: Python / FastAPI + PostgreSQL
- **Frontend**: React (JavaScript)
- **Containerization**: Docker + Docker Compose
- **Deployment**: Backend on Render, Frontend on Vercel

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Frontend    │  │   Backend    │  │  PostgreSQL   │  │
│  │   (React)     │  │  (FastAPI)   │  │   Database    │  │
│  │   Port 3000   │──│  Port 8000   │──│   Port 5432   │  │
│  │   Nginx       │  │  Uvicorn     │  │   Volume:     │  │
│  │               │  │              │  │   pgdata      │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Production Deployment:**
```
┌──────────────┐       HTTPS        ┌──────────────┐       ┌──────────────┐
│   Vercel      │  ──────────────▶  │   Render      │  ──▶ │  Render      │
│   (React SPA) │   API calls       │   (FastAPI)   │      │  PostgreSQL  │
└──────────────┘                    └──────────────┘       └──────────────┘
```

### Technology Choices & Rationale

| Choice | Why |
|--------|-----|
| **FastAPI** over Flask | Auto-generated OpenAPI docs, Pydantic validation, async support, type safety |
| **SQLAlchemy 2.0** | Industry-standard ORM, migration support via Alembic |
| **Alembic** | Database migration management for production |
| **React + Vite** | Fast dev server, optimized production builds |
| **Tailwind CSS** | Rapid responsive UI development, no custom CSS bloat |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with interceptors for error handling |
| **Render** for backend | Free tier with PostgreSQL add-on, Docker support |
| **Vercel** for frontend | Free tier, excellent React/Vite support |

---

## 3. Database Schema

### ERD

```
┌─────────────────────┐       ┌─────────────────────┐
│      products        │       │     customers        │
├─────────────────────┤       ├─────────────────────┤
│ id (PK, serial)     │       │ id (PK, serial)     │
│ name (varchar 255)  │       │ full_name (varchar)  │
│ sku (varchar, UQ)   │       │ email (varchar, UQ)  │
│ price (numeric 10,2)│       │ phone (varchar 20)   │
│ quantity (int >= 0)  │       │ created_at (ts)      │
│ description (text)   │       │ updated_at (ts)      │
│ created_at (ts)      │       └─────────┬───────────┘
│ updated_at (ts)      │                 │
└─────────┬───────────┘                 │
          │                              │
          │         ┌────────────────────┘
          │         │
          ▼         ▼
┌─────────────────────────┐
│        orders            │
├─────────────────────────┤
│ id (PK, serial)         │
│ customer_id (FK)        │
│ total_amount (numeric)  │
│ status (varchar)        │
│ created_at (ts)         │
│ updated_at (ts)         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│      order_items         │
├─────────────────────────┤
│ id (PK, serial)         │
│ order_id (FK)           │
│ product_id (FK)         │
│ quantity (int)          │
│ unit_price (numeric)    │
│ line_total (numeric)    │
└─────────────────────────┘
```

### Key Constraints
- `products.sku` — UNIQUE, NOT NULL
- `products.quantity` — CHECK >= 0
- `products.price` — CHECK > 0
- `customers.email` — UNIQUE, NOT NULL
- `orders.customer_id` — FK to customers(id)
- `order_items.order_id` — FK to orders(id) ON DELETE CASCADE
- `order_items.product_id` — FK to products(id)
- All tables have `created_at` (default NOW) and `updated_at` (auto-update)

### Design Decision: `order_items` Junction Table
The assessment says orders can have multiple "Product reference(s)". A separate `order_items` table allows:
- Multiple products per order
- Per-item quantity tracking
- `line_total = unit_price * quantity` stored at order time (price snapshot)
- `orders.total_amount = SUM(order_items.line_total)`

---

## 4. API Design

Base URL: `/api/v1`

### 4.1 Products API

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| POST | `/api/v1/products` | Create product | 201, 400, 409 (duplicate SKU) |
| GET | `/api/v1/products` | List all products | 200 |
| GET | `/api/v1/products/{id}` | Get product by ID | 200, 404 |
| PUT | `/api/v1/products/{id}` | Update product | 200, 400, 404, 409 |
| DELETE | `/api/v1/products/{id}` | Delete product | 200, 404 |

**Product Request Schema:**
```json
{
  "name": "string (required, max 255)",
  "sku": "string (required, unique)",
  "price": "number (required, > 0)",
  "quantity": "integer (required, >= 0)",
  "description": "string (optional)"
}
```

### 4.2 Customers API

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| POST | `/api/v1/customers` | Create customer | 201, 400, 409 (duplicate email) |
| GET | `/api/v1/customers` | List all customers | 200 |
| GET | `/api/v1/customers/{id}` | Get customer by ID | 200, 404 |
| DELETE | `/api/v1/customers/{id}` | Delete customer | 200, 404 |

**Customer Request Schema:**
```json
{
  "full_name": "string (required, max 255)",
  "email": "string (required, valid email, unique)",
  "phone": "string (required, max 20)"
}
```

### 4.3 Orders API

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| POST | `/api/v1/orders` | Create order | 201, 400, 404, 409 (insufficient stock) |
| GET | `/api/v1/orders` | List all orders | 200 |
| GET | `/api/v1/orders/{id}` | Get order details | 200, 404 |
| DELETE | `/api/v1/orders/{id}` | Cancel/delete order | 200, 404 |

**Order Create Request Schema:**
```json
{
  "customer_id": "integer (required)",
  "items": [
    {
      "product_id": "integer (required)",
      "quantity": "integer (required, > 0)"
    }
  ]
}
```

**Order Response Schema (includes computed fields):**
```json
{
  "id": 1,
  "customer_id": 1,
  "customer": { "id": 1, "full_name": "...", "email": "..." },
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product": { "id": 1, "name": "...", "sku": "..." },
      "quantity": 2,
      "unit_price": 29.99,
      "line_total": 59.98
    }
  ],
  "total_amount": 59.98,
  "status": "completed",
  "created_at": "2026-06-02T00:00:00Z"
}
```

### 4.4 Dashboard API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/summary` | Counts + low stock products |

**Response:**
```json
{
  "total_products": 25,
  "total_customers": 10,
  "total_orders": 15,
  "low_stock_products": [
    { "id": 3, "name": "Widget", "sku": "WDG-001", "quantity": 2 }
  ]
}
```

### 4.5 Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Liveness check |

---

## 5. Business Logic Implementation

| Rule | Implementation |
|------|----------------|
| Unique SKU | DB UNIQUE constraint + Pydantic check, return 409 on conflict |
| Unique email | DB UNIQUE constraint + Pydantic check, return 409 on conflict |
| No negative quantity | DB CHECK constraint + Pydantic `ge=0` validator |
| Insufficient stock check | Before order creation, query product quantities; if any `product.quantity < ordered_quantity`, return 400 with clear error |
| Auto stock reduction | Within a DB transaction: create order → decrement each product's quantity → commit (rollback on any failure) |
| Auto total calculation | Backend calculates `line_total = unit_price * quantity` per item, `total_amount = SUM(line_totals)` — frontend never sends totals |
| Order cancellation | On DELETE, restore stock quantities (add back) within a transaction |

### Transaction Safety
Order creation uses a database transaction:
1. Validate customer exists
2. Validate all products exist
3. Check all product quantities are sufficient
4. Create order record
5. Create order_item records (snapshot unit_price from product)
6. Decrement product quantities
7. COMMIT (or ROLLBACK on any failure)

---

## 6. Frontend Architecture

### Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Summary stats, low stock alerts |
| `/products` | Product List | Table with CRUD actions |
| `/products/new` | Add Product | Form |
| `/products/:id/edit` | Edit Product | Pre-filled form |
| `/customers` | Customer List | Table with add/delete |
| `/customers/new` | Add Customer | Form |
| `/orders` | Order List | Table view |
| `/orders/new` | Create Order | Customer + product selection form |
| `/orders/:id` | Order Details | Full order breakdown |

### Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── Layout.jsx
│   ├── common/
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── DataTable.jsx
│   │   └── StatsCard.jsx
│   ├── products/
│   │   ├── ProductForm.jsx
│   │   └── ProductList.jsx
│   ├── customers/
│   │   ├── CustomerForm.jsx
│   │   └── CustomerList.jsx
│   └── orders/
│       ├── OrderForm.jsx
│       ├── OrderList.jsx
│       └── OrderDetails.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── ProductCreate.jsx
│   ├── ProductEdit.jsx
│   ├── Customers.jsx
│   ├── CustomerCreate.jsx
│   ├── Orders.jsx
│   ├── OrderCreate.jsx
│   └── OrderDetail.jsx
├── services/
│   └── api.js            (Axios instance + API functions)
├── App.jsx
├── main.jsx
└── index.css
```

### State Management
- **React useState/useEffect** for local component state
- **No Redux** — the app's state is simple enough that prop drilling + hooks suffice
- Axios instance with base URL from environment variable `VITE_API_URL`

### UI Framework
- **Tailwind CSS** for responsive styling
- **Heroicons** for icons
- Mobile-first responsive design
- Toast notifications for success/error feedback

---

## 7. Project Folder Structure

```
Inventory-and-order-Management/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings from env vars
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── product.py
│   │   │   ├── customer.py
│   │   │   ├── order.py
│   │   │   └── order_item.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── product.py
│   │   │   ├── customer.py
│   │   │   ├── order.py
│   │   │   └── dashboard.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── products.py
│   │   │   ├── customers.py
│   │   │   ├── orders.py
│   │   │   └── dashboard.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── product_service.py
│   │       ├── customer_service.py
│   │       └── order_service.py
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── .gitignore
├── docs/
│   └── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## 8. Docker Strategy

### Backend Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY ./app ./app
COPY alembic/ ./alembic/
COPY alembic.ini .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile (Multi-stage with Nginx)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### docker-compose.yml
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: ${VITE_API_URL:-http://localhost:8000}
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## 9. Deployment Strategy

### Backend — Render
1. Push backend Docker image to Docker Hub
2. Create a **Web Service** on Render from Docker Hub image
3. Add a **PostgreSQL** add-on on Render (free tier)
4. Set environment variables:
   - `DATABASE_URL` (auto-set by Render PostgreSQL add-on)
   - `CORS_ORIGINS` (set to Vercel frontend URL)
5. Run Alembic migrations on startup via entrypoint script

### Frontend — Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend/`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set environment variable: `VITE_API_URL` = Render backend URL

### Docker Hub
1. Build and tag backend image
2. Push to Docker Hub: `docker push vipul1/inventory-backend:latest`

---

## 10. Implementation Phases

### Phase 1: Project Scaffolding & Database Setup
- Initialize backend project structure (FastAPI + SQLAlchemy)
- Create database models (products, customers, orders, order_items)
- Configure Alembic migrations
- Set up config with environment variables
- **Commit**: `feat: initialize backend with database models and migrations`

### Phase 2: Backend API — Products & Customers
- Implement Pydantic schemas for products and customers
- Implement product CRUD service + router
- Implement customer CRUD service + router
- Add validation, error handling, proper HTTP status codes
- **Commit**: `feat: add product and customer CRUD APIs`

### Phase 3: Backend API — Orders & Dashboard
- Implement order schemas (with nested items)
- Implement order service with transaction logic (stock check, auto-reduce, auto-total)
- Implement order cancellation with stock restoration
- Implement dashboard summary endpoint
- Add health check endpoint
- **Commit**: `feat: add order management and dashboard APIs`

### Phase 4: Frontend Scaffolding & Layout
- Initialize React + Vite project
- Install Tailwind CSS, React Router, Axios
- Create layout components (Sidebar, Header, Layout)
- Create reusable components (DataTable, StatsCard, LoadingSpinner, etc.)
- Set up API service layer with Axios
- Set up routing
- **Commit**: `feat: initialize frontend with layout and routing`

### Phase 5: Frontend — Product & Customer Pages
- Build Product List page (table with edit/delete)
- Build Add/Edit Product forms with validation
- Build Customer List page (table with delete)
- Build Add Customer form with validation
- Wire up to backend APIs
- **Commit**: `feat: add product and customer management pages`

### Phase 6: Frontend — Orders & Dashboard
- Build Dashboard page with stats cards and low stock table
- Build Order List page
- Build Create Order page (customer dropdown, product multi-select, quantity)
- Build Order Detail page
- **Commit**: `feat: add order management and dashboard pages`

### Phase 7: Docker & Docker Compose
- Write backend Dockerfile (multi-stage, slim image)
- Write frontend Dockerfile (multi-stage with Nginx)
- Write docker-compose.yml with all 3 services
- Create .dockerignore files
- Create .env.example
- Test full stack via `docker compose up`
- **Commit**: `feat: add Docker containerization and compose setup`

### Phase 8: Documentation & Deployment Prep
- Write comprehensive README.md
- Create entrypoint script for backend (run migrations on startup)
- Push backend image to Docker Hub
- Deploy backend to Render
- Deploy frontend to Vercel
- Verify live URLs work end-to-end
- **Commit**: `docs: add README and deployment configuration`

---

## 11. Assumptions & Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| No authentication | Assessment doesn't mention auth | Keep scope to what's required |
| Order status | Only "completed" and "cancelled" | Assessment only mentions create and cancel/delete |
| Order deletion | Soft-cancel (restore stock) then delete | Business logic: cancellation should restore inventory |
| Low stock threshold | Products with quantity <= 10 | Reasonable default; not specified in assessment |
| Price snapshot in order_items | Store `unit_price` at time of order | If product price changes later, historical orders stay correct |
| No pagination initially | Return all records | Assessment doesn't mention pagination; can add if needed |
| Customer update | Not implementing PUT /customers | Assessment only lists POST, GET, DELETE for customers |
| CORS | Configured via env var | Required for frontend-backend communication in deployment |

---

## 12. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Free tier DB limits on Render | PostgreSQL free tier has 1GB storage — sufficient for assessment |
| Render cold starts | Add health check endpoint; frontend shows loading state |
| Race conditions on stock | Use database transaction with row-level locking |
| Docker image size | Multi-stage builds with slim/alpine base images |
| Environment variable leaks | .env in .gitignore, .env.example with placeholder values |
