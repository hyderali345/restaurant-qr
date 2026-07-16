import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Customer/Welcome';
import Menu from './pages/Customer/Menu';
import OrderStatus from './pages/Customer/OrderStatus';
import KitchenDashboard from './pages/Kitchen/KitchenDashboard';
import CounterDashboard from './pages/Counter/CounterDashboard';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './pages/Staff/Login.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Toaster position="top-center" />
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/table/:tableId" element={<Welcome />} />
            <Route path="/table/:tableId/menu" element={<Menu />} />
            <Route path="/table/:tableId/order/:orderId" element={<OrderStatus />} />
            
            {/* Staff Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/kitchen" element={<KitchenDashboard />} />
            <Route path="/counter" element={<CounterDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
