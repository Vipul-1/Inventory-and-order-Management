import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/products', label: 'Products', icon: CubeIcon },
  { to: '/customers', label: 'Customers', icon: UsersIcon },
  { to: '/orders', label: 'Orders', icon: ClipboardDocumentListIcon },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">Inventory & Orders</h1>
        </div>
        <nav className="mt-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
