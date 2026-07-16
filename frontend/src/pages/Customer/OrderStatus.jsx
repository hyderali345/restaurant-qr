import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, Utensils, QrCode, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';
const SOCKET_URL = 'https://restaurant-qr-jl0w.onrender.com';

export default function OrderStatus() {
  const { tableId, orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [paymentMode, setPaymentMode] = useState(null); // 'upi' or 'cash'

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        toast.error('Failed to load order status');
      }
    };

    fetchOrder();

    const socket = io(SOCKET_URL);
    
    socket.emit('join_table', tableId);
    
    socket.on('order_status_update', (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
        toast.success(`Order is now: ${updatedOrder.status}`, {
          icon: '🍽️',
        });
      }
    });

    return () => socket.disconnect();
  }, [tableId, orderId]);

  const handlePay = async (mode) => {
    try {
      setPaymentMode(mode);
      // Wait a moment then automatically complete payment for demo
      setTimeout(async () => {
        await axios.put(`${API_URL}/orders/${orderId}/status`, { 
          status: 'completed',
          paymentStatus: 'completed'
        });
        toast.success('Bill Generated & SMS Sent!');
        setOrder(prev => ({ ...prev, paymentStatus: 'completed' }));
      }, 3000);
    } catch (err) {
      toast.error('Failed to process payment');
    }
  };

  if (!order) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div></div>;
  }

  const getStatusDisplay = () => {
    switch(order.status) {
      case 'pending': return { title: 'Order Received', icon: <Clock className="w-16 h-16 text-amber-500 animate-pulse" />, msg: 'Kitchen will start preparing soon.' };
      case 'preparing': return { title: 'Preparing Food', icon: <Utensils className="w-16 h-16 text-orange-500 animate-bounce" />, msg: 'Your food is being cooked with love.' };
      case 'coming': return { title: 'On the Way!', icon: <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />, msg: 'Your food is arriving at your table.' };
      case 'completed': return { title: 'Meal Completed', icon: <CheckCircle className="w-16 h-16 text-green-500" />, msg: 'Hope you enjoyed your meal!' };
      default: return { title: 'Processing', icon: <Clock className="w-16 h-16 text-gray-500" />, msg: 'Please wait...' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border border-gray-700 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="bg-gray-900 border border-amber-500/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            {status.icon}
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide">{status.title}</h2>
          <p className="text-gray-400 font-medium">{status.msg}</p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-700">
          <h3 className="font-bold text-gray-300 mb-3 uppercase tracking-wider text-sm">Your Order</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-300"><span className="text-amber-500 font-bold">{item.quantity}x</span> {item.menuItem?.name || 'Item'}</span>
                <span className="text-gray-400 font-medium">₹{item.menuItem?.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
            <span className="font-bold text-gray-300">Total Amount</span>
            <span className="text-2xl font-extrabold text-amber-500">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Payment Section (Shows when food is completed and not yet paid) */}
        {order.status === 'completed' && order.paymentStatus !== 'completed' && !paymentMode && (
          <div className="mt-6 text-center animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">Choose Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setPaymentMode('upi')}
                className="bg-gray-900 border border-amber-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-amber-500/10 transition"
              >
                <QrCode className="w-8 h-8 text-amber-500" />
                <span className="font-bold text-white">Pay via UPI</span>
              </button>
              <button 
                onClick={() => setPaymentMode('cash')}
                className="bg-gray-900 border border-green-500/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-green-500/10 transition"
              >
                <Banknote className="w-8 h-8 text-green-500" />
                <span className="font-bold text-white">Pay Cash</span>
              </button>
            </div>
          </div>
        )}

        {/* UPI QR Display */}
        {paymentMode === 'upi' && order.paymentStatus !== 'completed' && (
          <div className="mt-6 text-center bg-gray-900 p-6 rounded-2xl border border-amber-500/30 animate-fade-in">
            <h3 className="font-bold text-white mb-4">Scan to Pay ₹{order.totalAmount}</h3>
            <div className="bg-white p-3 rounded-xl inline-block shadow-xl border-4 border-amber-100 mb-4">
               <QrCode className="w-32 h-32 text-gray-900" />
            </div>
            <p className="text-gray-400 text-sm animate-pulse">Waiting for payment confirmation...</p>
          </div>
        )}

        {/* Cash Display */}
        {paymentMode === 'cash' && order.paymentStatus !== 'completed' && (
          <div className="mt-6 text-center bg-gray-900 p-6 rounded-2xl border border-green-500/30 animate-fade-in">
            <h3 className="font-bold text-white mb-4">Pay at Counter</h3>
            <p className="text-gray-400 text-sm">Please pay ₹{order.totalAmount} in cash at the counter.</p>
            <p className="text-amber-500 text-sm mt-4 animate-pulse">Processing bill...</p>
          </div>
        )}

        {/* Paid Success */}
        {order.paymentStatus === 'completed' && (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center animate-bounce-in">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="font-extrabold text-xl text-green-500 mb-1">Bill Generated & Paid</h3>
            <p className="text-gray-400 text-sm">SMS sent. Thank you for dining!</p>
          </div>
        )}
      </div>
    </div>
  );
}
