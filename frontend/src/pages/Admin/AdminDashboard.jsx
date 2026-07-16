import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import ManageMenu from './ManageMenu.jsx';
import { LogOut, LayoutDashboard, Utensils, QrCode, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/menu', icon: <Utensils size={20} />, label: 'Manage Menu' },
    { path: '/admin/tables', icon: <QrCode size={20} />, label: 'Tables & QR' },
    { path: '/admin/analytics', icon: <TrendingUp size={20} />, label: 'Analytics' },
    { path: '/admin/staff', icon: <Users size={20} />, label: 'Staff Management' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-extrabold text-amber-500 tracking-wider">AL-MAIDA<br/><span className="text-sm text-gray-400">ADMIN PANEL</span></h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${location.pathname === item.path ? 'bg-amber-500 text-gray-900 font-bold' : 'hover:bg-gray-700'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-gray-700 rounded-xl transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-2xl border border-gray-700">
          <h1 className="text-xl font-bold text-white">Welcome, {user?.name}</h1>
          <div className="bg-amber-500/10 text-amber-500 px-4 py-1 rounded-lg border border-amber-500/20 text-sm font-semibold">
            Admin Privilege
          </div>
        </header>

        <Routes>
          <Route path="/" element={<div className="text-gray-400">Dashboard Analytics coming soon...</div>} />
          <Route path="/menu" element={<ManageMenu />} />
          <Route path="/tables" element={<div className="text-gray-400">Table QR Generator coming soon...</div>} />
          <Route path="/analytics" element={<div className="text-gray-400">Revenue Analytics coming soon...</div>} />
          <Route path="/staff" element={<div className="text-gray-400">Staff Management coming soon...</div>} />
        </Routes>
      </main>
    </div>
  );
}
