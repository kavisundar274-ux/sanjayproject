import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home({ products = [], onAddToBill, loading, billItemsCount = 0 }) {
  const navigate = useNavigate();

  if (loading) return <div className="text-center py-8">Loading products...</div>;

  return (
    <div>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Electrical Shop</h1>
              <p className="text-sm text-gray-500 mt-1">Select products and continue in Bill page for payment</p>
            </div>
          </div>
          {billItemsCount > 0 && (
            <button
              onClick={() => navigate('/bill')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold shadow-lg flex items-center gap-2"
            >
              View Bill ({billItemsCount})
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.map(product => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">{product.brand}</p>
            <p className="text-green-600 font-bold">Rs {product.price}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            <div className="mt-2">
              <button
                onClick={() => onAddToBill(product)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={product.stock <= 0}
              >
                Add to Bill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
