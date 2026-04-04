import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const API = 'http://localhost:5000/api';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'Admin', role: 'Admin' };
    const isAdmin = user.role === 'Admin';
    const [notifications, setNotifications] = useState([]);
    const [pageTitle, setPageTitle] = useState('Dashboard');

    useEffect(() => {
        fetch(`${API}/notifications`).then(r => r.json()).then(setNotifications).catch(() => setNotifications([]));
    }, []);

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('dashboard')) setPageTitle('Dashboard');
        else if (path.includes('requests')) setPageTitle('Requests');
        else if (path.includes('orders')) setPageTitle('Orders');
        else if (path.includes('payments')) setPageTitle('Payments');
        else if (path.includes('suppliers')) setPageTitle('Suppliers');
    }, [location]);

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        navigate('/login');
    };

    const markRead = async (id, redirectUrl) => {
        try {
            await fetch(`${API}/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (redirectUrl) navigate(redirectUrl);
        } catch {}
    };

    const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

    return (
        <div className="app-wrapper">
            {/* ═══ Sidebar ═══ */}
            <aside className="sidebar">
                <Link to="/dashboard" className="sidebar-header">
                    <i className="bi bi-box-seam-fill"></i> ProCureSys+
                </Link>

                <nav>
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                        <i className="bi bi-grid-1x2-fill"></i> Dashboard
                    </Link>
                    <Link to="/requests" className={`nav-item ${isActive('/requests')}`}>
                        <i className="bi bi-clipboard2-data-fill"></i> Requests
                    </Link>
                    {isAdmin && (
                        <>
                            <Link to="/orders" className={`nav-item ${isActive('/orders')}`}>
                                <i className="bi bi-cart-check-fill"></i> Orders
                            </Link>
                            <Link to="/payments" className={`nav-item ${isActive('/payments')}`}>
                                <i className="bi bi-credit-card-2-front-fill"></i> Payments
                            </Link>
                            <Link to="/suppliers" className={`nav-item ${isActive('/suppliers')}`}>
                                <i className="bi bi-building-fill"></i> Suppliers
                            </Link>
                        </>
                    )}
                </nav>

                <div className="mt-auto">
                    <div className="d-flex align-items-center text-white mb-3 px-2">
                        <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'linear-gradient(135deg,#6366F1,#06B6D4)',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'0.75rem',fontWeight:700,fontSize:'0.9rem',flexShrink:0}}>
                            {user.username.substring(0,1).toUpperCase()}
                        </div>
                        <div>
                            <div className="fw-bold" style={{fontSize:'0.88rem'}}>{user.username}</div>
                            <small style={{color:'#64748B',fontSize:'0.75rem'}}>{user.role}</small>
                        </div>
                    </div>
                    <a href="#" onClick={handleLogout} className="nav-item" style={{color:'#F87171'}}>
                        <i className="bi bi-box-arrow-right"></i> Sign Out
                    </a>
                </div>
            </aside>

            {/* ═══ Main ═══ */}
            <main className="main-content">
                <header className="top-navbar">
                    <h4 className="mb-0">{pageTitle}</h4>

                    <div className="d-flex align-items-center gap-3">
                        {/* Notifications */}
                        <div className="dropdown">
                            <div className="notification-bell dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="bi bi-bell-fill"></i>
                                {notifications.length > 0 && (
                                    <span className="notification-badge">{notifications.length}</span>
                                )}
                            </div>
                            <ul className="dropdown-menu dropdown-menu-end" style={{width:'320px',maxHeight:'400px',overflowY:'auto'}}>
                                <li>
                                    <h6 className="dropdown-header" style={{fontWeight:700,fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em',color:'#64748B'}}>Notifications</h6>
                                </li>
                                {notifications.length === 0 ? (
                                    <li className="px-3 py-3 text-center">
                                        <i className="bi bi-bell-slash text-muted d-block mb-1" style={{fontSize:'1.5rem'}}></i>
                                        <small className="text-muted">No new notifications</small>
                                    </li>
                                ) : notifications.map(n => (
                                    <li key={n.id}>
                                        <a
                                            className="dropdown-item py-2 px-3"
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); markRead(n.id, n.type === 'success' ? '/orders' : '/requests'); }}
                                        >
                                            <div className="d-flex align-items-start">
                                                <div style={{width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'0.75rem',flexShrink:0,background: n.type === 'success' ? '#ECFDF5' : n.type === 'info' ? '#EFF6FF' : '#FEF2F2'}}>
                                                    <i className={`bi bi-${n.type === 'success' ? 'check-circle-fill' : n.type === 'info' ? 'info-circle-fill' : 'exclamation-circle-fill'}`} style={{color: n.type === 'success' ? '#10B981' : n.type === 'info' ? '#3B82F6' : '#EF4444',fontSize:'0.85rem'}}></i>
                                                </div>
                                                <div style={{minWidth:0}}>
                                                    <strong className="d-block text-truncate" style={{fontSize:'0.85rem',color:'#0F172A'}}>{n.title}</strong>
                                                    <small className="text-muted d-block text-wrap" style={{fontSize:'0.78rem',lineHeight:'1.4'}}>{n.message}</small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
