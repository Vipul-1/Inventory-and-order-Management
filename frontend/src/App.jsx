import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import Orders from './pages/Orders';
import OrderForm from './pages/OrderForm';
import OrderDetail from './pages/OrderDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
