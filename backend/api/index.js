import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import productRoutes from '../routes/productRoutes.js';

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({ origin: '*' }));

// JSON
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.json({ message: 'API ok' }));

// Mount routes
app.use('/api/products', productRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

export default app;

