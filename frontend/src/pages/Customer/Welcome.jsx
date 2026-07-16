import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';

export default function Welcome() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 5-second animated loading screen
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetTableId = tableId;
    if (!targetTableId) {
      toast.error('Table ID missing from QR code!');
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
    <div className="relative min-h-screen bg-gray-900 overflow-hidden flex items-center justify-center p-4">
      <AnimatePresence>
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center absolute inset-0 z-50 bg-gray-900"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mb-8 p-6 rounded-full border-4 border-amber-500/30"
            >
              <Utensils className="w-20 h-20 text-amber-500" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-wider text-center"
            >
              AL-MAIDA MANDI
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ delay: 1, duration: 3 }}
              className="h-1 bg-amber-500 mt-6 rounded-full"
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700 relative z-10"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-amber-500/20 p-4 rounded-full border border-amber-500/30">
                <Utensils className="w-10 h-10 text-amber-500" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-center text-white mb-2">Welcome!</h1>
            <p className="text-center text-gray-400 mb-8 font-medium">
              You are seated at Table <span className="text-amber-500 font-bold">{tableId}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-gray-900 border border-gray-700 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-gray-900 border border-gray-700 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-extrabold rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center tracking-wide text-lg"
              >
                {loading ? 'Processing...' : 'VIEW MENU'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
