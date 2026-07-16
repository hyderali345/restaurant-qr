import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Utensils } from 'lucide-react';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';

export default function Welcome() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  // If no tableId in URL, simulate QR scan by letting user type a table ID
  const [manualTableId, setManualTableId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetTableId = tableId || manualTableId;
    if (!targetTableId) {
      toast.error('Please provide a Table ID (or scan QR)');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/customers`, {
        ...formData,
        tableId: targetTableId
      });
      localStorage.setItem('customerId', res.data._id);
      localStorage.setItem('customerName', res.data.name);
      navigate(`/table/${targetTableId}/menu`);
    } catch (err) {
      toast.error('Failed to register details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 to-red-500 p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full">
            <Utensils className="w-12 h-12 text-orange-600" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Welcome!</h1>
        <p className="text-center text-gray-500 mb-8">
          {tableId ? `You are seated at Table ${tableId}` : 'Please enter your Table ID to continue'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!tableId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table Number (Simulate QR Scan)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
                placeholder="e.g., 64d9f..."
                value={manualTableId}
                onChange={(e) => setManualTableId(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center"
          >
            {loading ? 'Processing...' : 'View Menu'}
          </button>
        </form>
      </div>
    </div>
  );
}
