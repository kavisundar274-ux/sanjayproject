import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getProducts, addProduct, updateProduct, deleteProduct } from './api';
import Home from './pages/Home';
import Products from './pages/Products';
import Bill from './pages/Bill';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

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
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar billItemsCount={billItems.length} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home products={products} onAddToBill={addToBill} loading={loading} />} />
            <Route path="/products" element={
              <Products 
                products={products} 
                onAdd={handleAddProduct} 
                onUpdate={handleUpdateProduct} 
                onDelete={handleDeleteProduct} 
                loading={loading} 
              />
            } />
            <Route path="/bill" element={
              <Bill 
                billItems={billItems} 
                onUpdateQuantity={updateBillQuantity} 
                onClear={clearBill} 
              />
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
