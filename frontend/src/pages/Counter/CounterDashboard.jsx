import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';
const SOCKET_URL = 'https://restaurant-qr-jl0w.onrender.com';

export default function CounterDashboard() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState('live_orders'); // live_orders, table_setup

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/active`);
        setOrders(res.data);
      } catch (err) {
        toast.error('Failed to load counter orders');
      }
    };
    
    const fetchTables = async () => {
      try {
        const res = await axios.get(`${API_URL}/tables`);
        setTables(res.data);
      } catch (err) {
        toast.error('Failed to load tables');
      }
    };

    fetchOrders();
    fetchTables();

    const socket = io(SOCKET_URL);
    socket.emit('join_counter');

    socket.on('new_order', (order) => {
      setOrders(prev => [...prev, order]);
    });

    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => socket.disconnect();
  }, []);

  const completeOrder = async (orderId) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'completed' });
      setOrders(prev => prev.filter(o => o._id !== orderId));
      toast.success('Order completed & Bill closed.');
    } catch (err) {
      toast.error('Failed to close bill');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/4 bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Counter Menu</h2>
        <ul className="space-y-4">
          <li 
            onClick={() => setActiveTab('live_orders')}
            className={`font-semibold p-3 rounded-lg cursor-pointer transition ${activeTab === 'live_orders' ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Live Orders
          </li>
          <li className="font-semibold text-gray-600 hover:bg-gray-50 p-3 rounded-lg cursor-pointer transition">Menu Management</li>
          <li 
            onClick={() => setActiveTab('table_setup')}
            className={`font-semibold p-3 rounded-lg cursor-pointer transition ${activeTab === 'table_setup' ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Table Setup (QR Codes)
          </li>
        </ul>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
        {activeTab === 'live_orders' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Live Tables & Bills</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 rounded-tl-lg font-semibold">Table</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 rounded-tr-lg font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No active orders right now.</td>
                </tr>
              )}
              {orders.map(order => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                  <td className="p-4 font-bold text-gray-800">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                      {order.table?.tableNumber || '?'}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                      order.status === 'ready' ? 'bg-green-100 text-green-700' :
                      order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-800">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'ready' && (
                      <button 
                        onClick={() => completeOrder(order._id)}
                        className="flex items-center justify-center gap-2 w-full md:w-auto ml-auto px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
                      >
                        <CheckCircle className="w-4 h-4" /> Close Bill
                      </button>
                    )}
                    {order.status !== 'ready' && (
                      <span className="text-gray-400 text-sm">Waiting...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}

        {activeTab === 'table_setup' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Table QR Codes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map(table => (
                <div key={table._id} className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Table {table.tableNumber}</h3>
                  <div className="bg-white p-4 rounded-xl shadow-inner border">
                    {/* Generates URL like http://localhost:5173/table/1 */}
                    <QRCode value={`${window.location.origin}/table/${table.tableNumber}`} size={150} />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 mb-4 text-center">
                    Customers scan this to order from Table {table.tableNumber}
                  </p>
                  <button onClick={() => window.print()} className="mt-auto flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold transition">
                    <Printer className="w-4 h-4" /> Print QR
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
