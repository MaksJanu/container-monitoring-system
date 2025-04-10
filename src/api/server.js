import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import cors from 'cors';

import { fetchAndStoreContainerStats, deleteOldHistory } from './controllers/containers.controller.js';
import containerRoutes from './routes/container.route.js';
import authRoutes from './routes/auth.route.js';

dotenv.config();
mongoose.set('bufferTimeoutMS', 60000);


const app = express();


// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));


// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Routes
app.use('/api/containers', containerRoutes);
app.use('/api/auth', authRoutes);



// Connect to MongoDB first
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 60000,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
})
.then(() => {
  console.log('MongoDB connected');
  
  // Cron schedule to run function every 15 seconds
  cron.schedule('*/15 * * * * *', () => {
    console.log('Running container stats update...');
    fetchAndStoreContainerStats()
      .catch(err => console.error('Error in scheduled container stats update:', err));
  });

  fetchAndStoreContainerStats()
    .then(() => console.log('Initial container stats collected'))
    .catch(err => console.error('Error collecting initial container stats:', err));
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});