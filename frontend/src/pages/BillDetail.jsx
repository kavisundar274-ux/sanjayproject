import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBillById, updateBill, markBillPaid } from '../api';
import UPIQR from '../components/UPIQR';

export default function BillDetail({ onRefresh }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [editing, setEditing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

  useEffect(() => {
    loadBill();
  }, [id]);

  async function loadBill() {
    setLoading(true);
    try {
      const res = await getBillById(id);
      const b = res.data;
      setBill(b);
      setCustomerName(b.customerName || '');
      setPhone(b.phone || '');
      setGstEnabled((b.gst || 0) > 0);
      setItems(
        (b.items || []).map(i => ({
          ...i,
          _id: i.productId,
          id: i.productId,
          qty: i.qty || 1,
          price: Number(i.price || 0)
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
  const gst = gstEnabled ? +(subtotal * 0.18).toFixed(2) : 0;
  const grandTotal = +(subtotal + gst).toFixed(2);

  function addItemRow() {
    setItems(prev => [...prev, { name: '', price: 0, qty: 1 }]);
  }

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  function incQty(idx) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, qty: (it.qty || 1) + 1 } : it)));
  }

  function decQty(idx) {
    setItems(
      prev
        .map((it, i) => {
          if (i !== idx) return it;
          const q = (it.qty || 1) - 1;
          return q <= 0 ? null : { ...it, qty: q };
        })
        .filter(Boolean)
    );
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!bill || bill.paymentStatus !== 'pending') return;

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (!items.length) {
      alert('Please keep at least one item in bill');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerName,
        phone,
        items: items.map(i => ({
          productId: i._id || i.id,
          name: (i.name || '').trim() || 'Item',
          price: Number(i.price || 0),
          qty: Number(i.qty || 1),
          total: (Number(i.price) || 0) * (Number(i.qty) || 1)
        })),
        totalAmount: subtotal,
        gst,
        grandTotal
      };

      await updateBill(bill._id, payload);
      setEditing(false);
      await loadBill();
      onRefresh?.();
    } catch (e) {
      console.error(e);
      alert('Failed to save bill changes');
    } finally {
      setSaving(false);
    }
  }

  function handleMarkPaid() {
    setSelectedPaymentMethod('cash');
    setShowPaymentModal(true);
  }

  async function handlePayment(method) {
    if (!bill || bill.paymentStatus !== 'pending') return;

    setSaving(true);
    try {
      await markBillPaid(bill._id);
      setShowPaymentModal(false);
      await loadBill();
      onRefresh?.();
      alert(`Payment successful via ${method}`);
    } catch (e) {
      console.error(e);
      alert('Payment failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function printBill() {
    if (!bill) return;

    const printWindow = window.open('', '_blank');
    const html = `
      <html><head><title>Bill ${bill.billNumber}</title><style>
        body{font-family:Arial,sans-serif;padding:20px;}
        table{width:100%;border-collapse:collapse;}
        th,td{border:1px solid #333;padding:4px;text-align:left;}
      </style></head>
      <body>
      <h1>ELECTRICAL SHOP BILL</h1>
      <p><strong>Bill Number:</strong> ${bill.billNumber || ''}</p>
      <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString()}</p>
      <p><strong>Customer:</strong> ${bill.customerName || ''}</p>
      <p><strong>Phone:</strong> ${bill.phone || ''}</p>
      <p><strong>Payment Status:</strong> ${bill.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}</p>
      <table><thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Amount</th></tr></thead><tbody>
        ${(bill.items || [])
          .map(item => `
          <tr>
            <td>${item.name || 'Unknown'}</td>
            <td>${(item.price || 0).toFixed(2)}</td>
            <td>${item.qty || 1}</td>
            <td>${((item.price || 0) * (item.qty || 1)).toFixed(2)}</td>
          </tr>
        `)
          .join('')}
      </tbody></table>
      <p><strong>Total:</strong> Rs ${(bill.grandTotal || 0).toFixed(2)}</p>
      </body></html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  if (loading || !bill) {
    return <div className="py-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/bills')} className="text-[#0D47A1] font-medium">Back</button>
        <span className="font-semibold">Bill #{bill.billNumber}</span>
        <button onClick={printBill} className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 font-medium">
          Print
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-medium">{bill.customerName}</div>
            {bill.phone && <div className="text-sm text-slate-500">{bill.phone}</div>}
            <div className="text-xs text-slate-400 mt-1">{new Date(bill.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#0D47A1]">Rs {bill.grandTotal?.toFixed(2)}</div>
            {bill.paymentStatus === 'pending' && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Pending</span>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Items ({items.length})</h3>

          {editing && bill.paymentStatus === 'pending' && (
            <button className="bg-[#FFC107] text-slate-900 py-2 px-4 rounded-lg font-semibold mb-3" onClick={addItemRow}>
              + Add Item Row
            </button>
          )}

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 gap-4">
                <div className="flex-1">
                  {editing && bill.paymentStatus === 'pending' ? (
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        value={it.name || ''}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        className="border rounded px-2 py-1 text-sm flex-1"
                        placeholder="Item name"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={it.price ?? 0}
                        onChange={(e) => updateItem(idx, 'price', Number(e.target.value || 0))}
                        className="border rounded px-2 py-1 text-sm w-28"
                        placeholder="Price"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-slate-500">Rs {it.price} x {it.qty}</div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editing && bill.paymentStatus === 'pending' && (
                    <>
                      <button onClick={() => decQty(idx)} className="w-8 h-8 rounded bg-slate-100">-</button>
                      <span className="w-6 text-center">{it.qty}</span>
                      <button onClick={() => incQty(idx)} className="w-8 h-8 rounded bg-slate-100">+</button>
                      <button onClick={() => removeItem(idx)} className="text-xs text-rose-600">Remove</button>
                    </>
                  )}
                  <div className="font-semibold">Rs {((it.price || 0) * (it.qty || 1)).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>Rs {subtotal.toFixed(2)}</span>
          </div>
          {gst > 0 && (
            <div className="flex justify-between text-sm">
              <span>GST (18%)</span>
              <span>Rs {gst.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Grand Total</span>
            <span className="text-[#0D47A1]">Rs {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {bill.paymentStatus === 'pending' && (
          <div className="mt-4 flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#0D47A1] text-white py-2 rounded-lg font-semibold">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setEditing(false); loadBill(); }} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-semibold">Edit Bill</button>
                <button onClick={handleMarkPaid} disabled={saving} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold">
                  {saving ? '...' : 'Mark as Paid'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3">Mark Bill as Paid</h3>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>

            {selectedPaymentMethod === 'upi' && (
              <div className="mb-3">
                <div className="text-sm text-slate-600 mb-2">Scan to collect payment</div>
                <UPIQR amount={grandTotal} />
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => handlePayment(selectedPaymentMethod)}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Processing...' : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
