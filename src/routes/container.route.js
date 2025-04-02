import express from 'express';
import { getAllContainerStats, fetchAndStoreContainerStats } from '../controllers/containers.controller.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();


// GET (endpoint to fetch all container stats)
router.get('/', authenticate, getAllContainerStats);


// POST (endpoint for force refresh)
router.post('/refresh', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await fetchAndStoreContainerStats();
    res.json({ message: 'Container stats refreshed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;