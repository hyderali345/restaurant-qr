import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Customer/Welcome';
import Menu from './pages/Customer/Menu.jsx';
import OrderStatus from './pages/Customer/OrderStatus.jsx';
import CounterDashboard from './pages/Counter/CounterDashboard.jsx';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
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
          <Route path="/counter" element={<CounterDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
