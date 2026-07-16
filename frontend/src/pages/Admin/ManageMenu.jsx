import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_URL = 'https://restaurant-qr-jl0w.onrender.com/api';

export default function ManageMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Menu</h2>
        <button className="bg-amber-500 text-gray-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-amber-400 transition">
          <Plus size={20} /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="text-amber-500">Loading...</div>
      ) : (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {menuItems.map(item => (
                <tr key={item._id} className="hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-600" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">{item.name}</td>
                  <td className="px-6 py-4 text-gray-400">{item.category}</td>
                  <td className="px-6 py-4 font-bold text-amber-500">₹{item.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button className="text-blue-400 hover:text-blue-300 transition p-2 bg-blue-400/10 rounded-lg">
                        <Edit size={18} />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition p-2 bg-red-400/10 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
