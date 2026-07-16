import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, Utensils, QrCode } from 'lucide-react';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';
const SOCKET_URL = 'https://restaurant-qr-jl0w.onrender.com';

export default function OrderStatus() {
  const { tableId, orderId } = useParams();
  const [order, setOrder] = useState(null);
  
  useEffect(() => {
    // Fetch initial order data
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to load order', err);
      }
    };
    fetchOrder();

    // Socket.io connection for real-time updates
    const socket = io(SOCKET_URL);
    socket.emit('join_table', tableId);

    socket.on('order_status_update', (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
      }
    });

    return () => socket.disconnect();
  }, [tableId, orderId]);

  if (!order) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;
  }

  const getStatusDisplay = () => {
    switch(order.status) {
      case 'pending': return { icon: <Clock className="w-16 h-16 text-yellow-500"/>, text: 'Order Sent to Kitchen', color: 'text-yellow-500', bg: 'bg-gray-900 border-yellow-500/20', iconBg: 'bg-yellow-500/10 border-yellow-500/20' };
      case 'preparing': return { icon: <Utensils className="w-16 h-16 text-amber-500"/>, text: 'Food is Being Prepared', color: 'text-amber-500', bg: 'bg-gray-900 border-amber-500/20', iconBg: 'bg-amber-500/10 border-amber-500/20' };
      case 'ready': return { icon: <CheckCircle className="w-16 h-16 text-green-500"/>, text: 'Food is Ready! On the way!', color: 'text-green-500', bg: 'bg-gray-900 border-green-500/20', iconBg: 'bg-green-500/10 border-green-500/20' };
      default: return { icon: <CheckCircle className="w-16 h-16 text-gray-500"/>, text: order.status, color: 'text-gray-400', bg: 'bg-gray-900 border-gray-800', iconBg: 'bg-gray-800 border-gray-700' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col text-gray-200">
      <div className={`${status.bg} border-b p-10 flex flex-col items-center justify-center transition-colors duration-500`}>
        <div className={`${status.iconBg} p-5 rounded-full border shadow-lg mb-6 animate-bounce`}>
          {status.icon}
        </div>
        <h2 className={`text-2xl font-extrabold ${status.color} text-center tracking-wide`}>{status.text}</h2>
        <p className="text-gray-400 mt-2 text-center font-medium">Order #{orderId.slice(-6).toUpperCase()}</p>
      </div>

      <div className="flex-1 p-4 -mt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-[2rem] shadow-2xl p-6 space-y-4 relative z-10">
          <h3 className="font-extrabold text-xl border-b border-gray-800 pb-4 text-white">Order Details</h3>
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-gray-300 font-medium">
              <span><span className="text-amber-500 mr-2">{item.quantity}x</span> {item.menuItem?.name || 'Item'}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-gray-800 pt-4 flex justify-between font-extrabold text-xl text-white">
            <span>Total</span>
            <span className="text-amber-500">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Payment QR Section */}
        {order.status === 'ready' && order.paymentStatus === 'pending' && (
          <div className="mt-6 bg-gray-900 border border-amber-500/30 rounded-[2rem] shadow-[0_0_20px_rgba(245,158,11,0.15)] p-8 text-center">
            <h3 className="font-extrabold text-2xl text-white mb-2">Pay via UPI</h3>
            <p className="text-gray-400 text-sm mb-6">Scan with any UPI app to pay</p>
            
            <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-xl border-4 border-amber-100">
              {/* Dummy QR Code */}
              <QrCode className="w-40 h-40 text-gray-900" />
            </div>
            
            <p className="font-extrabold text-2xl text-amber-500">₹{order.totalAmount}</p>
            <p className="text-xs text-gray-500 mt-6 bg-gray-800/50 p-3 rounded-xl border border-gray-700">Show the payment screen at the counter when leaving to collect your bill.</p>
          </div>
        )}
      </div>
    </div>
  );
}
