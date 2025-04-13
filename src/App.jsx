// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css' 
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Users';
import PickerOrders from './pages/Picker/Orders';
import PackerOrders from './pages/Packer/Orders';
import ProtectedRoute from './routes/ProtectedRoute';
import ScanItem from './pages/Picker/ScanItem';
import Finalise from './pages/Packer/Finalise';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles= {["admin"]}><AdminDashboard/></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles= {["admin"]}><Users/></ProtectedRoute>} />
        <Route path="/picker/orders" element={<ProtectedRoute allowedRoles={["picker"]}><PickerOrders /></ProtectedRoute>} />
        <Route path="/picker/scanitem" element={<ProtectedRoute allowedRoles={["picker"]}><ScanItem /></ProtectedRoute>} />
        <Route path="/packer/orders" element={<ProtectedRoute allowedRoles={["packer"]}><PackerOrders /></ProtectedRoute>} />
        <Route path="/packer/finalise" element={<ProtectedRoute allowedRoles={["packer"]}><Finalise /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;