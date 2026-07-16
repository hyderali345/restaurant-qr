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
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Our Menu</h1>
        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
          Table {tableId}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {menuItems.map(item => (
          <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 border border-gray-100">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
              <p className="text-orange-600 font-bold mt-1">₹{item.price}</p>
              <p className="text-sm text-gray-500 line-clamp-2 mt-2">{item.description}</p>
            </div>
            
            <div className="relative flex flex-col items-center w-28">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-28 h-28 object-cover rounded-2xl shadow-sm" />
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
