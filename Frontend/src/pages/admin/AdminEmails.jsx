import { useState, useEffect } from 'react';
import { getAllEmails } from '../../api/adminService';
import Loader from '../../components/Loader';
import {
  FiMail,
  FiAlertTriangle,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSend,
} from 'react-icons/fi';

const statusConfig = {
  SENT:    { color: 'bg-green-500/15 text-green-400', icon: FiCheckCircle },
  FAILED:  { color: 'bg-red-500/15 text-red-400', icon: FiXCircle },
  PENDING: { color: 'bg-yellow-500/15 text-yellow-400', icon: FiClock },
};

const AdminEmails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAllEmails();
      setEmails(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load emails', err);
      setError('Failed to load email notifications. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" text="Loading email logs..." />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="glass-card p-8 border-red-500/20 bg-red-500/5 text-center max-w-lg">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white mb-2 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const sent = emails.filter(e => e.status === 'SENT').length;
  const failed = emails.filter(e => e.status === 'FAILED').length;

  const stats = [
    { label: 'Total Emails', value: emails.length, icon: FiMail, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Sent', value: sent, icon: FiSend, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Failed', value: failed, icon: FiXCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const filteredEmails = emails.filter(e =>
    search === '' ||
    (e.recipientEmail && e.recipientEmail.toLowerCase().includes(search.toLowerCase())) ||
    (e.subject && e.subject.toLowerCase().includes(search.toLowerCase())) ||
    (e.type && e.type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-5 flex items-center gap-4 group hover:border-gold-300/30 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} group-hover:scale-110 transition-transform`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">{s.label}</p>
              <p className="text-white text-2xl font-heading font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by email, subject, or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
          />
        </div>
      </div>

      {/* Email Logs */}
      {filteredEmails.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiMail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">No Email Notifications</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {emails.length === 0
              ? 'No system emails have been sent yet. Email notifications will appear here when triggered by orders, registrations, etc.'
              : 'No emails match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-4 text-left font-medium">Recipient</th>
                  <th className="px-6 py-4 text-left font-medium">Subject</th>
                  <th className="px-6 py-4 text-left font-medium hidden md:table-cell">Type</th>
                  <th className="px-6 py-4 text-left font-medium">Status</th>
                  <th className="px-6 py-4 text-left font-medium hidden lg:table-cell">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email, i) => {
                  const status = email.status || 'SENT';
                  const cfg = statusConfig[status] || statusConfig.SENT;
                  return (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                            <FiMail className="w-4 h-4 text-primary-400" />
                          </div>
                          <span className="text-white">{email.recipientEmail || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 max-w-xs truncate">{email.subject || '—'}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-gray-400 text-xs font-medium uppercase">{email.type || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <cfg.icon className="w-3 h-3" />
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">
                        {email.sentAt || email.createdAt || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmails;
