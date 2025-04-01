import express from 'express';
import { getAllContainerStats, fetchAndStoreContainerStats } from '../controllers/containers.controller.js';

const router = express.Router();


// GET (endpoint to fetch all container stats)
router.get('/', getAllContainerStats);


// POST (endpoint for force refresh)
router.post('/refresh', async (req, res) => {
  try {
    await fetchAndStoreContainerStats();
    res.json({ message: 'Container stats refreshed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;