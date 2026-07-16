import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, Utensils, QrCode } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

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
      case 'pending': return { icon: <Clock className="w-16 h-16 text-yellow-500"/>, text: 'Order Sent to Kitchen', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'preparing': return { icon: <Utensils className="w-16 h-16 text-orange-500"/>, text: 'Food is Being Prepared', color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'ready': return { icon: <CheckCircle className="w-16 h-16 text-green-500"/>, text: 'Food is Ready! On the way!', color: 'text-green-600', bg: 'bg-green-50' };
      default: return { icon: <CheckCircle className="w-16 h-16 text-gray-500"/>, text: order.status, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className={`${status.bg} p-8 flex flex-col items-center justify-center transition-colors duration-500`}>
        <div className="bg-white p-4 rounded-full shadow-sm mb-4 animate-bounce">
          {status.icon}
        </div>
        <h2 className={`text-2xl font-bold ${status.color} text-center`}>{status.text}</h2>
        <p className="text-gray-500 mt-2 text-center">Order #{orderId.slice(-6).toUpperCase()}</p>
      </div>

      <div className="flex-1 p-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4 relative z-10">
          <h3 className="font-bold text-lg border-b pb-2">Order Details</h3>
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-gray-700">
              <span>{item.quantity}x {item.menuItem?.name || 'Item'}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-600">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment QR Section */}
        {order.status === 'ready' && order.paymentStatus === 'pending' && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6 text-center border border-orange-100">
            <h3 className="font-bold text-xl text-gray-800 mb-2">Pay via UPI</h3>
            <p className="text-gray-500 text-sm mb-6">Scan with any UPI app to pay</p>
            
            <div className="bg-gray-100 p-4 rounded-2xl inline-block mb-4">
              {/* Dummy QR Code using an icon for UI purpose, in real app this would be a real image */}
              <QrCode className="w-32 h-32 text-gray-800" />
            </div>
            
            <p className="font-semibold text-lg text-gray-700">Amount: ${order.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-4">Show the payment screen at the counter when leaving to collect your bill.</p>
          </div>
        )}
      </div>
    </div>
  );
}
