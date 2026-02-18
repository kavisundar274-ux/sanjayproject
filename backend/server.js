import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './api/index.js';

const connectDB = async () => {
	try {
		if (!process.env.MONGO_URI) throw new Error('MONGO_URI not set in environment');
		await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
		console.log('MongoDB connected successfully');
	} catch (err) {
		console.log('MongoDB connection error:', err.message);
		console.log('Running without database - using in-memory storage');
	}
};

const startServer = async () => {
	try {
		await connectDB();
	} catch (err) {
		console.log('Running without database - using in-memory storage');
	}
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
