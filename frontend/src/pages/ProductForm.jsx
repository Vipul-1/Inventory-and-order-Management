import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      productAPI.getById(id).then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          sku: p.sku,
          price: String(p.price),
          quantity: String(p.quantity),
          description: p.description || '',
        });
      }).catch(() => {
        toast.error('Product not found');
        navigate('/products');
      });
    }
  }, [id, isEdit, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Price must be greater than 0';
    if (form.quantity === '' || Number(form.quantity) < 0) errs.quantity = 'Quantity cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const data = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description.trim() || null,
    };

    const request = isEdit
      ? productAPI.update(id, data)
      : productAPI.create(data);

    request
      .then(() => {
        toast.success(isEdit ? 'Product updated' : 'Product created');
        navigate('/products');
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail || 'Something went wrong');
      })
      .finally(() => setLoading(false));
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass('name')}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
          <input
            type="text"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className={inputClass('sku')}
          />
          {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClass('price')}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className={inputClass('quantity')}
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
