import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserAddresses, addAddress, updateAddress, deleteAddress } from '../api/addressService';
import AddressCard from '../components/AddressCard';
import Loader from '../components/Loader';
import { FiUser, FiMail, FiMapPin, FiPlus, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '', addressLine1: '', city: '', state: '', pincode: '', phone: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await getUserAddresses(user.id);
      setAddresses(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressForm);
        toast.success('Address updated!');
      } else {
        await addAddress(user.id, addressForm);
        toast.success('Address added!');
      }
      resetForm();
      fetchAddresses();
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName || address.name || '',
      addressLine1: address.addressLine1 || address.street || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || address.zipCode || '',
      phone: address.phone || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    setAddressForm({ fullName: '', addressLine1: '', city: '', state: '', pincode: '', phone: '' });
  };

  if (loading) return <Loader size="lg" text="Loading profile..." />;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-heading mb-8">My Profile</h1>

        {/* User Info */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-gold-300
                            flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-heading text-3xl font-bold">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-heading text-2xl font-semibold">
                {user?.name || 'User'}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <FiMail className="w-4 h-4" /> {user?.email}
                </span>
                {user?.role && (
                  <span className="badge-primary">{user.role}</span>
                )}
              </div>
            </div>
            <button onClick={logout}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-red-400 border border-red-500/20
                         rounded-xl hover:bg-red-500/10 transition-all text-sm">
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Addresses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-heading text-xl font-semibold flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-gold-300" /> Saved Addresses
            </h2>
            <button onClick={() => { resetForm(); setShowAddForm(true); }}
              className="text-gold-300 text-sm font-medium flex items-center gap-1 hover:underline">
              <FiPlus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddressSubmit} className="glass-card p-6 mb-4 space-y-3 animate-slide-down">
              <h3 className="text-white font-medium">
                {editingAddress ? 'Edit Address' : 'New Address'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={addressForm.fullName} onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                  placeholder="Full Name" className="input-field" required />
                <input value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                  placeholder="Phone" className="input-field" required />
              </div>
              <input value={addressForm.addressLine1} onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})}
                placeholder="Street Address" className="input-field" required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                  placeholder="City" className="input-field" required />
                <input value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                  placeholder="State" className="input-field" required />
                <input value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                  placeholder="PIN Code" className="input-field" required />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary text-sm">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={resetForm} className="btn-outline text-sm">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-500">No saved addresses</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Logout */}
        <button onClick={logout}
          className="md:hidden w-full flex items-center justify-center gap-2 py-3 text-red-400 border border-red-500/20
                     rounded-xl hover:bg-red-500/10 transition-all">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
