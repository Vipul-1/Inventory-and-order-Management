import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI
      .getById(id)
      .then((res) => setOrder(res.data))
      .catch(() => {
        toast.error('Order not found');
        navigate('/orders');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order #{order.id}</h2>
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            order.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Customer Info</h3>
          <p className="text-gray-800 font-medium">{order.customer_name}</p>
          <p className="text-gray-600 text-sm">{order.customer_email}</p>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="pb-2">Product</th>
                  <th className="pb-2">SKU</th>
                  <th className="pb-2">Unit Price</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-medium text-gray-800">{item.product_name}</td>
                    <td className="py-2 text-gray-600">{item.product_sku}</td>
                    <td className="py-2 text-gray-600">${Number(item.unit_price).toFixed(2)}</td>
                    <td className="py-2 text-gray-600">{item.quantity}</td>
                    <td className="py-2 text-right font-medium text-gray-800">
                      ${Number(item.line_total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-indigo-600">
            ${Number(order.total_amount).toFixed(2)}
          </span>
        </div>

        <div className="p-6 text-sm text-gray-500">
          Created: {new Date(order.created_at).toLocaleString()}
        </div>
      </div>

      <button
        onClick={() => navigate('/orders')}
        className="mt-4 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Back to Orders
      </button>
    </div>
  );
}
