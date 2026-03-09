import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { getProducts, addProduct, updateProduct, deleteProduct, createBill } from './api';
import Home from './pages/Home';
import Products from './pages/Products';
import Bill from './pages/Bill';
import DailyReport from './pages/DailyReport';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

function AppContent() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState(() => {
    const savedBillItems = localStorage.getItem('billItems');
    return savedBillItems ? JSON.parse(savedBillItems) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  // Save billItems to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('billItems', JSON.stringify(billItems));
  }, [billItems]);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  }

  const handleAddProduct = async (product) => {
    try {
      const res = await addProduct(product);
      setProducts([...products, res.data]);
    } catch (e) {
      console.error('Failed to add product', e);
    }
  };

  const handleUpdateProduct = async (id, updatedProduct) => {
    try {
      const res = await updateProduct(id, updatedProduct);
      setProducts(products.map(p => p._id === id ? res.data : p));
    } catch (e) {
      console.error('Failed to update product', e);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (e) {
      console.error('Failed to delete product', e);
    }
  };

  const addToBill = (product) => {
    const existing = billItems.find(item => item._id === product._id);
    if (existing) {
      setBillItems(billItems.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setBillItems([...billItems, { ...product, quantity: 1 }]);
    }
    // Show confirmation but don't navigate
    alert(`${product.name} added to bill!`);
  };

  const updateBillQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setBillItems(billItems.filter(item => item._id !== id));
    } else {
      setBillItems(billItems.map(item => item._id === id ? { ...item, quantity } : item));
    }
  };

  const clearBill = () => {
    setBillItems([]);
    localStorage.removeItem('billItems');
  };

  const handleCreateBill = async (billData) => {
    try {
      console.log('Attempting to create bill with:', billData);
      const res = await createBill(billData);
      console.log('Bill created successfully:', res.data);
      alert('✅ Bill created successfully!\nBill ID: ' + res.data._id + '\nBill #: ' + res.data.billNumber);
      clearBill();
      // Navigate to daily report to show the newly created bill
      navigate('/daily-report');
    } catch (e) {
      console.error('Failed to create bill:', e);
      const errorMsg = e.response?.data?.error || e.message || 'Unknown error occurred';
      alert('❌ Failed to create bill:\n' + errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home 
            products={products} 
            onAddToBill={addToBill} 
            loading={loading}
            billItemsCount={billItems.length}
          />} />
          <Route path="/products" element={
            <Products 
              products={products} 
              onAdd={handleAddProduct} 
              onUpdate={handleUpdateProduct} 
              onDelete={handleDeleteProduct} 
              loading={loading} 
            />
          } />
          <Route path="/bill" element={<Bill billItems={billItems} onUpdateQuantity={updateBillQuantity} onCreateBill={handleCreateBill} />} />
          <Route path="/daily-report" element={<DailyReport />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
      <Navbar billItemsCount={billItems.length} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
