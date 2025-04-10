import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

console.log('jwtDecode:', jwtDecode);
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const decodedToken = jwtDecode(token);

      if (decodedToken.exp * 1000 < Date.now()) {
        handleTokenExpiration();
      } else {
        setUser(JSON.parse(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setTokenExpirationTimer(decodedToken.exp * 1000 - Date.now());
      }
    }

    setLoading(false);
  }, []);

  const setTokenExpirationTimer = (timeUntilExpiration) => {
    setTimeout(() => {
      handleTokenExpiration();
    }, timeUntilExpiration);
  };

  const handleTokenExpiration = () => {
    logout();
    alert('Your session has expired. Please log in again.');
  };

  const login = async (username, password) => {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        username,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);

      const decodedToken = jwtDecode(token);
      setTokenExpirationTimer(decodedToken.exp * 1000 - Date.now());

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username, password, role = 'viewer') => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        username,
        password,
        role,
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);