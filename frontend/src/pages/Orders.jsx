import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    orderAPI
      .getAll()
      .then((res) => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm(`Cancel and delete order #${id}?`)) return;
    orderAPI
      .delete(id)
      .then(() => {
        toast.success('Order cancelled and deleted');
        fetchOrders();
      })
      .catch((err) => toast.error(err.response?.data?.detail || 'Delete failed'));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <Link
          to="/orders/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" /> Create Order
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No orders yet. Create your first order.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">#{o.id}</td>
                  <td className="px-6 py-4 text-gray-600">{o.customer_name}</td>
                  <td className="px-6 py-4 text-gray-600">{o.items.length} item(s)</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    ${Number(o.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        o.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/orders/${o.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
