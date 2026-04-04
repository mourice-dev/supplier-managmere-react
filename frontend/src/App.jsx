import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Requests from './pages/Requests';
import Orders from './pages/Orders';
import Payments from './pages/Payments';

const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const AdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'Admin') return <Navigate to="/dashboard" replace />;
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="requests" element={<Requests />} />
                    <Route path="orders" element={<AdminRoute><Orders /></AdminRoute>} />
                    <Route path="payments" element={<AdminRoute><Payments /></AdminRoute>} />
                    <Route path="suppliers" element={<AdminRoute><Suppliers /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
