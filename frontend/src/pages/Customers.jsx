import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    setLoading(true);
    customerAPI
      .getAll()
      .then((res) => setCustomers(res.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    customerAPI
      .delete(id)
      .then(() => {
        toast.success('Customer deleted');
        fetchCustomers();
      })
      .catch((err) => toast.error(err.response?.data?.detail || 'Delete failed'));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
        <Link
          to="/customers/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" /> Add Customer
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : customers.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No customers yet. Add your first customer.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{c.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.email}</td>
                  <td className="px-6 py-4 text-gray-600">{c.phone}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(c.id, c.full_name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
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
