import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, ArrowRight, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';

export default function Menu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

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
      toast.error('Customer details missing. Redirecting to start...');
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
      toast.success('Order placed successfully!');
      navigate(`/table/${tableId}/order/${res.data._id}`);
    } catch (err) {
      toast.error('Failed to place order');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;
  }

  return (
    <div className="pb-24 bg-[#0a0a0a] min-h-screen text-gray-200">
      <header className="bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-10 p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-extrabold text-white tracking-wide">Our Menu</h1>
        <div className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          Table {tableId}
        </div>
      </header>

      <div className="p-4 space-y-5">
        {menuItems.map(item => (
          <div key={item._id} className="bg-gray-900 p-4 rounded-3xl shadow-xl flex gap-4 border border-gray-800">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white">{item.name}</h3>
              <p className="text-amber-500 font-extrabold mt-1 text-lg">₹{item.price}</p>
              <p className="text-sm text-gray-400 line-clamp-2 mt-2 leading-relaxed">{item.description}</p>
            </div>
            
            <div className="relative flex flex-col items-center w-32">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded-[1.25rem] shadow-lg border border-gray-800" />
              ) : (
                <div className="w-32 h-32 bg-gray-800 rounded-[1.25rem] shadow-lg flex items-center justify-center">
                  <Utensils className="w-8 h-8 text-gray-600" />
                </div>
              )}
              
              <div className="absolute -bottom-4 w-full flex justify-center">
                {cart[item._id] ? (
                  <div className="flex items-center bg-gray-800 shadow-xl border border-amber-500/50 rounded-xl text-amber-500 font-bold overflow-hidden">
                    <button onClick={() => updateCart(item, -1)} className="p-2 px-3 hover:bg-gray-700 transition active:bg-gray-600">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{cart[item._id].quantity}</span>
                    <button onClick={() => updateCart(item, 1)} className="p-2 px-3 hover:bg-gray-700 transition active:bg-gray-600">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => updateCart(item, 1)}
                    className="bg-gray-900 text-amber-500 shadow-xl border border-amber-500/50 px-7 py-2 rounded-xl font-bold hover:bg-gray-800 transition text-sm uppercase tracking-wider"
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent backdrop-blur-sm z-50">
          <button 
            onClick={placeOrder}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_30px_rgba(245,158,11,0.3)] active:scale-95 transition-transform border border-amber-400/30"
          >
            <div className="flex items-center gap-4">
              <div className="bg-black/20 p-2.5 rounded-xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-amber-100 uppercase tracking-widest font-bold opacity-90">Total ({cartItemCount} items)</p>
                <p className="font-extrabold text-2xl leading-none mt-0.5">₹{cartTotal}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold tracking-widest text-sm">
              PLACE ORDER <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
