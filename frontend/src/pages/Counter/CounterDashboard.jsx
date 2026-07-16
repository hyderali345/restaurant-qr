import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Store, Clock, Utensils, CheckCircle, Car } from 'lucide-react';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';
const SOCKET_URL = 'https://restaurant-qr-jl0w.onrender.com';

export default function CounterDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchActiveOrders();

    const socket = io(SOCKET_URL);
    socket.emit('join_counter');

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`New order from Table ${order.table?.tableNumber || 'Unknown'}!`, { icon: '🔔' });
      playNotificationSound();
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => socket.disconnect();
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/active`);
      setOrders(res.data.reverse());
    } catch (err) {
      toast.error('Failed to fetch orders');
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-gray-800 border-gray-600';
      case 'preparing': return 'bg-orange-900/40 border-orange-500';
      case 'coming': return 'bg-blue-900/40 border-blue-500';
      case 'completed': return 'bg-green-900/40 border-green-500';
      default: return 'bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-6">
      <header className="flex justify-between items-center bg-gray-800 p-6 rounded-3xl shadow-xl mb-8 border border-gray-700">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 p-3 rounded-full border border-amber-500/30">
            <Store className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Counter Dashboard</h1>
            <p className="text-sm text-gray-400 font-medium">Manage all live orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-900 px-5 py-2 rounded-2xl border border-gray-700">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold tracking-wider text-gray-300">SYSTEM LIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order._id} className={`p-6 rounded-3xl border-2 shadow-lg transition-all ${getStatusColor(order.status)}`}>
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-700/50">
              <div>
                <h2 className="text-3xl font-black text-amber-500">T-{order.table?.tableNumber || '?'}</h2>
                <p className="text-white font-bold mt-1 text-lg">{order.customer?.name || 'Guest'}</p>
                <p className="text-gray-400 text-sm font-medium">{order.customer?.phone || 'No Phone'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Time</p>
                <p className="text-gray-300 font-semibold">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 min-h-[100px]">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-300 font-medium">
                    <span className="text-amber-500 font-bold mr-2">{item.quantity}x</span> 
                    {item.menuItem?.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-700/50">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total</span>
              <span className="text-2xl font-black text-white">₹{order.totalAmount}</span>
            </div>

            {/* Action Buttons */}
            {order.status !== 'completed' ? (
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => updateStatus(order._id, 'preparing')}
                  disabled={order.status === 'preparing'}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${order.status === 'preparing' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  <Utensils className="w-5 h-5 mb-1" /> Prepare
                </button>
                <button 
                  onClick={() => updateStatus(order._id, 'coming')}
                  disabled={order.status === 'coming'}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${order.status === 'coming' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  <Car className="w-5 h-5 mb-1" /> Coming
                </button>
                <button 
                  onClick={() => updateStatus(order._id, 'completed')}
                  className="flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white transition-all border border-green-500/30"
                >
                  <CheckCircle className="w-5 h-5 mb-1" /> Done
                </button>
              </div>
            ) : (
              <div className="bg-green-500/20 text-green-400 text-center py-3 rounded-xl font-bold border border-green-500/30 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Completed / Waiting for Payment
              </div>
            )}
            
            {order.paymentStatus === 'completed' && (
              <div className="mt-3 bg-amber-500 text-gray-900 text-center py-2 rounded-xl font-black text-sm uppercase tracking-widest animate-pulse">
                Bill Paid
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            <Store className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold">No Active Orders</h2>
            <p>Waiting for customers to scan QR codes...</p>
          </div>
        )}
      </div>
    </div>
  );
}
