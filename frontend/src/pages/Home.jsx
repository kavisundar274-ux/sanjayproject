import React from 'react';

export default function Home({ products = [], onAddToBill, loading }) {
  if (loading) return <div className="text-center py-8">Loading products...</div>;

  return (
    <div>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Electrical Shop</h1>
              <p className="text-sm text-gray-500 mt-1">Select products to add to bill</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">{product.brand}</p>
            <p className="text-green-600 font-bold">₹{product.price}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            <button
              onClick={() => onAddToBill(product)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={product.stock <= 0}
            >
              Add to Bill
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
