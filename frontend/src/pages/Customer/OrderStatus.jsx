import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CheckCircle, Clock, Utensils, QrCode, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const handlePayment = async () => {
    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 2. Create Order on Backend
      const { data: orderData } = await axios.post(`${API_URL}/payments/create`, { orderId });

      // 3. Initialize Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Al-Maida Mandi',
        description: `Payment for Order #${orderId.slice(-6).toUpperCase()}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_URL}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId
            });
            if (verifyRes.data.success) {
              toast.success('Payment Successful!');
              setOrder(prev => ({ ...prev, paymentStatus: 'completed' }));
            }
          } catch (err) {
            toast.error('Payment Verification Failed');
          }
        },
        prefill: {
          name: order.customer?.name || '',
          email: order.customer?.email || '',
          contact: order.customer?.phone || ''
        },
        theme: {
          color: '#f59e0b'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error('Could not initiate payment');
    }
  };

  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  if (!order) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;
  }

  const getStatusDisplay = () => {
    switch (order.status) {
      case 'pending': return { icon: <Clock className="w-16 h-16 text-yellow-500" />, text: 'Order Sent to Kitchen', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'preparing': return { icon: <Utensils className="w-16 h-16 text-orange-500" />, text: 'Food is Being Prepared', color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'ready': return { icon: <CheckCircle className="w-16 h-16 text-green-500" />, text: 'Food is Ready! On the way!', color: 'text-green-600', bg: 'bg-green-50' };
      default: return { icon: <CheckCircle className="w-16 h-16 text-gray-500" />, text: order.status, color: 'text-gray-600', bg: 'bg-gray-50' };
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

        {/* Payment Section */}
        {order.paymentStatus === 'completed' ? (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-[2rem] p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
            <h3 className="font-extrabold text-2xl text-green-500 mb-1">Paid Successfully</h3>
            <p className="text-gray-400 text-sm">Thank you for dining with us!</p>
          </div>
        ) : order.status === 'ready' && order.paymentStatus === 'pending' && (
          <div className="mt-6 bg-gray-900 border border-amber-500/30 rounded-[2rem] shadow-[0_0_20px_rgba(245,158,11,0.15)] p-8 text-center">
            <h3 className="font-extrabold text-2xl text-white mb-2">Pay Your Bill</h3>
            <p className="text-gray-400 text-sm mb-6">Choose your preferred payment method</p>
            
            <p className="font-extrabold text-4xl text-amber-500 mb-6">₹{order.totalAmount}</p>

            <button 
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-extrabold rounded-2xl py-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
            >
              <CreditCard className="w-6 h-6" /> PAY ONLINE
            </button>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
               <p className="text-gray-400 mb-4 text-sm font-bold uppercase tracking-widest">Or Pay at Counter</p>
               <div className="bg-white p-3 rounded-2xl inline-block shadow-xl border-4 border-amber-100">
                 <QrCode className="w-24 h-24 text-gray-900" />
               </div>
               <p className="text-xs text-gray-500 mt-4 px-4 leading-relaxed">Show this QR code at the counter if you wish to pay by Cash or physical POS machine.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
