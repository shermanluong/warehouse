// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css' 
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import ApprovalPage from './pages/Admin/Approval';
import Product from './pages/Admin/Product';
import Substitution from './pages/Admin/Substitution';
import Users from './pages/Admin/Users';
import AdminOrder from './pages/Admin/Order';
import PickerOrders from './pages/Picker/Orders';
import PickOrder from './pages/Picker/PickOrder';
import PackerOrders from './pages/Packer/Orders';
import ProtectedRoute from './routes/ProtectedRoute';
import Finalise from './pages/Packer/Finalise';
import { ViewPreferenceProvider} from './Context/ViewPreferenceContext';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <ViewPreferenceProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register/>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles= {["admin"]}><AdminDashboard/></ProtectedRoute>} />
          <Route path="/admin/approval" element={<ProtectedRoute allowedRoles= {["admin"]}><ApprovalPage/></ProtectedRoute>} />
          <Route path="/admin/product" element={<ProtectedRoute allowedRoles= {["admin"]}><Product/></ProtectedRoute>} />
          <Route path="/admin/substitution" element={<ProtectedRoute allowedRoles= {["admin"]}><Substitution/></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles= {["admin"]}><Users/></ProtectedRoute>} />
          <Route path="/admin/order/:id" element={<ProtectedRoute allowedRoles= {["admin"]}><AdminOrder/></ProtectedRoute>} />
          <Route path="/picker/orders" element={<ProtectedRoute allowedRoles={["picker"]}><PickerOrders /></ProtectedRoute>} />
          <Route path="/picker/order/:id" element={<ProtectedRoute allowedRoles={["picker"]}><PickOrder /></ProtectedRoute>} />
          <Route path="/packer/orders" element={<ProtectedRoute allowedRoles={["packer"]}><PackerOrders /></ProtectedRoute>} />
          <Route path="/packer/order/:id" element={<ProtectedRoute allowedRoles={["packer"]}><Finalise /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ViewPreferenceProvider>
  );
}

export default App;