import express from 'express';
import { getAllContainerStats, fetchAndStoreContainerStats, getContainerHistory, deleteAllHistory } from '../controllers/containers.controller.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();


// GET (endpoint to fetch all container stats)
router.get('/', authenticate, getAllContainerStats);
// GET (endpoint to fetch container stats history)
router.get('/history', authenticate, getContainerHistory);


// POST (endpoint for force refresh) (only for admin)
router.post('/refresh', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await fetchAndStoreContainerStats();
    res.json({ message: 'Container stats refreshed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//DELETE whole old history (only for admin)
router.delete('/delete-history', authenticate, authorizeAdmin, deleteAllHistory)


export default router;