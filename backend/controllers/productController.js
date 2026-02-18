let products = [
  { _id: '1', name: 'LED Bulb 9W', brand: 'Philips', price: 120, stock: 50, category: 'Lighting' },
  { _id: '2', name: 'Ceiling Fan', brand: 'Havells', price: 1800, stock: 20, category: 'Fans' },
  { _id: '3', name: 'Switch Board', brand: 'Anchor', price: 250, stock: 35, category: 'Switches' }
];

export const getProducts = async (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, brand, price, stock, category } = req.body;
    const newProduct = {
      _id: Date.now().toString(),
      name,
      brand,
      price: Number(price),
      stock: Number(stock || 0),
      category: category || 'General'
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = products.find(p => p._id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    Object.assign(product, req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const index = products.findIndex(p => p._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    products.splice(index, 1);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
