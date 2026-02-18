import React from 'react';

export default function Bill({ billItems, onUpdateQuantity, onClear }) {
  const total = billItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bill</h1>
      {billItems.length === 0 ? (
        <p>No items in bill</p>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {billItems.map(item => (
              <div key={item._id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p>₹{item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                    className="bg-gray-300 px-2 py-1 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                    className="bg-gray-300 px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onUpdateQuantity(item._id, 0)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
                <div className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="text-right text-xl font-bold mb-4">Total: ₹{total.toFixed(2)}</div>
          <div className="space-x-2">
            <button onClick={onClear} className="bg-red-600 text-white px-4 py-2 rounded">Clear Bill</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded">Print Bill</button>
          </div>
        </>
      )}
    </div>
  );
}
