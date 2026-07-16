import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, ArrowRight, Utensils, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';

export default function Menu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${API_URL}/menu`);
        setMenuItems(res.data);
      } catch (err) {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    setCustomerName(localStorage.getItem('customerName') || 'Guest');
  }, []);

  const updateCart = (item, delta) => {
    setCart(prev => {
      const currentQty = prev[item._id]?.quantity || 0;
      const newQty = Math.max(0, currentQty + delta);

      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[item._id];
      } else {
        newCart[item._id] = { ...item, quantity: newQty };
      }
      return newCart;
    });
  };

  const cartTotal = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      toast.error('Customer session not found! Please register again.');
      navigate(`/table/${tableId}`);
      return;
    }

    try {
      const orderData = {
        customer: customerId,
        table: tableId,
        items: Object.values(cart).map(item => ({
          menuItem: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cartTotal
      };

      const res = await axios.post(`${API_URL}/orders`, orderData);
      setShowPopup(true);
      setTimeout(() => {
        navigate(`/table/${tableId}/order/${res.data._id}`);
      }, 4000);
    } catch (err) {
      toast.error('Failed to place order');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 pb-24 font-sans">
      {/* Wait Time Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-amber-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.2)] text-center max-w-sm">
            <div className="bg-amber-500/20 p-4 rounded-full inline-block mb-4 border border-amber-500/30">
              <Clock className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Order Sent!</h2>
            <p className="text-gray-400 mb-6 font-medium">Max <span className="text-amber-500 font-bold text-lg">15-20 mins</span> of wait time until your order is ready.</p>
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700 shadow-xl px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30">
            <Utensils className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wide">Menu</h1>
            <p className="text-xs text-amber-500 font-semibold tracking-wider">Welcome, {customerName}</p>
          </div>
        </div>
        <div className="bg-gray-900 px-4 py-1.5 rounded-full border border-gray-700">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Table</span>
          <span className="ml-2 text-amber-500 font-extrabold text-sm">{tableId}</span>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {menuItems.map(item => (
          <div key={item._id} className="bg-gray-800 p-4 rounded-2xl shadow-sm flex gap-4 border border-gray-700">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white">{item.name}</h3>
              <p className="text-amber-500 font-bold mt-1">₹{item.price}</p>
              <p className="text-sm text-gray-400 mt-2">{item.description}</p>
            </div>

            <div className="relative flex flex-col items-center w-28">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-28 h-28 object-cover rounded-2xl" />
              ) : (
                <div className="w-28 h-28 bg-gray-100 rounded-2xl shadow-sm flex items-center justify-center">
                  <Utensils className="w-8 h-8 text-gray-300" />
                </div>
              )}

              <div className="absolute -bottom-3 w-full flex justify-center">
                {cart[item._id] ? (
                  <div className="flex items-center bg-white shadow-md border border-orange-100 rounded-lg text-orange-600 font-bold">
                    <button onClick={() => updateCart(item, -1)} className="p-1.5 px-2 hover:bg-orange-50 rounded-l-lg transition">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm">{cart[item._id].quantity}</span>
                    <button onClick={() => updateCart(item, 1)} className="p-1.5 px-2 hover:bg-orange-50 rounded-r-lg transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => updateCart(item, 1)}
                    className="bg-white text-orange-600 shadow-md border border-orange-100 px-6 py-1.5 rounded-lg font-bold hover:bg-orange-50 transition text-sm uppercase tracking-wide"
                  >
                    ADD
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {menuItems.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No items available right now.</p>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            onClick={placeOrder}
            className="w-full bg-orange-600 text-white rounded-xl p-4 flex items-center justify-between shadow-lg active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs text-orange-100 uppercase tracking-wider font-semibold">Total ({cartItemCount} items)</p>
                <p className="font-bold text-lg">₹{cartTotal}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold">
              Place Order <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
