import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/active`);
        setOrders(res.data.filter(o => o.status === 'pending' || o.status === 'preparing'));
      } catch (err) {
        toast.error('Failed to load kitchen orders');
      }
    };
    fetchOrders();

    const socket = io(SOCKET_URL);
    socket.emit('join_kitchen');

    socket.on('new_order', (order) => {
      setOrders(prev => [...prev, order]);
      toast.success(`New order for Table ${order.table?.tableNumber || 'Unknown'}!`);
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => {
        if (updatedOrder.status === 'ready' || updatedOrder.status === 'completed') {
          return prev.filter(o => o._id !== updatedOrder._id);
        }
        return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
      });
    });

    return () => socket.disconnect();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-extrabold text-white">Kitchen Display System</h1>
        <p className="text-gray-400 mt-1">Live Order Queue</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.length === 0 && (
          <div className="col-span-full flex justify-center items-center h-64 text-gray-500 text-xl">
            No active orders.
          </div>
        )}
        
        {orders.map(order => (
          <div key={order._id} className={`bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-t-4 ${order.status === 'pending' ? 'border-yellow-500' : 'border-orange-500'}`}>
            <div className="p-4 bg-gray-800/50 flex justify-between items-center border-b border-gray-700">
              <h3 className="font-bold text-xl text-white">Table {order.table?.tableNumber || '?'}</h3>
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-orange-500/20 text-orange-500'}`}>
                {order.status}
              </span>
            </div>
            
            <div className="p-4">
              <div className="space-y-3 mb-6 min-h-[150px]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 text-gray-300 items-start">
                    <span className="font-bold text-white bg-gray-700 w-8 h-8 flex items-center justify-center rounded-lg">{item.quantity}</span>
                    <span className="text-lg">{item.menuItem?.name || 'Unknown Item'}</span>
                  </div>
                ))}
              </div>

              {order.status === 'pending' && (
                <button 
                  onClick={() => updateStatus(order._id, 'preparing')}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold rounded-xl transition"
                >
                  Start Preparing
                </button>
              )}
              
              {order.status === 'preparing' && (
                <button 
                  onClick={() => updateStatus(order._id, 'ready')}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                >
                  Mark as Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
