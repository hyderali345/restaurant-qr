import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful');
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'kitchen') navigate('/kitchen');
      else navigate('/counter');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500/20 p-4 rounded-full border border-amber-500/30">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-6">Staff Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-amber-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
