import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const OAuth2Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (token && userId) {
      const userData = {
        id: parseInt(userId),
        name: name || '',
        email: email || '',
        role: role || 'CUSTOMER',
      };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success(`Welcome, ${name || 'User'}! 🎉`);
      // Reload to pick up the new auth state
      window.location.href = '/';
    } else {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" text="Signing you in with Google..." />
    </div>
  );
};

export default OAuth2Callback;
