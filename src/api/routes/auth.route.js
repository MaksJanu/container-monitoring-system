import express from 'express';
import { login, register, deleteUser } from '../controllers/auth.controller.js';


const router = express.Router();


// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

// Route for deleting a user
router.delete('/delete/:userId', deleteUser);


export default router;
