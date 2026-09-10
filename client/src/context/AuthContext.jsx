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
  const [mustChangePassword, setMustChangePassword] = useState(() => {
    return localStorage.getItem('sithma_must_change_pwd') === 'true';
  });
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
            setMustChangePassword(Boolean(res.data.user?.mustChangePassword));
            localStorage.setItem('sithma_user', JSON.stringify(res.data.user));
            localStorage.setItem(
              'sithma_must_change_pwd',
              res.data.user?.mustChangePassword ? 'true' : 'false'
            );
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

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', {
        email: identifier,
        username: identifier,
        password,
      });

      if (res.data.success) {
        const { token, user, student, mustChangePassword: pwdChangeRequired } = res.data;
        setToken(token);
        setUser(user);
        setStudent(student);
        setMustChangePassword(Boolean(pwdChangeRequired));

        localStorage.setItem('sithma_token', token);
        localStorage.setItem('sithma_user', JSON.stringify(user));
        localStorage.setItem(
          'sithma_must_change_pwd',
          pwdChangeRequired ? 'true' : 'false'
        );
        if (student) {
          localStorage.setItem('sithma_student', JSON.stringify(student));
        }

        toast.success(`Welcome back, ${user.name}!`);
        return {
          success: true,
          user,
          student,
          mustChangePassword: Boolean(pwdChangeRequired),
        };
      }
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || 'Login failed. Please check your credentials.';
      const pendingVerification =
        data?.accountStatus === 'pending_verification' ||
        (err.response?.status === 403 && msg.toLowerCase().includes('verification'));
      const accountLocked = Boolean(data?.accountLocked) || err.response?.status === 423;
      const accountDeactivated =
        data?.accountStatus === 'inactive' ||
        data?.accountStatus === 'suspended' ||
        msg.toLowerCase().includes('deactivated');

      toast.error(msg);
      return {
        success: false,
        message: msg,
        pendingVerification,
        accountLocked,
        accountDeactivated,
        status: err.response?.status,
        lockedUntil: data?.lockedUntil,
      };
    }
  };

  const register = async (registrationData) => {
    try {
      const res = await api.post('/auth/register', registrationData);
      if (res.data.success) {
        const { token, user, student, pendingVerification, message } = res.data;
        if (token && user) {
          setToken(token);
          setUser(user);
          setStudent(student);
          localStorage.setItem('sithma_token', token);
          localStorage.setItem('sithma_user', JSON.stringify(user));
          if (student) {
            localStorage.setItem('sithma_student', JSON.stringify(student));
          }
          toast.success('Registration successful! Welcome to Sithma Driving School.');
        } else {
          toast.success(message || 'Registration submitted! Awaiting officer verification.');
        }
        return { success: true, user, student, pendingVerification, message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res.data.success) {
        setMustChangePassword(false);
        localStorage.setItem('sithma_must_change_pwd', 'false');
        if (res.data.token) {
          setToken(res.data.token);
          localStorage.setItem('sithma_token', res.data.token);
        }
        if (user) {
          const updated = { ...user, mustChangePassword: false };
          setUser(updated);
          localStorage.setItem('sithma_user', JSON.stringify(updated));
        }
        toast.success('Password changed successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      setUser(null);
      setStudent(null);
      setMustChangePassword(false);
      localStorage.removeItem('sithma_token');
      localStorage.removeItem('sithma_user');
      localStorage.removeItem('sithma_student');
      localStorage.removeItem('sithma_must_change_pwd');
      toast.success('Logged out successfully');
    }
  };

  const updateStudentData = (updatedStudent) => {
    setStudent(updatedStudent);
    localStorage.setItem('sithma_student', JSON.stringify(updatedStudent));
  };

  const isAdvancePaid = !!(
    student?.isAdvancePaid ||
    student?.isPremium ||
    (student?.registrationStatus && student?.registrationStatus !== 'pending_payment')
  );
  const isPremium = user?.role === 'student' ? isAdvancePaid : true;

  const payAdvance = async (amount = 5000, bankName = 'Online Direct Advance', ref = '') => {
    try {
      const res = await api.post('/payments/pay-advance', {
        amount,
        bankName,
        transactionReference: ref,
      });
      if (res.data.success) {
        setStudent(res.data.student);
        localStorage.setItem('sithma_student', JSON.stringify(res.data.student));
        toast.success('👑 Advance payment confirmed! You are now a Premium User.');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Advance payment failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        token,
        loading,
        mustChangePassword,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isStaff: user?.role === 'staff' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
        isInstructor: user?.role === 'instructor',
        isAdvancePaid,
        isPremium,
        login,
        register,
        changePassword,
        logout,
        payAdvance,
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
