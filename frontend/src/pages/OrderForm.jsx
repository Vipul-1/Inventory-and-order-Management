import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, customerAPI, productAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function OrderForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([customerAPI.getAll(), productAPI.getAll()]).then(
      ([cusRes, prodRes]) => {
        setCustomers(cusRes.data);
        setProducts(prodRes.data);
      }
    );
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === Number(item.product_id));
      if (!product) return sum;
      return sum + product.price * item.quantity;
    }, 0);
  };

  const validate = () => {
    const errs = {};
    if (!customerId) errs.customer = 'Select a customer';
    items.forEach((item, i) => {
      if (!item.product_id) errs[`item_${i}_product`] = 'Select a product';
      if (!item.quantity || item.quantity < 1) errs[`item_${i}_qty`] = 'Min 1';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    orderAPI
      .create({
        customer_id: Number(customerId),
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      })
      .then(() => {
        toast.success('Order created');
        navigate('/orders');
      })
      .catch((err) => toast.error(err.response?.data?.detail || 'Something went wrong'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Order</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.customer ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.email})
              </option>
            ))}
          </select>
          {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">Order Items *</label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <PlusIcon className="w-4 h-4" /> Add Item
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedProduct = products.find(
                (p) => p.id === Number(item.product_id)
              );
              return (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${Number(p.price).toFixed(2)}) — Stock: {p.quantity}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct?.quantity || 999}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`item_${index}_qty`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-bold text-gray-800">
            <span>Estimated Total:</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
