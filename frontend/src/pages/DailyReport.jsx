import React, { useEffect, useState } from 'react';
import { getDailySales, markBillPaid } from '../api';
import UPIQR from '../components/UPIQR';

function formatCurrency(n) {
  return `₹${(n || 0).toFixed(2)}`;
}
function isOverduePendingBill(bill) {
  if (!bill || bill.paymentStatus !== 'pending') return false;
  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
  return (Date.now() - new Date(bill.createdAt).getTime()) >= fiveDaysMs;
}

export default function DailyReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [markingPaid, setMarkingPaid] = useState(false);
  const [signal, setSignal] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await getDailySales();
      setData(res.data);
    } catch (err) {
      setError('Failed to load daily sales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function showSignal(type, message) {
    setSignal({ type, message });
    setTimeout(() => setSignal(null), 2200);
  }

  function openPaymentModal(bill) {
    setSelectedBill(bill);
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  }

  async function confirmPayment() {
    const billId = selectedBill?._id || selectedBill?.billId || selectedBill?.id;
    if (!billId) {
      showSignal('error', 'Invalid bill id');
      return;
    }
    setMarkingPaid(true);
    try {
      await markBillPaid(billId);
      setShowPaymentModal(false);
      setSelectedBill(null);
      await load();
      showSignal('success', `Payment successful via ${paymentMethod}`);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Payment failed';
      if (String(msg).toLowerCase().includes('already paid')) {
        setShowPaymentModal(false);
        setSelectedBill(null);
        await load();
        showSignal('success', 'Bill already marked as paid');
      } else {
        showSignal('error', msg);
      }
    } finally {
      setMarkingPaid(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {signal && (
        <div
          className={`fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
            signal.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {signal.message}
        </div>
      )}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-8 rounded-2xl shadow-2xl border border-yellow-200">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-serif font-bold text-gray-800">Daily Sales Report</h1>
            <button
              onClick={load}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>
          <p className="text-lg text-gray-600">Today's Business Overview</p>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mt-4 rounded-full"></div>
        </div>

        {data ? (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</p>
                  </div>
                  <div className="text-yellow-500">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bills</p>
                    <p className="text-3xl font-bold text-gray-900">{data.totalBills}</p>
                  </div>
                  <div className="text-blue-500">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bills */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">Recent Bills</h2>
              {data.recentBills?.length > 0 ? (
                <div className="space-y-4">
                  {data.recentBills.map(bill => (
                    <div key={bill._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 font-semibold">₹</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Bill #{bill.billNumber}</p>
                          <p className="text-sm text-gray-600">{bill.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(bill.grandTotal)}</p>
                        <p className={`text-sm font-medium ${bill.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                  </p>
                        {isOverduePendingBill(bill) && (
                          <p className="text-xs font-medium text-red-600 mt-1">Reminder: pending for 5+ days</p>
                        )}
                        {bill.paymentStatus === 'pending' && (
                          <button
                            onClick={() => openPaymentModal(bill)}
                            className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Payment Option
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No bills recorded today</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No data available for today</p>
          </div>
        )}
      </div>

      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Option</h3>
            <p className="text-sm text-gray-600 mb-3">
              Bill #{selectedBill.billNumber} - {formatCurrency(selectedBill.grandTotal)}
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>

            {paymentMethod === 'upi' && (
              <div className="mb-3 text-center">
                <p className="text-sm text-gray-600 mb-2">Scan QR code for UPI payment</p>
                <UPIQR amount={selectedBill.grandTotal} />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBill(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={markingPaid}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {markingPaid ? 'Processing...' : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

