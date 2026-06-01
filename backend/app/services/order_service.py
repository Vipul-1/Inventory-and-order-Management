from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderResponse, OrderItemResponse


def create_order(db: Session, data: OrderCreate) -> OrderResponse:
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {data.customer_id} not found",
        )

    order_items = []
    total_amount = 0

    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}",
            )

        line_total = float(product.price) * item.quantity
        order_items.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": float(product.price),
            "line_total": line_total,
        })
        total_amount += line_total

    order = Order(
        customer_id=data.customer_id,
        total_amount=total_amount,
        status="completed",
    )
    db.add(order)
    db.flush()

    for item_data in order_items:
        product = item_data["product"]
        product.quantity -= item_data["quantity"]

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            line_total=item_data["line_total"],
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)

    return _build_order_response(order, customer)


def get_all_orders(db: Session) -> list[OrderResponse]:
    orders = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.id.desc())
        .all()
    )
    return [_build_order_response(o, o.customer) for o in orders]


def get_order_by_id(db: Session, order_id: int) -> OrderResponse:
    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found",
        )
    return _build_order_response(order, order.customer)


def delete_order(db: Session, order_id: int) -> OrderResponse:
    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found",
        )

    response = _build_order_response(order, order.customer)

    if order.status == "completed":
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return response


def _build_order_response(order: Order, customer: Customer) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=customer.full_name if customer else None,
        customer_email=customer.email if customer else None,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else None,
                product_sku=item.product.sku if item.product else None,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                line_total=float(item.line_total),
            )
            for item in order.items
        ],
        total_amount=float(order.total_amount),
        status=order.status,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
