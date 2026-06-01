import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    productAPI
      .getAll()
      .then((res) => setProducts(res.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    productAPI
      .delete(id)
      .then(() => {
        toast.success('Product deleted');
        fetchProducts();
      })
      .catch((err) => toast.error(err.response?.data?.detail || 'Delete failed'));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <Link
          to="/products/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No products yet. Add your first product.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{p.sku}</td>
                  <td className="px-6 py-4 text-gray-600">${Number(p.price).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        p.quantity === 0
                          ? 'bg-red-100 text-red-800'
                          : p.quantity <= 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${p.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
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
