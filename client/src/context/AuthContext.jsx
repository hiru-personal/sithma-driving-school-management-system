import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sithma_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('sithma_student');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sithma_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('sithma_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setStudent(res.data.student);
            localStorage.setItem('sithma_user', JSON.stringify(res.data.user));
            if (res.data.student) {
              localStorage.setItem('sithma_student', JSON.stringify(res.data.student));
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user, student } = res.data;
        setToken(token);
        setUser(user);
        setStudent(student);
        localStorage.setItem('sithma_token', token);
        localStorage.setItem('sithma_user', JSON.stringify(user));
        if (student) {
          localStorage.setItem('sithma_student', JSON.stringify(student));
        }
        toast.success(`Welcome back, ${user.name}!`);
        return { success: true, user, student };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (registrationData) => {
    try {
      const res = await api.post('/auth/register', registrationData);
      if (res.data.success) {
        const { token, user, student } = res.data;
        setToken(token);
        setUser(user);
        setStudent(student);
        localStorage.setItem('sithma_token', token);
        localStorage.setItem('sithma_user', JSON.stringify(user));
        if (student) {
          localStorage.setItem('sithma_student', JSON.stringify(student));
        }
        toast.success('Registration successful! Welcome to Sithma Driving School.');
        return { success: true, user, student };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setStudent(null);
    localStorage.removeItem('sithma_token');
    localStorage.removeItem('sithma_user');
    localStorage.removeItem('sithma_student');
    toast.success('Logged out successfully');
  };

  const updateStudentData = (updatedStudent) => {
    setStudent(updatedStudent);
    localStorage.setItem('sithma_student', JSON.stringify(updatedStudent));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        token,
        loading,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isStaff: user?.role === 'staff' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
        isInstructor: user?.role === 'instructor',
        login,
        register,
        logout,
        updateStudentData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
