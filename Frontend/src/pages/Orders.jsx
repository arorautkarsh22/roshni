import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../api/orderService';
import OrderCard from '../components/OrderCard';
import Loader from '../components/Loader';
import { FiPackage } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getUserOrders(user.id);
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" text="Loading your orders..." />;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-heading mb-2">My Orders</h1>
        <p className="section-subheading mb-8">Track your order history</p>

        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FiPackage className="w-20 h-20 text-gray-700 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-heading font-bold mb-2">No orders yet</h2>
            <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
            <Link to="/shop" className="btn-primary">Explore Products</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
