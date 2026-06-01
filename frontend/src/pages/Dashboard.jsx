import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import {
  CubeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .getSummary()
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!summary) {
    return <p className="text-center text-red-500">Failed to load dashboard data.</p>;
  }

  const stats = [
    {
      label: 'Total Products',
      value: summary.total_products,
      icon: CubeIcon,
      color: 'bg-blue-500',
      link: '/products',
    },
    {
      label: 'Total Customers',
      value: summary.total_customers,
      icon: UsersIcon,
      color: 'bg-green-500',
      link: '/customers',
    },
    {
      label: 'Total Orders',
      value: summary.total_orders,
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      link: '/orders',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-lg shadow p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-800">
            Low Stock Products (≤ 10)
          </h3>
        </div>
        {summary.low_stock_products.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">All products are well stocked.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.low_stock_products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                    <td className="px-6 py-4 text-gray-600">{p.sku}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          p.quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
