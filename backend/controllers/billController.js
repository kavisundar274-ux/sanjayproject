import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

const generateBillNumber = async (userId) => {
  const lastBill = await Bill.findOne({ userId }).sort({ createdAt: -1 });
  const num = lastBill ? parseInt(lastBill.billNumber.replace('B', ''), 10) + 1 : 1001;
  return `B${num}`;
};

export const createBill = async (req, res) => {
  try {
    const { customerName, phone, items, totalAmount, gst, grandTotal, paymentStatus } = req.body;
    
    // Validation
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    if (totalAmount === undefined || totalAmount === null || isNaN(totalAmount)) {
      return res.status(400).json({ error: 'Valid total amount is required' });
    }
    if (grandTotal === undefined || grandTotal === null || isNaN(grandTotal)) {
      return res.status(400).json({ error: 'Valid grand total is required' });
    }

    console.log('Creating bill with data:', req.body);
    const userId = req.user?._id || 'admin';
    const isPayLater = paymentStatus === 'pending';
    const billNumber = await generateBillNumber(userId);
    
    // Process items - ensure they have required fields
    const billItems = items.map(it => ({
      productId: it.productId || it._id || '',
      name: it.name || '',
      brand: it.brand || '',
      price: Number(it.price) || 0,
      qty: Number(it.qty) || 1,
      amount: Number(it.amount) || 0
    }));

    // Update stock if payment is confirmed (not pending)
    if (!isPayLater) {
      for (const it of billItems) {
        if (it.productId && it.productId.match(/^[0-9a-fA-F]{24}$/)) { // Valid MongoDB ObjectId
          try {
            const p = await Product.findById(it.productId);
            if (p) {
              p.stock = Math.max(0, (p.stock || 0) - it.qty);
              p.totalSold = (p.totalSold || 0) + it.qty;
              await p.save();
            }
          } catch (err) {
            console.warn(`Could not update stock for product ${it.productId}:`, err.message);
          }
        }
      }
    }

    const bill = new Bill({
      userId,
      billNumber,
      customerName: customerName.trim(),
      phone: phone || '',
      items: billItems,
      totalAmount: Number(totalAmount),
      gst: Number(gst || 0),
      grandTotal: Number(grandTotal),
      paymentStatus: isPayLater ? 'pending' : 'paid'
    });
    
    console.log('Bill object before save:', bill);
    await bill.save();
    console.log('Bill saved successfully:', bill._id);
    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: error.message || 'Failed to create bill' });
  }
};

export const getBills = async (req, res) => {
  try {
    const userId = req.user?._id || 'admin';
    const bills = await Bill.find({ userId }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBillById = async (req, res) => {
  try {
    const userId = req.user?._id || 'admin';
    const bill = await Bill.findOne({ _id: req.params.id, userId });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailySales = async (req, res) => {
  try {
    const userId = req.user?._id || 'admin';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bills = await Bill.find({ userId, createdAt: { $gte: today } });
    const overdueCutoff = new Date(Date.now() - (5 * 24 * 60 * 60 * 1000));
    const overduePendingBills = await Bill.find({
      userId,
      paymentStatus: 'pending',
      createdAt: { $lte: overdueCutoff }
    }).sort({ createdAt: 1 });
    const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
    const totalBills = bills.length;
    const recentBills = bills.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
    res.json({
      totalRevenue,
      totalBills,
      recentBills,
      count: bills.length,
      bills,
      overduePendingCount: overduePendingBills.length,
      overduePendingBills
    });
  } catch (error) {
    console.error('Error in getDailySales:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/bills/monthly?month=MM&year=YYYY
export const getMonthlyReport = async (req, res) => {
  try {
    const m = parseInt(req.query.month, 10);
    const y = parseInt(req.query.year, 10);
    const now = new Date();
    const month = Number.isFinite(m) && m >= 1 && m <= 12 ? m : (now.getMonth() + 1);
    const year = Number.isFinite(y) && y > 1970 ? y : now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const userId = req.user?._id || 'admin';

    // paid bills are used for revenue metrics
    const paidBills = await Bill.find({ userId, createdAt: { $gte: start, $lt: end }, paymentStatus: 'paid' });
    // all bills are used for recent list and pending discoverability
    const monthBills = await Bill.find({ userId, createdAt: { $gte: start, $lt: end } });

    const totalRevenue = paidBills.reduce((s, b) => s + (b.grandTotal || 0), 0);
    const totalBills = paidBills.length;

    // aggregate product-wise totals from bill items
    const items = paidBills.flatMap(b => (b.items || []).map(i => ({ productId: i.productId ? String(i.productId) : null, name: i.name || 'Unknown', qty: i.qty || 0, revenue: i.total || ((i.price || 0) * (i.qty || 0)), createdAt: b.createdAt })));

    const grouped = items.reduce((acc, it) => {
      const key = it.productId || it.name;
      if (!acc[key]) acc[key] = { productId: it.productId, name: it.name, qtySold: 0, revenue: 0 };
      acc[key].qtySold += it.qty;
      acc[key].revenue += it.revenue;
      return acc;
    }, {});

    const products = Object.values(grouped).sort((a, b) => b.revenue - a.revenue);

    // build daily breakdown
    const daysInMonth = new Date(year, month, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, totalRevenue: 0, totalBills: 0 }));
    for (const b of paidBills) {
      const d = new Date(b.createdAt).getDate();
      daily[d - 1].totalRevenue += (b.grandTotal || 0);
      daily[d - 1].totalBills += 1;
    }

    const recentBills = (monthBills || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
      .map(b => ({ billId: b._id, billNumber: b.billNumber, customerName: b.customerName || '', createdAt: b.createdAt, grandTotal: b.grandTotal, paymentStatus: b.paymentStatus }));

    const overdueCutoff = new Date(Date.now() - (5 * 24 * 60 * 60 * 1000));
    const overduePendingCount = monthBills.filter(b => b.paymentStatus === 'pending' && new Date(b.createdAt) <= overdueCutoff).length;

    res.json({ month, year, totalRevenue, totalBills, products, daily, recentBills, overduePendingCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save monthly report to DB (supports optional finalize flag)
import Report from '../models/Report.js';
export const saveMonthlyReport = async (req, res) => {
  try {
    const { month, year, finalize } = req.body;
    const m = Number(month);
    const y = Number(year);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    const bills = await Bill.find({ userId: req.user._id, createdAt: { $gte: start, $lt: end }, paymentStatus: 'paid' });

    const totalRevenue = bills.reduce((s, b) => s + (b.grandTotal || 0), 0);
    const totalBills = bills.length;

    const items = bills.flatMap(b => (b.items || []).map(i => ({ productId: i.productId ? String(i.productId) : null, name: i.name || 'Unknown', qty: i.qty || 0, revenue: i.total || ((i.price || 0) * (i.qty || 0)), createdAt: b.createdAt })));
    const grouped = items.reduce((acc, it) => {
      const key = it.productId || it.name;
      if (!acc[key]) acc[key] = { productId: it.productId, name: it.name, qtySold: 0, revenue: 0 };
      acc[key].qtySold += it.qty;
      acc[key].revenue += it.revenue;
      return acc;
    }, {});
    const products = Object.values(grouped);

    const daysInMonth = new Date(y, m, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, totalRevenue: 0, totalBills: 0 }));
    for (const b of bills) {
      const d = new Date(b.createdAt).getDate();
      daily[d - 1].totalRevenue += (b.grandTotal || 0);
      daily[d - 1].totalBills += 1;
    }

    const recentBills = (bills || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map(b => ({ billId: b._id, billNumber: b.billNumber, customerName: b.customerName || '', createdAt: b.createdAt, grandTotal: b.grandTotal, paymentStatus: b.paymentStatus }));

    const reportData = { userId: req.user._id, month: m, year: y, totalRevenue, totalBills, products, daily, recentBills, finalized: !!finalize, finalizedAt: finalize ? new Date() : undefined };
    const report = await Report.create(reportData);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const finalizeSavedReport = async (req, res) => {
  try {
    const r = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!r) return res.status(404).json({ error: 'Report not found' });
    if (r.finalized) return res.status(400).json({ error: 'Report already finalized' });
    r.finalized = true;
    r.finalizedAt = new Date();
    await r.save();
    res.json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listSavedReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSavedReportById = async (req, res) => {
  try {
    const r = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!r) return res.status(404).json({ error: 'Report not found' });
    res.json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.paymentStatus !== 'pending') return res.status(400).json({ error: 'Only Pay Later bills can be edited' });
    const { customerName, phone, items, totalAmount, gst, grandTotal } = req.body;
    const billItems = (items || bill.items).map(i => ({
      ...i,
      total: (i.price || 0) * (i.qty || 1)
    }));
    const sub = billItems.reduce((s, i) => s + i.total, 0);
    const gstVal = gst !== undefined ? Number(gst) : bill.gst;
    const total = Number(totalAmount ?? sub);
    const gTotal = Number(grandTotal ?? total + gstVal);
    bill.customerName = customerName ?? bill.customerName;
    bill.phone = phone ?? bill.phone;
    bill.items = billItems;
    bill.totalAmount = total;
    bill.gst = gstVal;
    bill.grandTotal = gTotal;
    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markBillPaid = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.paymentStatus === 'paid') return res.status(400).json({ error: 'Bill already paid' });
    for (const it of bill.items) {
      if (it.productId) {
        const p = await Product.findById(it.productId);
        if (p) {
          const qty = it.qty || 1;
          p.stock = Math.max(0, (p.stock || 0) - qty);
          p.totalSold = (p.totalSold || 0) + qty;
          await p.save();
        }
      }
    }
    bill.paymentStatus = 'paid';
    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
