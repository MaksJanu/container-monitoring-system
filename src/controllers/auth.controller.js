import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret';
const JWT_EXPIRES_IN = '24h';


const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const user = new User({ username, password, role });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const login = async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.json({ token, user: { username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

export {  register, login };
